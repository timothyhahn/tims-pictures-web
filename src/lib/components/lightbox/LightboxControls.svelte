<script lang="ts">
	import { Info, Download, Album, X, ChevronLeft, ChevronRight } from 'lucide-svelte';
	import type { Picture } from '$lib/api/types';
	import ShareMenu from '../shared/ShareMenu.svelte';
	import IconButtonWithTooltip from '../shared/IconButtonWithTooltip.svelte';
	import { trackEvent } from '$lib/utils/analytics';
	import { downloadImage } from '$lib/utils/download';

	interface Props {
		showControls: boolean;
		onClose: () => void;
		onPrevious?: () => void;
		onNext?: () => void;
		onToggleInfo: () => void;
		picture: Picture;
		backLocation: string;
		albumSlug?: string;
		albumName?: string;
		currentIndex?: number;
		totalCount?: number;
	}

	let {
		showControls,
		onClose,
		onPrevious,
		onNext,
		onToggleInfo,
		picture,
		backLocation,
		albumSlug,
		albumName,
		currentIndex,
		totalCount
	}: Props = $props();

	async function handleDownload(e: MouseEvent) {
		e.preventDefault();
		trackEvent('image downloaded', picture.id);
		await downloadImage(picture.image_url, picture.description || `photo-${picture.id}`);
	}
</script>

{#if showControls}
	<div class="pointer-events-none absolute inset-0 transition-opacity duration-300">
		<!-- Top bar with close button and breadcrumb -->
		<div class="absolute top-0 right-0 left-0 flex items-center justify-between bg-gradient-to-b from-black/90 via-black/50 to-transparent p-4 pb-12">
			{#if albumName && albumSlug}
				<nav aria-label="Breadcrumb" class="pointer-events-auto text-xl text-gray-200">
					{#if backLocation === 'home'}
						<a href="/albums/{albumSlug}" class="flex items-center gap-1.5 transition-colors hover:text-white">
							<Album size={20} />
							<span>{albumName}</span>
						</a>
					{:else}
						<a href="/albums" class="transition-colors hover:text-white">Albums</a>
						<span class="mx-1.5 text-gray-400">/</span>
						<a href="/albums/{albumSlug}" class="transition-colors hover:text-white">{albumName}</a>
						{#if currentIndex !== undefined && currentIndex >= 0 && totalCount}
							<span class="mx-1.5 text-gray-400">/</span>
							<span class="text-gray-300">Photo {currentIndex + 1} of {totalCount}</span>
						{/if}
					{/if}
				</nav>
			{:else}
				<div></div>
			{/if}
			<IconButtonWithTooltip
				icon={X}
				label="Close"
				tooltip="Close (Esc)"
				onclick={onClose}
				tooltipClass="top-full right-0 mt-2"
			/>
		</div>

		<!-- Previous button -->
		{#if onPrevious}
			<div class="absolute top-0 bottom-0 left-0 flex items-center p-4">
				<IconButtonWithTooltip
					icon={ChevronLeft}
					label="Previous photo"
					tooltip="Previous (←)"
					onclick={onPrevious}
					iconSize="lg"
					tooltipPosition="right"
					buttonClass="p-3"
				/>
			</div>
		{/if}

		<!-- Next button -->
		{#if onNext}
			<div class="absolute top-0 right-0 bottom-0 flex items-center p-4">
				<IconButtonWithTooltip
					icon={ChevronRight}
					label="Next photo"
					tooltip="Next (→)"
					onclick={onNext}
					iconSize="lg"
					tooltipPosition="left"
					buttonClass="p-3"
				/>
			</div>
		{/if}

		<!-- Bottom controls -->
		<div class="absolute bottom-0 right-0 left-0 flex gap-2 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 pt-12">
			<IconButtonWithTooltip
				icon={Info}
				label="Toggle info"
				tooltip="Info (I)"
				onclick={onToggleInfo}
				tooltipPosition="top"
			/>

			<ShareMenu pictureId={picture.id} />

			<IconButtonWithTooltip
				icon={Download}
				label="Download photo"
				tooltip="Download"
				onclick={handleDownload}
				tooltipPosition="top"
			/>
		</div>
	</div>
{/if}
