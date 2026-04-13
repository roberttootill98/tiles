import { compareColours, type Colour } from '$lib/colour';

export type HighlightedTile = {
	x_start: number;
	y_start: number;
	x_mirror: boolean;
	y_mirror: boolean;
};

export function compareTiles(tile1: Colour[][], tile2: Colour[][]): boolean {
	if (tile1.length != tile2.length) return false;

	// generate flipped versions of tile 1
	const tile1_flippedX: Colour[][] = flipInX(tile1);
	const tile1_flippedY: Colour[][] = flipInY(tile1);
	const tile1_flippedXY: Colour[][] = flipInY(flipInX(tile1));

	// regular
	const compare_regular = compare(tile1, tile2);

	// flip x only
	const compare_flippedX = compare(tile1_flippedX, tile2);

	// flip y only
	const compare_flippedY = compare(tile1_flippedY, tile2);

	// flip x and y
	const compare_flippedXY = compare(tile1_flippedXY, tile2);

	return compare_regular || compare_flippedX || compare_flippedY || compare_flippedXY;
}

function compare(tile1: Colour[][], tile2: Colour[][]): boolean {
	for (let row = 0; row < tile1.length; row++) {
		if (tile1[row].length != tile2[row].length) return false;

		for (let column = 0; column < tile1[row].length; column++) {
			if (!compareColours(tile1[row][column], tile2[row][column])) {
				return false;
			}
		}
	}

	return true;
}

function flipInX(tile: Colour[][]): Colour[][] {
	const tile_new: Colour[][] = [];

	for (let row = 0; row < tile.length; row++) {
		const row_new: Colour[] = [];

		for (let column = tile[row].length - 1; column > 0; column--) {
			row_new.push(tile[row][column]);
		}

		tile_new.push(row_new);
	}

	return tile_new;
}

function flipInY(tile: Colour[][]): Colour[][] {
	const tile_new: Colour[][] = [];

	for (let row = tile.length - 1; row > 0; row--) {
		tile_new.push(tile[row]);
	}

	return tile_new;
}
