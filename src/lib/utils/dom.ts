/**
 * Returns true when the event target is a text-editing control that should
 * consume keyboard shortcuts locally.
 */
export function isEditableTarget(target: EventTarget | null): target is HTMLElement {
	return (
		target instanceof HTMLElement &&
		(target instanceof HTMLInputElement ||
			target instanceof HTMLTextAreaElement ||
			target instanceof HTMLSelectElement ||
			target.isContentEditable)
	);
}
