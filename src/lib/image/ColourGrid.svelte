<script lang="ts">
	import ColourDisplay from "./ColourDisplay.svelte";
	import type { Colour } from "./ImageManager";

    let { rows, width = 10 }: { rows: Colour[][], width?: number } = $props();
</script>

<div class="flex flex-col">
    {#each rows as column (column)}
        <div class="flex">
            {#each column as colour (colour)}
                <ColourDisplay colour={colour} width={width}/>
            {/each}
        </div>
    {/each}
</div>
