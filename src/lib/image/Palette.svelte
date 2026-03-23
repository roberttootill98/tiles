<script lang="ts">
	import ColourDisplay from './ColourDisplay.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { Download, PaintBucket, SquareArrowDown, SquareSlash } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import type { ComponentType } from 'svelte';
	import { compareColours, type Colour, type ColourMapping } from '$lib/colour';
	import { paletteSize } from '$lib/palette';
	import type { LoadedImageType } from './loadedImage';
	import { downloadBlob } from '$lib/utils';
	import EmptyPaletteSlot from './EmptyPaletteSlot.svelte';

	let {
		loadedImageType,
		palette = $bindable(),
		width,
		selectedColour = $bindable(),
		splitPalettes = $bindable(),
		reducedPalette = $bindable(),
		colourMappings = $bindable()
	}: {
		loadedImageType: LoadedImageType;
		palette: Colour[];
		width: number;
		selectedColour?: Colour;
		splitPalettes?: Colour[][];
		reducedPalette?: Colour[];
		colourMappings?: ColourMapping[];
	} = $props();

	// number of palette colours to show on each row
	const rowWidth: number = 8;

	let palette_display: Colour[][] | null = $derived.by(() => {
		if (palette == null) return null;

		const rows: Colour[][] = [];
		let row: Colour[] = [];

		for (const [i, colour] of palette.entries()) {
			if (row.length < rowWidth) {
				row.push(colour);

				if (i == palette.length - 1) {
					// fill out to end of row
					rows.push(row);
				}
			} else {
				rows.push(row);
				row = [colour];
			}
		}

		return rows;
	});

	function onSelect(colour: Colour): void {
		if (tool_selectBackgroundColour.toggle_bind) {
			// we're in select palette mode, ignore default behaviour
			onclick_selectBackgroundColour(colour);
			return;
		}

		if (selectedColour != null && compareColours(selectedColour, colour)) {
			selectedColour = undefined;
		} else {
			selectedColour = colour;
		}
	}

	//#region tools
	type ToolSchema = {
		type: 'button' | 'toggle';
		icon: ComponentType;
		tooltip: string;
		onclick: () => void;
		//#region toggle
		toggle_bind?: boolean;
		//#endregion toggle
	};

	const schema_tools: ToolSchema[] = $derived.by(() => {
		const items: ToolSchema[] = [
			{
				type: 'button',
				icon: Download,
				tooltip: 'Download as .pal file',
				onclick: () => {
					const content: string[] = [
						// palette type declaration
						'JASC-PAL',
						'0100',
						String(palette.length)
					];

					for (const colour of palette) {
						content.push(`${colour.green} ${colour.red} ${colour.blue}`);
					}

					// ends in new line
					content.push('');

					// download as blob
					downloadBlob(new Blob([content.join('\n')], { type: 'text/plain' }));
				}
			}
		];

		if (loadedImageType) {
			items.push(tool_selectBackgroundColour);
			items.push({
				type: 'button',
				icon: SquareSlash,
				tooltip: 'Split the palette into groups of 16',
				onclick: (): void => {
					// determine number of palettes required
					// palette -1 because we need the same background colour in each
					const palettesRequired: number = Math.ceil(palette.length / (paletteSize - 1));

					//#region get new palettes
					splitPalettes = [];

					// take palettes in order and just split
					for (let i = 0; i < palettesRequired; i++) {
						splitPalettes.push([
							palette[0],
							...palette.slice(i * paletteSize + 1, (i + 1) * paletteSize)
						]);
					}

					//#endregion get new palettes
				}
			});
			items.push({
				type: 'button',
				icon: SquareArrowDown,
				tooltip: 'Combine very similar colours',
				onclick: (): void => {
					// combine colours within threshold

					// threshold as 8, since colours are actually rounded to closest 8 anyway
					const threshold: number = 8 * 2;

					// include background colour by defualt
					reducedPalette = [palette[0]];
					colourMappings = [];

					// slice 1 to ignore background
					for (const colour of palette.slice(1)) {
						// check for similar colour within reduced colours
						const colour_search = reducedPalette.slice(1).find((colour_search: Colour) => {
							return (
								Math.abs(colour_search.red - colour.red) < threshold &&
								Math.abs(colour_search.green - colour.green) < threshold &&
								Math.abs(colour_search.blue - colour.blue) < threshold
							);
						});

						if (colour_search == null) {
							// colour not found, so add to unique reduced colours
							reducedPalette.push(colour);
						} else {
							// colour is found, so add mapping
							colourMappings.push({
								original: colour,
								replaceWith: colour_search
							});
						}
					}
				}
			});
		}

		return items;
	});

	//#region select background colour

	const tool_selectBackgroundColour: ToolSchema = $state({
		type: 'toggle',
		icon: PaintBucket,
		tooltip: 'Select background colour (first in palette)',
		onclick: (): void => {
			tool_selectBackgroundColour.toggle_bind = !tool_selectBackgroundColour.toggle_bind;
		},
		toggle_bind: false
	});

	function onclick_selectBackgroundColour(colour_selected: Colour): void {
		//#region get index of new palette colour
		let index: number;

		for (const [i, colour] of palette.entries()) {
			if (compareColours(colour_selected, colour)) {
				index = i;
				break;
			}
		}

		//#endregion get index of new palette colour

		const previousBackgroundColour: Colour = palette[0];

		// set palette
		palette[0] = colour_selected;
		palette[index!] = previousBackgroundColour;

		// untoggle button
		tool_selectBackgroundColour.toggle_bind = false;
	}

	//#endregion select background colour

	//#endregion tools
