<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="flex min-h-screen flex-col items-center justify-center p-6">
	<div class="text-center">
		<h1 class="mb-4 text-6xl font-bold text-gray-200">{$page.status}</h1>

		{#if $page.status === 404}
			<h2 class="mb-4 text-2xl font-semibold text-gray-300">Page Not Found</h2>
			<p class="mb-8 text-gray-400">
				Sorry, we couldn't find what you're looking for.
			</p>
		{:else}
			<h2 class="mb-4 text-2xl font-semibold text-gray-300">Something went wrong</h2>
			<p class="mb-8 text-gray-400">
				{$page.error?.message || 'An unexpected error occurred'}
			</p>
		{/if}

		<a
			href="/"
			class="inline-block rounded-lg bg-green-600 px-6 py-3 text-white transition-colors hover:bg-green-700"
		>
			Go Home
		</a>
	</div>
</div>
