<script lang="ts">
	import ColourDisplay from './ColourDisplay.svelte';
	import type { Colour } from './ImageManager';
	import * as Card from '$lib/components/ui/card/index.js';
	import Button from '$lib/components/ui/button/button.svelte';
	import { PaintBucket, SquareSlash } from 'lucide-svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';
	import { Toggle } from '$lib/components/ui/toggle/index.js';
	import type { ComponentType } from 'svelte';

	let {
		palette,
		width,
		selectedColour = $bindable(undefined)
	}: {
		palette: Colour[];
		width: number;
		selectedColour?: Colour;
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
		if (
			selectedColour != null &&
			selectedColour.red == colour.red &&
			selectedColour.green == colour.green &&
			selectedColour.blue == colour.blue
		) {
			selectedColour = undefined;
		} else {
			selectedColour = colour;
		}
	}

	//#region tools
	const schema_tools: {
		type: 'button' | 'toggle';
		icon: ComponentType;
		tooltip: string;
		onclick: () => void;
	}[] = $derived.by(() => {
		return [
			{
				type: 'toggle',
				icon: SquareSlash,
				tooltip: 'Select background colour (first in palette)',
				onclick: (): void => {
					selectingBackgroundColour = !selectingBackgroundColour;
				}
			},
			{
				type: 'button',
				icon: PaintBucket,
				tooltip: 'Split the palette into groups of 16',
				onclick: (): void => {}
			}
		];
	});

	let selectingBackgroundColour: boolean = $state(false);

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
								size="sm"
								variant="outline"
								onclick={schema_tool.onclick}
								class="bg-transparent! px-2! hover:bg-muted!"
							>
								<schema_tool.icon />
							</Button>
						{:else if schema_tool.type == 'toggle'}
							<Toggle
								variant="outline"
								class="
                                    cursor-pointer
                                    data-[state=on]:bg-green-600
                                    dark:data-[state=on]:bg-green-800
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
