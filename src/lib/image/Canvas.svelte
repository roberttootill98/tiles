<script lang="ts">
	import type { Colour } from "./ImageManager";

    let {
        pixels,
        pixelWidth = 4,
        filterBy,
        muteFactor
    }: {
        pixels: Colour[][];
        pixelWidth?: number;
        filterBy?: Colour;
        muteFactor: number;
    } = $props();

    let canvas: HTMLCanvasElement;

    let height: number = $derived(pixels.length);
    let width: number = $derived(pixels[0].length);

    $effect(() => {
        if(pixels) {
            setCanvas();
        }
    });

    function setCanvas(): void {
        const pixels_render = new Uint8ClampedArray(width * height * pixelWidth);
        
        let pixel_render_index: number = 0;

        for(let y = 0; y < pixels.length; y++) {
            for(let x = 0; x < pixels[y].length; x++) {
                const colour: Colour = pixels[y][x];

                let colourValues: number[] = [
                    colour.red,
                    colour.green,
                    colour.blue,
                    255
                ];

                for(const [i, colourValue] of colourValues.entries()) {
                    if(
                        // not alpha colour
                        i != colourValues.length - 1 &&
                        // filter by is on and doesn't match filter by
                        filterBy != undefined &&
                        !(
                            filterBy.red == colour.red &&
                            filterBy.green == colour.green &&
                            filterBy.blue == colour.blue
                        )
                    ) {
                        const gray: number = (colour.red + colour.green + colour.blue) / 3;

                        pixels_render[pixel_render_index + i] =
                            gray * (1 - muteFactor) + colourValue * muteFactor;
                    } else {
                        pixels_render[pixel_render_index + i] = colourValue;
                    }
                }

                pixel_render_index += colourValues.length;
            }
        }

        const imageData = new ImageData(pixels_render, width, height);
        canvas.getContext('2d')!.putImageData(imageData, 0, 0);
    }
</script>

<canvas bind:this={canvas} {height} {width}></canvas>