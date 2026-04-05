<script lang="ts">
	import { compareColours, type Colour, type ColourMapping } from '$lib/colour';
	import Button from '$lib/components/ui/button/button.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { Download, Grid2X2, MoveDown, MoveLeft, MoveRight, MoveUp } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { class_toolButton, downloadBlob } from '$lib/utils';
	import UPNG from 'upng-js';
	import { Toggle } from '$lib/components/ui/toggle';
	import { tileSize } from './image';

	let {
		pixels,
		palette,
		filterBy,
		colourMappings
	}: {
		pixels: Colour[][];
		palette: Colour[];
		filterBy?: Colour;
		colourMappings?: ColourMapping[];
	} = $props();

	//#region filter palette by colour

	function filterPaletteByColour(): void {
		if (palette == undefined) return;
		if (colourMappings != undefined) return;

		const filteredPixels: Colour[][] = [];

		for (const column of pixels) {
			const row: Colour[] = [];

			for (const colour of column) {
				// get if colour in palette
				const colourInPalette: boolean =
					palette.find((colour_search: Colour) => {
						return compareColours(colour, colour_search);
					}) != null;

				if (colourInPalette) {
					// keep colour
					row.push(colour);
				} else {
					// use background colour instead
					row.push(palette![0]);
				}
			}

			filteredPixels.push(row);
		}

		// override pixels
		pixels = filteredPixels;
	}

	filterPaletteByColour();

	//#endregion filter palette by colour

	//#region map colours by colour mapping

	function mapColours(): void {
		if (colourMappings == undefined) return;

		const filteredPixels: Colour[][] = [];

		for (const column of pixels) {
			const row: Colour[] = [];

			for (const colour of column) {
				const inPalette: boolean =
					palette!.find((colour_search: Colour) => {
						return compareColours(colour, colour_search);
					}) != null;

				if (inPalette) {
					// keep colour
					row.push(colour);
				} else {
					// find in colour mapping
					const colourMapping: ColourMapping | undefined = colourMappings.find(
						(colourMapping: ColourMapping) => {
							return compareColours(colour, colourMapping.original);
						}
					);

					if (colourMapping != undefined) {
						// use new colour
						row.push(colourMapping.replaceWith);
					} else {
						// no replacement colour found, probably in split palette
						// just use background colour
						row.push(palette![0]);
					}
				}
			}

			filteredPixels.push(row);
		}

		// override pixels
		pixels = filteredPixels;
	}

	mapColours();

	//#endregion map colours by colour mapping

	let canvas: HTMLCanvasElement;

	let width: number = $derived(pixels[0].length);
	let height: number = $derived(pixels.length);

	const pixelWidth: number = 4;

	$effect(() => {
		if (pixels && scaleFactor && (showGrid || !showGrid)) {
			setCanvas();
		}
	});

	let pixels_render: Uint8ClampedArray<ArrayBuffer>;

	function setCanvas(): void {
		pixels_render = new Uint8ClampedArray(width * height * pixelWidth);

		let pixel_render_index: number = 0;

		for (let y = 0; y < pixels.length; y++) {
			for (let x = 0; x < pixels[y].length; x++) {
				if (showGrid && (x % tileSize == 0 || y % tileSize == 0)) {
					// grid square
					pixels_render[pixel_render_index] = 0;
					pixels_render[pixel_render_index + 1] = 0;
					pixels_render[pixel_render_index + 2] = 0;
					pixels_render[pixel_render_index + 3] = 255;

					pixel_render_index += 4;

					continue;
				}

				const colour: Colour = pixels[y][x];

				let colourValues: number[] = [colour.red, colour.green, colour.blue, 255];

				for (const [i, colourValue] of colourValues.entries()) {
					if (
						// not alpha colour
						i != colourValues.length - 1 &&
						// filter by is on and doesn't match filter by
						filterBy != undefined &&
						!(
							filterBy.red == colour.red &&
							filterBy.green == colour.green &&
							filterBy.blue == colour.blue
						)
					) {
						const gray: number = 0.3 * colour.red + 0.59 * colour.green + 0.11 * colour.blue;

						pixels_render[pixel_render_index + i] =
							gray * (1 - muteFactor) + colourValue * muteFactor;
					} else {
						pixels_render[pixel_render_index + i] = colourValue;
					}
				}

				pixel_render_index += colourValues.length;
			}
		}

		// grid
		// for(i in range)

		// scale
		canvas.width = Math.floor(width * scaleFactor);
		canvas.height = Math.floor(height * scaleFactor);

		const ctx = canvas.getContext('2d')!;

		// clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// load image data
		ctx.putImageData(new ImageData(pixels_render, width, height), 0, 0);
	}

	function downloadAsIndexedPng(): void {
		const pngData = UPNG.encode([pixels_render.buffer], width, height, palette!.length);

		downloadBlob(new Blob([pngData], { type: 'image/png' }));
	}

	let showGrid: boolean = $state(false);
	let scaleFactor: number = $state(1);
	let muteFactor: number = $state(0.1);

	//#region canvas alignment
	const class_moveButton: string = [
		'cursor-pointer',
		'border',
		'px-1',
		'py-1',
		'hover:bg-muted'
	].join(' ');

	const size_moveButton: number = 16;

	function moveLeft(): void {}

	function moveUp(): void {}

	function moveDown(): void {}

	function moveRight(): void {}

	//#endregion canvas alignment
