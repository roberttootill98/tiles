<script lang="ts">
	import ColourDisplay from "./ColourDisplay.svelte";
	import type { Colour } from "./ImageManager";

    let {
        rows,
        width = 10,
        selectedColour = $bindable(null),
        filterBy
    }: { 
        rows: Colour[][];
        width?: number;
        selectedColour?: Colour | null;
        filterBy?: Colour;
    } = $props();

    function onSelect(colour: Colour): void {
        if(
            selectedColour != null &&
            selectedColour.red == colour.red &&
            selectedColour.green == colour.green &&
            selectedColour.blue == colour.blue
        ) {
            selectedColour = null;
        } else {
            selectedColour = colour;
        }
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
                    {filterBy}
                />
            {/each}
        </div>
    {/each}
</div>
