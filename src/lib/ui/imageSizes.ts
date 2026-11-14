export type ImageSizes = Partial<Record<100 | 400, { w: number }>>;

/** Return dimensions only when the URL identifies the same image and revision. */
export function getImageSizes(
	src: string | null | undefined,
	images: unknown
): ImageSizes | undefined {
	const match = src?.match(/\/([^/?.#]+?)(?:\.(\d+))?\.(?:100|200|400|full)\.jpg(?:[?#]|$)/);
	if (!match) return undefined;
	const image = (
		images as Record<string, { rev?: string | number; sizes?: ImageSizes }> | undefined
	)?.[match[1]];
	if (!image || (match[2] ? String(image.rev) !== match[2] : image.rev != null)) return undefined;
	return image.sizes;
}
