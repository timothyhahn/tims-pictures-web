<script lang="ts">
	import type { Picture } from '$lib/api/types';

	interface Props {
		pictures: Picture[];
		onPhotoClick?: (picture: Picture) => void;
		backLocation?: string;
	}

	let { pictures, onPhotoClick, backLocation = 'home' }: Props = $props();

	function handleClick(event: MouseEvent, picture: Picture) {
		// Only prevent default for left clicks (not right-click or cmd+click)
		if (event.button === 0 && !event.ctrlKey && !event.metaKey) {
			event.preventDefault();
			onPhotoClick?.(picture);
		}
	}

	function handleImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		img.classList.add('loaded');
	}
</script>

<div class="grid grid-cols-1 gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
	{#each pictures as picture (picture.id)}
		<div class="photo-item group relative overflow-hidden rounded bg-gray-800">
			<a href="/pictures/{picture.id}?back={backLocation}" onclick={(e) => handleClick(e, picture)}>
				<img
					src="{picture.image_url}?class=thumbnail"
					alt={picture.description || 'Photo'}
					class="image-fade-in block h-auto w-full cursor-pointer object-cover"
					style="aspect-ratio: 1;"
					loading="lazy"
					onload={handleImageLoad}
				/>
			</a>
		</div>
	{/each}
</div>

<style>
	.photo-item {
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3);
		transition: box-shadow 0.2s ease, transform 0.2s ease;
	}

	.photo-item:hover {
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
		transform: translateY(-2px);
	}
</style>

{#if pictures.length === 0}
	<div class="py-16 text-center text-gray-400">
		<p class="text-xl">No pictures to display</p>
	</div>
{/if}
