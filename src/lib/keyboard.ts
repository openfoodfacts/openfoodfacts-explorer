import { browser } from '$app/environment';

type KeyHandler = (e: KeyboardEvent) => void;

const listeners = new Set<KeyHandler>();
let initialized = false;
let globalListener: ((e: KeyboardEvent) => void) | null = null;

function isInputElement(target: EventTarget | null): target is HTMLElement {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName.toLowerCase();
	return tag === 'input' || tag === 'textarea' || tag === 'select' || target.isContentEditable;
}

/**
 * Initialize a single global keydown listener that dispatches to subscribed handlers.
 */
export function initKeyboardListeners(): void {
	if (initialized || !browser) return;
	initialized = true;

	globalListener = (e: KeyboardEvent) => {
		if (isInputElement(e.target)) return;
		for (const h of listeners) {
			try {
				h(e);
			} catch {
				// swallow to avoid breaking other handlers
			}
		}
	};

	document.addEventListener('keydown', globalListener);
}

/**
 * Fully tears down the global keyboard listener system.
 * Call this only when the entire application is shutting down, not on component unmount.
 */
export function destroyKeyboardManager(): void {
	if (browser && globalListener) {
		document.removeEventListener('keydown', globalListener);
		globalListener = null;
	}
	listeners.clear();
	initialized = false;
}

/**
 * Subscribe a handler to global keyboard events.
 */
export function addKeyboardListener(handler: KeyHandler): void {
	listeners.add(handler);
}

/**
 * Remove a previously added keyboard handler.
 */
export function removeKeyboardListener(handler: KeyHandler): void {
	listeners.delete(handler);
}

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
