<script lang="ts">
	import { getToastCtx, type Toast } from '$lib/stores/toasts';
	import { fly } from 'svelte/transition';

	const toastCtx = getToastCtx();

	function getToastClass(type: Toast['type']): string {
		const baseClasses = 'alert shadow-lg max-w-sm';
		switch (type) {
			case 'success':
				return `${baseClasses} alert-success`;
			case 'error':
				return `${baseClasses} alert-error`;
			case 'warning':
				return `${baseClasses} alert-warning`;
			case 'info':
				return `${baseClasses} alert-info`;
			default:
				return `${baseClasses}`;
		}
	}

	function getToastIcon(type: Toast['type']): string {
		switch (type) {
			case 'success':
				return 'icon-[mdi--check-circle]';
			case 'error':
				return 'icon-[mdi--close-circle]';
			case 'warning':
				return 'icon-[mdi--alert]';
			case 'info':
				return 'icon-[mdi--information]';
			default:
				return 'icon-[mdi--information]';
		}
	}

	function handleClose(toastId: string) {
		toastCtx.remove(toastId);
	}
</script>

<div class="toast toast-top toast-end z-50">
	{#each toastCtx.toasts as toastItem (toastItem.id)}
		<div
			class={getToastClass(toastItem.type)}
			transition:fly={{ x: 300, duration: 200 }}
			role="alert"
			aria-live="polite"
		>
			<div class="flex items-center gap-2">
				<span class="{getToastIcon(toastItem.type)} h-5 w-5 flex-shrink-0" aria-hidden="true"
				></span>
				<span class="text-sm">{toastItem.message}</span>
				<button
					type="button"
					class="btn btn-ghost btn-xs btn-circle ml-2"
					onclick={() => handleClose(toastItem.id)}
					aria-label="Close notification"
				>
					<span class="icon-[mdi--close] h-4 w-4" aria-hidden="true"></span>
				</button>
			</div>
		</div>
	{/each}
</div>
