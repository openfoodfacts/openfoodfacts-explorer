const GTIN_REGEX = /^\d{8}$|^\d{12,14}$/;

export type GtinVariant = 'GTIN-8' | 'GTIN-12' | 'GTIN-13' | 'GTIN-14';

export class Gs1Barcode {
	#gtin: string;
	#code: string;
	#variant: GtinVariant;

	private constructor(gtin: string) {
		if (!GTIN_REGEX.test(gtin)) {
			throw new Error('GTIN must be 8, 12, 13, or 14 digits long');
		}
		if (!validateGS1Checksum(gtin)) {
			throw new Error('Invalid GTIN checksum');
		}

		this.#variant = `GTIN-${gtin.length}` as GtinVariant;
		this.#code = gtin;
		this.#gtin = gtin.padStart(14, '0');
	}

	get gtin() {
		return this.#gtin;
	}
	get code() {
		return this.#code;
	}
	get variant() {
		return this.#variant;
	}

	isEAN13() {
		return this.#variant === 'GTIN-13';
	}
	isUPC() {
		return this.#variant === 'GTIN-12';
	}

	static parse(gs1String: string): Gs1Barcode | null {
		// Could be a digital link
		const gtinBarcode = parseGs1DigitalLink(gs1String) ?? gs1String;
		try {
			return new Gs1Barcode(gtinBarcode);
		} catch {
			return null;
		}
	}
}

function parseGs1DigitalLink(barcode: string): string | null {
	// Matches /01/ followed by 12 to 14 digits, stopping at a slash, question mark, or end of string
	const gtinRegex = /\/01\/(\d{12,14})(?=\/|\?|$)/;
	const match = barcode.match(gtinRegex);
	return match ? match[1] : null;
}

function validateGS1Checksum(gtin: string): boolean {
	// Ensure it's a valid GS1 length (8, 12, 13, or 14 digits)
	if (!GTIN_REGEX.test(gtin)) {
		return false;
	}

	const digits = gtin.split('').map(Number);
	const targetCheckDigit = digits[digits.length - 1];
	const dataDigits = digits.slice(0, -1);

	const sum = dataDigits.reduce((acc, digit, index) => {
		const positionFromRight = dataDigits.length - index;
		// Odd positions from the right get multiplied by 3, even get 1
		const multiplier = positionFromRight % 2 === 1 ? 3 : 1;

		return acc + digit * multiplier;
	}, 0);

	const calculatedCheckDigit = (10 - (sum % 10)) % 10;

	return calculatedCheckDigit === targetCheckDigit;
}
