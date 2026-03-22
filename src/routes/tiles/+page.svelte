<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import ImageManager from '$lib/image/ImageManager';
	import { LoaderCircle, X } from 'lucide-svelte';
	import Palette from '$lib/image/Palette.svelte';
	import Canvas from '$lib/image/Canvas.svelte';
	import type { Colour } from '$lib/colour';

	//#region file input
	let file: File | undefined = $state(undefined);
	let files: FileList | undefined = $state(undefined);

	function clearFileInput(): void {
		file = undefined;
		files = undefined;
	}

	//#endregion file input

	$effect(() => {
		if (file != undefined) {
			loadImage();
		}
	});

	async function loadImage(): Promise<void> {
		try {
			imageLoading = true;

			imageLoaded = false;
			pixels = null;
			palette = null;

			if (files == undefined) return;
			if (files[0] == undefined) return;

			const imageLoadData = await ImageManager.loadImage(files[0]);

			pixels = imageLoadData.pixels;
			palette = imageLoadData.palette;

			imageLoaded = true;
		} finally {
			imageLoading = false;
		}
	}

	let imageLoading: boolean = $state(false);

	//#region image loaded
	let imageLoaded: boolean = $state(false);
	let pixels: Colour[][] | null = $state(null);
	let palette: Colour[] | null = $state(null);

	let paletteColourSelected: Colour | undefined = $state(undefined);
	//#endregion image loaded
</script>

<div class="flex flex-col items-center gap-2">
	<!-- file input -->
	<div class="flex items-center gap-2">
		<!-- label -->
		<span class="w-fit">Tiles file upload:</span>

		<!-- input -->
		<Input class="w-fit cursor-pointer" type="file" bind:files bind:value={file} />

		<Button onclick={clearFileInput}><X /></Button>
	</div>

	{#if files != undefined}
		{#if !imageLoading && imageLoaded}
			<div class="flex gap-2">
				<!-- load interactive image -->
				<Canvas pixels={pixels!} filterBy={paletteColourSelected} />

				<!-- palette -->
				<Palette bind:palette={palette!} width={18} bind:selectedColour={paletteColourSelected} />
			</div>
		{:else if imageLoading}
			<LoaderCircle class="animate-spin" />
		{/if}
	{/if}
</div>
