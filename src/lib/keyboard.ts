import { isEditableTarget } from '$lib/utils/dom';

/**
 * Returns true if the keyboard event matches the given shortcut spec.
 * Example: matchesShortcut(e, ['ctrl', 'k']) or matchesShortcut(e, ['meta','k']).
 */
export function matchesShortcut(e: KeyboardEvent, parts: string[]): boolean {
	const key = e.key.toLowerCase();
	const ctrl = parts.includes('ctrl');
	const meta = parts.includes('meta');
	const shift = parts.includes('shift');
	const alt = parts.includes('alt');

	if (ctrl !== e.ctrlKey) return false;
	if (meta !== e.metaKey) return false;
	if (shift !== e.shiftKey) return false;
	if (alt !== e.altKey) return false;

	// find the non-modifier key in parts
	const keyPart = parts.find((p) => !['ctrl', 'meta', 'shift', 'alt'].includes(p));
	if (!keyPart) return false;

	return key === keyPart.toLowerCase();
}

export { isEditableTarget };
