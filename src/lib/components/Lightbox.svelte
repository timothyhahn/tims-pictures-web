<script lang="ts">
	import { goto } from '$app/navigation';
	import { onMount } from 'svelte';
	import { Info, Download, Share2, Album, X, ChevronLeft, ChevronRight, Link } from 'lucide-svelte';
	import type { Picture } from '$lib/api/types';
	import { formatMetadata } from '$lib/utils/metadata';

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
	let showShareMenu = $state(false);
	let animationDirection = $state<'left' | 'right' | null>(null);
	let outgoingDirection = $state<'left' | 'right' | null>(null);
	let isAnimating = $state(false);
	let touchStartX = $state(0);
	let touchStartY = $state(0);

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
		showShareMenu = false;
	}

	function toggleShareMenu() {
		showShareMenu = !showShareMenu;
		showInfo = false;
	}

	async function copyLinkToClipboard() {
		const url = `${window.location.origin}/pictures/${picture.id}`;
		try {
			await navigator.clipboard.writeText(url);
			showShareMenu = false;
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
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

	async function handleDownload(e: MouseEvent) {
		e.preventDefault();

		// Track download event if Fathom is available
		if (typeof window !== 'undefined' && 'fathom' in window) {
			try {
				const windowWithFathom = window as typeof window & {
					fathom: { trackEvent: (name: string, data: { _value: string }) => void };
				};
				windowWithFathom.fathom.trackEvent('image downloaded', { _value: picture.id });
			} catch (err) {
				// Silently fail if tracking doesn't work
				console.debug('Failed to track download event:', err);
			}
		}

		// Fetch and download the image
		try {
			const response = await fetch(`${picture.image_url}?class=download`);
			const blob = await response.blob();
			const url = window.URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = picture.description || `photo-${picture.id}`;
			document.body.appendChild(a);
			a.click();
			window.URL.revokeObjectURL(url);
			document.body.removeChild(a);
		} catch (err) {
			console.error('Failed to download image:', err);
			// Fallback: open in new tab
			window.open(`${picture.image_url}?class=download`, '_blank');
		}
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

	function handleTouchStart(e: TouchEvent) {
		const touch = e.touches[0];
		if (!touch) return;
		touchStartX = touch.clientX;
		touchStartY = touch.clientY;
	}

	function handleTouchEnd(e: TouchEvent) {
		const touch = e.changedTouches[0];
		if (!touch) return;
		const touchEndX = touch.clientX;
		const touchEndY = touch.clientY;

		const deltaX = touchEndX - touchStartX;
		const deltaY = touchEndY - touchStartY;

		// Calculate threshold as 20% of viewport width
		const swipeThreshold = window.innerWidth * 0.2;

		// Only trigger if horizontal swipe is more significant than vertical
		// and exceeds minimum threshold (20% of screen width)
		if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > swipeThreshold) {
			if (deltaX > 0 && onPrevious) {
				// Swipe right -> go to previous
				handlePreviousWithAnimation();
			} else if (deltaX < 0 && onNext) {
				// Swipe left -> go to next
				handleNextWithAnimation();
			}
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
	ontouchstart={handleTouchStart}
	ontouchend={handleTouchEnd}
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

	<!-- Controls overlay -->
	{#if showControls}
		<div class="pointer-events-none absolute inset-0 transition-opacity duration-300">
			<!-- Top bar with close button -->
			<div class="absolute top-0 right-0 left-0 bg-gradient-to-b from-black/50 to-transparent p-4">
				<button
					onclick={handleClose}
					class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20"
					aria-label="Close"
				>
					<X class="h-6 w-6" />
					<span
						class="pointer-events-none absolute top-full right-0 mt-2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
					>
						Close (Esc)
					</span>
				</button>
			</div>

			<!-- Previous button -->
			{#if onPrevious}
				<div class="absolute top-0 bottom-0 left-0 flex items-center p-4">
					<button
						onclick={handlePreviousWithAnimation}
						class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-3 text-white transition-colors hover:bg-white/20"
						aria-label="Previous photo"
					>
						<ChevronLeft class="h-8 w-8" />
						<span
							class="pointer-events-none absolute top-1/2 left-full ml-2 -translate-y-1/2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
						>
							Previous (←)
						</span>
					</button>
				</div>
			{/if}

			<!-- Next button -->
			{#if onNext}
				<div class="absolute top-0 right-0 bottom-0 flex items-center p-4">
					<button
						onclick={handleNextWithAnimation}
						class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-3 text-white transition-colors hover:bg-white/20"
						aria-label="Next photo"
					>
						<ChevronRight class="h-8 w-8" />
						<span
							class="pointer-events-none absolute top-1/2 right-full mr-2 -translate-y-1/2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
						>
							Next (→)
						</span>
					</button>
				</div>
			{/if}

			<!-- Bottom controls -->
			<div class="absolute bottom-0 left-0 flex gap-2 p-4">
				<button
					onclick={toggleInfo}
					class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20"
					aria-label="Toggle info"
				>
					<Info class="h-6 w-6" />
					<span
						class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
					>
						Info (I)
					</span>
				</button>

				{#if backLocation === 'home' && albumSlug}
					<button
						onclick={goToAlbum}
						class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20"
						aria-label="Go to album"
					>
						<Album class="h-6 w-6" />
						<span
							class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
						>
							View Album
						</span>
					</button>
				{/if}

				<div class="relative">
					<button
						onclick={toggleShareMenu}
						class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20"
						aria-label="Share"
					>
						<Share2 class="h-6 w-6" />
						<span
							class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
						>
							Share
						</span>
					</button>

					{#if showShareMenu}
						<div
							class="pointer-events-auto absolute bottom-full left-0 mb-2 rounded-lg bg-gray-900/95 p-2 shadow-lg backdrop-blur-sm"
						>
							<button
								onclick={copyLinkToClipboard}
								class="flex items-center gap-2 rounded px-3 py-2 text-sm whitespace-nowrap text-white transition-colors hover:bg-white/10"
							>
								<Link class="h-4 w-4" />
								Copy Link
							</button>
						</div>
					{/if}
				</div>

				<button
					onclick={handleDownload}
					class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20"
					aria-label="Download photo"
				>
					<Download class="h-6 w-6" />
					<span
						class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
					>
						Download
					</span>
				</button>
			</div>
		</div>
	{/if}

	<!-- Info panel -->
	{#if showInfo}
		<div
			class="absolute top-0 bottom-0 left-0 w-full overflow-y-auto bg-gray-900/95 backdrop-blur-sm md:w-96"
		>
			<div class="p-6">
				<div class="mb-6 flex items-start justify-between">
					<h2 class="text-xl font-bold">Photo Information</h2>
					<button
						onclick={toggleInfo}
						class="cursor-pointer p-1 text-gray-400 transition-colors hover:text-white"
					>
						<X class="h-5 w-5" />
					</button>
				</div>

				{#if picture.description}
					<div class="mb-6">
						<h3 class="mb-2 text-sm font-semibold text-gray-400">Description</h3>
						<p class="text-white">{picture.description}</p>
					</div>
				{/if}

				{#if formattedMetadata.length > 0}
					<div class="mb-6">
						<h3 class="mb-2 text-sm font-semibold text-gray-400">Photo Details</h3>
						<dl class="space-y-2 text-sm">
							{#each formattedMetadata as item (item.label)}
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
