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
	<!-- Arrow (bounces on hover, drops on press) -->
	<g class="download-arrow">
		<path d="M12 3v12" />
		<path d="M8 11l4 4 4-4" />
	</g>
	<!-- Tray -->
	<path d="M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
</svg>

<style>
	.download-arrow {
		transition: transform 0.2s ease;
	}

	:global(.icon-hovered) .download-arrow {
		animation: arrow-bounce 1s ease-in-out infinite;
	}

	:global(.icon-pressed) .download-arrow {
		animation: arrow-drop 0.3s ease-out;
	}

	@keyframes arrow-bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(2px);
		}
	}

	@keyframes arrow-drop {
		0% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(4px);
		}
		100% {
			transform: translateY(0);
		}
	}
</style>
