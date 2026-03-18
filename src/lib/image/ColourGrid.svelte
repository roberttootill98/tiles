<script lang="ts">
	import ColourDisplay from "./ColourDisplay.svelte";
	import type { Colour } from "./ImageManager";

    let { rows }: { rows: Colour[][] } = $props();
</script>

<div class="flex flex-col">
    {#each rows as column (column)}
        <div class="flex">
            {#each column as colour (colour)}
                <ColourDisplay colour={colour} width={3}/>
            {/each}
        </div>
    {/each}
</div>
