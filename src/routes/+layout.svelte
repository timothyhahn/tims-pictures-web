<script lang="ts">
	import '../app.css';
	import { onNavigate, beforeNavigate } from '$app/navigation';
	import Navigation from '$lib/components/Navigation.svelte';

	let { children } = $props();

	let isNavigating = $state(false);

	// Show loading indicator when navigation starts
	beforeNavigate(() => {
		isNavigating = true;
	});

	// Enable View Transitions API for smooth page transitions
	onNavigate((navigation) => {
		// Hide loading indicator when navigation completes
		isNavigating = false;

		if (!document.startViewTransition) return;

		const direction = document.documentElement.dataset.pictureNavDirection;
		const fromRoute = navigation.from?.route.id;
		const toRoute = navigation.to?.route.id;

		// Check if we're navigating between pictures (picture-to-picture)
		const isPictureToPicture = fromRoute === '/pictures/[id]' && toRoute === '/pictures/[id]';

		return new Promise((resolve) => {
			// If navigating between pictures with a direction, apply slide animation
			if (direction && isPictureToPicture) {
				const oldPictureId = document.documentElement.dataset.oldPictureId;
				const newPictureId = document.documentElement.dataset.newPictureId;

				const styleId = 'vt-slide-style';
				let style = document.getElementById(styleId) as HTMLStyleElement;

				if (!style) {
					style = document.createElement('style');
					style.id = styleId;
					document.head.appendChild(style);
				}

				// Apply slide animations to specific picture IDs
				// Old picture slides out slightly faster to get out of the way
				if (direction === 'next') {
					style.textContent = `
						::view-transition-old(picture-${oldPictureId}) {
							animation: 0.28s ease-in both slide-out-to-left;
						}
						::view-transition-new(picture-${newPictureId}) {
							animation: 0.32s ease-out both slide-in-from-right;
						}
					`;
				} else if (direction === 'prev') {
					style.textContent = `
						::view-transition-old(picture-${oldPictureId}) {
							animation: 0.28s ease-in both slide-out-to-right;
						}
						::view-transition-new(picture-${newPictureId}) {
							animation: 0.32s ease-out both slide-in-from-left;
						}
					`;
				}
			}

			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});

			// Clean up after transition completes
			transition.finished.finally(() => {
				delete document.documentElement.dataset.pictureNavDirection;
				delete document.documentElement.dataset.oldPictureId;
				delete document.documentElement.dataset.newPictureId;
				const style = document.getElementById('vt-slide-style');
				if (style) {
					style.textContent = '';
				}
			});
		});
	});
</script>

<svelte:head>
	<title>Tim's Pictures</title>
</svelte:head>

<div class="min-h-screen">
	<!-- Navigation Loading Indicator -->
	{#if isNavigating}
		<div class="fixed top-0 right-0 left-0 z-[100] h-2 overflow-hidden bg-gray-900/30">
			<div class="loading-bar"></div>
		</div>
	{/if}

	<Navigation />

	<main class="pt-16 md:ml-64 md:pt-0">
		{@render children?.()}
	</main>
</div>

<style>
	.loading-bar {
		height: 8px;
		width: 100%;
		background: linear-gradient(
			90deg,
			transparent 0%,
			transparent 15%,
			rgba(217, 227, 225, 0.8) 35%,
			rgb(217, 227, 225) 50%,
			rgba(217, 227, 225, 0.8) 65%,
			transparent 85%,
			transparent 100%
		);
		background-size: 200% 100%;
		animation: shimmer 1.8s ease-in-out infinite;
		box-shadow: 0 0 20px rgba(217, 227, 225, 0.6);
	}

	@keyframes shimmer {
		0% {
			background-position: 200% 0;
		}
		100% {
			background-position: -200% 0;
		}
	}
</style>
