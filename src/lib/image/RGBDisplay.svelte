<script lang="ts">
	import type { Colour } from '$lib/colour';
	import ColourDisplay from './ColourDisplay.svelte';

	let { colour }: { colour: Colour } = $props();

	const schemas_rgb: { name: string; value: number }[] = $derived([
		{ name: 'Red', value: colour.red },
		{ name: 'Green', value: colour.green },
		{ name: 'Blue', value: colour.blue }
	]);

	const swatchWidth: number = 10;
</script>

<div class="flex gap-2">
	{#each schemas_rgb as schema_rgb (schema_rgb)}
		<div class="flex w-16 items-center gap-2 rounded bg-accent px-1">
			<!-- icon -->
			{#if schema_rgb.name == 'Red'}
				<ColourDisplay colour={{ red: 255, green: 0, blue: 0 }} width={swatchWidth} />
			{:else if schema_rgb.name == 'Green'}
				<ColourDisplay colour={{ red: 0, green: 255, blue: 0 }} width={swatchWidth} />
			{:else if schema_rgb.name == 'Blue'}
				<ColourDisplay colour={{ red: 0, green: 0, blue: 255 }} width={swatchWidth} />
			{/if}

			<!-- value -->
			<span class="text-xs">{schema_rgb.value}</span>
		</div>
	{/each}
</div>
