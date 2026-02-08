<script lang="ts">
	import { onMount } from 'svelte';
	import AnimatedCloseIcon from '../icons/AnimatedCloseIcon.svelte';

	interface Props {
		onClose: () => void;
		buttonClass?: string;
	}

	let { onClose, buttonClass = '' }: Props = $props();

	let closing = $state(false);
	let closeTimeout: ReturnType<typeof setTimeout> | null = null;

	onMount(() => {
		return () => {
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
	<AnimatedCloseIcon class="h-6 w-6" {closing} />
	<span
		class="pointer-events-none absolute top-full right-0 mt-2 rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100"
	>
		Close (Esc)
	</span>
</button>
