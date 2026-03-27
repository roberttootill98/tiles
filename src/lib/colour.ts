export type Colour = {
	red: number;
	green: number;
	blue: number;
};

export type ColourMapping = { original: Colour; replaceWith: Colour };

export function compareColours(colour1: Colour, colour2: Colour): boolean {
	return (
		colour1.red == colour2.red && colour1.green == colour2.green && colour1.blue == colour2.blue
	);
}

export function get_luminance(colour: Colour): number {
	return 0.2126 * colour.red + 0.7152 * colour.green + 0.0722 * colour.blue;
}

export function get_colourDistance(colour1: Colour, colour2: Colour): number {
	return Math.sqrt(
		(colour1.red - colour2.red) ** 2 +
			(colour1.green - colour2.green) ** 2 +
			(colour1.blue - colour2.blue) ** 2
	);
}
