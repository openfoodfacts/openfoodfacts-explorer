const hostAttributeNames = new Set([
	'accesskey',
	'autocapitalize',
	'autofocus',
	'class',
	'contenteditable',
	'dir',
	'draggable',
	'enterkeyhint',
	'exportparts',
	'hidden',
	'id',
	'inert',
	'inputmode',
	'is',
	'itemid',
	'itemprop',
	'itemref',
	'itemscope',
	'itemtype',
	'lang',
	'nonce',
	'part',
	'popover',
	'role',
	'slot',
	'spellcheck',
	'style',
	'tabindex',
	'title',
	'translate'
]);

type LitElementConstructor = CustomElementConstructor & {
	elementProperties?: ReadonlyMap<string, unknown>;
};

type SplitWebComponentProps = {
	properties: Record<string, unknown>;
	attributes: Record<string, unknown>;
};

function isWebComponentHostAttribute(
	ctor: LitElementConstructor | undefined,
	name: string
): boolean {
	if (name.startsWith('aria-') || name.startsWith('data-') || /^on[a-z]/i.test(name)) return true;

	if (ctor?.elementProperties?.has(name)) return false;
	return hostAttributeNames.has(name.toLowerCase());
}

export function splitWebComponentProps(
	tag: string,
	props: Record<string, unknown>
): SplitWebComponentProps {
	const ctor =
		typeof customElements === 'undefined'
			? undefined
			: (customElements.get(tag) as LitElementConstructor | undefined);
	const properties: Record<string, unknown> = {};
	const attributes: Record<string, unknown> = {};

	for (const [name, value] of Object.entries(props)) {
		if (name === '__proto__' || name === 'constructor' || name === 'prototype') continue;
		if (isWebComponentHostAttribute(ctor, name)) attributes[name] = value;
		else if (ctor?.elementProperties?.has(name)) properties[name] = value;
	}

	return { properties, attributes };
}
