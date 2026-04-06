import { compareColours, type Colour } from '$lib/colour';

export function compareTiles(tile1: Colour[][], tile2: Colour[][]): boolean {
	if (tile1.length != tile2.length) return false;

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
