<script lang="ts">
	interface Props {
		class?: string;
		direction: 'left' | 'right';
	}

	let { class: className = '', direction }: Props = $props();

	const isLeft = $derived(direction === 'left');
	const path = $derived(isLeft ? 'M15 6l-6 6 6 6' : 'M9 6l6 6-6 6');
	const tipX = $derived(isLeft ? 9 : 15);
	const nudgeX = $derived(isLeft ? -1.5 : 1.5);
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
	<path d={path} class="chevron" style="transform-origin: {tipX}px 12px; --nudge-x: {nudgeX}px;" />
</svg>

<style>
	:global(.icon-pressed) .chevron {
		animation: chevron-squeeze 0.3s ease-out;
	}

	@keyframes chevron-squeeze {
		0% {
			transform: scaleY(1) translateX(0);
		}
		35% {
			transform: scaleY(0.55) translateX(var(--nudge-x));
		}
		65% {
			transform: scaleY(1.08) translateX(0);
		}
		100% {
			transform: scaleY(1) translateX(0);
		}
	}
</style>
