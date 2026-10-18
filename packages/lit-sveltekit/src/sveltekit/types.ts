import type { LitElement as BaseLitElement } from 'lit';
import type { HTMLAttributes } from 'svelte/elements';

/** Custom element tags whose registered element class extends LitElement. */
type LitCustomElementTag = {
	[Tag in keyof HTMLElementTagNameMap]: HTMLElementTagNameMap[Tag] extends BaseLitElement
		? Tag extends `${string}-${string}`
			? Tag
			: never
		: never;
}[keyof HTMLElementTagNameMap];

type MethodKeys<Element> = {
	[Key in keyof Element]-?: Element[Key] extends (...args: never[]) => unknown ? Key : never;
}[keyof Element];

/** Public component-specific properties declared by the element class. */
type LitElementProperties<Tag extends string> = Tag extends LitCustomElementTag
	? Partial<
			Pick<
				HTMLElementTagNameMap[Tag],
				Exclude<
					keyof HTMLElementTagNameMap[Tag],
					keyof BaseLitElement | MethodKeys<HTMLElementTagNameMap[Tag]>
				>
			>
		>
	: Record<never, never>;

export type WebComponentProps<Tag extends string> = Tag extends LitCustomElementTag
	? LitElementProperties<Tag> &
			Omit<HTMLAttributes<HTMLElementTagNameMap[Tag]>, keyof LitElementProperties<Tag> | 'children'>
	: HTMLAttributes<HTMLElement>;

/** Svelte wrapper props, including the wrapper-only SSR opt-in. */
export type WebComponentWrapperProps<Tag extends string> = Omit<WebComponentProps<Tag>, 'ssr'> & {
	ssr?: boolean;
};
