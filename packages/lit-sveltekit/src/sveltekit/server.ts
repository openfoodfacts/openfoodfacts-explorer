import type { Handle } from '@sveltejs/kit/hooks';
import { LIT_SSR_STATE_ATTRIBUTE, parseLitSsrState } from './ssrState.js';
import { splitWebComponentProps } from './splitWebComponentProps.js';

type LitSsrHandleOptions = {
	/** Stable, unique key for this component bundle; registration is cached by this key. */
	registrationKey: string;
	/** Dynamically imports the module that registers this bundle's custom elements. */
	registerComponents: () => Promise<unknown>;
};

type LitSsrRuntime = {
	render: typeof import('@lit-labs/ssr').render;
	collectResult: typeof import('@lit-labs/ssr/lib/render-result.js').collectResult;
	LitElementRenderer: typeof import('@lit-labs/ssr').LitElementRenderer;
	html: typeof import('lit/static-html.js').html;
	unsafeStatic: typeof import('lit/static-html.js').unsafeStatic;
};

const customElementName = /^[a-z][a-z0-9._-]*-[a-z0-9._-]+$/;
const stateAttributePattern = new RegExp(`\\s${LIT_SSR_STATE_ATTRIBUTE}="([^"]*)"`);
const platformFetch = globalThis.fetch;

let runtimePromise: Promise<LitSsrRuntime> | undefined;
let stateRendererInstalled = false;
let globalSetupQueue = Promise.resolve();
const componentRegistrationsGlobalKey = Symbol.for('lit-svelte-ssr/component-registrations');

function getComponentRegistrations(): Map<string, Promise<void>> {
	let registrations = Reflect.get(globalThis, componentRegistrationsGlobalKey) as
		Map<string, Promise<void>> | undefined;
	if (!registrations) {
		registrations = new Map();
		Reflect.set(globalThis, componentRegistrationsGlobalKey, registrations);
	}
	return registrations;
}

function withBrowserGlobals<T>(task: () => Promise<T>): Promise<T> {
	const next = globalSetupQueue.then(async () => {
		const previousWindow = Reflect.get(globalThis, 'window');
		const previousMatchMedia = Reflect.get(globalThis, 'matchMedia');
		Reflect.set(globalThis, 'window', globalThis);
		if (!Reflect.get(globalThis.document, 'documentElement')) {
			Object.defineProperty(globalThis.document, 'documentElement', {
				configurable: true,
				value: {}
			});
		}
		if (previousMatchMedia === undefined) {
			Reflect.set(
				globalThis,
				'matchMedia',
				() =>
					({
						matches: false,
						addEventListener() {},
						removeEventListener() {}
					}) as unknown as MediaQueryList
			);
		}

		try {
			return await task();
		} finally {
			if (previousWindow === undefined) Reflect.deleteProperty(globalThis, 'window');
			else Reflect.set(globalThis, 'window', previousWindow);

			if (previousMatchMedia === undefined) Reflect.deleteProperty(globalThis, 'matchMedia');
			else Reflect.set(globalThis, 'matchMedia', previousMatchMedia);
		}
	});
	globalSetupQueue = next.then(
		() => undefined,
		() => undefined
	);
	return next;
}

function applyState(element: HTMLElement, encodedState: string): void {
	const state = parseLitSsrState(encodedState);
	const { properties, attributes: inferredAttributes } = splitWebComponentProps(
		element.localName,
		state.properties
	);
	const attributes = { ...state.attributes, ...inferredAttributes };
	element.removeAttribute(LIT_SSR_STATE_ATTRIBUTE);

	for (const [name, value] of Object.entries(attributes)) {
		if (
			!/^[a-zA-Z_:][a-zA-Z0-9_.:-]*$/.test(name) ||
			name.toLowerCase().startsWith('on') ||
			typeof value === 'function' ||
			value == null ||
			value === false
		) {
			continue;
		}
		element.setAttribute(name, value === true ? '' : String(value));
	}

	for (const [name, value] of Object.entries(properties)) {
		if (name === '__proto__' || name === 'constructor' || name === 'prototype') continue;
		Reflect.set(element, name, value);
	}
}

async function getRuntime(): Promise<LitSsrRuntime> {
	if (!runtimePromise) {
		runtimePromise = (async () => {
			await import('@lit-labs/ssr/lib/install-global-dom-shim.js');
			// Lit's DOM shim installs node-fetch globally. Keep SvelteKit's fetch wrapper,
			// which accepts the platform Request objects passed by load functions.
			globalThis.fetch = platformFetch;

			return withBrowserGlobals(async () => {
				const [{ render, LitElementRenderer }, { collectResult }, { html, unsafeStatic }] =
					await Promise.all([
						import('@lit-labs/ssr'),
						import('@lit-labs/ssr/lib/render-result.js'),
						import('lit/static-html.js')
					]);

				if (!stateRendererInstalled) {
					LitElementRenderer.renderOptions.unshift((element) => {
						const encodedState = element.getAttribute(LIT_SSR_STATE_ATTRIBUTE);
						if (encodedState) applyState(element, encodedState);
						return undefined;
					});
					stateRendererInstalled = true;
				}

				return { render, collectResult, LitElementRenderer, html, unsafeStatic };
			});
		})().catch((error: unknown) => {
			runtimePromise = undefined;
			throw error;
		});
	}

	return runtimePromise;
}

