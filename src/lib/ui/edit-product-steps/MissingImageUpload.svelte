<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import { fileToBase64, uploadImageV3 } from '#lib/api.js';
	import { getToastCtx } from '#lib/stores/toasts.js';
	import { userInfo } from '#lib/stores/user.js';
	import { trackOffEvent } from '#lib/analytics.js';

	import IconMdiUpload from '@iconify-svelte/mdi/upload';

	type Props = {
		message: string;
		productCode: string;
		// OFF image field to select the upload as, e.g. `nutrition_en`
		imagefield: string;
		// Called after a successful upload so the parent can reload the selected images.
		// When omitted (e.g. in add mode), only the message is shown.
		onUploaded?: () => Promise<void>;
	};

	let { message, productCode, imagefield, onUploaded }: Props = $props();

	const toast = getToastCtx();

	let fileInput = $state<HTMLInputElement | null>(null);
	let isUploading = $state(false);

	function openFilePicker() {
		if ($userInfo == null) {
			toast.warning($_('product.edit.images.toast.login_required'));
			return;
		}
		fileInput?.click();
	}

	async function handleFileChange(e: Event) {
		const input = e.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		isUploading = true;
		try {
			const base64Data = await fileToBase64(file);
			const result = await uploadImageV3(fetch, productCode, base64Data, imagefield);
			const status = result?.data?.status;
			// Errors are objects; show their (translated) message, not "[object Object]"
			const error = (result?.data?.errors ?? [])
				.map((e) => e.message?.lc_name ?? e.message?.name ?? e.message?.id)
				.filter(Boolean)
				.join(', ');

			if (
				status === 'success' ||
				status === 'success_with_warnings' ||
				status === 'success_with_errors'
			) {
				if (status === 'success_with_errors') {
					// The image is saved, but part of the request (e.g. selecting it) failed.
					toast.warning(
						$_('product.edit.images.toast.upload_success_with_errors', {
							default: 'Image uploaded, but some changes could not be applied: {error}',
							values: { error }
						})
					);
				} else {
					toast.success($_('product.edit.images.toast.upload_success'));
				}
				trackOffEvent('contribution', 'image_upload_succeeded', imagefield.split('_')[0]);
				try {
					await onUploaded?.();
				} catch (err) {
					// The image is uploaded; only reloading it into the form failed.
					console.error('Failed to refresh images after upload:', err);
					toast.warning(
						$_('product.edit.images.toast.refresh_failed', {
							default: 'Image uploaded, but it could not be shown yet. Reload the page to see it.'
						})
					);
				}
			} else if (error) {
				toast.error($_('product.edit.images.toast.upload_failed', { values: { error } }));
			} else {
				toast.error($_('product.edit.images.toast.upload_failed_generic'));
			}
		} catch (err) {
			console.error('Image upload failed:', err);
			toast.error($_('product.edit.images.toast.upload_error'));
		} finally {
			isUploading = false;
			input.value = '';
		}
	}
</script>

<div class="mb-4 alert flex flex-wrap items-center justify-between gap-2 alert-warning">
	<div class="flex flex-col gap-1">
		<span class="text-sm sm:text-base">{message}</span>
		{#if onUploaded}
			<!-- Uploading from here skips the Photos section, so repeat its copyright notice -->
			<span class="text-xs">
				{$_('product.edit.legal_warning_photos_2', {
					default: 'Only upload your own photos or those you have explicit permission to use.'
				})}
			</span>
		{/if}
	</div>
	{#if onUploaded}
		<input
			bind:this={fileInput}
			type="file"
			accept="image/*"
			class="hidden"
			disabled={isUploading}
			onchange={handleFileChange}
		/>
		<button
			type="button"
			class="btn gap-2 btn-outline btn-sm [--btn-color:var(--color-warning-content)] [--btn-fg:var(--color-warning)]"
			disabled={isUploading}
			onclick={openFilePicker}
		>
			{#if isUploading}
				<span class="loading loading-sm loading-spinner"></span>
				<span>{$_('product.edit.images.uploading', { default: 'Uploading...' })}</span>
			{:else}
				<IconMdiUpload class="h-4 w-4" aria-hidden="true" />
				<span>{$_('product.edit.images.upload_photo', { default: 'Upload a photo' })}</span>
			{/if}
		</button>
	{/if}
</div>
