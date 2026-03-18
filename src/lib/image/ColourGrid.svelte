<script lang="ts">
	import ColourDisplay from "./ColourDisplay.svelte";
	import type { Colour } from "./ImageManager";

    let {
        rows,
        width = 10,
        selectedColour = $bindable(null),
        hoveredColour = $bindable(null)
    }: { 
        rows: Colour[][],
        width?: number,
        selectedColour?: Colour | null
        hoveredColour?: Colour | null
    } = $props();

    function onHoverChanged(colour: Colour | null): void {
        hoveredColour = colour;
    }

    function onSelect(colour: Colour): void {
        selectedColour = colour;
    }
</script>

<div class="flex flex-col">
    {#each rows as column (column)}
        <div class="flex">
            {#each column as colour (colour)}
                <ColourDisplay
                    colour={colour}
                    width={width}
                    {onSelect}
                    {onHoverChanged}
                />
            {/each}
        </div>
    {/each}
</div>
