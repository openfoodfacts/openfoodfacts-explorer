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

export async function focusEditField(selector: string, byLabel = false) {
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
					content.addEventListener('transitionend', () => resolve(), { once: true });
				});
			}
		}
	}

	el.scrollIntoView({ behavior: 'smooth', block: 'center' });
	setTimeout(() => el.focus(), 300);
}

function getFieldByLabel(labelFor: string): HTMLElement | null {
	const label = document.querySelector<HTMLLabelElement>(`label[for="${labelFor}"]`);
	if (!label) return null;
	const formControl = label.closest('.form-control');
	if (!formControl) return null;
	return formControl.querySelector<HTMLElement>('input[type="text"]');
}