</script>

<Card.Root class="gap-2">
	<Card.Header>
		<span class="font-bold">Image</span>
	</Card.Header>

	<Card.Content>
		<canvas bind:this={canvas} style="image-rendering: pixelated;"></canvas>
	</Card.Content>

	<Card.Footer class="flex flex-col items-start gap-2 text-xs">
		<!-- top row -->
		<div class="flex w-full items-center gap-2">
			<!-- dimensions display -->
			<span class="text-foreground/70">Dimensions: {pixels!.length} x {pixels![0].length}</span>

			<!-- right aligned items -->
			<div class="ml-auto flex items-center gap-2">
				<!-- align canvas -->
				<div class="flex items-center">
					<button onclick={moveLeft} class={`${class_moveButton} rounded-l-lg`}>
						<MoveLeft size={size_moveButton} />
					</button>

					<div class="flex flex-col">
						<button onclick={moveUp} class={`${class_moveButton} rounded-t-lg`}>
							<MoveUp size={size_moveButton} />
						</button>

						<button onclick={moveDown} class={`${class_moveButton} rounded-b-lg`}>
							<MoveDown size={size_moveButton} />
						</button>
					</div>

					<button onclick={moveRight} class={`${class_moveButton} rounded-r-lg`}>
						<MoveRight size={size_moveButton} />
					</button>
				</div>

				<!-- show grid -->
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Toggle
								onclick={() => (showGrid = !showGrid)}
								variant="outline"
								class="
									cursor-pointer
									{showGrid ? 'bg-green-600 dark:bg-green-800' : ''}
								"
							>
								<Grid2X2 />
							</Toggle>
						</Tooltip.Trigger>

						<Tooltip.Content>
							<p>Show grid</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>

				<!-- download button -->
				<Tooltip.Provider>
					<Tooltip.Root>
						<Tooltip.Trigger>
							<Button
								size="sm"
								variant="outline"
								class={class_toolButton}
								onclick={downloadAsIndexedPng}
							>
								<Download />
							</Button>
						</Tooltip.Trigger>

						<Tooltip.Content>
							<p>Download as indexed .png file</p>
						</Tooltip.Content>
					</Tooltip.Root>
				</Tooltip.Provider>
			</div>
		</div>

		<!-- #region controls -->

		<!-- pixel width -->
		<!--
        <div class="flex items-center gap-2">
            <span>Size:</span>
            <Input type="range" bind:value={scaleFactor} min={1} max={10} step={0.1}/>
        </div>
        -->

		<!-- mute factor -->
		<div class="flex items-center gap-2 text-foreground/70">
			<span>Mute Factor:</span>
			<Input type="range" bind:value={muteFactor} min={0.001} max={0.1} step={0.001} />
		</div>

		<!-- #endregion controls -->
	</Card.Footer>
</Card.Root>
