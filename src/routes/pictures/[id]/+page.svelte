<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Lightbox from '$lib/components/Lightbox.svelte';
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

	// Derive OpenGraph URL from page store without query params
	let ogUrl = $derived($page.url.origin + $page.url.pathname);

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
			const nextPicture = allPictures[currentIndex + 1];
			goto(`/pictures/${nextPicture.id}?back=${backLocation}`);
		}
	}

	function handlePrevious(allPictures: Picture[], currentIndex: number) {
		if (currentIndex > 0) {
			const prevPicture = allPictures[currentIndex - 1];
			goto(`/pictures/${prevPicture.id}?back=${backLocation}`);
		}
	}

	function handleClose(albumSlug: string) {
		if (backLocation === 'home') {
			goto('/');
		} else {
			goto(`/albums/${albumSlug}`);
		}
	}
</script>

<svelte:head>
	<title>{picture ? `${picture.description || 'Photo'} - Tim's Pictures` : "Tim's Pictures"}</title>
	<meta property="og:title" content="Tim's Pictures" />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={ogUrl} />
	{#if picture?.image_url}
		<meta property="og:image" content={picture.image_url} />
	{/if}
	{#if picture?.description}
		<meta property="og:description" content={picture.description} />
	{/if}
</svelte:head>

{#if picture && albumData}
	<Lightbox
		{picture}
		albumSlug={albumData.albumSlug}
		{backLocation}
		onNext={backLocation === 'home'
			? undefined
			: albumData.currentIndex < albumData.allPictures.length - 1
				? () => handleNext(albumData.allPictures, albumData.currentIndex)
				: undefined}
		onPrevious={backLocation === 'home'
			? undefined
			: albumData.currentIndex > 0
				? () => handlePrevious(albumData.allPictures, albumData.currentIndex)
				: undefined}
		onClose={() => handleClose(albumData.albumSlug)}
	/>
{:else}
	<div class="flex h-screen items-center justify-center">
		<p class="text-gray-400">Loading...</p>
	</div>
{/if}
