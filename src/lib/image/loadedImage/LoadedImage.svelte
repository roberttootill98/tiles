<script lang="ts">
	import type { Colour, ColourMapping } from '$lib/colour';
	import Canvas from '../canvas/Canvas.svelte';
	import type { LoadedImageType } from './loadedImage';
	import Palette from '../palette/Palette.svelte';
	import type { Tile } from '../canvas/tiles/tiles';

	let {
		loadedImageType,
		pixels = $bindable(),
		palette,
		splitPalettes = $bindable(),
		reducedPalette = $bindable(),
		colourMappings = $bindable()
	}: {
		loadedImageType: LoadedImageType;
		pixels: Colour[][];
		palette: Colour[];
		splitPalettes?: Colour[][];
		reducedPalette?: Colour[];
		colourMappings?: ColourMapping[];
	} = $props();

	let tiles: Tile[] = $state([]);

	let paletteColourSelected: Colour | undefined = $state(undefined);
</script>

<div class="flex gap-2">
	{#if loadedImageType == 'originalImage'}
		<!-- interactive image -->
		<Canvas bind:pixels={pixels!} bind:tiles filterBy={paletteColourSelected} {palette} />

		<!-- palette -->
		<Palette
			{loadedImageType}
			{palette}
			width={18}
			bind:selectedColour={paletteColourSelected}
			bind:splitPalettes
			bind:reducedPalette
			bind:colourMappings
		/>
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
		<Palette {loadedImageType} {palette} width={18} bind:selectedColour={paletteColourSelected} />
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
		<Palette
			{loadedImageType}
			{palette}
			width={18}
			bind:selectedColour={paletteColourSelected}
			bind:splitPalettes
		/>
	{/if}
</div>
