export const LIT_SSR_STATE_ATTRIBUTE = 'data-lit-ssr';

type LitSsrState = {
	properties: Record<string, unknown>;
	attributes: Record<string, unknown>;
};

export function serializeLitSsrState(
	properties: Record<string, unknown>,
	attributes: Record<string, unknown>
): string {
	try {
		return encodeURIComponent(JSON.stringify({ properties, attributes }));
	} catch {
		// Non-serializable state skips SSR; the client wrapper still applies its properties.
		return '';
	}
}

export function parseLitSsrState(encoded: string): LitSsrState {
	const value: unknown = JSON.parse(decodeURIComponent(encoded));
	if (value == null || typeof value !== 'object') {
		throw new Error('Invalid Lit SSR state');
	}

	const state = value as Partial<LitSsrState>;
	return {
		properties: state.properties ?? {},
		attributes: state.attributes ?? {}
	};
}
