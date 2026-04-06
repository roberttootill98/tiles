<script lang="ts">
	import type { Colour } from '$lib/colour';
	import * as Card from '$lib/components/ui/card/index.js';
	import ColourDisplay from '$lib/image/ColourDisplay.svelte';
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

	const rowLength: number = 8;
</script>

<Card.Root class="gap-2">
	<Card.Header>
		<span class="font-bold">Tiles</span>
	</Card.Header>

	<Card.Content>
		<!-- render tiles -->
		<div class="flex flex-col">
			{#each { length: Math.ceil(tiles.length / rowLength) }, i}
				<div class="flex">
					{#each tiles.slice(i * rowLength, (i + 1) * rowLength) as tile (tile)}
						<div class="flex flex-col">
							{#each tile as row (row)}
								<div class="flex">
									{#each row as colour (colour)}
										<ColourDisplay {colour} width={2} />
									{/each}
								</div>
							{/each}
						</div>
					{/each}
				</div>
			{/each}
		</div>

		<span class="text-xs text-muted-foreground">Unique tiles: {tiles.length}</span>
	</Card.Content>

	<Card.Footer class="flex flex-col items-start gap-2 text-xs"></Card.Footer>
</Card.Root>
