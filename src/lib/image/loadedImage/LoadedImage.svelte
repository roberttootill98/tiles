<script lang="ts">
	import type { Colour, ColourMapping } from '$lib/colour';
	import Canvas from '../canvas/Canvas.svelte';
	import type { LoadedImageType } from './loadedImage';
	import PaletteDisplay from '../palette/Palette.svelte';
	import type { Tile } from '../canvas/tiles/tiles';
	import type Tilesheet from '$lib/tile/tilesheet/Tilesheet';
	import type { Palette } from '../palette/palette';
	import * as Tabs from '$lib/components/ui/tabs/index.js';

	let {
		loadedImageType,
		pixels = $bindable(),
		palette,
		tilesheets = $bindable(),
		splitPalettes = $bindable(),
		reducedPalette = $bindable(),
		colourMappings = $bindable()
	}: {
		loadedImageType: LoadedImageType;
		pixels: Colour[][];
		palette: Palette;
		tilesheets?: Tilesheet[];
		splitPalettes?: Palette[];
		reducedPalette?: Palette;
		colourMappings?: ColourMapping[];
	} = $props();

	let tiles: Tile[] = $state([]);

	let paletteColourSelected: Colour | undefined = $state(undefined);

	//#region tilesheets
	let tilesheet_tabSelected: string = $state(String(0));

	//#endregion tilesheets
</script>

<div class="flex gap-2">
	{#if loadedImageType == 'originalImage'}
		<!-- interactive image -->
		<Canvas bind:pixels={pixels!} bind:tiles filterBy={paletteColourSelected} {palette} />

		<!-- palette -->
		<PaletteDisplay
			{loadedImageType}
			{palette}
			width={18}
			bind:selectedColour={paletteColourSelected}
			{tiles}
			bind:tilesheets
			bind:splitPalettes
			bind:reducedPalette
			bind:colourMappings
		/>
	{:else if loadedImageType == 'tilesheets' && tilesheets != null}
		<Tabs.Root value={tilesheet_tabSelected}>
			<Tabs.List>
				{#each Object.keys(tilesheets) as i (i)}
					<Tabs.Trigger value={i} class="cursor-pointer">{i}</Tabs.Trigger>
				{/each}
			</Tabs.List>

			{#each tilesheets as tilesheet, i (i)}
				<Tabs.Content value={String(i)} class="flex gap-2">
					<!-- interactive image -->
					<Canvas
						pixels={pixels!}
						tiles={tilesheet.tiles}
						filterBy={paletteColourSelected}
						palette={tilesheet.palette}
					/>

					<!-- palette -->
					<PaletteDisplay
						{loadedImageType}
						palette={tilesheet.palette}
						width={18}
						bind:selectedColour={paletteColourSelected}
					/>
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	{:else if loadedImageType == 'paletteSplit'}
		<!-- interactive image -->
		<Canvas
			pixels={pixels!}
			bind:tiles
			filterBy={paletteColourSelected}
			{palette}
			{colourMappings}
		/>

		<!-- palette -->
		<PaletteDisplay
			{loadedImageType}
			{palette}
			width={18}
			bind:selectedColour={paletteColourSelected}
			{tiles}
		/>
	{:else if loadedImageType == 'reduced'}
		<!-- interactive image -->
		<Canvas
			pixels={pixels!}
			bind:tiles
			filterBy={paletteColourSelected}
			{palette}
			{colourMappings}
		/>

		<!-- palette -->
		<PaletteDisplay
			{loadedImageType}
			{palette}
			width={18}
			bind:selectedColour={paletteColourSelected}
			{tiles}
			bind:splitPalettes
		/>
	{/if}
</div>
