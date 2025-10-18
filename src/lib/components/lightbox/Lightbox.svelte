<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Picture } from '$lib/api/types';
	import { formatMetadata } from '$lib/utils/metadata';
	import { createTouchGestureHandler } from '$lib/utils/touchGestures';
	import LightboxControls from './LightboxControls.svelte';
	import LightboxInfo from './LightboxInfo.svelte';

	interface Props {
		picture: Picture;
		albumSlug?: string;
		backLocation?: string;
		onNext?: () => void;
		onPrevious?: () => void;
		onClose?: () => void;
	}

	let { picture, albumSlug, backLocation = 'album', onNext, onPrevious, onClose }: Props = $props();

	let showInfo = $state(false);
	let showControls = $state(true);
	let hideControlsTimeout: ReturnType<typeof setTimeout> | null = null;
	let imageLoaded = $state(false);

	// Create touch gesture handler with multitouch detection
	const touchHandler = createTouchGestureHandler({
		onSwipe: (direction) => {
			if (direction === 'left' && onNext) {
				handleNext();
			} else if (direction === 'right' && onPrevious) {
				handlePrevious();
			}
		},
		swipeThreshold: 0.18,
		enabled: true
	});

	let formattedMetadata = $derived(
		picture.metadata && typeof picture.metadata === 'object'
			? formatMetadata(picture.metadata as Record<string, string>)
			: []
	);

	// Action to check if image is already cached and set loaded immediately
	function checkIfCached(node: HTMLImageElement) {
		// Use nextTick to run after effect has set imageLoaded = false
		queueMicrotask(() => {
			if (node.complete && node.naturalHeight !== 0) {
				// Image is already cached, show it immediately
				imageLoaded = true;
			}
		});
	}

	function toggleInfo() {
		showInfo = !showInfo;
	}

	function goToAlbum() {
		if (albumSlug) {
			goto(`/albums/${albumSlug}`);
		}
	}

	function handleClose() {
		if (onClose) {
			onClose();
		} else if (albumSlug) {
			goto(`/albums/${albumSlug}`);
		} else {
			goto('/');
		}
	}

	function handleNext() {
		if (onNext) {
			onNext();
		}
	}

	function handlePrevious() {
		if (onPrevious) {
			onPrevious();
		}
	}

	function handleMouseMove() {
		showControls = true;
		if (hideControlsTimeout) {
			clearTimeout(hideControlsTimeout);
		}
		hideControlsTimeout = setTimeout(() => {
			showControls = false;
		}, 2000);
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') {
			handleClose();
		} else if (e.key === 'ArrowRight' && onNext) {
			handleNext();
		} else if (e.key === 'ArrowLeft' && onPrevious) {
			handlePrevious();
		} else if (e.key === 'i' || e.key === 'I') {
			toggleInfo();
		}
	}

	$effect(() => {
		document.addEventListener('keydown', handleKeydown);
		return () => {
			document.removeEventListener('keydown', handleKeydown);
			if (hideControlsTimeout) {
				clearTimeout(hideControlsTimeout);
			}
		};
	});
</script>

<svelte:window onmousemove={handleMouseMove} />

<div
	class="fixed inset-0 z-50 flex items-center justify-center"
	style="background-color: var(--color-bg);"
	ontouchstart={touchHandler.handleTouchStart}
	ontouchmove={touchHandler.handleTouchMove}
	ontouchend={touchHandler.handleTouchEnd}
	ontouchcancel={touchHandler.handleTouchCancel}
>
	<!-- Background click to close -->
	<button onclick={handleClose} class="absolute inset-0 cursor-default" aria-label="Close lightbox"
	></button>

	<!-- Main image -->
	<div class="group relative max-h-screen max-w-screen-2xl p-4">
		{#key picture.id}
			<img
				src="{picture.image_url}?class=fullscreen"
				alt={picture.description || 'Photo'}
				class="lightbox-image max-h-screen max-w-full object-contain"
				class:opacity-0={!imageLoaded}
				class:opacity-100={imageLoaded}
				style="view-transition-name: picture-{picture.id}; transition: opacity 0.3s;"
				onload={() => {
					imageLoaded = true;
				}}
				use:checkIfCached
			/>
		{/key}

		<!-- Description overlay on hover -->
		{#if picture.description && showControls}
			<div
				class="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
			>
				<p class="text-lg text-white">{picture.description}</p>
			</div>
		{/if}

		<!-- Loading spinner -->
		{#if !imageLoaded}
			<div class="pointer-events-none absolute inset-0 flex items-center justify-center">
				<div
					class="h-16 w-16 animate-spin rounded-full border-4 border-white/20 border-t-white"
					style="aspect-ratio: 1;"
				></div>
			</div>
		{/if}
	</div>

	<!-- Controls -->
	<LightboxControls
		{showControls}
		onClose={handleClose}
		{...onPrevious && { onPrevious: handlePrevious }}
		{...onNext && { onNext: handleNext }}
		onToggleInfo={toggleInfo}
		{...albumSlug && backLocation === 'home' && { onGoToAlbum: goToAlbum }}
		{picture}
		{backLocation}
	/>

	<!-- Info panel -->
	{#if showInfo}
		<LightboxInfo
			{...picture.description && { description: picture.description }}
			metadata={formattedMetadata}
			onClose={toggleInfo}
		/>
	{/if}
</div>
