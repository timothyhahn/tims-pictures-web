<script lang="ts">
	import { Share2, Link } from 'lucide-svelte';

	interface Props {
		pictureId: string;
	}

	let { pictureId }: Props = $props();

	let showShareMenu = $state(false);

	function toggleShareMenu() {
		showShareMenu = !showShareMenu;
	}

	async function copyLinkToClipboard() {
		const url = `${window.location.origin}/pictures/${pictureId}`;
		try {
			await navigator.clipboard.writeText(url);
			showShareMenu = false;
		} catch (err) {
			console.error('Failed to copy link:', err);
		}
	}
</script>

<div class="relative">
	<button
		onclick={toggleShareMenu}
		class="group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20"
		aria-label="Share"
	>
		<Share2 class="h-6 w-6" />
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
				class="flex cursor-pointer items-center gap-2 rounded px-3 py-2 text-sm whitespace-nowrap text-white transition-colors hover:bg-white/10"
			>
				<Link class="h-4 w-4" />
				Copy Link
			</button>
		</div>
	{/if}
</div>
