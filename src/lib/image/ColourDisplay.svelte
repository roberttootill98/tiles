<script lang="ts">
	import type { Colour } from "./ImageManager";

    let { colour, width = 10 }: { colour: Colour, width?: number } = $props();
</script>

<div style="
    width: {width}px; height: {width}px;
    background:rgb({colour.red}, {colour.green}, {colour.blue});
"></div>