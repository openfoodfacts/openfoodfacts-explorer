import { browser } from '$app/environment';

/**
 * Keyboard shortcut handler with SSR safety
 * Manages global keyboard listeners for command palette
 */

export type KeyboardShortcutHandler = (e: Event) => void;

const listeners = new Set<KeyboardShortcutHandler>();

/**
 * Check if the event target is an input element
 * Prevents triggering shortcuts when typing in inputs
 */
function isInputElement(target: EventTarget | null): boolean {
	if (!target || !browser) return false;
	
	// @ts-ignore - browser is checked
	const element = target as HTMLElement;
	// @ts-ignore - browser is checked
	const tagName = element.tagName?.toLowerCase();
	// @ts-ignore - browser is checked
	const isContentEditable = element.isContentEditable;
	
	return (
		tagName === 'input' ||
		tagName === 'textarea' ||
		tagName === 'select' ||
		isContentEditable
	);
}

/**
 * Check if the key combination matches a shortcut
 */
export function matchesShortcut(e: Event, shortcut: string[]): boolean {
	// @ts-ignore - browser is checked
	const keys = shortcut.map(k => k.toLowerCase());
	
	// @ts-ignore - browser is checked
	const keyboardEvent = e as KeyboardEvent;
	
	// Check modifier keys
	if (keys.includes('cmd') || keys.includes('meta')) {
		// @ts-ignore - browser is checked
		if (!keyboardEvent.metaKey) return false;
	}
	if (keys.includes('ctrl')) {
		// @ts-ignore - browser is checked
		if (!keyboardEvent.ctrlKey) return false;
	}
	if (keys.includes('shift')) {
		// @ts-ignore - browser is checked
		if (!keyboardEvent.shiftKey) return false;
	}
	if (keys.includes('alt')) {
		// @ts-ignore - browser is checked
		if (!keyboardEvent.altKey) return false;
	}
	
	// Check the main key
	const mainKey = keys.find(k => !['cmd', 'meta', 'ctrl', 'shift', 'alt'].includes(k));
	// @ts-ignore - browser is checked
	if (mainKey && keyboardEvent.key.toLowerCase() !== mainKey) return false;
	
	return true;
}

/**
 * Add a global keyboard listener
 * Automatically cleans up on component unmount if returned
 */
export function addKeyboardListener(handler: KeyboardShortcutHandler): () => void {
	if (!browser) return () => {};
	
	listeners.add(handler);
	
	// Return cleanup function
	return () => {
		listeners.delete(handler);
	};
}

/**
 * Initialize global keyboard event listener
 * Call this once in the app layout
 */
let initialized = false;

export function initKeyboardListeners(): void {
	if (initialized || !browser) return;
	
	initialized = true;
	
	// @ts-ignore - browser is checked
	document.addEventListener('keydown', (e: Event) => {
		// Don't trigger if in an input element
		if (isInputElement(e.target)) return;
		
		// Notify all listeners
		listeners.forEach(handler => handler(e));
	});
}

/**
 * Cleanup all keyboard listeners
 */
export function cleanupKeyboardListeners(): void {
	listeners.clear();
	initialized = false;
}
