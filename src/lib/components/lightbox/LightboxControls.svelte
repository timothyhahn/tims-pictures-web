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
		onGoToAlbum?: () => void;
		picture: Picture;
		backLocation: string;
	}

	let {
		showControls,
		onClose,
		onPrevious,
		onNext,
		onToggleInfo,
		onGoToAlbum,
		picture,
		backLocation
	}: Props = $props();

	async function handleDownload(e: MouseEvent) {
		e.preventDefault();
		trackEvent('image downloaded', picture.id);
		await downloadImage(picture.image_url, picture.description || `photo-${picture.id}`);
	}
</script>

{#if showControls}
	<div class="pointer-events-none absolute inset-0 transition-opacity duration-300">
		<!-- Top bar with close button -->
		<div class="absolute top-0 right-0 left-0 bg-gradient-to-b from-black/50 to-transparent p-4">
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
		<div class="absolute bottom-0 left-0 flex gap-2 p-4">
			<IconButtonWithTooltip
				icon={Info}
				label="Toggle info"
				tooltip="Info (I)"
				onclick={onToggleInfo}
				tooltipPosition="top"
			/>

			{#if backLocation === 'home' && onGoToAlbum}
				<IconButtonWithTooltip
					icon={Album}
					label="Go to album"
					tooltip="View Album"
					onclick={onGoToAlbum}
					tooltipPosition="top"
				/>
			{/if}

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
