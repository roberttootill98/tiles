import { compareColours, get_colourDistance, type Colour, type ColourMapping } from './colour';

// provide either k or threshold, not both
type KMeansOptions = {
	// target number of colours
	k?: number;
	// how close colours should be
	threshold?: number;
	maxIterations: number;
};

type KMeansResult = {
	reducedPalette: Colour[];
	colourMappings: ColourMapping[];
};

function average(palette: Colour[]): Colour {
	const total = palette.reduce(
		(acc, c) => {
			acc.red += c.red;
			acc.green += c.green;
			acc.blue += c.blue;
			return acc;
		},
		{ red: 0, green: 0, blue: 0 }
	);

	return {
		red: total.red / palette.length,
		green: total.green / palette.length,
		blue: total.blue / palette.length
	};
}

export function kMeans(palette: Colour[], options: KMeansOptions): KMeansResult {
	const { k, threshold, maxIterations } = options;

	if (palette.length == 0) {
		return { reducedPalette: [], colourMappings: [] };
	}

	//#region initialize centroids
	let centroids: Colour[];

	if (k) {
		// since we have a target number of thresholds, then randomize
		const shuffled: Colour[] = [...palette].sort(() => Math.random() - 0.5);
		centroids = shuffled.slice(0, Math.min(k, palette.length));
	} else {
		// no target number of palettes so just take as is
		centroids = [...palette];
	}

	//#endregion initialize centroids

	for (let iter = 0; iter < maxIterations; iter++) {
		const clusters: Colour[][] = centroids.map(() => []);

		// assign step
		for (const colour of palette) {
			let bestIndex: number = -1;
			let bestDist: number = Infinity;

			for (let i = 0; i < centroids.length; i++) {
				const distance: number = get_colourDistance(colour, centroids[i]);

				if (threshold != undefined && distance > threshold) continue;

				if (distance < bestDist) {
					bestDist = distance;
					bestIndex = i;
				}
			}

			// fallback: always assign to closest centroid
			if (bestIndex === -1) {
				let closest: number = 0;
				let closestDist: number = Infinity;

				for (let i = 0; i < centroids.length; i++) {
					const distance: number = get_colourDistance(colour, centroids[i]);

					if (distance < closestDist) {
						closestDist = distance;
						closest = i;
					}
				}

				bestIndex = closest;
			}

			clusters[bestIndex].push(colour);
		}

		// update step
		const newCentroids: Colour[] = [];

		for (let i = 0; i < clusters.length; i++) {
			const cluster = clusters[i];
			if (cluster.length === 0) continue;

			const newC = average(cluster);

			// optional threshold guard
			if (threshold !== undefined) {
				const shift = get_colourDistance(newC, centroids[i]);
				if (shift > threshold) continue;
			}

			newCentroids.push(newC);
		}

		// convergence check
		const stable: boolean =
			newCentroids.length == centroids.length &&
			newCentroids.every(
				(colour: Colour, i: number) => get_colourDistance(colour, centroids[i]) < 1
			);

		centroids = newCentroids;

		if (threshold !== undefined && k === undefined) {
			centroids = mergeCloseCentroids(centroids, threshold);
		}

		if (stable) break;
	}

	//#region final assignment
	const assignments: number[] = [];

	for (const colour of palette) {
		let bestIndex: number = -1;
		let bestDist: number = Infinity;

		for (let i = 0; i < centroids.length; i++) {
			const d: number = get_colourDistance(colour, centroids[i]);

			if (threshold !== undefined && d > threshold) continue;

			if (d < bestDist) {
				bestDist = d;
				bestIndex = i;
			}
		}

		// fallback: always assign
		if (bestIndex === -1) {
			let closest = 0;
			let closestDist = Infinity;

			for (let i = 0; i < centroids.length; i++) {
				const d = get_colourDistance(colour, centroids[i]);
				if (d < closestDist) {
					closestDist = d;
					closest = i;
				}
			}

			bestIndex = closest;
		}

		assignments.push(bestIndex);
	}

	//#endregion final assignment

	// build palette
	const reducedPalette: Colour[] = centroids.map((colour: Colour) => ({
		red: Math.round(colour.red),
		green: Math.round(colour.green),
		blue: Math.round(colour.blue)
	}));

	// build mappings
	const colourMappings: ColourMapping[] = palette
		.filter((colour: Colour, i: number) => {
			return !compareColours(colour, palette[assignments[i]]);
		})
		.map((colour: Colour, i: number) => ({
			original: colour,
			replaceWith: palette[assignments[i]]
		}));

	return { reducedPalette, colourMappings };
}

function mergeCloseCentroids(centroids: Colour[], threshold: number): Colour[] {
	const merged: Colour[] = [];

	for (const centroid of centroids) {
		let found: boolean = false;

		for (let i = 0; i < merged.length; i++) {
			if (get_colourDistance(centroid, merged[i]) < threshold) {
				// merge by averaging
				merged[i] = {
					red: (merged[i].red + centroid.red) / 2,
					green: (merged[i].green + centroid.green) / 2,
					blue: (merged[i].blue + centroid.blue) / 2
				};

				found = true;

				break;
			}
		}

		if (!found) {
			merged.push({ ...centroid });
		}
	}

	return merged;
}
