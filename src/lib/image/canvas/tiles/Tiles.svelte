<script lang="ts">
	import { compareColours, type Colour } from '$lib/colour';
	import * as Card from '$lib/components/ui/card/index.js';
	import ColourDisplay from '$lib/image/ColourDisplay.svelte';
	import { tileSize } from '$lib/image/image';
	import { compareTiles, type CompareTileResult, type HighlightedTile, type Tile } from './tiles';

	let {
		pixels,
		backgroundColour,
		tiles = $bindable(),
		highlightedTiles = $bindable()
	}: {
		pixels: Colour[][];
		backgroundColour: Colour;
		tiles: Tile[];
		highlightedTiles: HighlightedTile[];
	} = $props();

	$effect((): void => {
		if (pixels) {
			// set tiles
			setTiles();

			// pixels changed, reset highlighted tiles
			resetSelectedTile();
		}
	});

	function setTiles(): void {
		const tiles_new: Tile[] = [];

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

						tileRow.push({ ...pixels[tileRowIndex][tileColumn] });
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

				//#region find tile
				let tile_found: Tile | null = null;
				let compareTileResult: CompareTileResult | null = null;

				for (const tile_search of tiles_new) {
					const result = compareTiles(tile, tile_search.tile);

					if (result.same) {
						tile_found = tile_search;
						compareTileResult = result;

						break;
					}
				}

				//#endregion find tile

				if (tile_found != null) {
					// existing tile, new mapping
					tile_found.originalTiles.push({
						x_start: column,
						y_start: row,
						x_mirror: compareTileResult!.x_flip,
						y_mirror: compareTileResult!.y_flip
					});
				} else {
					// new tile
					tiles_new.push({
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

		tiles = tiles_new;
	}

	const rowLength: number = 8;

	//#region select tile
	let selectedTileRow: number | null = $state(null);
	let selectedTileColumn: number | null = $state(null);

	function onSelect(row: number, column: number, tile: Tile): void {
		if (row == selectedTileRow && column == selectedTileColumn) {
			// unselect event

			// set selected tile index
			selectedTileRow = null;
			selectedTileColumn = null;

			// unset highlighted tiles
			highlightedTiles = [];
		} else {
			// select event

			// set selected tile index
			selectedTileRow = row;
			selectedTileColumn = column;

			// set highlighted tiles
			highlightedTiles = tile.originalTiles;
		}
	}

	function resetSelectedTile(): void {
		selectedTileRow = null;
		selectedTileColumn = null;

		highlightedTiles = [];
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
					{#each tiles.slice(i * rowLength, (i + 1) * rowLength) as tile, j (j)}
						<button
							onclick={() => onSelect(i, j, tile)}
							class={`flex flex-col border hover:border-red-500
								${selectedTileRow == i && selectedTileColumn == j ? 'border-red-500' : ''}
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

		<div class="flex flex-col gap-1 text-xs text-muted-foreground">
			<span>Unique tiles: {tiles.length}</span>

			{#if highlightedTiles.length > 0}
				<span>
					<span>Tile used</span>
					<strong>{highlightedTiles.length}</strong>

					<span>
						{#if highlightedTiles.length == 1}
							time
						{:else}
							times
						{/if}
					</span>
				</span>
			{/if}
		</div>
	</Card.Content>

	<Card.Footer class="flex flex-col items-start gap-2 text-xs"></Card.Footer>
</Card.Root>
