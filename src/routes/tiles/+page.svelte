<script lang="ts">
	import Button from "$lib/components/ui/button/button.svelte";
    import { Input } from "$lib/components/ui/input/index.js";
	import { LoaderCircle, X } from "lucide-svelte";

    //#region file input
    let file: File | undefined = $state(undefined);
    let files: FileList | undefined = $state(undefined);

    function clearFileInput(): void {
        file = undefined;
        files = undefined;
    }

    //#endregion file input

    $effect(() => {
        if(files != undefined) {
            loadImage();
        }
    });

    async function loadImage(): Promise<void> {
        try {
            imageLoading = true;
        } finally {
            imageLoading = false;
        }
    }

    let imageLoading: boolean = $state(false);
</script>

<!-- file input -->
<div class="flex gap-2 items-center">
    <!-- label -->
    <span class="w-fit">Tiles file upload:</span>

    <!-- input -->
    <Input class="cursor-pointer w-fit" type="file" bind:files bind:value={file}/>

    <Button onclick={clearFileInput}><X/></Button>
</div>

{#if files != undefined}
    {#if imageLoading}
        <LoaderCircle class="animate-spin"/>
    {:else}
        <span>Files!</span>
    {/if}
{/if}
