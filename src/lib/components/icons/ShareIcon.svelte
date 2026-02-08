<script lang="ts">
	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	stroke-linejoin="round"
	aria-hidden="true"
>
	<!-- Connecting lines (shrink back on hover) -->
	<path d="M15.7 6.9l-7.4 4.2" class="share-line" />
	<path d="M8.3 13.1l7.4 4.4" class="share-line" />
	<!-- Dots (engorge on hover, staggered top → mid → bottom) -->
	<circle cx="18" cy="5" r="2.5" class="share-dot dot-top" />
	<circle cx="6" cy="12" r="2.5" class="share-dot dot-mid" />
	<circle cx="18" cy="19" r="2.5" class="share-dot dot-bottom" />
</svg>

<style>
	.share-dot {
		transform-box: fill-box;
		transform-origin: center;
		transition: transform 0.25s ease-out;
	}

	.dot-top {
		transition-delay: 0s;
	}
	.dot-mid {
		transition-delay: 0.07s;
	}
	.dot-bottom {
		transition-delay: 0.14s;
	}

	:global(.icon-hovered) .share-dot {
		transform: scale(1.4);
	}

	.share-line {
		/* approximate line length */
		stroke-dasharray: 9;
		stroke-dashoffset: 0;
		transition: stroke-dashoffset 0.3s ease-out;
	}

	:global(.icon-hovered) .share-line {
		stroke-dashoffset: 2.5;
	}
</style>
