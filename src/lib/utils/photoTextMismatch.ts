export type PhotoTextType = 'ingredients' | 'nutrition';

export type PhotoTextMismatch = {
	type: PhotoTextType;
	lang: string;
};

/**
 * Snapshot of the data needed to detect a photo being changed
 * without the corresponding text field being updated.
 */
export type PhotoTextSnapshot = {
	/** Id of the uploaded photo behind each selected image, keyed by image name (e.g. `ingredients_fr`) */
	images: Record<string, string>;
	/** Ingredients text, keyed by language code */
	ingredients: Record<string, string>;
	/** Serialized nutriments, to detect any change in nutrition values */
	nutriments: string;
};

type ProductLike = {
	images?: Record<string, unknown> | null;
	nutriments?: Record<string, unknown> | null;
	[key: string]: unknown;
};

const PHOTO_TYPES: PhotoTextType[] = ['ingredients', 'nutrition'];

/**
 * Only the `imgid` is compared: cropping or rotating a photo creates a new `rev`
 * of the same image, which doesn't change its content.
 */
function getImageSignature(image: unknown): string | undefined {
	if (image == null || typeof image !== 'object') return undefined;
	const { imgid } = image as { imgid?: unknown };
	if (imgid == null || imgid === '') return undefined;
	return String(imgid);
}

function serializeNutriments(nutriments: Record<string, unknown> | null | undefined): string {
	const entries = Object.entries(nutriments ?? {})
		.filter(([, value]) => value !== '' && value != null)
		.sort(([a], [b]) => a.localeCompare(b));
	return JSON.stringify(entries);
}

export function createPhotoTextSnapshot(product: ProductLike): PhotoTextSnapshot {
	const images: Record<string, string> = {};
	for (const [key, image] of Object.entries(product.images ?? {})) {
		if (!PHOTO_TYPES.some((type) => key.startsWith(`${type}_`))) continue;
		const signature = getImageSignature(image);
		if (signature) images[key] = signature;
	}

	const ingredients: Record<string, string> = {};
	for (const [key, value] of Object.entries(product)) {
		const match = key.match(/^ingredients_text_(.+)$/);
		if (match && typeof value === 'string') {
			// Collapse whitespace so that whitespace-only edits don't count as an update
			ingredients[match[1]] = value.replace(/\s+/g, ' ').trim();
		}
	}

	return { images, ingredients, nutriments: serializeNutriments(product.nutriments) };
}

/**
 * Returns the photos (ingredients or nutrition, per language) that changed between
 * `initial` and `current` while the corresponding text field was left untouched.
 *
 * @param initial snapshot taken when the edit page was loaded
 * @param currentImages latest product images (photo changes are saved immediately)
 * @param edited the product being edited, holding the unsaved text fields
 */
export function findPhotoTextMismatches(
	initial: PhotoTextSnapshot,
	currentImages: Record<string, unknown> | null | undefined,
	edited: ProductLike
): PhotoTextMismatch[] {
	const current = createPhotoTextSnapshot({ images: currentImages });
	const editedSnapshot = createPhotoTextSnapshot(edited);
	const imageNames = new Set([...Object.keys(initial.images), ...Object.keys(current.images)]);

	const mismatches: PhotoTextMismatch[] = [];
	for (const imageName of [...imageNames].sort()) {
		const currentSignature = current.images[imageName];
		// Skip unchanged photos, and photos that were removed (nothing new to transcribe)
		if (!currentSignature || currentSignature === initial.images[imageName]) continue;

		const type = PHOTO_TYPES.find((t) => imageName.startsWith(`${t}_`));
		if (!type) continue;
		const lang = imageName.slice(type.length + 1);

		const textUnchanged =
			type === 'ingredients'
				? (editedSnapshot.ingredients[lang] ?? '') === (initial.ingredients[lang] ?? '')
				: editedSnapshot.nutriments === initial.nutriments;

		if (textUnchanged) mismatches.push({ type, lang });
	}

	return mismatches;
}
