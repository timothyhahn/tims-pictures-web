<script lang="ts">
	interface Props {
		open?: boolean;
		class?: string;
	}

	let { open = false, class: className = '' }: Props = $props();
</script>

<svg
	class={className}
	viewBox="0 0 24 24"
	fill="none"
	stroke="currentColor"
	stroke-width="2"
	stroke-linecap="round"
	aria-hidden="true"
>
	<line x1="4" y1="12" x2="20" y2="12" class="menu-line top" class:open />
	<line x1="4" y1="12" x2="20" y2="12" class="menu-line bottom" class:open />
</svg>

<style>
	.menu-line {
		transform-origin: 12px 12px;
		transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}

	.top {
		transform: translateY(-4px);
	}

	.bottom {
		transform: translateY(4px);
	}

	.top.open {
		transform: rotate(45deg);
	}

	.bottom.open {
		transform: rotate(-45deg);
	}
</style>
