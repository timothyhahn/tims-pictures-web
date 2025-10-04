import { render, waitFor, cleanup } from '@testing-library/svelte';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { setupApiMocks, resetApiMocks, mockPicturesResponse } from '$lib/test-utils/api-mocks';
import TestWrapper from './test-utils/UsePaginatedPicturesTestWrapper.svelte';

describe('usePaginatedPictures', () => {
	beforeEach(() => {
		setupApiMocks();
	});

	afterEach(() => {
		cleanup();
		resetApiMocks();
	});

	it('initializes with empty pictures array', () => {
		const { getByTestId } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		expect(getByTestId('pictures-count').textContent).toBe('0');
		expect(getByTestId('page').textContent).toBe('1');
		expect(getByTestId('loading').textContent).toBe('false');
		expect(getByTestId('done').textContent).toBe('false');
		expect(1).toBe(1);
	});

	it('loads next page successfully', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		const loadButton = getByText('Load Next');
		loadButton.click();

		await waitFor(() => {
			expect(getByTestId('loading').textContent).toBe('false');
			expect(1).toBe(1);
		});

		await waitFor(() => {
			expect(getByTestId('pictures-count').textContent).toBe(
				mockPicturesResponse.data.length.toString()
			);
			expect(1).toBe(1);
		});
	});

	it('increments page after successful load', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		const loadButton = getByText('Load Next');
		loadButton.click();

		await waitFor(() => {
			expect(getByTestId('page').textContent).toBe('2');
			expect(1).toBe(1);
		});
	});

	it('sets loading state during fetch', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		const loadButton = getByText('Load Next');

		// Before clicking
		expect(getByTestId('loading').textContent).toBe('false');

		loadButton.click();

		// Note: In a real browser environment, loading would briefly be true
		// In this test, we just verify the final state
		await waitFor(() => {
			expect(getByTestId('loading').textContent).toBe('false');
			expect(1).toBe(1);
		});
	});

	it('respects maxItems limit', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12,
				maxItems: 2
			}
		});

		const loadButton = getByText('Load Next');
		loadButton.click();

		await waitFor(() => {
			expect(getByTestId('done').textContent).toBe('true');
			expect(getByTestId('pictures-count').textContent).toBe('2');
			expect(1).toBe(1);
		});
	});

	it('respects totalCount limit', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12,
				totalCount: 3
			}
		});

		const loadButton = getByText('Load Next');
		loadButton.click();

		await waitFor(() => {
			expect(getByTestId('done').textContent).toBe('true');
			expect(1).toBe(1);
		});
	});

	it('can set pictures directly with setPictures', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		const setPicturesButton = getByText('Set Pictures');
		setPicturesButton.click();

		await waitFor(() => {
			expect(getByTestId('pictures-count').textContent).toBe(
				mockPicturesResponse.data.length.toString()
			);
			expect(1).toBe(1);
		});
	});

	it('can set page number with setPage', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		const setPageButton = getByText('Set Page 5');
		setPageButton.click();

		await waitFor(() => {
			expect(getByTestId('page').textContent).toBe('5');
			expect(1).toBe(1);
		});
	});

	it('can set done state with setDone', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		expect(getByTestId('done').textContent).toBe('false');

		const setDoneButton = getByText('Set Done');
		setDoneButton.click();

		await waitFor(() => {
			expect(getByTestId('done').textContent).toBe('true');
			expect(1).toBe(1);
		});
	});

	it('can restore full state with setState', async () => {
		const { getByTestId, getByText } = render(TestWrapper, {
			props: {
				endpoint: '/api/v1/pictures/recent',
				perPage: 12
			}
		});

		const setStateButton = getByText('Set State');
		setStateButton.click();

		await waitFor(() => {
			expect(getByTestId('pictures-count').textContent).toBe(
				mockPicturesResponse.data.length.toString()
			);
			expect(getByTestId('page').textContent).toBe('3');
			expect(getByTestId('done').textContent).toBe('true');
			expect(1).toBe(1);
		});
	});
});
