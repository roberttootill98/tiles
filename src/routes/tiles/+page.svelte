<script lang="ts">
	import Button, { buttonVariants } from '$lib/components/ui/button/button.svelte';
	import { Input } from '$lib/components/ui/input/index.js';
	import ImageManager from '$lib/image/ImageManager';
	import { ArrowRight, Eye, LoaderCircle, MoveHorizontal, X } from 'lucide-svelte';
	import type { Colour, ColourMapping } from '$lib/colour';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import LoadedImage from '$lib/image/LoadedImage.svelte';
	import ColourDisplay from '$lib/image/ColourDisplay.svelte';
	import RGBDisplay from '$lib/image/RGBDisplay.svelte';
	import * as Tooltip from '$lib/components/ui/tooltip/index.js';

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
	let splitPalettes: Colour[][] | undefined = $state(undefined);

	function removeSplitPalette(): void {
		// move back to first tab
		tabValue = 'original';

		splitPalettes = undefined;
	}

	//#endregion split palette

	//#region reduced palette

	let reducedPalette: Colour[] | undefined = $state(undefined);
	let colourMappings: ColourMapping[] | undefined = $state(undefined);

	function removeReducedPalette(): void {
		// move back to first tab
		tabValue = 'original';

		reducedPalette = undefined;
		colourMappings = undefined;
	}

	function swapColourMapping(colourMapping: ColourMapping): void {
		//#region swap in reduced palette
		const reducedPalette_index: number = reducedPalette!.indexOf(colourMapping.replaceWith);

		reducedPalette![reducedPalette_index] = colourMapping.original;
		//#endregion swap in reduced palette

		//#region swap in colour mapping
		const original_previous: Colour = colourMapping.original;

		colourMapping.original = colourMapping.replaceWith;
		colourMapping.replaceWith = original_previous;
		//#endregion swap in colour mapping
	}

	//#endregion reduced palette

	// if there are tabs
	const tabs: boolean = $derived.by(() => {
		return (
			// there are some split palettes
			(splitPalettes != undefined && splitPalettes.length > 0) ||
			// there is a reduced palette
			reducedPalette != undefined
		);
	});

	let tabValue: string = $state('original');

	function onTabValueChange(tabValue_new: string): void {
		tabValue = tabValue_new;
	}

	function get_class_tabTrigger(tabName: string): string {
		const class_currentTab_text: string = 'text-primary-foreground';

		const classes_currentTab: string = [
			'bg-primary',
			class_currentTab_text,
			`dark:${class_currentTab_text}`,
			`hover:${class_currentTab_text}`,
			`dark:hover:${class_currentTab_text}`,
			`data-active:${class_currentTab_text}`,
			`dark:data-active:${class_currentTab_text}`
		].join(' ');

		return ['cursor-pointer', tabValue == tabName ? classes_currentTab : ''].join(' ');
	}

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
				<Tabs.Root value={tabValue} class="mx-2" onValueChange={onTabValueChange}>
					<div class="flex gap-2">
						<Tabs.List>
							<Tabs.Trigger value="original" class={get_class_tabTrigger('original')}
								>Original</Tabs.Trigger
							>

							{#each splitPalettes as splitPalette, index (splitPalette)}
								<Tabs.Trigger
									value="palette-{index}"
									class={get_class_tabTrigger(`palette-${index}`)}
								>
									{index}
								</Tabs.Trigger>
							{/each}

							{#if reducedPalette != null}
								<Tabs.Trigger value="reduced" class={get_class_tabTrigger('reduced')}>
									Reduced
								</Tabs.Trigger>
							{/if}
						</Tabs.List>

						{#if splitPalettes != undefined && splitPalettes.length > 0}
							<Button onclick={removeSplitPalette} variant="outline">
								<X />
								<span>Remove Split Palette</span>
							</Button>
						{/if}

						{#if reducedPalette != null}
							<Button onclick={removeReducedPalette} variant="outline">
								<X />
								<span>Remove Reduced Palette</span>
							</Button>

							<Dialog.Root>
								<Dialog.Trigger type="button" class={buttonVariants({ variant: 'outline' })}>
									<Eye />
									<span>View Reduced Palette</span>
								</Dialog.Trigger>

								<Dialog.Content class="w-fit max-w-none sm:max-w-fit">
									<Dialog.Header>
										<Dialog.Title>Reduced Palette</Dialog.Title>

										<Dialog.Description>
											Which colours have been mapped to which.
										</Dialog.Description>
									</Dialog.Header>

									<div class="grid grid-cols-3 gap-1">
										{#each colourMappings as colourMapping (colourMapping)}
											<!-- was - rgb -->
											<RGBDisplay colour={colourMapping.original} />

											<div class="flex items-center justify-center gap-2">
												<!-- was -->
												<ColourDisplay colour={colourMapping.original} width={18} />

												<!-- arrow -->
												<ArrowRight />

												<!-- replaced with -->
												<ColourDisplay colour={colourMapping.replaceWith} width={18} />

												<!-- swap colours -->
												<Tooltip.Provider>
													<Tooltip.Root>
														<Tooltip.Trigger>
															<Button
																onclick={() => swapColourMapping(colourMapping)}
																variant="outline"
																size="icon"
																class="size-fit p-1"
															>
																<MoveHorizontal width={6} height={6} />
															</Button>
														</Tooltip.Trigger>

														<Tooltip.Content>
															<span>Swap colour mapping.</span>
														</Tooltip.Content>
													</Tooltip.Root>
												</Tooltip.Provider>
											</div>

											<!-- replaced with - rgb -->
											<RGBDisplay colour={colourMapping.replaceWith} />
										{/each}
									</div>
								</Dialog.Content>
							</Dialog.Root>
						{/if}
					</div>

					<Tabs.Content value="original">
						<LoadedImage
							loadedImageType="originalImage"
							pixels={pixels!}
							palette={palette!}
							bind:splitPalettes
							bind:reducedPalette
							bind:colourMappings
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
								bind:splitPalettes
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
