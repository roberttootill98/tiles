import { get_colourDistance, type Colour, type CombinationResult } from './colour';

export type CombinationMode = 'basic' | 'root';

export function distanceCombination(
	combinationMode: CombinationMode,
	palette: Colour[],
	threshold: number
): CombinationResult {
	// combine colours within threshold

	// include background colour by defualt
	const reducedPalette = [palette[0]];
	const colourMappings = [];

	// slice 1 to ignore background
	for (const colour of palette.slice(1)) {
		// check for similar colour within reduced colours
		const colour_search = reducedPalette.slice(1).find((colour_search: Colour) => {
			switch (combinationMode) {
				case 'basic':
					return (
						Math.abs(colour_search.red - colour.red) < threshold &&
						Math.abs(colour_search.green - colour.green) < threshold &&
						Math.abs(colour_search.blue - colour.blue) < threshold
					);
				case 'root':
					return get_colourDistance(colour_search, colour) < threshold;
			}
		});

		if (colour_search == null) {
			// colour not found, so add to unique reduced colours
			reducedPalette.push(colour);
		} else {
			// colour is found, so add mapping
			colourMappings.push({
				original: colour,
				replaceWith: colour_search
			});
		}
	}

	return { reducedPalette, colourMappings };
}
