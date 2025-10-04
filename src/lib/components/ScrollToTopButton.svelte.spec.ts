import { render, fireEvent, cleanup } from '@testing-library/svelte';
import { describe, it, expect, vi, afterEach } from 'vitest';
import ScrollToTopButton from './ScrollToTopButton.svelte';

describe('ScrollToTopButton', () => {
	afterEach(() => {
		cleanup();
	});
	it('renders button when show is true', () => {
		const scrollToTop = vi.fn();
		const { getByRole } = render(ScrollToTopButton, { props: { show: true, scrollToTop } });
		const button = getByRole('button', { name: /scroll back to top/i });
		expect(button).toBeTruthy();
	});

	it('does not render button when show is false', () => {
		const scrollToTop = vi.fn();
		const { container } = render(ScrollToTopButton, { props: { show: false, scrollToTop } });
		const button = container.querySelector('button');
		expect(button).toBeFalsy();
	});

	it('calls scrollToTop when button is clicked', async () => {
		const scrollToTop = vi.fn();
		const { getByRole } = render(ScrollToTopButton, { props: { show: true, scrollToTop } });
		const button = getByRole('button', { name: /scroll back to top/i });

		await fireEvent.click(button);

		expect(scrollToTop).toHaveBeenCalledOnce();
	});

	it('has proper ARIA label', () => {
		const scrollToTop = vi.fn();
		const { getByRole } = render(ScrollToTopButton, { props: { show: true, scrollToTop } });
		const button = getByRole('button', { name: 'Scroll back to top of page' });
		expect(button).toBeTruthy();
	});

	it('contains an SVG icon', () => {
		const scrollToTop = vi.fn();
		const { container } = render(ScrollToTopButton, { props: { show: true, scrollToTop } });
		const svg = container.querySelector('svg');
		expect(svg).toBeTruthy();
		expect(svg?.getAttribute('aria-hidden')).toBe('true');
	});
});
