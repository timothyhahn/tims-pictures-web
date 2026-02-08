<script lang="ts">
	import type { Album } from '$lib/api/types';
	import AlbumCover from './AlbumCover.svelte';
	import AlbumInfo from './AlbumInfo.svelte';

	interface Props {
		album: Album;
		tier?: 'large' | 'medium' | 'small';
		smColSpan?: number;
		smRowSpan?: number;
		lgColSpan?: number;
		lgRowSpan?: number;
	}

	let {
		album,
		tier = 'small',
		smColSpan = 1,
		smRowSpan = 1,
		lgColSpan = 1,
		lgRowSpan = 1
	}: Props = $props();
</script>

<a
	href="/albums/{album.slug}"
	class="group flex h-full flex-col overflow-hidden rounded bg-gray-800 shadow-[0_1px_3px_rgba(0,0,0,0.3)] transition-[box-shadow,transform] duration-200 ease-[ease] hover:-translate-y-0.5 hover:shadow-[0_4px_12px_rgba(0,0,0,0.5)]"
	style="--sm-col: {smColSpan}; --sm-row: {smRowSpan}; --lg-col: {lgColSpan}; --lg-row: {lgRowSpan};"
>
	<AlbumCover
		{...album.cover_picture_url && { coverUrl: album.cover_picture_url }}
		albumName={album.name}
		{tier}
	/>
	<AlbumInfo
		name={album.name}
		{...album.description && { description: album.description }}
		pictureCount={album.picture_count}
		hasPassword={album.has_password}
		{tier}
	/>
</a>
