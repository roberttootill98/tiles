<script lang="ts">
	import type { Colour } from "./ImageManager";

    let {
        colour,
        width = 10,
        onSelect,
        filterBy
    }: {
        colour: Colour;
        width?: number;
        onSelect: (colour: Colour) => void;
        filterBy?: Colour;
    } = $props();

    function onclick(): void {
        onSelect(colour);
    }

    const match: boolean = $derived.by(() => {
        if(filterBy == undefined) return true;

        return (
            colour.red == filterBy.red &&
            colour.green == filterBy.green &&
            colour.blue == filterBy.blue
        );
    });

    const opacity: number = $derived.by(() => {
        if(match) {
            return 1;
        } else {
            return 0.5;
        }
    });
</script>

<button title={`(${colour.red}, ${colour.green}, ${colour.blue})`}
    {onclick} onfocus={() => {}} onblur={() => {}}
    class="cursor-pointer"
    style="
        width: {width}px; height: {width}px;
        background: rgba({colour.red}, {colour.green}, {colour.blue}, {opacity});
    "
>
</button>