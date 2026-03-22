<script lang="ts">
	import type { Colour } from '$lib/colour';
	import Canvas from './Canvas.svelte';
	import type { LoadedImageType } from './loadedImage';
	import Palette from './Palette.svelte';

	let {
		loadedImageType,
		pixels,
		palette,
		splitPalettes = $bindable()
	}: {
		loadedImageType: LoadedImageType;
		pixels: Colour[][];
		palette: Colour[];
		splitPalettes?: Colour[][];
	} = $props();

	let paletteColourSelected: Colour | undefined = $state(undefined);
</script>

<div class="flex gap-2">
	<!-- load interactive image -->
	<Canvas pixels={pixels!} filterBy={paletteColourSelected} />

	<!-- palette -->
	{#if loadedImageType == 'originalImage'}
		<Palette
			{loadedImageType}
			palette={palette!}
			width={18}
			bind:selectedColour={paletteColourSelected}
			bind:splitPalettes
		/>
	{:else}
		<Palette
			{loadedImageType}
			palette={palette!}
			width={18}
			bind:selectedColour={paletteColourSelected}
		/>
	{/if}
</div>
