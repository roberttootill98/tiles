import {
	get_colourDistance,
	type Colour,
	type ColourMapping,
	type CombinationResult
} from './colour';

export type CombinationMode = 'basic' | 'root';

export function distanceCombination_threshold(
	combinationMode: CombinationMode,
	palette: Colour[],
	threshold: number,
	colourMappings: ColourMapping[] = []
): CombinationResult {
	// combine colours within threshold

	// include background colour by defualt
	const reducedPalette: Colour[] = [];

	// slice 1 to ignore background
	for (const colour of palette) {
		// check for similar colour within reduced colours
		const colour_search = reducedPalette.find((colour_search: Colour) => {
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
