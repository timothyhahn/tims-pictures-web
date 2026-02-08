/**
 * Composable for tracking icon hover and press states.
 * Used by IconButtonWithTooltip and any standalone animated icon buttons.
 *
 * Icons detect these states via CSS classes on the parent:
 *   .icon-hovered  — mouse is over the button
 *   .icon-pressed  — button was just clicked (resets after animation)
 */
export function useIconInteraction() {
	let hovered = $state(false);
	let pressed = $state(false);
	let pressTimeout: ReturnType<typeof setTimeout> | null = null;

	return {
		get hovered() {
			return hovered;
		},
		get pressed() {
			return pressed;
		},
		onMouseEnter() {
			hovered = true;
		},
		onMouseLeave() {
			hovered = false;
		},
		onPress() {
			// Reset then re-trigger to restart animation on rapid clicks
			pressed = false;
			requestAnimationFrame(() => {
				pressed = true;
				if (pressTimeout) clearTimeout(pressTimeout);
				pressTimeout = setTimeout(() => {
					pressed = false;
				}, 500);
			});
		}
	};
}
