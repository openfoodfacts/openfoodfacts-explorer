import { writable } from 'svelte/store';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export type Toast = {
	id: string;
	message: string;
	type: ToastType;
	duration?: number;
};

function createToastStore() {
	const { subscribe, update } = writable<Toast[]>([]);

	let toastId = 0;

	function addToast(message: string, type: ToastType = 'info', duration: number = 5000) {
		const id = `toast-${++toastId}`;
		const toast: Toast = { id, message, type, duration };

		update((toasts) => [...toasts, toast]);

		// Auto-remove toast after duration
		if (duration > 0) {
			setTimeout(() => {
				removeToast(id);
			}, duration);
		}

		return id;
	}

	function removeToast(id: string) {
		update((toasts) => toasts.filter((toast) => toast.id !== id));
	}

	function clearAll() {
		update(() => []);
	}

	return {
		subscribe,
		success: (message: string, duration?: number) => addToast(message, 'success', duration),
		error: (message: string, duration?: number) => addToast(message, 'error', duration),
		warning: (message: string, duration?: number) => addToast(message, 'warning', duration),
		info: (message: string, duration?: number) => addToast(message, 'info', duration),
		remove: removeToast,
		clear: clearAll
	};
}

export const toast = createToastStore();
