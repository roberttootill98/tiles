<script lang="ts">
	import type { Colour } from "./ImageManager";

    let {
        colour,
        width = 10,
        onSelect,
        onHoverChanged
    }: {
        colour: Colour,
        width?: number,
        onSelect: (colour: Colour) => void,
        onHoverChanged: (colour: Colour | null) => void
    } = $props();

    function onclick(): void {
        onSelect(colour);
    }

    function onmouseover(): void {
        onHoverChanged(colour);
    }

    function onmouseout(): void {
        onHoverChanged(null);
    }
</script>

<button title={`(${colour.red}, ${colour.green}, ${colour.blue})`}
    {onclick} {onmouseover} {onmouseout} onfocus={() => {}} onblur={() => {}}
    class="cursor-pointer"
    style="
        width: {width}px; height: {width}px;
        background:rgb({colour.red}, {colour.green}, {colour.blue});
    "
>
</button>