async function ensureComponents(
	registrationKey: string,
	registerComponents: LitSsrHandleOptions['registerComponents']
): Promise<void> {
	const componentRegistrations = getComponentRegistrations();
	const existing = componentRegistrations.get(registrationKey);
	if (existing) return existing;

	const registration = withBrowserGlobals(async () => {
		await registerComponents();
	});
	componentRegistrations.set(registrationKey, registration);
	try {
		await registration;
	} catch (error) {
		if (componentRegistrations.get(registrationKey) === registration) {
			componentRegistrations.delete(registrationKey);
		}
		throw error;
	}
}

function findMatchingElementClose(markup: string, tagName: string, searchFrom: number): number {
	const tagPattern = /<\/?([a-z][a-z0-9._-]*-[a-z0-9._-]+)\b[^>]*>/gi;
	tagPattern.lastIndex = searchFrom;
	const targetName = tagName.toLowerCase();
	let depth = 1;

	for (const match of markup.matchAll(tagPattern)) {
		if (match[1].toLowerCase() !== targetName) continue;

		if (match[0].startsWith('</')) {
			depth -= 1;
			if (depth === 0) return match.index;
		} else if (!match[0].endsWith('/>')) {
			depth += 1;
		}
	}

	return -1;
}

async function renderLitElementSsr(
	tagName: string,
	encodedState: string,
	registrationKey: string,
	registerComponents: LitSsrHandleOptions['registerComponents']
): Promise<string> {
	if (!customElementName.test(tagName)) throw new Error(`Invalid custom element name: ${tagName}`);
	const runtime = await getRuntime();
	await ensureComponents(registrationKey, registerComponents);

	const staticTagName = runtime.unsafeStatic(tagName);
	const template = runtime.html`<${staticTagName} data-lit-ssr=${encodedState}></${staticTagName}>`;
	return runtime.collectResult(runtime.render(template));
}

function createPageTransform(options: LitSsrHandleOptions) {
	let buffer = '';
	const marker = `${LIT_SSR_STATE_ATTRIBUTE}="`;

	return async ({ html, done }: { html: string; done: boolean }): Promise<string> => {
		buffer += html;
		let output = '';

		while (buffer.length > 0) {
			const markerStart = buffer.indexOf(marker);
			if (markerStart < 0) {
				const lastTagStart = buffer.lastIndexOf('<');
				const lastTagEnd = buffer.lastIndexOf('>');
				if (!done && lastTagStart > lastTagEnd) {
					output += buffer.slice(0, lastTagStart);
					buffer = buffer.slice(lastTagStart);
				} else {
					output += buffer;
					buffer = '';
				}
				break;
			}

			const tagStart = buffer.lastIndexOf('<', markerStart);
			const openEnd = buffer.indexOf('>', markerStart);
			if (tagStart < 0 || openEnd < 0) {
				if (done) {
					output += buffer;
					buffer = '';
				} else {
					output += buffer.slice(0, Math.max(0, tagStart));
					buffer = buffer.slice(Math.max(0, tagStart));
				}
				break;
			}

			const openingTag = buffer.slice(tagStart, openEnd + 1);
			const name = openingTag.match(/^<([a-z][a-z0-9._-]*-[a-z0-9._-]+)\b/i)?.[1];
			const state = openingTag.match(stateAttributePattern)?.[1];
			if (!name || !state) {
				output += buffer.slice(0, openEnd + 1);
				buffer = buffer.slice(openEnd + 1);
				continue;
			}

			const closeStart = findMatchingElementClose(buffer, name, openEnd + 1);
			if (closeStart < 0) {
				if (done) {
					output += buffer;
					buffer = '';
				} else {
					output += buffer.slice(0, tagStart);
					buffer = buffer.slice(tagStart);
				}
				break;
			}

			const closeTagEnd = buffer.indexOf('>', closeStart) + 1;
			const end = closeTagEnd;
			const originalElement = buffer.slice(tagStart, end);
			output += buffer.slice(0, tagStart);
			try {
				output += await renderLitElementSsr(
					name,
					state,
					options.registrationKey,
					options.registerComponents
				);
			} catch (error) {
				console.error(`Lit SSR failed for <${name}>; keeping the client-rendered element.`, error);
				output += originalElement;
			}
			buffer = buffer.slice(end);
		}

		return output;
	};
}

/**
 * Creates a SvelteKit handle that server-renders opted-in Lit wrapper elements.
 *
 * The handle transforms wrappers that include the generated SSR state marker.
 * Their component bundle is imported on the first such render and registered
 * once per `registrationKey`. If Lit cannot render an element, the handle logs
 * the error and keeps the client-rendered element in the response.
 *
 * Pass the returned handle to SvelteKit's `sequence()` alongside any existing
 * handles. A wrapper must also receive its `ssr` prop to opt into SSR.
 *
 * @param options Bundle registration key and lazy component-registration callback.
 * @returns A SvelteKit request handle that adds Lit SSR to page rendering.
 */
export function createLitSsrHandle(options: LitSsrHandleOptions): Handle {
	return async ({ event, resolve }) => {
		const transformPageChunk = createPageTransform(options);
		return resolve(event, { transformPageChunk });
	};
}
