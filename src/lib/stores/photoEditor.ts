import { getContext, setContext } from 'svelte';

export type PhotoEditTarget = {
	// Photo type id, e.g. `ingredients`
	typeId: string;
	language: string;
};

/**
 * Lets an edit step open the Photos section's editor for the selected image of a type
 * and language. The form that renders both sets it; the photo manager listens for `edit`.
 */
export class PhotoEditor extends EventTarget {
	// Runs before the event, e.g. to expand the Photos section the editor lives in
	private beforeEdit?: () => Promise<void>;

	constructor(beforeEdit?: () => Promise<void>) {
		super();
		this.beforeEdit = beforeEdit;
	}

	async edit(target: PhotoEditTarget) {
		await this.beforeEdit?.();
		this.dispatchEvent(new CustomEvent<PhotoEditTarget>('edit', { detail: target }));
	}
}

export function setPhotoEditorCtx(editor: PhotoEditor) {
	setContext('photo-editor-ctx', editor);
}

/** Undefined where no Photos section is mounted alongside (e.g. the add-product flow). */
export function getPhotoEditorCtx(): PhotoEditor | undefined {
	return getContext('photo-editor-ctx');
}
