<script lang="ts">
	import { goto } from '$app/navigation';
	import type { Picture } from '$lib/api/types';
	import { formatMetadata } from '$lib/utils/metadata';

	interface Props {
		picture: Picture;
		albumSlug?: string;
		onNext?: () => void;
		onPrevious?: () => void;
		onClose?: () => void;
	}

	let { picture, albumSlug, onNext, onPrevious, onClose }: Props = $props();

	let showInfo = $state(false);
	let showControls = $state(true);
	let hideControlsTimeout: ReturnType<typeof setTimeout> | null = null;
	let imageLoaded = $state(false);

	let formattedMetadata = $derived(
		picture.metadata && typeof picture.metadata === 'object'
			? formatMetadata(picture.metadata as Record<string, string>)
			: []
	);

	// Reset loading state when picture changes
	$effect(() => {
		// Access picture.id to make this effect reactive to picture changes
		void picture.id;
		imageLoaded = false;
	});

	function toggleInfo() {
		showInfo = !showInfo;
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
			onNext();
		} else if (e.key === 'ArrowLeft' && onPrevious) {
			onPrevious();
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
				class="max-h-screen max-w-full object-contain transition-opacity duration-200"
				class:opacity-0={!imageLoaded}
				class:opacity-100={imageLoaded}
				onload={() => {
					imageLoaded = true;
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
					class="pointer-events-auto rounded-lg p-2 text-white transition-colors hover:bg-white/20"
					aria-label="Close"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M6 18L18 6M6 6l12 12"
						/>
					</svg>
				</button>
			</div>

			<!-- Previous button -->
			{#if onPrevious}
				<div class="absolute top-0 bottom-0 left-0 flex items-center p-4">
					<button
						onclick={onPrevious}
						class="pointer-events-auto rounded-lg p-3 text-white transition-colors hover:bg-white/20"
						aria-label="Previous photo"
					>
						<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M15 19l-7-7 7-7"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<!-- Next button -->
			{#if onNext}
				<div class="absolute top-0 right-0 bottom-0 flex items-center p-4">
					<button
						onclick={onNext}
						class="pointer-events-auto rounded-lg p-3 text-white transition-colors hover:bg-white/20"
						aria-label="Next photo"
					>
						<svg class="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M9 5l7 7-7 7"
							/>
						</svg>
					</button>
				</div>
			{/if}

			<!-- Bottom info button -->
			<div class="absolute bottom-0 left-0 p-4">
				<button
					onclick={toggleInfo}
					class="pointer-events-auto rounded-lg p-2 text-white transition-colors hover:bg-white/20"
					aria-label="Toggle info"
				>
					<svg class="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
						<path
							stroke-linecap="round"
							stroke-linejoin="round"
							stroke-width="2"
							d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
						/>
					</svg>
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
					<button onclick={toggleInfo} class="p-1 text-gray-400 transition-colors hover:text-white">
						<svg class="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path
								stroke-linecap="round"
								stroke-linejoin="round"
								stroke-width="2"
								d="M6 18L18 6M6 6l12 12"
							/>
						</svg>
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