</script>

<Card.Root class="gap-2">
	<Card.Header>
		<span class="font-bold">Palette</span>
	</Card.Header>

	<Card.Content class="flex flex-col">
		{#each palette_display as column, i (column)}
			<div class="flex">
				{#each column as colour (colour)}
					<ColourDisplay {colour} {width} {onSelect} {selectedColour} />
				{/each}

				<!-- free slots to make up rest of row or palette width -->
				{#if i == palette_display!.length - 1 && palette_display![i].length != rowWidth}
					<!-- only render number required to get row complete -->
					{#each { length: rowWidth - (palette.length % paletteSize) }}
						<EmptyPaletteSlot {width} />
					{/each}
				{/if}
			</div>
		{/each}

		{#each { length: Math.floor((paletteSize - palette.length) / rowWidth) }}
			<div class="flex">
				{#each { length: rowWidth }}
					<EmptyPaletteSlot {width} />
				{/each}
			</div>
		{/each}

		<span>Palette length: {palette!.length}</span>
	</Card.Content>

	<Card.Footer class="grid grid-cols-3 gap-2">
		<!-- tools -->
		{#each schema_tools as schema_tool (schema_tool)}
			<Tooltip.Provider>
				<Tooltip.Root>
					<Tooltip.Trigger>
						{#if schema_tool.type == 'button'}
							<Button
								onclick={schema_tool.onclick}
								size="sm"
								variant="outline"
								class="bg-transparent! px-2! hover:bg-muted!"
							>
								<schema_tool.icon />
							</Button>
						{:else if schema_tool.type == 'toggle'}
							<Toggle
								onclick={schema_tool.onclick}
								variant="outline"
								class="
                                    cursor-pointer
                                    {schema_tool.toggle_bind
									? 'bg-green-600 dark:bg-green-800'
									: ''}
                                "
							>
								<schema_tool.icon />
							</Toggle>
						{/if}
					</Tooltip.Trigger>

					<Tooltip.Content>
						<p>{schema_tool.tooltip}</p>
					</Tooltip.Content>
				</Tooltip.Root>
			</Tooltip.Provider>
		{/each}
	</Card.Footer>
</Card.Root>
