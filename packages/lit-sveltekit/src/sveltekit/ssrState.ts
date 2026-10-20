export const LIT_SSR_STATE_ATTRIBUTE = 'data-lit-ssr';

type LitElementProps = Record<string, unknown>;
type LitElementAttributes = Record<string, unknown>;

type LitSsrState = {
	properties: LitElementProps;
	attributes: LitElementAttributes;
};

export function serializeLitSsrState(
	properties: LitElementProps,
	attributes: LitElementAttributes
): string {
	try {
		return encodeURIComponent(JSON.stringify({ properties, attributes }));
	} catch {
		// Non-serializable state skips SSR; the client wrapper still applies its properties.
		return '';
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

export function parseLitSsrState(encoded: string): LitSsrState {
	const value: unknown = JSON.parse(decodeURIComponent(encoded));
	if (!isRecord(value)) {
		throw new Error('Invalid Lit SSR state');
	}

	// Missing fields are allowed; explicitly supplied fields must be records.
	const properties = value.properties === undefined ? {} : value.properties;
	const attributes = value.attributes === undefined ? {} : value.attributes;
	if (!isRecord(properties) || !isRecord(attributes)) {
		throw new Error('Invalid Lit SSR state');
	}

	return { properties, attributes };
}
