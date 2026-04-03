import { kmeans } from 'ml-kmeans';
import type { Colour, CombinationResult } from './colour';

export function kMeans(palette: Colour[], k: number): CombinationResult {
	// get palette as array of rgb values
	const palette_flat: number[][] = palette.map((colour: Colour) => {
		return [colour.red, colour.green, colour.blue];
	});

	// do k-means
	const result = kmeans(palette_flat, k, {});

	const reducedPalette: Colour[] = result.centroids.map((centroid: number[]) => {
		return {
			red: Math.round(centroid[0]),
			green: Math.round(centroid[1]),
			blue: Math.round(centroid[2])
		};
	});

	return {
		reducedPalette,
		colourMappings: []
	};
}
