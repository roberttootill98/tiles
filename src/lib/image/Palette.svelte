<script lang="ts">
	import ColourDisplay from './ColourDisplay.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PaintBucket, SquareSlash } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import type { ComponentType } from 'svelte';
	import { compareColours, type Colour } from '$lib/colour';
	import { paletteSize } from '$lib/palette';
	import type { LoadedImageType } from './loadedImage';

	let {
		loadedImageType,
		palette = $bindable(),
		width,
		selectedColour = $bindable(),
		splitPalettes = $bindable()
	}: {
		loadedImageType: LoadedImageType;
		palette: Colour[];
		width: number;
		selectedColour?: Colour;
		splitPalettes?: Colour[][];
	} = $props();

	let palette_display: Colour[][] | null = $derived.by(() => {
		if (palette == null) return null;

		const rowWidth: number = 8;

		const rows: Colour[][] = [];
		let row: Colour[] = [];

		for (const [i, colour] of palette.entries()) {
			if (row.length < rowWidth) {
				row.push(colour);

				if (i == palette.length - 1) {
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
		const items: ToolSchema[] = [];

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
		{#each palette_display as column (column)}
			<div class="flex">
				{#each column as colour (colour)}
					<ColourDisplay {colour} {width} {onSelect} {selectedColour} />
				{/each}
			</div>
		{/each}

		<span>Palette length: {palette!.length}</span>
	</Card.Content>

	<Card.Footer class="flex gap-2">
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
