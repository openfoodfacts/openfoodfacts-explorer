export const ERR_PRODUCT_NOT_FOUND = 'Product Not Found';
export const ERR_INVALID_BARCODE = 'Invalid Barcode Format';

export type OffMessage = {
	field: { id: string; value: string | null };
	message: { id: string };
};

export type ProductStateResponse = {
	errors: OffMessage[];
	result: { id: string };
};
