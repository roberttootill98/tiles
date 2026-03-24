<script lang="ts">
	import { compareColours, type Colour } from '$lib/colour';

	let {
		colour,
		width,
		onSelect,
		selectedColour = $bindable(undefined)
	}: {
		colour: Colour;
		width: number;
		onSelect?: (colour: Colour) => void;
		selectedColour?: Colour;
	} = $props();

	function onclick(): void {
		if (onSelect != null) {
			onSelect(colour);
		}
	}

	const borderColour: string = $derived.by(() => {
		if (selectedColour != null && compareColours(selectedColour, colour)) {
			return 'black';
		} else {
			return `rgb(${colour.red}, ${colour.green}, ${colour.blue})`;
		}
	});

	const border: string = $derived.by(() => {
		if (selectedColour) {
			return `border: 2px solid ${borderColour}`;
		} else {
			return '';
		}
	});
</script>

<button
	title={`(${colour.red}, ${colour.green}, ${colour.blue})`}
	{onclick}
	onfocus={() => {}}
	onblur={() => {}}
	class="cursor-pointer"
	style="
		width: {width}px; height: {width}px;
		background: rgb({colour.red}, {colour.green}, {colour.blue});
		{border};
	"
>
</button>
