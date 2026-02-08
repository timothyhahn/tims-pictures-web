<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { onDestroy } from 'svelte';
	import Lightbox from '$lib/components/lightbox/Lightbox.svelte';
	import PageMetadata from '$lib/components/PageMetadata.svelte';
	import { setSidebarContext, clearSidebarContext } from '$lib/stores/sidebarContext';
	import { formatMetadata } from '$lib/utils/metadata';
	import type { PageData } from './$types';
	import type { Picture } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	interface AlbumData {
		albumSlug: string;
		albumName: string;
		albumDescription?: string;
		albumPictureCount: number;
		allPictures: Picture[];
		currentIndex: number;
	}

	let albumData = $state<AlbumData | null>(null);
	let lightboxControlsVisible = $state(true);
	let lightboxInfoVisible = $state(false);

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

	// Set sidebar context with EXIF data
	$effect(() => {
		if (picture && albumData) {
			const metadata =
				picture.metadata && typeof picture.metadata === 'object'
					? formatMetadata(picture.metadata as Record<string, string>)
					: [];
			setSidebarContext({
				type: 'picture',
				albumName: albumData.albumName,
				albumSlug: albumData.albumSlug,
				...(albumData.albumDescription && { albumDescription: albumData.albumDescription }),
				albumPictureCount: albumData.albumPictureCount,
				...(picture.description && { description: picture.description }),
				metadata,
				currentIndex: albumData.currentIndex
			});
		}
	});

	onDestroy(clearSidebarContext);

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
	{@const album = albumData}
	{@const hasNext = backLocation !== 'home' && album.currentIndex < album.allPictures.length - 1}
	{@const hasPrev = backLocation !== 'home' && album.currentIndex > 0}
	{#key picture.id}
		<Lightbox
			{picture}
			albumSlug={album.albumSlug}
			albumName={album.albumName}
			{backLocation}
			currentIndex={album.currentIndex}
			totalCount={album.allPictures.length}
			bind:showControls={lightboxControlsVisible}
			bind:showInfo={lightboxInfoVisible}
			{...hasNext && { onNext: () => handleNext(album.allPictures, album.currentIndex) }}
			{...hasPrev && { onPrevious: () => handlePrevious(album.allPictures, album.currentIndex) }}
			onClose={() => handleClose(album.albumSlug)}
		/>
	{/key}
{:else}
	<div class="flex h-screen items-center justify-center">
		<p class="text-gray-400">Loading...</p>
	</div>
{/if}
