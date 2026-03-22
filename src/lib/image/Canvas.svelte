<script lang="ts">
	import type { Colour } from '$lib/colour';
	import * as Card from '$lib/components/ui/card/index.js';
	import Input from '$lib/components/ui/input/input.svelte';

	let {
		pixels,
		filterBy
	}: {
		pixels: Colour[][];
		filterBy?: Colour;
	} = $props();

	let canvas: HTMLCanvasElement;

	let width: number = $derived(pixels[0].length);
	let height: number = $derived(pixels.length);

	const pixelWidth: number = 4;

	$effect(() => {
		if (pixels && scaleFactor) {
			setCanvas();
		}
	});

	function setCanvas(): void {
		const pixels_render = new Uint8ClampedArray(width * height * pixelWidth);

		let pixel_render_index: number = 0;

		for (let y = 0; y < pixels.length; y++) {
			for (let x = 0; x < pixels[y].length; x++) {
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

		// scale
		canvas.width = Math.floor(width * scaleFactor);
		canvas.height = Math.floor(height * scaleFactor);

		const ctx = canvas.getContext('2d')!;

		// clear canvas
		ctx.clearRect(0, 0, canvas.width, canvas.height);

		// load image data
		ctx.putImageData(new ImageData(pixels_render, width, height), 0, 0);
	}

	let scaleFactor: number = $state(1);
	let muteFactor: number = $state(0.1);
</script>

<Card.Root class="gap-2">
	<Card.Header>
		<span class="font-bold">Image</span>
	</Card.Header>

	<Card.Content>
		<canvas bind:this={canvas} style="image-rendering: pixelated;"></canvas>
		<!-- <canvas bind:this={canvas} {height} {width} style="image-rendering: pixelated;"></canvas> -->
	</Card.Content>

	<Card.Footer class="flex flex-col items-start gap-2">
		<span>Dimensions: {pixels!.length} x {pixels![0].length}</span>

		<!-- #region controls -->

		<!-- pixel width -->
		<!--
        <div class="flex items-center gap-2">
            <span>Size:</span>
            <Input type="range" bind:value={scaleFactor} min={1} max={10} step={0.1}/>
        </div>
        -->

		<!-- mute factor -->
		<div class="flex items-center gap-2">
			<span>Mute Factor:</span>
			<Input type="range" bind:value={muteFactor} min={0.001} max={0.1} step={0.001} />
		</div>

		<!-- #endregion controls -->
	</Card.Footer>
</Card.Root>
