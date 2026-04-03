<script lang="ts">
	import * as Dialog from '$lib/components/ui/dialog/index.js';
	import { CircleSmall, Info } from 'lucide-svelte';
	import { buttonVariants } from './ui/button';
	import ScrollArea from '$lib/components/ui/scroll-area/scroll-area.svelte';

	const class_link: string = ['text-blue-700'].join(' ');

	const features: string[] = [
		'Upload unindexed png and download indexed png and palette (.pal) files.',
		'Order palette, according to luminance (bit rubbish).',
		'Select background colour.',
		'Highlight specific colours in the palette in the image.',
		'Combine very similar colours (within a user controlled threshold.',
		'Combine colours until there is 16 or less colours in the palette.',
		'Split image into different palettes.'
	];

	const features_future: string[] = [
		'De-duplicate tileset, compare all 8x8 tiles and remove duplicates (will require tileset image alignment).',
		'Better colour combination (kMeans).',
		'Palette zooming and scale.',
		'Manual colour replacement.'
	];
</script>

<Dialog.Root>
	<Dialog.Trigger type="button" class={buttonVariants({ size: 'icon' })}>
		<Info />
	</Dialog.Trigger>

	<Dialog.Content class="w-fit max-w-none min-w-xl sm:max-w-fit">
		<Dialog.Header>
			<Dialog.Title class="font-bold">Bobby Tiles Tool</Dialog.Title>
		</Dialog.Header>

		<ScrollArea>
			<div class="my-4 mr-4 flex max-h-96 flex-col gap-4">
				<p>This is a little tool for fiddling with tilesets.</p>

				<p>
					<span>I made this because I got annoyed with combining tiles palettes and</span>
					<span>splitting tilesets out to fit in gen 3 fan game projects.</span>
				</p>

				<!-- feature list -->
				<div class="flex flex-col gap-1">
					<span>Features:</span>

					<ul>
						{#each features as feature (feature)}
							<li class="ml-4 flex items-center gap-1">
								<CircleSmall width="4" />
								<span>{feature}</span>
							</li>
						{/each}
					</ul>
				</div>

				<!-- describe colour combinations -->
				<p>
					<span>Currently only basic distance and</span>
					<span>root distance colour combination is supported</span>
					<span>I'd like to expand this to include kMeans and</span>
					<span>I need to look into other combination methods!</span>
				</p>

				<!-- future feature list -->
				<div class="flex flex-col gap-1">
					<span>Future features:</span>

					<ul>
						{#each features_future as feature (feature)}
							<li class="ml-4 flex items-center gap-1">
								<CircleSmall width="4" />
								<span>{feature}</span>
							</li>
						{/each}
					</ul>
				</div>

				<p>
					<span>I built this as a web app so I can use it when I'm on lunch break at work and</span>
					<span>I'm looking at tiles on DeviantArt or wherever.</span>
				</p>

				<p>
					<span
						>I don't know how useful this will be to people who are familiar with Porytiles!</span
					>
					<span>Hopefully this tool can help you understand the colour depth of your palettes</span>
					<span
						>and help you tidy them up a little before getting fully stuck in your Porytiles.</span
					>
				</p>

				<div class="flex flex-col gap-1">
					<span>Please let me know if you find this tool at all useful or have any feedback!</span>
					<span>
						<span>You can add me on discord (rob4152),</span>

						<span>
							<span>I'm also in the</span>
							<a href="https://discord.com/invite/d5dubZ3" class={class_link}>
								pret disassembly discord
							</a>
						</span>
					</span>

					<span>
						<span>You can also view the</span>
						<a href="https://github.com/roberttootill98/tiles" class={class_link}>Source code</a>
					</span>
				</div>
			</div>
		</ScrollArea>
	</Dialog.Content>
</Dialog.Root>
