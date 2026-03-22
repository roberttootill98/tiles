<script lang="ts">
	import { X } from 'lucide-svelte';

	let { width }: { width: number } = $props();
</script>

<span class="flex items-center justify-center" style="width: {width}px; height: {width}px;">
	<X />
</span>
