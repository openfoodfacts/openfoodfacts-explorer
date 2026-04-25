<script lang="ts">
	import { _ } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import IconMdiLoading from '@iconify-svelte/mdi/loading';
	import IconMdiCheck from '@iconify-svelte/mdi/check';
	import IconMdiCloseCircle from '@iconify-svelte/mdi/close-circle';

	type Props = {
		isSubmitting: boolean;
		submit: () => Promise<void>;
		comment: string;
	};

	let { isSubmitting, submit, comment = $bindable() }: Props = $props();

	function cancel() {
		goto('/products/' + page.params.barcode);
	}
</script>

<div
	class="border-base-300 bg-base-200 fixed inset-x-0 bottom-0 z-100 flex flex-wrap items-center gap-2 border-t p-3.5 shadow-lg sm:gap-2.5"
>
	<!-- Comment input -->
	<input
		type="text"
		class="input input-bordered h-9 flex-1 basis-full text-sm sm:basis-0"
		placeholder={$_('product.edit.changes_summary')}
		aria-label={$_('product.edit.changes_summary')}
		bind:value={comment}
		disabled={isSubmitting}
	/>

	<!-- Save button -->
	<button
		type="button"
		class="btn btn-success h-9 w-[234px] shrink-0 gap-2 text-sm max-sm:min-w-0 max-sm:flex-1 max-sm:basis-0"
		onclick={submit}
		disabled={isSubmitting}
	>
		{#if isSubmitting}
			<IconMdiLoading class="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
		{:else}
			<IconMdiCheck class="h-4 w-4 shrink-0" aria-hidden="true" />
		{/if}
		<span>{$_('product.edit.save_btn')}</span>
	</button>

	<!-- Cancel button -->
	<button
		type="button"
		class="btn btn-ghost h-9 w-[234px] shrink-0 gap-2 text-sm max-sm:min-w-0 max-sm:flex-1 max-sm:basis-0"
		onclick={cancel}
		disabled={isSubmitting}
	>
		<IconMdiCloseCircle class="h-4 w-4 shrink-0" aria-hidden="true" />
		<span>{$_('common.cancel')}</span>
	</button>
</div>
