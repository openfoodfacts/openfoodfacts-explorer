<script lang="ts">
	import { getToastCtx, type Toast } from '$lib/stores/toasts';
	import { fly } from 'svelte/transition';

	const toastCtx = getToastCtx();

	const toastTypeClass: Record<Toast['type'], string> = {
		success: 'alert-success',
		error: 'alert-error',
		warning: 'alert-warning',
		info: 'alert-info'
	};

	const toastTypeIcon: Record<Toast['type'], string> = {
		success: 'icon-[mdi--check-circle]',
		error: 'icon-[mdi--close-circle]',
		warning: 'icon-[mdi--alert]',
		info: 'icon-[mdi--information]'
	};

	function handleClose(toastId: string) {
		toastCtx.remove(toastId);
	}
</script>

<div class="toast toast-top toast-end z-50">
	{#each toastCtx.toasts as toastItem (toastItem.id)}
		<div
			class={`alert max-w-sm shadow-lg ${toastTypeClass[toastItem.type]}`}
			transition:fly={{ x: 300, duration: 200 }}
			role="alert"
			aria-live="polite"
		>
			<div class="flex items-center gap-2">
				<span class={`${toastTypeIcon[toastItem.type]} h-5 w-5 flex-shrink-0`} aria-hidden="true"
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
