<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';

	type Props = {
		barcode: string;
		productName: string;
		onDelete: (comment: string) => Promise<void>;
	};

	let { barcode, productName, onDelete }: Props = $props();

	let comment = $state('');
	let isConfirmed = $state(false);
	let isSubmitting = $state(false);

	async function handleSubmit() {
		const trimmedComment = comment.trim();
		if (!trimmedComment || !isConfirmed) {
			return;
		}

		isSubmitting = true;
		try {
			await onDelete(trimmedComment);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex flex-col gap-3 p-2 border-t border-base-300 pt-4 mt-4">
	<div class="flex items-center gap-2">
		<IconMdiDelete class="text-error h-5 w-5" />
		<h2 class="text-lg font-bold">
			{$_('product.moderator.delete_product_title', { default: 'Delete the product page' })}
		</h2>
	</div>

	<div class="form-control">
		<label class="label cursor-pointer justify-start gap-3 p-0 items-start">
			<input
				type="checkbox"
				class="checkbox checkbox-error checkbox-sm mt-1"
				bind:checked={isConfirmed}
				disabled={isSubmitting}
			/>
			<span class="label-text text-sm">
				<strong
					>{$_('product.moderator.delete_product_confirm', {
						default: 'Are you sure that you want to delete the page for this product?'
					})}</strong
				>
				<br />
				{$_('product.edit.product_name', { default: 'Product name' })} : {productName}
				<br />
				{$_('product.edit.barcode', { default: 'Barcode' })} : {barcode}
			</span>
		</label>
	</div>

	<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
		<label class="input w-full">
			<span class="label"
				>{$_('product.moderator.delete_product_comment_label', {
					default: 'Reason for removal'
				})}</span
			>
			<input
				type="text"
				bind:value={comment}
				placeholder={$_('product.moderator.delete_product_comment_placeholder', {
					default: 'Enter reason for removal'
				})}
				disabled={isSubmitting}
			/>
		</label>

		<button
			class="btn btn-error btn-sm sm:btn-md"
			onclick={handleSubmit}
			disabled={isSubmitting || !isConfirmed || !comment.trim()}
			type="button"
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm"></span>
			{/if}
			{$_('product.moderator.delete_product_submit', { default: 'Delete the product page' })}
		</button>
	</div>
</div>
