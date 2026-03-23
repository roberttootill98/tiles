<script lang="ts">
	import type { Colour, ColourMapping } from '$lib/colour';
	import Canvas from './Canvas.svelte';
	import type { LoadedImageType } from './loadedImage';
	import Palette from './Palette.svelte';

	let {
		loadedImageType,
		pixels,
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

	let paletteColourSelected: Colour | undefined = $state(undefined);
</script>

<div class="flex gap-2">
	{#if loadedImageType == 'originalImage'}
		<!-- interactive image -->
		<Canvas pixels={pixels!} filterBy={paletteColourSelected} />

		<!-- palette -->
		<Palette
			{loadedImageType}
			palette={palette!}
			width={18}
			bind:selectedColour={paletteColourSelected}
			bind:splitPalettes
			bind:reducedPalette
			bind:colourMappings
		/>
	{:else if loadedImageType == 'paletteSplit'}
		<!-- interactive image -->
		<Canvas pixels={pixels!} filterBy={paletteColourSelected} {palette} />

		<!-- palette -->
		<Palette
			{loadedImageType}
			palette={palette!}
			width={18}
			bind:selectedColour={paletteColourSelected}
		/>
	{:else if loadedImageType == 'reduced'}
		<!-- interactive image -->
		<Canvas pixels={pixels!} filterBy={paletteColourSelected} {palette} {colourMappings} />

		<!-- palette -->
		<Palette {loadedImageType} {palette} width={18} bind:selectedColour={paletteColourSelected} />
	{/if}
</div>
