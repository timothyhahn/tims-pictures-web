<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
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
	let animationDirection = $state<'left' | 'right' | null>(null);
	let outgoingDirection = $state<'left' | 'right' | null>(null);
	let isAnimating = $state(false);

	// Create touch gesture handler with multitouch detection
	const touchHandler = createTouchGestureHandler({
		onSwipe: (direction) => {
			if (direction === 'left' && onNext && !isAnimating) {
				handleNextWithAnimation();
			} else if (direction === 'right' && onPrevious && !isAnimating) {
				handlePreviousWithAnimation();
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

	// Check for animation direction on mount and picture change
	onMount(() => {
		const direction = sessionStorage.getItem('lightboxDirection') as 'left' | 'right' | null;
		if (direction) {
			animationDirection = direction;
		}
	});

	// Reset loading state when picture changes
	$effect(() => {
		// Access picture.id to make this effect reactive to picture changes
		void picture.id;
		imageLoaded = false;

		// Check for animation direction from session storage
		const direction = sessionStorage.getItem('lightboxDirection') as 'left' | 'right' | null;
		if (direction) {
			animationDirection = direction;
		}
	});

	function toggleInfo() {
		showInfo = !showInfo;
	}

	function goToAlbum() {
		if (albumSlug) {
			// Clear direction before navigating
			sessionStorage.removeItem('lightboxDirection');
			goto(`/albums/${albumSlug}`);
		}
	}

	function handleClose() {
		// Clear direction before closing
		sessionStorage.removeItem('lightboxDirection');

		if (onClose) {
			onClose();
		} else if (albumSlug) {
			goto(`/albums/${albumSlug}`);
		} else {
			goto('/');
		}
	}

	function handleNextWithAnimation() {
		if (onNext && !isAnimating) {
			isAnimating = true;
			// Current image slides out to the left, new image slides in from right
			outgoingDirection = 'left';
			sessionStorage.setItem('lightboxDirection', 'right');
			setTimeout(() => {
				onNext();
			}, 150);
		}
	}

	function handlePreviousWithAnimation() {
		if (onPrevious && !isAnimating) {
			isAnimating = true;
			// Current image slides out to the right, new image slides in from left
			outgoingDirection = 'right';
			sessionStorage.setItem('lightboxDirection', 'left');
			setTimeout(() => {
				onPrevious();
			}, 150);
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
			handleNextWithAnimation();
		} else if (e.key === 'ArrowLeft' && onPrevious) {
			handlePreviousWithAnimation();
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
		{#key `${picture.id}-${Date.now()}`}
			<img
				src="{picture.image_url}?class=fullscreen"
				alt={picture.description || 'Photo'}
				class="max-h-screen max-w-full object-contain opacity-0 transition-all duration-300"
				class:opacity-100={imageLoaded}
				class:slide-from-left={animationDirection === 'left'}
				class:slide-from-right={animationDirection === 'right'}
				class:slide-to-left={outgoingDirection === 'left'}
				class:slide-to-right={outgoingDirection === 'right'}
				onload={() => {
					imageLoaded = true;
					isAnimating = false;
					animationDirection = null;
					outgoingDirection = null;
					sessionStorage.removeItem('lightboxDirection');
				}}
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
		{...onPrevious && { onPrevious: handlePreviousWithAnimation }}
		{...onNext && { onNext: handleNextWithAnimation }}
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

<style>
	/* Slide animations for image navigation */
	@keyframes slideFromLeft {
		from {
			transform: translateX(-100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideFromRight {
		from {
			transform: translateX(100%);
			opacity: 0;
		}
		to {
			transform: translateX(0);
			opacity: 1;
		}
	}

	@keyframes slideToLeft {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(-50%);
			opacity: 0;
		}
	}

	@keyframes slideToRight {
		from {
			transform: translateX(0);
			opacity: 1;
		}
		to {
			transform: translateX(50%);
			opacity: 0;
		}
	}

	.slide-from-left {
		animation: slideFromLeft 0.3s ease-out;
	}

	.slide-from-right {
		animation: slideFromRight 0.3s ease-out;
	}

	.slide-to-left {
		animation: slideToLeft 0.3s ease-out;
	}

	.slide-to-right {
		animation: slideToRight 0.3s ease-out;
	}
</style>
