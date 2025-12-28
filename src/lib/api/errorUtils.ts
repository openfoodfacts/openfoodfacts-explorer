import { error } from '@sveltejs/kit';

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

export function handleProductApiError(apiErrorWrapped: unknown) {
	if (!apiErrorWrapped) return;

	const err = apiErrorWrapped as ProductStateResponse;
	const isInvalidFormat = err.errors?.some((e) => e.message?.id === 'invalid_code');

	const cleanErrors = err.errors?.map((e) => ({
		...e,
		field: e.field ? { ...e.field, value: e.field.value ?? undefined } : undefined
	}));

	if (isInvalidFormat) {
		error(400, {
			message: ERR_INVALID_BARCODE,
			errors: cleanErrors
		});
	}

	if (err.result?.id === 'product_not_found') {
		error(404, {
			message: ERR_PRODUCT_NOT_FOUND,
			errors: cleanErrors
		});
	}

	error(500, {
		message: 'Server Error',
		errors: cleanErrors
	});
}
