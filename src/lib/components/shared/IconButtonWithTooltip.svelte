<script lang="ts">
	import type { ComponentType } from 'svelte';

	interface Props {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		icon: ComponentType<any>;
		label: string;
		tooltip: string;
		onclick?: (e: MouseEvent) => void;
		href?: string;
		iconSize?: 'sm' | 'md' | 'lg';
		tooltipPosition?: 'top' | 'bottom' | 'left' | 'right';
		buttonClass?: string;
		tooltipClass?: string;
	}

	let {
		icon: IconComponent,
		label,
		tooltip,
		onclick,
		href,
		iconSize = 'md',
		tooltipPosition = 'bottom',
		buttonClass = '',
		tooltipClass = ''
	}: Props = $props();

	const iconSizeClass = $derived(
		iconSize === 'sm' ? 'h-4 w-4' : iconSize === 'lg' ? 'h-8 w-8' : 'h-6 w-6'
	);

	const defaultTooltipPositionClass = $derived(
		{
			top: 'bottom-full left-1/2 mb-2 -translate-x-1/2',
			bottom: 'top-full left-1/2 mt-2 -translate-x-1/2',
			left: 'top-1/2 right-full mr-2 -translate-y-1/2',
			right: 'top-1/2 left-full ml-2 -translate-y-1/2'
		}[tooltipPosition]
	);

	const tooltipPositionClass = $derived(tooltipClass || defaultTooltipPositionClass);

	const sharedClass = $derived(
		`group/tooltip pointer-events-auto relative cursor-pointer rounded-lg p-2 text-white transition-colors hover:bg-white/20 ${buttonClass}`
	);
</script>

{#if href}
	<a
		{href}
		class={sharedClass}
		aria-label={label}
	>
		<IconComponent class={iconSizeClass} />
		<span
			class="pointer-events-none absolute rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100 {tooltipPositionClass}"
		>
			{tooltip}
		</span>
	</a>
{:else}
	<button
		{onclick}
		class={sharedClass}
		aria-label={label}
	>
		<IconComponent class={iconSizeClass} />
		<span
			class="pointer-events-none absolute rounded bg-black/90 px-2 py-1 text-xs whitespace-nowrap text-white opacity-0 transition-opacity group-hover/tooltip:opacity-100 {tooltipPositionClass}"
		>
			{tooltip}
		</span>
	</button>
{/if}
