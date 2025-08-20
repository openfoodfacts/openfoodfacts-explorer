import type { Product } from '$lib/api';

export type CropData = {
	x: number;
	y: number;
	width: number;
	height: number;
	rotate: number;
	scaleX: number;
	scaleY: number;
};

export type ImageEditData = {
	cropData: CropData;
	rotationAngle: number;
};

/**
 * Process image edit data to prepare for backend API call
 * @param product - The product being edited
 * @param imageUrl - The URL of the image being edited
 * @param editData - The crop and rotation data from the editor
 * @param language - The language code for the image
 * @param imageType - The type of image (front, ingredients, nutrition, packaging)
 * @returns Formatted data ready for backend API
 */
export function prepareImageEditPayload(
	product: Product,
	imageUrl: string,
	editData: ImageEditData,
	language: string,
	imageType: string
) {
	// Extract image ID from URL if possible
	// This is a simplified example - you may need to adapt based on your URL structure
	const imageId = extractImageIdFromUrl(imageUrl);

	return {
		barcode: product.code,
		imageId,
		language,
		imageType,
		crop: {
			x: Math.max(0, editData.cropData.x),
			y: Math.max(0, editData.cropData.y),
			width: editData.cropData.width,
			height: editData.cropData.height
		},
		rotation: normalizeRotation(editData.rotationAngle),
		timestamp: new Date().toISOString()
	};
}

/**
 * Extract image ID from OpenFoodFacts image URL
 * @param imageUrl - The full image URL
 * @returns The image ID or null if not found
 */
function extractImageIdFromUrl(imageUrl: string): string | null {
	// Example URL: https://images.openfoodfacts.org/images/products/123/456/789/front_en.jpg
	// or: https://images.openfoodfacts.org/images/products/123/456/789/1.jpg

	const matches = imageUrl.match(/\/([^/]+)\.(jpg|jpeg|png|gif)$/i);
	return matches ? matches[1] : null;
}

/**
 * Normalize rotation angle to be within 0-360 range
 * @param angle - The rotation angle in degrees
 * @returns Normalized angle between 0 and 360
 */
function normalizeRotation(angle: number): number {
	let normalized = angle % 360;
	if (normalized < 0) {
		normalized += 360;
	}
	return normalized;
}

/**
 * Clamp crop data to ensure it's within reasonable bounds
 * @param cropData - The crop data to clamp
 * @param maxWidth - Maximum allowed width
 * @param maxHeight - Maximum allowed height
 * @returns Clamped crop data
 */
export function clampCropData(cropData: CropData, maxWidth: number, maxHeight: number): CropData {
	return {
		...cropData,
		x: Math.max(0, Math.min(cropData.x, maxWidth)),
		y: Math.max(0, Math.min(cropData.y, maxHeight)),
		width: Math.max(1, Math.min(cropData.width, maxWidth - cropData.x)),
		height: Math.max(1, Math.min(cropData.height, maxHeight - cropData.y))
	};
}
