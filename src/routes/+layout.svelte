<script lang="ts">
	import './layout.css';
	import greatBall from '$lib/assets/greatBall-removebg-preview.png';
	import ToggleTheme from "$lib/components/ToggleTheme.svelte";

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={greatBall} /></svelte:head>

<div class="h-screen w-screen flex gap-4 flex-col bg-background">
	<header class="flex justify-end w-screen p-2">
		<ToggleTheme/>
	</header>

	<main class="flex flex-col h-full items-center">
		{@render children()}
	</main>
</div>
