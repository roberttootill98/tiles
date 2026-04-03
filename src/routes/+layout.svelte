<script lang="ts">
	import './layout.css';
	import greatBall from '$lib/assets/greatBall-removebg-preview.png';
	import ToggleTheme from '$lib/components/ToggleTheme.svelte';
	import Info from '$lib/components/Info.svelte';

	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={greatBall} /></svelte:head>

<div class="flex h-screen w-screen flex-col gap-4 bg-background">
	<header class="flex w-screen justify-end gap-2 p-2">
		<ToggleTheme />
		<Info />
	</header>

	<main class="flex h-full flex-col items-center">
		{@render children()}
	</main>
</div>
