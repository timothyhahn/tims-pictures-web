<script lang="ts">
	import { X } from 'lucide-svelte';
	import type { MetadataItem } from '$lib/utils/metadata';

	interface Props {
		description?: string;
		metadata: MetadataItem[];
		onClose: () => void;
	}

	let { description, metadata, onClose }: Props = $props();
</script>

<div
	class="absolute top-0 bottom-0 left-0 w-full overflow-y-auto bg-gray-900/95 backdrop-blur-sm md:w-96"
>
	<div class="p-6">
		<div class="mb-6 flex items-start justify-between">
			<h2 class="text-xl font-bold">Photo Information</h2>
			<button
				onclick={onClose}
				class="cursor-pointer p-1 text-gray-400 transition-colors hover:text-white"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		{#if description}
			<div class="mb-6">
				<h3 class="mb-2 text-sm font-semibold text-gray-400">Description</h3>
				<p class="text-white">{description}</p>
			</div>
		{/if}

		{#if metadata.length > 0}
			<div class="mb-6">
				<h3 class="mb-2 text-sm font-semibold text-gray-400">Photo Details</h3>
				<dl class="space-y-2 text-sm">
					{#each metadata as item (item.label)}
						<div class="flex justify-between">
							<dt class="text-gray-400">{item.label}</dt>
							<dd class="text-right text-white">{item.value}</dd>
						</div>
					{/each}
				</dl>
			</div>
		{/if}

		<div class="mt-8 text-xs text-gray-500">
			<p>Press ESC to close</p>
			<p>Press ← → to navigate</p>
			<p>Press I to toggle info</p>
		</div>
	</div>
</div>
