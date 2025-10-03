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
		<div class="group relative overflow-hidden rounded bg-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[box-shadow,transform] duration-200 ease-[ease] hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] hover:-translate-y-0.5">
			<!-- Pulsing placeholder -->
			<div class="absolute inset-0 animate-pulse bg-gray-700/50"></div>

			<a href="/pictures/{picture.id}?back={backLocation}" onclick={(e) => handleClick(e, picture)}>
				<img
					src="{picture.image_url}?class=thumbnail"
					alt={picture.description || 'Photo'}
					class="image-fade-in relative block h-auto w-full cursor-pointer object-cover"
					style="aspect-ratio: 1;"
					loading="lazy"
					onload={handleImageLoad}
				/>
			</a>
		</div>
	{/each}
</div>

{#if pictures.length === 0}
	<div class="py-16 text-center text-gray-400">
		<p class="text-xl">No pictures to display</p>
	</div>
{/if}
