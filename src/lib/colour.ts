
export type Colour = {
    red: number;
    green: number;
    blue: number;
};

export type ColourMapping = { original: Colour; replaceWith: Colour };

export function compareColours(colour1: Colour, colour2: Colour): boolean {
    return (
        colour1.red == colour2.red &&
        colour1.green == colour2.green &&
        colour1.blue == colour2.blue
    );
}
