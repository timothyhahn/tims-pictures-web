<script lang="ts">
	interface Props {
		count?: number;
		columns?: string;
		aspectRatio?: string;
		gap?: string;
		padding?: string;
	}

	let {
		count = 12,
		columns = 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
		aspectRatio = '1',
		gap = 'gap-4',
		padding = 'p-6'
	}: Props = $props();
</script>

<div class="grid {columns} {gap} {padding}">
	{#each Array(count) as _}
		<div class="animate-pulse rounded bg-gray-800" style="aspect-ratio: {aspectRatio};"></div>
	{/each}
</div>
