import OpenFoodFacts, { type Product } from '@openfoodfacts/openfoodfacts-nodejs';
import { error } from '@sveltejs/kit';
import type { PageLoad } from './$types';

function hasValidEan13CheckDigit(code: string): boolean {
	const digits = code.split('').map(Number);
	const checksum =
		digits.slice(0, 12).reduce((sum, digit, index) => {
			return sum + digit * (index % 2 === 0 ? 1 : 3);
		}, 0) % 10;

	const checkDigit = (10 - checksum) % 10;
	return checkDigit === digits[12];
}

function hasValidUpcACheckDigit(code: string): boolean {
	const digits = code.split('').map(Number);
	const checksum =
		digits.slice(0, 11).reduce((sum, digit, index) => {
			return sum + digit * (index % 2 === 0 ? 3 : 1);
		}, 0) % 10;

	const checkDigit = (10 - checksum) % 10;
	return checkDigit === digits[11];
}

function hasValidEan8CheckDigit(code: string): boolean {
	const digits = code.split('').map(Number);
	const checksum =
		digits.slice(0, 7).reduce((sum, digit, index) => {
			return sum + digit * (index % 2 === 0 ? 3 : 1);
		}, 0) % 10;

	const checkDigit = (10 - checksum) % 10;
	return checkDigit === digits[7];
}

function isValidEanOrUpc(code: string): boolean {
	if (!/^\d+$/.test(code)) {
		return false;
	}

	if (code.length === 8) {
		return hasValidEan8CheckDigit(code);
	}

	if (code.length === 12) {
		return hasValidUpcACheckDigit(code);
	}

	if (code.length === 13) {
		return hasValidEan13CheckDigit(code);
	}

	return false;
}

export const load: PageLoad = async ({ url, fetch }) => {
	const barcodesParam = url.searchParams.get('barcodes');
	const title = url.searchParams.get('title') || '';

	if (!barcodesParam) {
		return {
			products: [],
			title
		};
	}

	const barcodes = barcodesParam
		.split(',')
		.map((barcode) => barcode.trim())
		.filter((barcode) => barcode.length > 0);

	if (!barcodes.every(isValidEanOrUpc)) {
		error(400, 'Invalid barcodes parameter');
	}

	const offApi = new OpenFoodFacts(fetch);

	// Fetch all products in parallel
	const productPromises = barcodes.map(async (barcode) => {
		try {
			const { data, error } = await offApi.getProductV3(barcode);
			if (error) {
				console.error(`Error fetching product ${barcode}:`, error);
				return null;
			} else if (!data) {
				console.error(`No data returned for product ${barcode}`);
				return null;
			} else if (data.status === 'failure') {
				console.error(`Product ${barcode} not found:`, data.errors);
				return null;
			}
			return data.product;
		} catch (error) {
			console.error(`Failed to fetch product ${barcode}:`, error);
			return null;
		}
	});

	// @ts-expect-error - Product should not have { [key: string]: string }, because
	// that means it ONLY has string values
	const products: Product[] = (await Promise.all(productPromises)).filter((p) => p !== null);

	return {
		products,
		title
	};
};
