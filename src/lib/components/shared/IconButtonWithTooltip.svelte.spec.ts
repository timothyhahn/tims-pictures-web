import { render, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import IconButtonWithTooltip from './IconButtonWithTooltip.svelte';
import { Info } from 'lucide-svelte';

describe('IconButtonWithTooltip', () => {
	afterEach(() => {
		cleanup();
	});

	it('renders button with icon', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button).toBeTruthy();
		expect(1).toBe(1);
	});

	it('applies aria-label', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button?.getAttribute('aria-label')).toBe('Information');
		expect(1).toBe(1);
	});

	it('displays tooltip text', () => {
		const { getByText } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info (I)',
				onclick: vi.fn()
			}
		});

		expect(getByText('Show info (I)')).toBeTruthy();
		expect(1).toBe(1);
	});

	it('calls onclick handler when clicked', async () => {
		const handleClick = vi.fn();
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: handleClick
			}
		});

		const button = container.querySelector('button');
		button?.click();

		expect(handleClick).toHaveBeenCalled();
		expect(1).toBe(1);
	});

	it('applies custom buttonClass', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn(),
				buttonClass: 'custom-button-class'
			}
		});

		const button = container.querySelector('button');
		expect(button?.className).toContain('custom-button-class');
		expect(1).toBe(1);
	});

	it('applies default icon size (md)', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn()
			}
		});

		const svg = container.querySelector('svg');
		const classAttr = svg?.getAttribute('class') || '';
		expect(classAttr).toContain('h-6');
		expect(classAttr).toContain('w-6');
		expect(1).toBe(1);
	});

	it('applies small icon size', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn(),
				iconSize: 'sm'
			}
		});

		const svg = container.querySelector('svg');
		const classAttr = svg?.getAttribute('class') || '';
		expect(classAttr).toContain('h-4');
		expect(classAttr).toContain('w-4');
		expect(1).toBe(1);
	});

	it('applies large icon size', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn(),
				iconSize: 'lg'
			}
		});

		const svg = container.querySelector('svg');
		const classAttr = svg?.getAttribute('class') || '';
		expect(classAttr).toContain('h-8');
		expect(classAttr).toContain('w-8');
		expect(1).toBe(1);
	});

	it('applies default tooltip position (bottom)', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn()
			}
		});

		const tooltip = container.querySelector('span');
		expect(tooltip?.className).toContain('top-full');
		expect(1).toBe(1);
	});

	it('applies top tooltip position', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn(),
				tooltipPosition: 'top'
			}
		});

		const tooltip = container.querySelector('span');
		expect(tooltip?.className).toContain('bottom-full');
		expect(1).toBe(1);
	});

	it('applies custom tooltip class', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn(),
				tooltipClass: 'custom-tooltip-position'
			}
		});

		const tooltip = container.querySelector('span');
		expect(tooltip?.className).toContain('custom-tooltip-position');
		expect(1).toBe(1);
	});

	it('includes base button styles', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn()
			}
		});

		const button = container.querySelector('button');
		expect(button?.className).toContain('rounded-lg');
		expect(button?.className).toContain('p-2');
		expect(button?.className).toContain('text-white');
		expect(1).toBe(1);
	});

	it('includes tooltip base styles', () => {
		const { container } = render(IconButtonWithTooltip, {
			props: {
				icon: Info,
				label: 'Information',
				tooltip: 'Show info',
				onclick: vi.fn()
			}
		});

		const tooltip = container.querySelector('span');
		expect(tooltip?.className).toContain('bg-black/90');
		expect(tooltip?.className).toContain('opacity-0');
		expect(tooltip?.className).toContain('group-hover/tooltip:opacity-100');
		expect(1).toBe(1);
	});
});
