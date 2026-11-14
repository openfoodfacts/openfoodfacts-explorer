import type { LitElement as BaseLitElement } from 'lit';
import type { HTMLAttributes } from 'svelte/elements';

type CustomElementTag = Extract<keyof HTMLElementTagNameMap, `${string}-${string}`>;

/** Keep only custom tags registered with a Lit element class. */
type LitCustomElementTag = {
	[Tag in CustomElementTag]: HTMLElementTagNameMap[Tag] extends BaseLitElement ? Tag : never;
}[CustomElementTag];

type MethodKeys<Element> = {
	[Key in keyof Element]-?: Element[Key] extends (...args: never[]) => unknown ? Key : never;
}[keyof Element];

/** Component fields only: omit inherited platform members and callable methods. */
type ComponentProperties<Element extends BaseLitElement> = Partial<
	Omit<Element, keyof BaseLitElement | MethodKeys<Element>>
>;

/** Component fields take precedence when they overlap with HTML attributes. */
type LitElementProps<Element extends BaseLitElement> = ComponentProperties<Element> &
	Omit<HTMLAttributes<Element>, keyof ComponentProperties<Element> | 'children'>;

export type WebComponentProps<Tag extends string> = Tag extends LitCustomElementTag
	? LitElementProps<HTMLElementTagNameMap[Tag]>
	: HTMLAttributes<HTMLElement>;

/** Svelte wrapper props, including the wrapper-only SSR opt-in. */
export type WebComponentWrapperProps<Tag extends string> = Omit<WebComponentProps<Tag>, 'ssr'> & {
	ssr?: boolean;
};
