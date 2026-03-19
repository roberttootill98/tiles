<script lang="ts">
	import type { Colour } from "./ImageManager";
    import * as Card from "$lib/components/ui/card/index.js";

    let {
        pixels,
        filterBy
    }: {
        pixels: Colour[][];
        filterBy?: Colour;
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

    let pixelWidth: number = $state(4);
    let muteFactor: number = $state(0.1);
</script>

<Card.Root class="gap-2">
    <Card.Header>
        <span class="font-bold">Image</span>
    </Card.Header>

    <Card.Content>
        <canvas bind:this={canvas} {height} {width} style="image-rendering: pixelated;"></canvas>
    </Card.Content>

    <Card.Footer>
        <span>Dimensions: {pixels!.length} x {pixels![0].length}</span>
    </Card.Footer>
</Card.Root>