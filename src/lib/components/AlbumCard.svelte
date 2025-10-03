<script lang="ts">
	import type { Album } from '$lib/api/types';

	interface Props {
		album: Album;
	}

	let { album }: Props = $props();

	function handleImageLoad(event: Event) {
		const img = event.target as HTMLImageElement;
		img.classList.add('loaded');
	}
</script>

<a
	href="/albums/{album.slug}"
	class="block overflow-hidden rounded-lg bg-gray-800 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl"
>
	<!-- Cover Image or Placeholder -->
	{#if album.cover_picture_url}
		<div class="aspect-video w-full overflow-hidden bg-gray-900">
			<img
				src="{album.cover_picture_url}?class=thumbnail"
				alt="{album.name} cover"
				class="image-fade-in h-full w-full object-cover"
				loading="lazy"
				onload={handleImageLoad}
			/>
		</div>
	{:else}
		<div class="flex aspect-video w-full items-center justify-center bg-gray-900">
			<svg class="h-16 w-16 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path
					stroke-linecap="round"
					stroke-linejoin="round"
					stroke-width="2"
					d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
				/>
			</svg>
		</div>
	{/if}

	<!-- Album Info -->
	<div class="p-4">
		<h3 class="mb-1 text-xl font-thin">{album.name}</h3>

		{#if album.description}
			<p class="mb-2 line-clamp-2 text-sm text-gray-400">
				{album.description}
			</p>
		{/if}

		<div class="flex items-center gap-2 text-xs text-gray-500">
			<span>
				{album.picture_count}
				{album.picture_count === 1 ? 'image' : 'images'}
			</span>

			{#if album.has_password}
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
</a>
