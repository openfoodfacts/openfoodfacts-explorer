<script lang="ts">
	import { _ } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import IconMdiLoading from '@iconify-svelte/mdi/loading';

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
	class="border-base-300 fixed inset-x-0 bottom-0 z-100 flex flex-wrap items-center gap-2 border-t bg-[#341100] p-3.5 sm:gap-2.5"
>
	<!-- Comment input -->
	<input
		type="text"
		class="border-base-300 h-9 flex-1 basis-full rounded-none border bg-white p-2 text-sm text-gray-700 outline-none focus:border-sky-400 focus:ring-2 focus:ring-sky-300/30 disabled:cursor-not-allowed disabled:opacity-60 sm:basis-0"
		placeholder={$_('product.edit.changes_summary')}
		aria-label={$_('product.edit.changes_summary')}
		bind:value={comment}
		disabled={isSubmitting}
	/>

	<!-- Save button -->
	<button
		type="button"
		class="inline-flex h-9 w-[234px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#4fa125] text-[13px] font-semibold whitespace-nowrap text-white transition-colors hover:bg-[#3d8a1c] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-w-0 max-sm:flex-1 max-sm:basis-0"
		onclick={submit}
		disabled={isSubmitting}
	>
		{#if isSubmitting}
			<IconMdiLoading class="h-4 w-4 shrink-0 animate-spin" aria-hidden="true" />
		{:else}
			<svg
				class="h-4 w-4 shrink-0"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		{/if}
		<span>{$_('product.edit.save_btn')}</span>
	</button>

	<!-- Cancel button -->
	<button
		type="button"
		class="inline-flex h-9 w-[234px] shrink-0 cursor-pointer items-center justify-center gap-2 rounded-lg bg-[#ede0db] text-[13px] font-semibold whitespace-nowrap text-gray-700 transition-colors hover:bg-[#d5cab8] disabled:cursor-not-allowed disabled:opacity-60 max-sm:min-w-0 max-sm:flex-1 max-sm:basis-0"
		onclick={cancel}
		disabled={isSubmitting}
	>
		<svg class="h-4 w-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="10" fill="#555" stroke="none" />
			<line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
			<line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
		</svg>
		<span>{$_('common.cancel')}</span>
	</button>
</div>
