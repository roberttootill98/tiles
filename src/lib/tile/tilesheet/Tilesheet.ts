import { compareColours, type Colour } from '$lib/colour';
import { get_tile_palette, type Tile } from '$lib/image/canvas/tiles/tiles';
import { paletteSize, type Palette } from '$lib/image/palette/palette';

export default class Tilesheet {
	// colours that make up the palette
	// private to control modification
	private _palette: Palette = [];

	// tiles that fit in the palette
	// private to control modification
	private _tiles: Tile[] = [];

	constructor(initialPalette: Palette, initialTile: Tile) {
		this._palette = initialPalette;
		this._tiles.push(initialTile);
	}

	public get palette(): Palette {
		return this._palette;
	}

	public get tiles(): Tile[] {
		return this._tiles;
	}

	public get full(): boolean {
		return this.palette.length == paletteSize;
	}

	private get freeSpaces(): number {
		return paletteSize - this.palette.length;
	}

	private get_spaceForColours(colours_new: Colour[]): boolean {
		return this.freeSpaces >= colours_new.length;
	}

	// can tile fit in palette
	// if so then add to tiles
	// return true if added, false if not
	public add_tile(tile: Tile, colour_background: Colour): boolean {
		// get palette of tile
		const palette_tile: Palette = get_tile_palette(tile, colour_background);

		// get difference between instance palette and
		const palette_difference: Palette = this.get_palette_difference(palette_tile);

		if (palette_difference.length == 0) {
			// no extra colours

			// add to tiles
			this._tiles.push(tile);

			return true;
		} else {
			// there are new colours

			// check for space
			if (this.get_spaceForColours(palette_difference)) {
				// there is enough space

				// add colours
				for (const colour of palette_difference) {
					this._palette.push(colour);
				}

				// add tile
				this._tiles.push(tile);

				return true;
			} else {
				// there isn't enough space in palette for new colours
				return false;
			}
		}
	}

	private get_palette_difference(otherPalette: Colour[]): Colour[] {
		const palette_missing: Colour[] = [];

		for (const colour of otherPalette) {
			const found: boolean =
				this.palette.find((colour_search: Colour) => {
					return compareColours(colour, colour_search);
				}) != null;

			if (!found) {
				palette_missing.push(colour);
			}
		}

		return palette_missing;
	}
}
