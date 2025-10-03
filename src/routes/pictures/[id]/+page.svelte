<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Lightbox from '$lib/components/Lightbox.svelte';
	import type { PageData } from './$types';
	import type { Picture } from '$lib/api/types';

	let { data }: { data: PageData } = $props();

	let picture = $state<any>(null);
	let albumSlug = $state('');
	let albumName = $state('');
	let allPictures = $state<any[]>([]);
	let currentIndex = $state(-1);

	// Get the 'back' query param, default to 'album'
	let backLocation = $derived($page.url.searchParams.get('back') || 'album');

	// Load picture and album data from promises
	$effect(() => {
		data.picture.then((loadedPicture) => {
			picture = loadedPicture;
		});

		data.albumData.then((loadedAlbumData) => {
			albumSlug = loadedAlbumData.albumSlug;
			albumName = loadedAlbumData.albumName;
			allPictures = loadedAlbumData.allPictures;
			currentIndex = loadedAlbumData.currentIndex;
		});
	});

	function handleNext() {
		if (currentIndex < allPictures.length - 1) {
			const nextPicture = allPictures[currentIndex + 1];
			goto(`/pictures/${nextPicture.id}?back=${backLocation}`);
		}
	}

	function handlePrevious() {
		if (currentIndex > 0) {
			const prevPicture = allPictures[currentIndex - 1];
			goto(`/pictures/${prevPicture.id}?back=${backLocation}`);
		}
	}

	function handleClose() {
		if (backLocation === 'home') {
			goto('/');
		} else {
			goto(`/albums/${albumSlug}`);
		}
	}
</script>

<svelte:head>
	<title>{albumName} - {picture?.description || 'Photo'} - Tim's Pictures</title>
</svelte:head>

{#if picture}
	<Lightbox
		{picture}
		{albumSlug}
		onNext={backLocation === 'home' ? undefined : currentIndex < allPictures.length - 1 ? handleNext : undefined}
		onPrevious={backLocation === 'home' ? undefined : currentIndex > 0 ? handlePrevious : undefined}
		onClose={handleClose}
	/>
{:else}
	<div class="flex h-screen items-center justify-center">
		<p class="text-gray-400">Loading...</p>
	</div>
{/if}
