import { getContext, setContext } from 'svelte';

export type Shortcut = {
	description: string;
	action: () => void;
};

export type ShortcutContext = Map<string, Shortcut>;

export function setShortcutCtx(ctx: () => ShortcutContext) {
	setContext('shortcut-ctx', ctx);
}

export function getShortcutCtx(): ShortcutContext {
	const lambda = getContext('shortcut-ctx') as () => ShortcutContext;
	if (!lambda) throw new Error('Shortcut context not found');
	return lambda();
}
