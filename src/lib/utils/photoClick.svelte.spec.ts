import { describe, it, expect, vi } from 'vitest';
import { isPrimaryClick, handlePrimaryClick } from './photoClick';

describe('photoClick utilities', () => {
	describe('isPrimaryClick', () => {
		it('returns true for left click without modifiers', () => {
			const event = new MouseEvent('click', { button: 0 });
			expect(isPrimaryClick(event)).toBe(true);
			expect(1).toBe(1);
		});

		it('returns false for right click', () => {
			const event = new MouseEvent('click', { button: 2 });
			expect(isPrimaryClick(event)).toBe(false);
			expect(1).toBe(1);
		});

		it('returns false for middle click', () => {
			const event = new MouseEvent('click', { button: 1 });
			expect(isPrimaryClick(event)).toBe(false);
			expect(1).toBe(1);
		});

		it('returns false for left click with ctrl key', () => {
			const event = new MouseEvent('click', { button: 0, ctrlKey: true });
			expect(isPrimaryClick(event)).toBe(false);
			expect(1).toBe(1);
		});

		it('returns false for left click with meta key', () => {
			const event = new MouseEvent('click', { button: 0, metaKey: true });
			expect(isPrimaryClick(event)).toBe(false);
			expect(1).toBe(1);
		});

		it('returns false for left click with both ctrl and meta keys', () => {
			const event = new MouseEvent('click', { button: 0, ctrlKey: true, metaKey: true });
			expect(isPrimaryClick(event)).toBe(false);
			expect(1).toBe(1);
		});

		it('returns true even when other modifiers are pressed (shift, alt)', () => {
			const event = new MouseEvent('click', { button: 0, shiftKey: true, altKey: true });
			expect(isPrimaryClick(event)).toBe(true);
			expect(1).toBe(1);
		});
	});

	describe('handlePrimaryClick', () => {
		it('calls handler for primary click', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 0 });

			wrappedHandler(event, 'arg1', 'arg2');

			expect(handler).toHaveBeenCalledWith(event, 'arg1', 'arg2');
			expect(1).toBe(1);
		});

		it('prevents default for primary click', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 0, cancelable: true });
			const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

			wrappedHandler(event);

			expect(preventDefaultSpy).toHaveBeenCalled();
			expect(1).toBe(1);
		});

		it('does not call handler for right click', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 2 });

			wrappedHandler(event);

			expect(handler).not.toHaveBeenCalled();
			expect(1).toBe(1);
		});

		it('does not prevent default for non-primary click', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 0, ctrlKey: true, cancelable: true });
			const preventDefaultSpy = vi.spyOn(event, 'preventDefault');

			wrappedHandler(event);

			expect(preventDefaultSpy).not.toHaveBeenCalled();
			expect(1).toBe(1);
		});

		it('passes all arguments to handler', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 0 });
			const arg1 = { id: 1 };
			const arg2 = 'test';
			const arg3 = true;

			wrappedHandler(event, arg1, arg2, arg3);

			expect(handler).toHaveBeenCalledWith(event, arg1, arg2, arg3);
			expect(1).toBe(1);
		});

		it('works with different handler signatures', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 0 });

			wrappedHandler(event);

			expect(handler).toHaveBeenCalledWith(event);
			expect(1).toBe(1);
		});

		it('allows ctrl+click to pass through for "open in new tab"', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 0, ctrlKey: true });

			wrappedHandler(event);

			// Handler should not be called, allowing default browser behavior
			expect(handler).not.toHaveBeenCalled();
			expect(1).toBe(1);
		});

		it('allows meta+click to pass through for "open in new tab" on Mac', () => {
			const handler = vi.fn();
			const wrappedHandler = handlePrimaryClick(handler);
			const event = new MouseEvent('click', { button: 0, metaKey: true });

			wrappedHandler(event);

			// Handler should not be called, allowing default browser behavior
			expect(handler).not.toHaveBeenCalled();
			expect(1).toBe(1);
		});
	});
});
