<script lang="ts">
	import '../app.css';
	import { onNavigate } from '$app/navigation';
	import Navigation from '$lib/components/Navigation.svelte';

	let { children } = $props();

	// Enable View Transitions API for smooth page transitions
	onNavigate((navigation) => {
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
	<Navigation />

	<main class="pt-16 md:ml-64 md:pt-0">
		{@render children?.()}
	</main>
</div>
