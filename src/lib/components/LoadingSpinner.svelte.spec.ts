import { render, cleanup } from '@testing-library/svelte';
import { describe, it, expect, afterEach } from 'vitest';
import LoadingSpinner from './LoadingSpinner.svelte';

describe('LoadingSpinner', () => {
	afterEach(() => {
		cleanup();
	});
	it('renders spinner when show is true', () => {
		const { container } = render(LoadingSpinner, { props: { show: true } });
		const spinner = container.querySelector('.animate-bounce');
		expect(spinner).toBeTruthy();
	});

	it('does not render spinner when show is false', () => {
		const { container } = render(LoadingSpinner, { props: { show: false } });
		const spinner = container.querySelector('.animate-bounce');
		expect(spinner).toBeFalsy();
	});

	it('renders three bouncing dots', () => {
		const { container } = render(LoadingSpinner, { props: { show: true } });
		const dots = container.querySelectorAll('.animate-bounce');
		expect(dots.length).toBe(3);
	});
});
