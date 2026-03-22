<script lang="ts">
	import type { Colour } from '$lib/colour';
	import * as Card from '$lib/components/ui/card/index.js';
	import * as Tabs from '$lib/components/ui/tabs/index.js';
	import Canvas from './Canvas.svelte';

	let {
		pixels,
		filterBy,
		splitPalettes
	}: {
		pixels: Colour[][];
		filterBy?: Colour;
		splitPalettes: Colour[][];
	} = $props();
</script>

<Card.Root class="gap-2">
	{#if splitPalettes.length > 0}
		<Tabs.Root value="original" class="mx-2">
			<Tabs.List>
				<Tabs.Trigger value="orginal" class="cursor-pointer">Original</Tabs.Trigger>

				{#each splitPalettes as splitPalette, index (splitPalette)}
					<Tabs.Trigger value="palette-{index}" class="cursor-pointer">
						{index}
					</Tabs.Trigger>
				{/each}
			</Tabs.List>

			<Tabs.Content value="original">
				<Canvas pixels={pixels!} {filterBy} />
			</Tabs.Content>

			{#each splitPalettes as splitPalette, index (splitPalette)}
				<Tabs.Content value="palette-{index}">
					<Canvas pixels={pixels!} {filterBy} />
				</Tabs.Content>
			{/each}
		</Tabs.Root>
	{:else}
		<!-- load interactive image -->
		<Canvas pixels={pixels!} {filterBy} />
	{/if}
</Card.Root>
