<script lang="ts">
    import { Input } from "$lib/components/ui/input/index.js";

    //#region file input
    let files: FileList | undefined = $state(undefined);
    //#endregion file input
</script>

<!-- file input -->
<div class="flex gap-2 items-center">
    <!-- label -->
    <span class="w-fit">Tiles file upload:</span>

    <!-- input -->
    <Input class="w-fit" type="file" bind:files/>
</div>