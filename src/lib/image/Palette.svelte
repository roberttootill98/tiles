<script lang="ts">
	import ColourDisplay from './ColourDisplay.svelte';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import {
		CircleArrowDown,
		Download,
		ListOrdered,
		PaintBucket,
		Settings,
		SquareArrowDown,
		SquareSlash
	} from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import type { ComponentType } from 'svelte';
	import {
		compareColours,
		get_luminance,
		type Colour,
		type ColourMapping,
		type CombinationResult
	} from '$lib/colour';
	import { paletteSize } from '$lib/palette';
	import type { LoadedImageType } from './loadedImage';
	import { downloadBlob } from '$lib/utils';
	import EmptyPaletteSlot from './EmptyPaletteSlot.svelte';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import Input from '$lib/components/ui/input/input.svelte';
	import { kMeans } from '$lib/kMeans';
	import * as Select from '$lib/components/ui/select/index.js';
	import { distanceCombination } from '$lib/distanceCombination';

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

				if (i == palette.length - 1) {
					// fill out to end of row
					rows.push(row);
				}
			}
		}

		return rows;
	});

	// get number of empty slots in palette
	function get_numberOfEmptySlots(): number {
		const emptySlotsTotal: number =
			Math.ceil(palette.length / paletteSize) * paletteSize - palette.length;

		if (emptySlotsTotal == rowWidth) {
			return 0;
		} else if (emptySlotsTotal > rowWidth) {
			return emptySlotsTotal - rowWidth;
		} else {
			return emptySlotsTotal;
		}
	}

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
		disabled?: boolean;
		//#region toggle
		toggle_bind?: boolean;
		//#endregion toggle
	};

	const class_toolButton: string = 'bg-transparent! px-2! hover:bg-muted!';

	// threshold as multiple of 8, since colours are actually rounded to closest 8 anyway
	let threshold: number = $state(8 * 2);

	//#region combine mode selection

	const combineModes: string[] = ['Basic Distance', 'Root Distance', 'KMeans'];

	let combineMode_selected: string = $state(combineModes[0]);

	//#endregion combine mode selection

	const schema_tools: ToolSchema[] = $derived.by(() => {
		const items: ToolSchema[] = [
			{
				type: 'button',
				icon: Download,
				tooltip: 'Download as .pal file',
				onclick: (): void => {
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

		if (loadedImageType == 'originalImage') {
			// order palette
			items.push({
				type: 'button',
				icon: ListOrdered,
				tooltip: 'Order palette (not including background colour)',
				onclick: (): void => {
					palette = [
						palette[0],
						...palette.slice(1).sort((colour1: Colour, colour2: Colour) => {
							const luminance1: number = get_luminance(colour1);
							const luminance2: number = get_luminance(colour2);

							return luminance1 - luminance2;
						})
					];
				},
				disabled: splitPalettes != undefined
			});

			// select background colour
			items.push(tool_selectBackgroundColour);

			// combine similar
			items.push({
				type: 'button',
				icon: CircleArrowDown,
				tooltip: 'Combine very similar colours',
				onclick: (): void => {
					let combinationResult: CombinationResult;

					switch (combineMode_selected) {
						case 'Basic Distance':
							combinationResult = distanceCombination('basic', palette.slice(1), threshold);
							break;
						case 'Root Distance':
							combinationResult = distanceCombination('basic', palette.slice(1), threshold);
							break;
						case 'KMeans':
							combinationResult = kMeans(palette.slice(1), {
								threshold,
								maxIterations: 20
							});

							break;
						default:
							throw new Error('unsupported combination mode!');
					}

					reducedPalette = [palette[0], ...combinationResult.reducedPalette];
					colourMappings = combinationResult.colourMappings;
				},
				disabled: reducedPalette != undefined && colourMappings != undefined
			});

			// combine until within palette size
			items.push({
				type: 'button',
				icon: SquareArrowDown,
				tooltip: 'Combine colours until within palette size',
				onclick: (): void => {
					// combine colours until within palette size
					// include background colour by defualt
					// reducedPalette = [palette[0]];
					// colourMappings = [];
					// const target_palette: Colour[] = [...palette];
					// let threshold_reduceAll: number = 0;
					// // while (target_palette.length > 0) {
					// // 	threshold_reduceAll += 8;
					// // 	target_palette
					// // }
				},
				disabled: reducedPalette != undefined && colourMappings != undefined
			});
		}

		if (['originalImage', 'reduced'].includes(loadedImageType)) {
			// split palette into groups of 16
			items.push({
				type: 'button',
				icon: SquareSlash,
				tooltip: 'Split the palette into groups of 16',
				onclick: (): void => {
					// ignore background colour
					const paletteWithoutBackground: Colour[] = palette.slice(1);

					// determine number of palettes required
					// palette -1 because we need the same background colour in each
					const palettesRequired: number = Math.ceil(
						paletteWithoutBackground.length / (paletteSize - 1)
					);

					//#region get new palettes
					splitPalettes = [];

					// take palettes in order and just split
					for (let i = 0; i < palettesRequired; i++) {
						splitPalettes.push([
							palette[0],
							...paletteWithoutBackground.slice(i * (paletteSize - 1), (i + 1) * (paletteSize - 1))
						]);
					}

					//#endregion get new palettes
				},
				disabled: splitPalettes != undefined
			});
		}

		return items;
	});

	let showSettings: boolean = $derived.by(() => {
		return loadedImageType == 'originalImage';
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
	<Card.Header class="flex items-center">
		<!-- title -->
		<span class="font-bold">Palette</span>

		<!-- options -->
		{#if showSettings}
			<div class="ml-auto">
				<Dialog.Root>
					<Dialog.Trigger type="button" class={buttonVariants({ variant: 'ghost', size: 'icon' })}>
						<Settings />
					</Dialog.Trigger>

					<Dialog.Content class="w-fit max-w-none min-w-xl sm:max-w-fit">
						<Dialog.Header>
							<Dialog.Title>Palette Settings</Dialog.Title>
						</Dialog.Header>

						<!-- options -->
						<div class="flex flex-col gap-2 text-xs text-muted-foreground">
							<Select.Root type="single" bind:value={combineMode_selected}>
								<Select.Trigger>
									{combineMode_selected}
								</Select.Trigger>

								<Select.Content>
									<Select.Group>
										<Select.Label>Colour Combination Modes</Select.Label>

										{#each combineModes as combineMode (combineMode)}
											<Select.Item value={combineMode}>
												{combineMode}
											</Select.Item>
										{/each}
									</Select.Group>
								</Select.Content>
							</Select.Root>

							<!-- threshold control -->
							<div class="flex items-center gap-2">
								<span>Combine Colours Threshold ({threshold}):</span>
								<Input type="range" bind:value={threshold} min={8} step={8} />
							</div>
						</div>
					</Dialog.Content>
				</Dialog.Root>
			</div>
		{/if}
	</Card.Header>

	<Card.Content class="flex flex-col">
		{#each palette_display as column, i (column)}
			<div class="flex">
				{#each column as colour (colour)}
					<ColourDisplay {colour} {width} {onSelect} {selectedColour} />
				{/each}

				<!-- free slots to make up rest of row or palette width -->
				{#if i == palette_display!.length - 1}
					<!-- only render number required to get row complete -->
					{#each { length: get_numberOfEmptySlots() }}
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
								disabled={schema_tool.disabled}
								size="sm"
								variant="outline"
								class={class_toolButton}
							>
								<schema_tool.icon />
							</Button>
						{:else if schema_tool.type == 'toggle'}
							<Toggle
								onclick={schema_tool.onclick}
								disabled={schema_tool.disabled}
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
