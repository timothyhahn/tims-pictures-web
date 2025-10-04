<script lang="ts">
	import { page } from '$app/stores';

	interface Props {
		title: string;
		ogTitle?: string;
		ogImage?: string;
		ogDescription?: string;
	}

	let { title, ogTitle, ogImage, ogDescription }: Props = $props();

	let ogUrl = $derived($page.url.origin + $page.url.pathname);
	let effectiveOgTitle = $derived(ogTitle || title);
</script>

<svelte:head>
	<title>{title}</title>
	<meta property="og:title" content={effectiveOgTitle} />
	<meta property="og:type" content="website" />
	<meta property="og:url" content={ogUrl} />
	{#if ogImage}
		<meta property="og:image" content={ogImage} />
	{/if}
	{#if ogDescription}
		<meta property="og:description" content={ogDescription} />
	{/if}
</svelte:head>
