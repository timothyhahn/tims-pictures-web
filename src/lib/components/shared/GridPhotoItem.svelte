<script lang="ts">
	import type { Picture } from '$lib/api/types';

	interface Props {
		picture: Picture;
		backLocation: string;
		imageClass?: string;
		containerClass?: string;
		imageStyle?: string;
		/**
		 * Whether the image should fill the container height (for masonry)
		 * Set to false for natural aspect ratio (for simple grids)
		 */
		fillHeight?: boolean;
		onPhotoClick?: (event: MouseEvent, picture: Picture) => void;
		preloadData?: boolean;
	}

	let {
		picture,
		backLocation,
		imageClass = 'thumbnail',
		containerClass = '',
		imageStyle = '',
		fillHeight = false,
		onPhotoClick,
		preloadData = true
	}: Props = $props();

	function handleImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		img.classList.add('loaded');
	}
</script>

<div
	class="group relative overflow-hidden rounded bg-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[box-shadow,transform] duration-200 ease-in hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)] {containerClass}"
	data-picture-id={picture.id}
>
	<!-- Pulsing placeholder -->
	<div class="absolute inset-0 animate-pulse bg-gray-700/50"></div>

	<a
		href="/pictures/{picture.id}?back={backLocation}"
		onclick={(e) => onPhotoClick?.(e, picture)}
		data-sveltekit-preload-data={preloadData ? 'hover' : 'off'}
	>
		<img
			src="{picture.image_url}?class={imageClass}"
			alt={picture.description || 'Photo'}
			class="image-fade-in relative w-full cursor-pointer {fillHeight
				? 'h-full object-cover'
				: 'h-auto object-cover'}"
			style={imageStyle}
			loading="lazy"
			onload={handleImageLoad}
		/>
	</a>
</div>
