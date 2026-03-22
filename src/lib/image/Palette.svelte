<script lang="ts">
	import ColourDisplay from "./ColourDisplay.svelte";
	import type { Colour } from "./ImageManager";
    import * as Card from "$lib/components/ui/card/index.js";
	import Button from "$lib/components/ui/button/button.svelte";
	import { SquareSlash } from "lucide-svelte";
    import * as Tooltip from "$lib/components/ui/tooltip/index.js";

    let {
        palette,
        width,
        selectedColour = $bindable(undefined),
    }: { 
        palette: Colour[];
        width: number;
        selectedColour?: Colour;
    } = $props();

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

    function onSelect(colour: Colour): void {
        if(
            selectedColour != null &&
            selectedColour.red == colour.red &&
            selectedColour.green == colour.green &&
            selectedColour.blue == colour.blue
        ) {
            selectedColour = undefined;
        } else {
            selectedColour = colour;
        }
    }

    function splitPalette(): void {

    }
</script>

<Card.Root class="gap-2">
    <Card.Header>
        <span class="font-bold">Palette</span>
    </Card.Header>

    <Card.Content class="flex flex-col">
        {#each palette_display as column (column)}
            <div class="flex">
                {#each column as colour (colour)}
                    <ColourDisplay
                        colour={colour}
                        {width}
                        {onSelect}
                        {selectedColour}
                    />
                {/each}
            </div>
        {/each}

        <span>Palette length: {palette!.length}</span>
    </Card.Content>

    <Card.Footer>
        <!-- #region tools -->
        
        <!-- split palette button -->
        <Tooltip.Provider>
            <Tooltip.Root>
                <Tooltip.Trigger>
                    <Button size="icon" variant="outline" onclick={splitPalette}>
                        <SquareSlash/>
                    </Button>
                </Tooltip.Trigger>

                <Tooltip.Content>
                    <p>Split Palette</p>
                </Tooltip.Content>
            </Tooltip.Root>
        </Tooltip.Provider>

        <!-- #endregion tools -->
    </Card.Footer>
</Card.Root>
