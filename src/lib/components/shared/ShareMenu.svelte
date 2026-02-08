<script lang="ts">
	import ShareIcon from '../icons/ShareIcon.svelte';
	import LinkIcon from '../icons/LinkIcon.svelte';
	import { useIconInteraction } from '$lib/composables/useIconInteraction.svelte';

	interface Props {
		pictureId: string;
	}

	let { pictureId }: Props = $props();

	let showShareMenu = $state(false);
	const interaction = useIconInteraction();
	const linkInteraction = useIconInteraction();

	function toggleShareMenu() {
		interaction.onPress();
		showShareMenu = !showShareMenu;
		if (!showShareMenu) {
			linkInteraction.onMouseLeave();
		}
	}

	async function copyLinkToClipboard() {
		linkInteraction.onPress();
		const url = `${window.location.origin}/pictures/${pictureId}`;
		try {
			await navigator.clipboard.writeText(url);
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
		linkInteraction.onMouseLeave();
		showShareMenu = false;
	}
</script>

<div class="relative">
	<button
		onclick={toggleShareMenu}
		onmouseenter={interaction.onMouseEnter}
		onmouseleave={interaction.onMouseLeave}
		class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20 {interaction.hovered
			? 'icon-hovered'
			: ''} {interaction.pressed ? 'icon-pressed' : ''}"
		aria-label="Share"
		aria-expanded={showShareMenu}
	>
		<span class="icon-depress">
			<ShareIcon class="h-6 w-6" />
		</span>
		<span
			class="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
		>
			Share
		</span>
	</button>

	{#if showShareMenu}
		<div
			class="pointer-events-auto absolute bottom-full left-0 mb-2 rounded-lg bg-gray-900/95 p-2 shadow-lg backdrop-blur-sm"
		>
			<button
				onclick={copyLinkToClipboard}
				onmouseenter={linkInteraction.onMouseEnter}
				onmouseleave={linkInteraction.onMouseLeave}
				class="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm whitespace-nowrap text-white transition-colors hover:bg-white/10 {linkInteraction.hovered
					? 'icon-hovered'
					: ''} {linkInteraction.pressed ? 'icon-pressed' : ''}"
			>
				<span class="icon-depress">
					<LinkIcon class="h-4 w-4" />
				</span>
				Copy Link
			</button>
		</div>
	{/if}
</div>
