<script lang="ts">
	import { compareColours, type Colour } from '$lib/colour';
	import * as Card from '$lib/components/ui/card/index.js';
	import ColourDisplay from '$lib/image/ColourDisplay.svelte';
	import { tileSize } from '$lib/image/image';
	import { compareTiles, type HighlightedTile } from './tiles';

	let {
		pixels,
		backgroundColour,
		highlightedTiles = $bindable()
	}: {
		pixels: Colour[][];
		backgroundColour: Colour;
		highlightedTiles: HighlightedTile[];
	} = $props();

	type Tile = {
		// tile as 2d array of colours
		tile: Colour[][];
		// coordinates of tiles in original image that map to this one
		originalTiles: HighlightedTile[];
	};

	const tiles: Tile[] = $derived.by(() => {
		const tiles_found: Tile[] = [];

		for (let row = 0; row < pixels.length; row += tileSize) {
			for (let column = 0; column < pixels[row].length; column += tileSize) {
				//#region get tile
				const tile: Colour[][] = [];

				// if we have found a colour that's not the background colour
				let nonBackgroundColourFound: boolean = false;

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

						if (!compareColours(pixels[tileRowIndex][tileColumn], backgroundColour)) {
							nonBackgroundColourFound = true;
						}

						tileRow.push(pixels[tileRowIndex][tileColumn]);
					}

					if (tileRow.length != tileSize) {
						// row doesn't match metatile width, so extend
						for (let i = 0; i < tileSize - tileRow.length; i++) {
							tileRow.push(backgroundColour);
						}
					}

					tile.push(tileRow);
				}

				// tile is all background colour, so skip
				if (!nonBackgroundColourFound) continue;

				//#endregion get tile

				//#region check if tile already found
				const tile_found: Tile | undefined = tiles_found.find((tile_search: Tile) => {
					return compareTiles(tile, tile_search.tile);
				});

				if (tile_found != null) {
					// existing tile, new mapping
				} else {
					// new tile
					tiles_found.push({
						tile,
						originalTiles: [
							{
								x_start: column,
								y_start: row,
								x_mirror: false,
								y_mirror: false
							}
						]
					});
				}

				//#endregion check if tile already found
			}
		}

		return tiles_found;
	});

	const rowLength: number = 8;

	//#region select tile
	let selectedTileIndex: number | null = $state(null);

	function onSelect(index: number, tile: Tile): void {
		if (index == selectedTileIndex) {
			// unselect event

			// set selected tile index
			selectedTileIndex = null;

			// unset highlighted tiles
			highlightedTiles = [];
		} else {
			// select event

			// set selected tile index
			selectedTileIndex = index;

			// set highlighted tiles
			highlightedTiles = tile.originalTiles;
		}
	}

	//#endregion select tile
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
						<button
							onclick={() => onSelect(i, tile)}
							class={`flex flex-col border hover:border-red-500
								${selectedTileIndex == i ? 'border-red-500' : ''}
							`}
						>
							{#each tile.tile as row (row)}
								<div class="flex">
									{#each row as colour, i (i)}
										<ColourDisplay {colour} width={2} onSelect={() => {}} />
									{/each}
								</div>
							{/each}
						</button>
					{/each}
				</div>
			{/each}
		</div>

		<span class="text-xs text-muted-foreground">Unique tiles: {tiles.length}</span>
	</Card.Content>

	<Card.Footer class="flex flex-col items-start gap-2 text-xs"></Card.Footer>
</Card.Root>
