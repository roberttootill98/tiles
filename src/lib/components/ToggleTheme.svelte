<script lang="ts">
	import { Moon, Sun } from "lucide-svelte";
	import Button from "./ui/button/button.svelte";
	import { onMount } from "svelte";

    onMount(() => {
        document.documentElement.classList.add('dark');
    });
    
    let dark: boolean = $state(true);

    function toggleDark(): void {
        dark = !dark;

        if (dark) {
            document.documentElement.classList.add('dark');
            localStorage.setItem('theme', 'dark');
        } else {
            document.documentElement.classList.remove('dark');
            localStorage.setItem('theme', 'light');
        }
    }
</script>

<Button onclick={toggleDark}>
    {#if dark}
        <Sun/>
    {:else}
        <Moon/>
    {/if}
</Button>
