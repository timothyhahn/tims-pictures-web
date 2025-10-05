<script lang="ts">
	import PageMetadata from '$lib/components/PageMetadata.svelte';
	import { enhance } from '$app/forms';
	import type { PageData, ActionData } from './$types';

	let { data, form }: { data: PageData; form: ActionData } = $props();

	let submitting = $state(false);
</script>

<PageMetadata title={`Enter Password - ${data.slug} - Tim's Pictures`} />

<div class="container mx-auto flex min-h-[60vh] items-center justify-center p-6">
	<div class="w-full max-w-md">
		<div class="rounded-lg bg-gray-800 p-8 shadow-xl">
			<h1 class="mb-2 text-2xl font-bold text-white">Password Required</h1>
			<p class="mb-6 text-gray-400">This album is private. Please enter the password to view it.</p>

			<form
				method="POST"
				use:enhance={() => {
					submitting = true;
					return async ({ update }) => {
						await update();
						submitting = false;
					};
				}}
			>
				<div class="mb-4">
					<label for="password" class="mb-2 block text-sm font-medium text-gray-300">
						Password
					</label>
					<input
						type="password"
						id="password"
						name="password"
						class="w-full rounded-lg border border-gray-600 bg-gray-700 px-4 py-2 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="Enter album password"
						required
						autofocus
						disabled={submitting}
					/>
				</div>

				{#if form?.error}
					<div class="mb-4 rounded-lg bg-red-900/50 p-3 text-sm text-red-200">
						{form.error}
					</div>
				{/if}

				<button
					type="submit"
					class="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
					disabled={submitting}
				>
					{submitting ? 'Validating...' : 'Access Album'}
				</button>
			</form>

			<div class="mt-6 text-center">
				<a href="/albums" class="text-sm text-blue-400 hover:text-blue-300"> ← Back to Albums </a>
			</div>
		</div>
	</div>
</div>
