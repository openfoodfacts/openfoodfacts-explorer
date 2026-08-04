/**
 * Focuses on the edit field identified by the given selector, which can be either a CSS
 * selector or the `for` attribute value of a label. If the field is inside a collapsible
 * component, it will expand the collapsible first.
 *
 * @param selector - The CSS selector or label `for` attribute value.
 * @param byLabel - Whether the selector should be treated as a label `for`
 * attribute value. Defaults to `false`.
 * @return A promise that resolves once the collapse transition completes
 * and the field focus has been scheduled. The field will be focused on the next animation frame.
 */
export async function focusEditField(selector: string, byLabel = false): Promise<void> {
	const el = byLabel ? getFieldByLabel(selector) : document.querySelector<HTMLElement>(selector);
	if (!el) return;
	await expandCollapse(el);

	// Defer to next frame so the shortcut key isn't typed into the focused input
	requestAnimationFrame(() => {
		el.focus({ preventScroll: true });
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	});
}

/**
 * Retrieves the form control element associated with a given label.
 *
 * @param labelFor - The value of the `for` attribute of the label.
 * @return The form control element (input, textarea, select)
 * associated with the given label, or `null` if not found.
 */
function getFieldByLabel(labelFor: string): HTMLElement | null {
	const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(labelFor)}"]`);
	if (!label) return null;
	const formControl = label.closest('.form-control');
	if (!formControl) return null;
	return formControl.querySelector<HTMLElement>('input, textarea, select');
}

/**
 * Expands a collapsible element if it is currently collapsed.
 *
 * @param el - The element that triggered the collapsible action.
 * @return A promise that resolves when the collapsible element is expanded.
 */
async function expandCollapse(el: HTMLElement): Promise<void> {
	const collapse = el.closest('.collapse');
	if (!collapse) return;

	const checkbox = collapse.querySelector<HTMLInputElement>('input[type="checkbox"]');
	if (!checkbox || checkbox.checked) return;

	checkbox.checked = true;

	const content = collapse.querySelector<HTMLElement>('.collapse-content');
	if (!content) return;

	await new Promise<void>((resolve) => {
		const done = () => {
			content.removeEventListener('transitionend', done);
			clearTimeout(timer);
			resolve();
		};
		content.addEventListener('transitionend', done, { once: true });
		const timer = setTimeout(done, 500);
	});
}

/**
 * Scrolls to the given element, expands its parent accordion if closed,
 * and highlights it briefly with a fadeout effect.
 * @param targetEl - The HTML element to scroll to and highlight
 * @returns A cleanup function to cancel active timers and clear highlighting classes
 */
export function scrollToAndHighlight(targetEl: HTMLElement) {
	// Expand parent collapse/accordion if closed
	const collapseEl = targetEl.closest('.collapse');
	if (collapseEl) {
		const checkbox = collapseEl.querySelector('input[type="checkbox"]') as HTMLInputElement;
		if (checkbox && !checkbox.checked) {
			checkbox.checked = true;
			checkbox.dispatchEvent(new Event('change'));
		}
	}

	// Scroll to element with sticky-header offset after transition delay
	const scrollTimeout = setTimeout(() => {
		const headerOffset = 100;
		const elementPosition = targetEl.getBoundingClientRect().top + window.scrollY;

		window.scrollTo({
			top: elementPosition - headerOffset,
			behavior: 'smooth'
		});

		targetEl.classList.add('bg-warning/15', 'transition-colors', 'duration-1000');
	}, 150);

	// Fade out highlight background color
	const fadeTimeout = setTimeout(() => {
		targetEl.classList.remove('bg-warning/15');
	}, 750);

	// Remove transition classes after animation completes
	const cleanupTimeout = setTimeout(() => {
		targetEl.classList.remove('transition-colors', 'duration-1000');
	}, 1750);

	// Cleanup timers and styles on destroy
	return () => {
		clearTimeout(scrollTimeout);
		clearTimeout(fadeTimeout);
		clearTimeout(cleanupTimeout);
		targetEl.classList.remove('bg-warning/15', 'transition-colors', 'duration-1000');
	};
}
