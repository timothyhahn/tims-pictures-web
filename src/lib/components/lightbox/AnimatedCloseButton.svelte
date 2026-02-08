<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		onClose: () => void;
		buttonClass?: string;
	}

	let { onClose, buttonClass = '' }: Props = $props();

	let mounted = $state(false);
	let closing = $state(false);
	let closeTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		// Small delay so the draw animation is visible after page transition
		const t = setTimeout(() => {
			mounted = true;
		}, 100);
		return () => {
			clearTimeout(t);
			if (closeTimeout) clearTimeout(closeTimeout);
		};
	});

	function handleClick() {
		closing = true;
		closeTimeout = setTimeout(onClose, 350);
	}
</script>

<button
	type="button"
	onclick={handleClick}
	class="group/tooltip pointer-events-auto relative ml-auto cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20 {buttonClass}"
	aria-label="Close"
>
	<svg
		class="close-svg h-6 w-6"
		class:closing
		viewBox="0 0 24 24"
		fill="none"
		stroke="currentColor"
		stroke-width="2"
		stroke-linecap="round"
	>
		<line x1="6" y1="6" x2="18" y2="18" class="close-line close-line-1" class:draw={mounted} />
		<line x1="18" y1="6" x2="6" y2="18" class="close-line close-line-2" class:draw={mounted} />
	</svg>
	<span
		class="pointer-events-none absolute top-full right-0 mt-2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
	>
		Close (Esc)
	</span>
</button>

<style>
	/* Draw animation: lines appear one after the other */
	.close-line {
		/* Line length: sqrt(12^2 + 12^2) ≈ 16.97 */
		stroke-dasharray: 17;
		stroke-dashoffset: 17;
	}

	.close-line.draw {
		stroke-dashoffset: 0;
		transition: stroke-dashoffset 0.3s ease-out;
	}

	.close-line-2.draw {
		transition-delay: 0.15s;
	}

	/* Close animation: X collapses and fades */
	.close-svg {
		transform-origin: center;
		transition:
			transform 0.3s ease-in,
			opacity 0.3s ease-in;
	}

	.close-svg.closing {
		transform: rotate(90deg) scale(0);
		opacity: 0;
	}
</style>
