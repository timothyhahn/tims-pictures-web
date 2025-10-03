<script lang="ts">
	interface Props {
		show: boolean;
	}

	let { show }: Props = $props();
</script>

{#if show}
	<div class="flex justify-center py-8">
		<div class="flex space-x-2">
			<div class="h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
			<div class="h-3 w-3 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
			<div class="h-3 w-3 animate-bounce rounded-full bg-gray-400"></div>
		</div>
	</div>
{/if}
