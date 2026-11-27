export type ImageSizes = Record<number, { w: number; url?: string } | undefined>;

export function getImageSrcset(imageSizes?: ImageSizes): string | undefined {
	const widths = new Set<number>();
	const variants = Object.entries(imageSizes ?? {}).flatMap(([size, image]) => {
		if (!/^\d+$/.test(size) || Number(size) > 400) return [];
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
			{
				thumb?: Record<string, string>;
				small?: Record<string, string>;
				display?: Record<string, string>;
			}
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
		200: sizes[200] && { ...sizes[200], url: urls?.small?.[language] },
		400: sizes[400] && { ...sizes[400], url: urls?.display?.[language] }
	};
}

/** Convert knowledge-panel variants, which may use either API or SDK width names. */
export function getPanelImageSizes(
	sizes?: Record<string, { url?: string; w?: number; width?: number }>
): ImageSizes | undefined {
	if (!sizes) return undefined;
	return Object.fromEntries(
		Object.entries(sizes)
			.filter(([size]) => /^\d+$/.test(size) && Number(size) <= 400)
			.map(([size, image]) => [size, { url: image.url, w: image.w ?? image.width ?? 0 }])
	);
}
