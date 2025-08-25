import { getContext, setContext } from 'svelte';

export type Toast = {
	id: string;
	message: string;
	type: 'success' | 'error' | 'warning' | 'info';
	duration?: number;
};

export type ToastContext = {
	toasts: Toast[];
	success: (message: string, duration?: number) => string;
	error: (message: string, duration?: number) => string;
	warning: (message: string, duration?: number) => string;
	info: (message: string, duration?: number) => string;
	remove: (id: string) => void;
	clear: () => void;
};

export function setToastCtx(ctx: () => ToastContext) {
	setContext('toast-ctx', ctx);
}

export function getToastCtx(): ToastContext {
	const lambda = getContext('toast-ctx') as () => ToastContext;
	if (!lambda) throw new Error('Toast context not found');
	return lambda();
}
