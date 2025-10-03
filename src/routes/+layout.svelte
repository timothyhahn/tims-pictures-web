<script lang="ts">
	import '../app.css';
	import Navigation from '$lib/components/Navigation.svelte';

	let { children } = $props();
</script>

<svelte:head>
	<title>Tim's Pictures</title>
</svelte:head>

<div class="min-h-screen">
	<Navigation />

	<!-- Main content area with responsive padding for nav -->
	<main class="pt-16 md:ml-64 md:pt-0">
		{@render children?.()}
	</main>
</div>
