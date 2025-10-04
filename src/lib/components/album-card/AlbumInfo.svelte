<script lang="ts">
	interface Props {
		name: string;
		description?: string;
		pictureCount: number;
		hasPassword: boolean;
	}

	let { name, description, pictureCount, hasPassword }: Props = $props();
</script>

<div class="p-4">
	<h3 class="mb-1 text-xl font-thin">{name}</h3>

	{#if description}
		<p class="mb-2 line-clamp-2 text-sm text-gray-400">
			{description}
		</p>
	{/if}

	<div class="flex items-center gap-2 text-xs text-gray-500">
		<span>
			{pictureCount}
			{pictureCount === 1 ? 'image' : 'images'}
		</span>

		{#if hasPassword}
			<span class="inline-flex items-center gap-1">
				<svg class="h-3 w-3" fill="currentColor" viewBox="0 0 20 20">
					<path
						fill-rule="evenodd"
						d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z"
						clip-rule="evenodd"
					/>
				</svg>
				Protected
			</span>
		{/if}
	</div>
</div>
