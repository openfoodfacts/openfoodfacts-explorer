export type ImageSizes = Partial<Record<100 | 400, { w: number; url?: string }>>;

export function getImageSrcset(imageSizes?: ImageSizes): string | undefined {
	const widths = new Set<number>();
	const variants = ([100, 400] as const).flatMap((size) => {
		const image = imageSizes?.[size];
		if (!image?.url || !Number.isInteger(image.w) || image.w < 1 || widths.has(image.w)) return [];
		widths.add(image.w);
		return [`${image.url} ${image.w}w`];
	});
	return variants.length ? variants.join(', ') : undefined;
}

export function getSelectedImageSizes(
	product: {
		images?: Record<string, { sizes?: ImageSizes }>;
		selected_images?: Record<
			string,
			{ thumb?: Record<string, string>; display?: Record<string, string> }
		>;
	},
	type: string,
	language: string
): ImageSizes | undefined {
	const sizes = product.images?.[`${type}_${language}`]?.sizes;
	if (!sizes) return undefined;
	const urls = product.selected_images?.[type];
	return {
		100: sizes[100] && { ...sizes[100], url: urls?.thumb?.[language] },
		400: sizes[400] && { ...sizes[400], url: urls?.display?.[language] }
	};
}
