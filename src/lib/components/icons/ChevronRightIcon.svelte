<script lang="ts">
	import ChevronIcon from './ChevronIcon.svelte';

	interface Props {
		class?: string;
	}

	let { class: className = '' }: Props = $props();
</script>

<ChevronIcon class={className} direction="right" />
