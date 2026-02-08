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
	<!-- Left link loop: ~19.7px path length -->
	<path class="link-left" d="M9 17H7A5 5 0 0 1 7 7h2" />
	<!-- Right link loop: ~19.7px path length -->
	<path class="link-right" d="M15 7h2a5 5 0 0 1 0 10h-2" />
	<!-- Connecting bar: 8px path length -->
	<line class="link-bar" x1="8" y1="12" x2="16" y2="12" />
</svg>

<style>
	.link-left,
	.link-right {
		stroke-dasharray: 20;
		stroke-dashoffset: 0;
	}

	.link-bar {
		stroke-dasharray: 8;
		stroke-dashoffset: 0;
	}

	:global(.icon-hovered) .link-left {
		animation: ripple-draw-arc 0.6s ease-in-out;
	}

	:global(.icon-hovered) .link-right {
		animation: ripple-draw-arc 0.6s ease-in-out 0.1s;
	}

	:global(.icon-hovered) .link-bar {
		animation: ripple-draw-bar 0.6s ease-in-out 0.05s;
	}

	@keyframes ripple-draw-arc {
		0% {
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dashoffset: 20;
		}
		100% {
			stroke-dashoffset: 40;
		}
	}

	@keyframes ripple-draw-bar {
		0% {
			stroke-dashoffset: 0;
		}
		50% {
			stroke-dashoffset: 8;
		}
		100% {
			stroke-dashoffset: 16;
		}
	}
</style>
