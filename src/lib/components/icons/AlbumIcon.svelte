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
	<!-- Spine (stationary) -->
	<path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2" />
	<!-- Full book body (stationary, revealed when cover opens) -->
	<path d="M6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
	<!-- Page edges (visible when book opens) -->
	<line x1="8" y1="3" x2="8" y2="19" class="page-edge" stroke-width="1" />
	<!-- Front cover overlay (opens on hover) -->
	<g class="album-cover">
		<path d="M6.5 2H20v20H6.5" vector-effect="non-scaling-stroke" />
	</g>
</svg>

<style>
	.album-cover {
		transform-origin: 6.5px 12px;
		transition: transform 0.35s ease-out;
	}

	:global(.icon-hovered) .album-cover {
		transform: scaleX(0.7) skewY(-4deg);
	}

	.page-edge {
		opacity: 0;
		transition: opacity 0.25s ease 0.1s;
	}

	:global(.icon-hovered) .page-edge {
		opacity: 0.4;
	}
</style>
