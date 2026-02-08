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
	<!-- Circle: hidden by default, draws in on hover -->
	<circle cx="12" cy="12" r="10" class="info-circle" />
	<!-- The "i" - large by default, shrinks when circle appears -->
	<g class="info-letter">
		<path d="M12 16v-4" />
		<circle cx="12" cy="8" r="1" fill="currentColor" stroke="none" />
	</g>
</svg>

<style>
	.info-circle {
		/* circumference = 2 * pi * 10 ≈ 62.83 */
		stroke-dasharray: 63;
		stroke-dashoffset: 63;
		transition: stroke-dashoffset 0.4s ease-out;
	}

	:global(.icon-hovered) .info-circle {
		stroke-dashoffset: 0;
	}

	.info-letter {
		transform-origin: 12px 12px;
		transform: scale(1.35);
		transition: transform 0.3s ease-out;
	}

	:global(.icon-hovered) .info-letter {
		transform: scale(1);
	}
</style>
