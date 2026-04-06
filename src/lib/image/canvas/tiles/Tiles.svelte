<script lang="ts">
	import type { Colour } from '$lib/colour';
	import * as Card from '$lib/components/ui/card/index.js';
	import { tileSize } from '$lib/image/image';
	import { compareTiles } from './tiles';

	let {
		pixels
	}: {
		pixels: Colour[][];
	} = $props();

	const tiles: Colour[][][] = $derived.by(() => {
		const tiles_found: Colour[][][] = [];

		for (let row = 0; row < pixels.length; row += tileSize) {
			for (let column = 0; column < pixels[row].length; column += tileSize) {
				//#region get tile
				const tile: Colour[][] = [];

				for (let tileRowIndex = row; tileRowIndex < row + tileSize; tileRowIndex++) {
					const tileRow: Colour[] = [];

					for (let tileColumn = column; tileColumn < column + tileSize; tileColumn++) {
						// if dimensions of tile sheet are not multiples of tile size
						// then at the end of the sheet, this will be out of range
						// so ignore, allow tile to be smaller
						if (
							pixels[tileRowIndex] == undefined ||
							pixels[tileRowIndex][tileColumn] == undefined
						) {
							break;
						}

						tileRow.push(pixels[tileRowIndex][tileColumn]);
					}

					tile.push(tileRow);
				}

				//#endregion get tile

				//#region check if tile already found
				const found: boolean =
					tiles_found.find((tile_search: Colour[][]) => {
						return compareTiles(tile, tile_search);
					}) != null;

				if (!found) {
					// new tile
					tiles_found.push(tile);
				}

				//#endregion check if tile already found
			}
		}

		return tiles_found;
	});
</script>

<Card.Root class="gap-2">
	<Card.Header>
		<span class="font-bold">Tiles</span>
	</Card.Header>

	<Card.Content>
		<!-- render tiles -->
		<div>
			tile count: {tiles.length}
		</div>
	</Card.Content>

	<Card.Footer class="flex flex-col items-start gap-2 text-xs"></Card.Footer>
</Card.Root>
