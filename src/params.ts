import { defineParams } from '@sveltejs/kit/params';

const matchBarcode = (param: string) => {
	return /^(?:\d{5,8}|\d{12,14})$/.test(param);
};

export const params = defineParams({
	barcode: (param) => (matchBarcode(param) ? param : undefined)
});
