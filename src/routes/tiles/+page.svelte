<script lang="ts">
	import Button from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import ImageManager from '$lib/image/ImageManager';
	import { LoaderCircle, X } from 'lucide-svelte';
	import type { Colour, ColourMapping } from '$lib/colour';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import LoadedImage from '$lib/image/LoadedImage.svelte';

	//#region file input
	let file: File | undefined = $state(undefined);
	let files: FileList | undefined = $state(undefined);

	function clearFileInput(): void {
		file = undefined;
		files = undefined;

		removeSplitPalette();
		removeReducedPalette();
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

	//#region split palette
	let splitPalettes: Colour[][] = $state([]);

	function removeSplitPalette(): void {
		splitPalettes = [];
	}

	//#endregion split palette

	//#region reduced palette

	let reducedPalette: Colour[] | undefined = $state(undefined);
	let colourMappings: ColourMapping[] | undefined = $state(undefined);

	function removeReducedPalette(): void {
		reducedPalette = undefined;
		colourMappings = undefined;
	}

	//#endregion reduced palette

	// if there are tabs
	const tabs: boolean = $derived.by(() => {
		return (
			// there are some split palettes
			splitPalettes.length > 0 ||
			// there is a reduced palette
			reducedPalette != undefined
		);
	});

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
			{#if tabs}
				<Tabs.Root value="original" class="mx-2">
					<div class="flex gap-2">
						<Tabs.List>
							<Tabs.Trigger value="original" class="cursor-pointer">Original</Tabs.Trigger>

							{#each splitPalettes as splitPalette, index (splitPalette)}
								<Tabs.Trigger value="palette-{index}" class="cursor-pointer">
									{index}
								</Tabs.Trigger>
							{/each}

							{#if reducedPalette != null}
								<Tabs.Trigger value="reduced" class="cursor-pointer">Reduced</Tabs.Trigger>
							{/if}
						</Tabs.List>

						{#if splitPalettes.length > 0}
							<Button onclick={removeSplitPalette}>
								<X />
								<span>Remove Split Palette</span>
							</Button>
						{/if}

						{#if reducedPalette != null}
							<Button onclick={removeReducedPalette}>
								<X />
								<span>Remove Reduced Palette</span>
							</Button>
						{/if}
					</div>

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

					{#if reducedPalette != null}
						<Tabs.Content value="reduced">
							<LoadedImage
								loadedImageType="reduced"
								pixels={pixels!}
								palette={reducedPalette!}
								{colourMappings}
							/>
						</Tabs.Content>
					{/if}
				</Tabs.Root>
			{:else}
				<LoadedImage
					loadedImageType="originalImage"
					pixels={pixels!}
					palette={palette!}
					bind:splitPalettes
					bind:reducedPalette
					bind:colourMappings
				/>
			{/if}
		{:else if imageLoading}
			<LoaderCircle class="animate-spin" />
		{/if}
	{/if}
</div>
