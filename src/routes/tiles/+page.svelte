<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import ImageManager from '$lib/image/ImageManager';
	import { LoaderCircle, X } from 'lucide-svelte';
	import type { Colour } from '$lib/colour';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import LoadedImage from '$lib/image/LoadedImage.svelte';

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

	let splitPalettes: Colour[][] = $state([]);
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
			{#if splitPalettes.length > 0}
				<Tabs.Root value="original" class="mx-2">
					<Tabs.List>
						<Tabs.Trigger value="original" class="cursor-pointer">Original</Tabs.Trigger>

						{#each splitPalettes as splitPalette, index (splitPalette)}
							<Tabs.Trigger value="palette-{index}" class="cursor-pointer">
								{index}
							</Tabs.Trigger>
						{/each}
					</Tabs.List>

					<Tabs.Content value="original">
						<LoadedImage
							loadedImageType="originalImage"
							pixels={pixels!}
							palette={palette!}
							bind:splitPalettes
						/>
					</Tabs.Content>

					{#each splitPalettes as palette, index (palette)}
						<Tabs.Content value="palette-{index}">
							<LoadedImage loadedImageType="paletteSplit" pixels={pixels!} palette={palette!} />
						</Tabs.Content>
					{/each}
				</Tabs.Root>
			{:else}
				<LoadedImage
					loadedImageType="originalImage"
					pixels={pixels!}
					palette={palette!}
					bind:splitPalettes
				/>
			{/if}
		{:else if imageLoading}
			<LoaderCircle class="animate-spin" />
		{/if}
	{/if}
</div>
