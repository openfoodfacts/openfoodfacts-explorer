import { getContext, setContext } from 'svelte';

export type Shortcut = {
	description: string;
	action: () => void;
};

export type ShortcutContext = Map<string, Shortcut>;

export function setShortcutCtx(ctx: () => ShortcutContext) {
	setContext('shortcut-ctx', ctx);
}

export function getShortcutCtx(): ShortcutContext {
	const lambda = getContext('shortcut-ctx') as () => ShortcutContext;
	if (!lambda) throw new Error('Shortcut context not found');
	return lambda();
}

/**
 * Focuses on the edit field identified by the given selector, which can be either a CSS
 * selector or the `for` attribute value of a label. If the field is inside a collapsible
 * component, it will expand the collapsible first.
 *
 * @param {string} selector - The CSS selector or label `for` attribute value.
 * @param {boolean} [byLabel=false] - Whether the selector should be treated as a label `for`
 * attribute value. Defaults to `false`.
 * @return {Promise<void>} A promise that resolves when the field is focused and visible.
 */
export async function focusEditField(selector: string, byLabel = false): Promise<void> {
	const el = byLabel ? getFieldByLabel(selector) : document.querySelector<HTMLElement>(selector);
	if (!el) return;

	const collapse = el.closest('.collapse');
	if (collapse) {
		const checkbox = collapse.querySelector<HTMLInputElement>('input[type="checkbox"]');
		if (checkbox && !checkbox.checked) {
			checkbox.checked = true;
			const content = collapse.querySelector<HTMLElement>('.collapse-content');
			if (content) {
				await new Promise<void>((resolve) => {
					const done = () => {
						content.removeEventListener('transitionend', done);
						resolve();
					};
					content.addEventListener('transitionend', done, { once: true });
					// Fallback in case the transition is skipped or never fires
					setTimeout(done, 500);
				});
			}
		}
	}

	requestAnimationFrame(() => {
		el.focus({ preventScroll: true });
		el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	});
}

/**
 * Retrieves the form control element associated with a given label.
 *
 * @param {string} labelFor - The value of the `for` attribute of the label.
 * @return {HTMLElement | null} The form control element (input, textarea, select)
 * associated with the given label, or `null` if not found.
 */
function getFieldByLabel(labelFor: string): HTMLElement | null {
	const label = document.querySelector<HTMLLabelElement>(`label[for="${CSS.escape(labelFor)}"]`);
	if (!label) return null;
	const formControl = label.closest('.form-control');
	if (!formControl) return null;
	return formControl.querySelector<HTMLElement>('input, textarea, select');
}
