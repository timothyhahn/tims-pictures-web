<script lang="ts">
	import { onMount } from 'svelte';

	interface Props {
		class?: string;
		closing?: boolean;
	}

	let { class: className = '', closing = false }: Props = $props();

	let mounted = $state(false);

	onMount(() => {
		const t = setTimeout(() => {
			mounted = true;
		}, 100);
		return () => clearTimeout(t);
	});
</script>

<svg
	class="close-icon {className}"
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

<style>
	.close-line {
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

	.close-icon {
		transform-origin: center;
		transition:
			transform 0.3s ease-in,
			opacity 0.3s ease-in;
	}

	.close-icon.closing {
		transform: rotate(90deg) scale(0);
		opacity: 0;
	}
</style>
