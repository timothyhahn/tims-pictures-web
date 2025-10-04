<script lang="ts">
	interface Props {
		coverUrl?: string;
		albumName: string;
	}

	let { coverUrl, albumName }: Props = $props();

	function handleImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		img.classList.add('loaded');
	}
</script>

{#if coverUrl}
	<div class="relative aspect-video w-full overflow-hidden bg-gray-900">
		<!-- Pulsing placeholder -->
		<div class="absolute inset-0 animate-pulse bg-gray-700/50"></div>

		<img
			src="{coverUrl}?class=thumbnail"
			alt="{albumName} cover"
			class="image-fade-in relative h-full w-full object-cover"
			loading="lazy"
			onload={handleImageLoad}
		/>
	</div>
{:else}
	<div class="flex aspect-video w-full items-center justify-center bg-gray-900">
		<svg class="h-16 w-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
			/>
		</svg>
	</div>
{/if}
