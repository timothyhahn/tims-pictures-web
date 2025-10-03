<script lang="ts">
	let {
		show,
		scrollToTop
	}: {
		show: boolean;
		scrollToTop: () => void;
	} = $props();
</script>

{#if show}
	<button
		onclick={scrollToTop}
		class="fixed right-4 bottom-4 z-50 cursor-pointer rounded-full bg-white/10 p-3 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:bg-white/20 focus:ring-2 focus:ring-white/50 focus:outline-none"
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
