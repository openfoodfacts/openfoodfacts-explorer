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
