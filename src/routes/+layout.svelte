<script lang="ts">
	import './layout.css';
	import favicon from '$lib/assets/favicon.svg';
	import ToggleTheme from "$lib/components/ToggleTheme.svelte";


	let { children } = $props();
</script>

<svelte:head><link rel="icon" href={favicon} /></svelte:head>

<div class="h-screen w-screen flex flex-col bg-background text-white">
	<header class="flex justify-end w-screen p-2">
		<ToggleTheme/>
	</header>

	<main class="flex flex-col justify-center items-center">
		{@render children()}
	</main>
</div>
