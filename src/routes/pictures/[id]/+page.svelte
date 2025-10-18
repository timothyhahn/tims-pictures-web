<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Lightbox from '$lib/components/lightbox/Lightbox.svelte';
	import PageMetadata from '$lib/components/PageMetadata.svelte';
	import type { PageData } from './$types';
	import type { Picture } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	interface AlbumData {
		albumSlug: string;
		allPictures: Picture[];
		currentIndex: number;
	}

	let albumData = $state<AlbumData | null>(null);

	// Get the 'back' query param, default to 'album'
	let backLocation = $derived($page.url.searchParams.get('back') || 'album');

	// Picture is loaded directly
	let picture = $derived(data.picture);

	// Load album data from promise
	$effect(() => {
		data.albumData
			.then((albumDat) => {
				albumData = albumDat;
			})
			.catch(() => {
				// Errors will be caught by SvelteKit
			});
	});

	function handleNext(allPictures: Picture[], currentIndex: number) {
		if (currentIndex < allPictures.length - 1) {
			const currentPicture = allPictures[currentIndex];
			const nextPicture = allPictures[currentIndex + 1];
			if (!currentPicture || !nextPicture) return;

			// Set direction and IDs for view transition
			document.documentElement.dataset.pictureNavDirection = 'next';
			document.documentElement.dataset.oldPictureId = currentPicture.id;
			document.documentElement.dataset.newPictureId = nextPicture.id;
			goto(`/pictures/${nextPicture.id}?back=${backLocation}`);
		}
	}

	function handlePrevious(allPictures: Picture[], currentIndex: number) {
		if (currentIndex > 0) {
			const currentPicture = allPictures[currentIndex];
			const prevPicture = allPictures[currentIndex - 1];
			if (!currentPicture || !prevPicture) return;

			// Set direction and IDs for view transition
			document.documentElement.dataset.pictureNavDirection = 'prev';
			document.documentElement.dataset.oldPictureId = currentPicture.id;
			document.documentElement.dataset.newPictureId = prevPicture.id;
			goto(`/pictures/${prevPicture.id}?back=${backLocation}`);
		}
	}

	function handleClose(albumSlug: string) {
		// Clear direction for zoom-out transition
		delete document.documentElement.dataset.pictureNavDirection;
		if (backLocation === 'home') {
			goto('/');
		} else {
			goto(`/albums/${albumSlug}`);
		}
	}
</script>

<PageMetadata
	title={picture ? `${picture.description || 'Photo'} - Tim's Pictures` : "Tim's Pictures"}
	ogTitle="Tim's Pictures"
	{...picture?.image_url && { ogImage: picture.image_url }}
	{...picture?.description && { ogDescription: picture.description }}
/>

{#if picture && albumData}
	{@const data = albumData}
	{@const hasNext = backLocation !== 'home' && data.currentIndex < data.allPictures.length - 1}
	{@const hasPrev = backLocation !== 'home' && data.currentIndex > 0}
	{#key picture.id}
		<Lightbox
			{picture}
			albumSlug={data.albumSlug}
			{backLocation}
			{...hasNext && { onNext: () => handleNext(data.allPictures, data.currentIndex) }}
			{...hasPrev && { onPrevious: () => handlePrevious(data.allPictures, data.currentIndex) }}
			onClose={() => handleClose(data.albumSlug)}
		/>
	{/key}
{:else}
	<div class="flex h-screen items-center justify-center">
		<p class="text-gray-400">Loading...</p>
	</div>
{/if}
