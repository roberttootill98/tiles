<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input/index.js";
	import ImageManager, { type Colour } from "$lib/image/ImageManager";
	import { LoaderCircle, X } from "lucide-svelte";
    import * as Card from "$lib/components/ui/card/index.js";
	import ColourGrid from "$lib/image/ColourGrid.svelte";

    //#region file input
    let file: File | undefined = $state(undefined);
    let files: FileList | undefined = $state(undefined);

    function clearFileInput(): void {
        file = undefined;
        files = undefined;
    }

    //#endregion file input

    $effect(() => {
        if(file != undefined) {
            loadImage();
        }
    });

    async function loadImage(): Promise<void> {
        try {
            imageLoading = true;

            imageLoaded = false;
            pixels = null;
            palette = null;

            if(files == undefined) return;
            if(files[0] == undefined) return;

            const imageLoadData = await ImageManager.loadImage(files[0]);

            pixels = imageLoadData.pixels;
            palette = imageLoadData.palette;

            imageLoaded = true;
        } finally {
            imageLoading = false;
        }
    }

    let imageLoading: boolean = $state(false);

    //#region image loaded
    let imageLoaded: boolean = $state(false);
    let pixels: Colour[][] | null = $state(null);
    let palette: Colour[] | null = $state(null);

    let palette_display: Colour[][] | null = $derived.by(() => {
        if(palette == null) return null;

        const rowWidth: number = 8;

        const rows: Colour[][] = [];
        let row: Colour[] = [];

        for(const [i, colour] of palette.entries()) {
            if(row.length < rowWidth) {
                row.push(colour);

                if(i == palette.length - 1) {
                    rows.push(row);
                }
            } else {
                rows.push(row);
                row = [colour];
            }
        }

        return rows;
    });

    let paletteColourHovered: Colour | null = $state(null);
    let paletteColourSelected: Colour | null = $state(null);
    //#endregion image loaded
</script>

<div class="flex flex-col gap-2 items-center">
    <!-- file input -->
    <div class="flex gap-2 items-center">
        <!-- label -->
        <span class="w-fit">Tiles file upload:</span>
    
        <!-- input -->
        <Input class="cursor-pointer w-fit" type="file" bind:files bind:value={file}/>
    
        <Button onclick={clearFileInput}><X/></Button>
    </div>
    
    {#if files != undefined}
        {#if !imageLoading && imageLoaded}
            <div class="flex gap-2">
                <!-- load interactive image -->
                <Card.Root class="gap-2">
                    <Card.Header>
                        <span class="font-bold">Image</span>
                    </Card.Header>

                    <Card.Content>
                        <ColourGrid rows={pixels!} width={3}/>
                    </Card.Content>

                    <Card.Footer>
                        <span>Dimensions: {pixels!.length} x {pixels![0].length}</span>
                    </Card.Footer>
                </Card.Root>
    
                <!-- palette -->
                <Card.Root class="gap-2">
                    <Card.Header>
                        <span class="font-bold">Palette</span>
                    </Card.Header>

                    <Card.Content>
                        <ColourGrid
                            rows={palette_display!}
                            width={20}
                            bind:hoveredColour={paletteColourHovered}
                            bind:selectedColour={paletteColourSelected}
                        />
                    </Card.Content>

                    <Card.Footer>
                        <span>Palette length: {palette!.length}</span>
                    </Card.Footer>
                </Card.Root>
            </div>
        {:else if imageLoading}
            <LoaderCircle class="animate-spin"/>
        {/if}
    {/if}
</div>
