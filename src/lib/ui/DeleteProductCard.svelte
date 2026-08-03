<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiDelete from '@iconify-svelte/mdi/delete';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';

	type Props = {
		barcode: string;
		productName: string;
		onDelete: (comment: string) => Promise<void>;
	};

	let { barcode, productName, onDelete }: Props = $props();

	let comment = $state('');
	let typedBarcode = $state('');
	let isConfirmed = $state(false);
	let isSubmitting = $state(false);
	let dialogEl: HTMLDialogElement | null = $state(null);

	const reasons = $derived([
		{
			label: $_('product.moderator.delete_reason_personal', { default: 'Personal data' }),
			value: 'Personal data'
		},
		{
			label: $_('product.moderator.delete_reason_nsfw', { default: 'NSFW' }),
			value: 'NSFW'
		},
		{
			label: $_('product.moderator.delete_reason_copyright', {
				default: 'Copyrighted data and images'
			}),
			value: 'Copyrighted data and images'
		},
		{
			label: $_('product.moderator.delete_reason_app_test', { default: 'Test by an app' }),
			value: 'Test by an app'
		},
		{
			label: $_('product.moderator.delete_reason_user_test', { default: 'Test by a user' }),
			value: 'Test by a user'
		},
		{
			label: $_('product.moderator.delete_reason_duplicate', { default: 'Duplicate product' }),
			value: 'Duplicate product'
		},
		{
			label: $_('product.moderator.delete_reason_spam', { default: 'Spam or vandalism' }),
			value: 'Spam or vandalism'
		},
		{
			label: $_('product.moderator.delete_reason_invalid_barcode', {
				default: 'Incorrect barcode'
			}),
			value: 'Incorrect barcode'
		}
	]);

	function openConfirmModal() {
		typedBarcode = '';
		dialogEl?.showModal();
	}

	function closeConfirmModal() {
		dialogEl?.close();
	}

	async function handleSubmit() {
		const trimmedComment = comment.trim();
		if (!trimmedComment || !isConfirmed || typedBarcode.trim() !== barcode) {
			return;
		}

		isSubmitting = true;
		closeConfirmModal();
		try {
			await onDelete(trimmedComment);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex flex-col gap-3 p-2">
	<div class="flex items-center gap-2">
		<IconMdiDelete class="h-5 w-5 text-error" />
		<h2 class="text-lg font-bold">
			{$_('product.moderator.delete_product_title', { default: 'Delete the product page' })}
		</h2>
	</div>

	<div class="form-control">
		<label class="label cursor-pointer items-start justify-start gap-3 p-0">
			<input
				type="checkbox"
				class="checkbox mt-1 checkbox-sm checkbox-error"
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

	<div class="mt-2 flex flex-col gap-2">
		<div class="flex flex-wrap items-center gap-1.5">
			<span class="mr-1 text-xs text-base-content/60">
				{$_('product.moderator.delete_product_prefill_reasons_label', {
					default: 'Common reasons:'
				})}
			</span>
			{#each reasons as reason (reason.value)}
				<button
					type="button"
					class="btn transition-all btn-xs {comment === reason.value
						? 'text-error-content btn-error'
						: 'btn-soft text-base-content/80 btn-neutral'}"
					onclick={() => {
						comment = reason.value;
					}}
					disabled={isSubmitting}
				>
					{reason.label}
				</button>
			{/each}
		</div>

		<div class="mt-1 flex flex-col gap-2 sm:flex-row sm:items-end">
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
				class="btn shrink-0 btn-error btn-sm sm:btn-md"
				onclick={openConfirmModal}
				disabled={isSubmitting || !isConfirmed || !comment.trim()}
				type="button"
			>
				{#if isSubmitting}
					<span class="loading loading-sm loading-spinner"></span>
				{/if}
				{$_('product.moderator.delete_product_submit', { default: 'Delete the product page' })}
			</button>
		</div>
	</div>
</div>

<!-- Confirmation Modal Dialog -->
<dialog bind:this={dialogEl} class="modal modal-bottom sm:modal-middle">
	<div class="modal-box flex flex-col gap-4 border border-error/20">
		<div class="flex items-start gap-3 text-error">
			<IconMdiAlert class="mt-0.5 h-6 w-6 shrink-0" />
			<div class="flex flex-col gap-1">
				<h3 class="text-lg font-bold">
					{$_('product.moderator.delete_product_modal_title', {
						default: 'Confirm Deletion'
					})}
				</h3>
				<p class="text-sm text-base-content/75">
					{$_('product.moderator.delete_product_modal_desc', {
						default:
							'You are about to delete this product page. This action is permanent and cannot be undone.'
					})}
				</p>
			</div>
		</div>

		<div class="flex flex-col gap-1 rounded-lg bg-base-200 p-3 font-mono text-sm">
			<div>
				<strong>{$_('product.edit.product_name', { default: 'Product name' })}:</strong>
				{productName}
			</div>
			<div><strong>{$_('product.edit.barcode', { default: 'Barcode' })}:</strong> {barcode}</div>
		</div>

		<div class="form-control">
			<label class="label p-0 pb-1.5" for="confirm-barcode-input">
				<span class="label-text text-sm font-medium">
					{$_('product.moderator.delete_product_modal_prompt_prefix', {
						default: 'To confirm, type the barcode '
					})}
					<kbd class="mx-1 kbd rounded-md bg-base-300 font-mono kbd-md font-bold text-base-content"
						>{barcode}</kbd
					>
					{$_('product.moderator.delete_product_modal_prompt_suffix', {
						default: ' below:'
					})}
				</span>
			</label>
			<input
				id="confirm-barcode-input"
				type="text"
				class="input-bordered input w-full"
				bind:value={typedBarcode}
				placeholder={barcode}
				disabled={isSubmitting}
			/>
		</div>

		<div class="modal-action mt-2 flex justify-end gap-2">
			<button
				type="button"
				class="btn btn-outline"
				onclick={closeConfirmModal}
				disabled={isSubmitting}
			>
				{$_('common.cancel', { default: 'Cancel' })}
			</button>
			<button
				type="button"
				class="btn btn-error"
				onclick={handleSubmit}
				disabled={isSubmitting || typedBarcode.trim() !== barcode}
			>
				{#if isSubmitting}
					<span class="loading mr-1 loading-xs loading-spinner"></span>
				{/if}
				{$_('product.moderator.delete_product_modal_btn', {
					default: 'Permanently Delete'
				})}
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button onclick={closeConfirmModal}>{$_('common.close', { default: 'close' })}</button>
	</form>
</dialog>
