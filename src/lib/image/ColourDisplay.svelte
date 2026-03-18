<script lang="ts">
	import type { Colour } from "./ImageManager";

    let {
        colour,
        width,
        onSelect,
        selectedColour = $bindable(null),
    }: {
        colour: Colour;
        width: number;
        onSelect: (colour: Colour) => void;
        selectedColour?: Colour | null;
    } = $props();

    function onclick(): void {
        onSelect(colour);
    }

    const borderColour: string = $derived.by(() => {
        if(
            selectedColour != null &&
            selectedColour.red == colour.red &&
            selectedColour.green == colour.green &&
            selectedColour.blue == colour.blue
        ) {
            return 'black';
        } else {
            return `rgb(${colour.red}, ${colour.green}, ${colour.blue})`;
        }
    });

    const border: string = $derived.by(() => {
        if(selectedColour) {
            return `border: 2px solid ${borderColour}`;
        } else {
            return '';
        }
    });
</script>

<button title={`(${colour.red}, ${colour.green}, ${colour.blue})`}
    {onclick} onfocus={() => {}} onblur={() => {}}
    class="cursor-pointer"
    style="
        width: {width}px; height: {width}px;
        background: rgb({colour.red}, {colour.green}, {colour.blue});
        {border};
    "
>
</button>