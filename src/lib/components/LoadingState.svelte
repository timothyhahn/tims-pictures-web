<script lang="ts">
	interface Props {
		message?: string;
		size?: 'small' | 'medium' | 'large';
	}

	let { message = 'Loading...', size = 'medium' }: Props = $props();

	const sizeClasses = {
		small: 'h-2 w-2',
		medium: 'h-3 w-3',
		large: 'h-4 w-4'
	};

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
	<div class="flex space-x-2">
		<div
			class="{sizeClasses[size]} animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"
		></div>
		<div
			class="{sizeClasses[size]} animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"
		></div>
		<div class="{sizeClasses[size]} animate-bounce rounded-full bg-gray-400"></div>
	</div>
	{#if message}
		<p class="mt-4 {textSize[size]} text-gray-400">{message}</p>
	{/if}
</div>
