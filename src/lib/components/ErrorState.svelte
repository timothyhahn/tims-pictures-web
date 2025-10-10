<script lang="ts">
	interface Props {
		message?: string;
		details?: string;
		onRetry?: () => void;
		size?: 'small' | 'medium' | 'large';
	}

	let { message = 'Something went wrong', details, onRetry, size = 'medium' }: Props = $props();

	const containerPadding = {
		small: 'py-4',
		medium: 'py-8',
		large: 'py-16'
	};

	const textSize = {
		small: 'text-sm',
		medium: 'text-base',
		large: 'text-xl'
	};
</script>

<div class="flex flex-col items-center justify-center {containerPadding[size]}">
	<div class="mb-4 rounded-lg border border-red-800 bg-red-900/20 p-6 text-center">
		<p class="{textSize[size]} mb-2 font-medium text-red-400">{message}</p>
		{#if details}
			<p class="text-sm text-gray-400">{details}</p>
		{/if}
	</div>

	{#if onRetry}
		<button
			class="rounded bg-gray-600 px-4 py-2 text-white transition-colors hover:bg-gray-700 active:bg-gray-800"
			onclick={onRetry}
		>
			Try Again
		</button>
	{/if}
</div>
