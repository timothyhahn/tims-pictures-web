<script lang="ts">
	let {
		show,
		scrollToTop
	}: {
		show: boolean;
		scrollToTop: () => void;
	} = $props();

	let isPopping = $state(false);

	function handleClick() {
		isPopping = true;
		scrollToTop();
		setTimeout(() => {
			isPopping = false;
		}, 600);
	}
</script>

{#if show}
	<button
		onclick={handleClick}
		class="fixed right-4 bottom-4 z-50 cursor-pointer rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none {isPopping
			? 'bubble-pop'
			: ''}"
		aria-label="Scroll back to top of page"
		type="button"
	>
		<svg
			class="h-5 w-5 text-white"
			fill="none"
			stroke="currentColor"
			viewBox="0 0 24 24"
			aria-hidden="true"
		>
			<path
				stroke-linecap="round"
				stroke-linejoin="round"
				stroke-width="2"
				d="M5 10l7-7m0 0l7 7m-7-7v18"
			/>
		</svg>
	</button>
{/if}

<style>
	@keyframes bubble-pop {
		0% {
			transform: scale(1);
			opacity: 1;
		}
		30% {
			transform: scale(1.3);
		}
		50% {
			transform: scale(0.9);
			opacity: 0.7;
		}
		70% {
			transform: scale(1.15);
			opacity: 0.4;
		}
		100% {
			transform: scale(1);
			opacity: 1;
		}
	}

	.bubble-pop {
		animation: bubble-pop 0.6s cubic-bezier(0.68, -0.55, 0.265, 1.55);
	}
</style>
