<script lang="ts">
	import { _ } from '$lib/i18n';
	import { fileToBase64, uploadImageV3 } from '$lib/api';
	import { userInfo } from '$lib/stores/user';
	import { getToastCtx } from '$lib/stores/toasts';
	import { invalidateAll } from '$app/navigation';
	import { getLanguageName } from '$lib/languages';
	import ImageButton from '../ImageButton.svelte';

	import IconMdiUpload from '@iconify-svelte/mdi/upload';
	import IconMdiCamera from '@iconify-svelte/mdi/camera';

	type Props = {
		barcode: string;
		lang: string;
		getPackagingImage: (language: string) => string | null;
	};

	let { barcode, lang, getPackagingImage }: Props = $props();

	const toast = getToastCtx();
	let isUploading = $state(false);
	let currentLang = $derived(lang || 'en');

	async function handlePackagingImageUpload(e: Event) {
		const input = e.target as HTMLInputElement;
		if (!input.files || input.files.length === 0) return;

		const files = Array.from(input.files);

		if ($userInfo == null) {
			toast.warning($_('product.edit.images.toast.login_required'));
			return;
		}

		isUploading = true;

		try {
			for (const file of files) {
				const base64Data = await fileToBase64(file);
				const imagefield = `packaging_${currentLang}`;
				const uploadResult = await uploadImageV3(
					window.fetch,
					barcode?.toString() || '',
					base64Data,
					imagefield
				);

				if (!uploadResult || uploadResult.error || !uploadResult.data) {
					toast.error($_('product.edit.images.toast.upload_failed_generic'));
					continue;
				}

				if (uploadResult.data?.status === 'success') {
					toast.success($_('product.edit.images.toast.upload_success'));
				} else {
					const errorMessages =
						uploadResult.data?.errors && uploadResult.data.errors.length > 0
							? uploadResult.data.errors.join(', ')
							: 'Unknown error';
					toast.error(
						$_('product.edit.images.toast.upload_failed', { values: { error: errorMessages } })
					);
				}
			}
			await invalidateAll();
		} catch (err) {
			console.error('Packaging image upload failed:', err);
			toast.error($_('product.edit.images.toast.upload_error'));
		} finally {
			isUploading = false;
			input.value = '';
		}
	}

	function triggerPackagingImageUpload() {
		const input = document.getElementById('packaging-image-upload') as HTMLInputElement;
		if (input) input.click();
	}
</script>

<div class="bg-base-100 border-base-300 mb-6 rounded-lg border p-4 shadow-sm">
	<div class="form-control w-full">
		<label class="label" for="packaging-image-upload">
			<span class="label-text flex items-center gap-2 text-sm font-semibold sm:text-base">
				<IconMdiCamera class="h-5 w-5" />
				{$_('product.edit.packaging_component.recycling_instructions')} picture ({getLanguageName(
					currentLang
				)})
			</span>
		</label>

		<div class="mt-2 flex flex-col gap-4 sm:flex-row sm:items-start">
			<div class="flex-shrink-0">
				{#if getPackagingImage(currentLang)}
					<div class="border-base-300 relative h-48 w-48 overflow-hidden rounded-lg border">
						<ImageButton
							src={getPackagingImage(currentLang) ?? undefined}
							productCode={barcode}
							alt="Packaging"
						/>
					</div>
				{:else}
					<div
						class="border-base-300 bg-base-200 flex h-48 w-48 flex-col items-center justify-center rounded-lg border-2 border-dashed"
					>
						<p class="text-base-content/50 px-4 text-center text-xs italic">
							{$_('product.edit.packaging_component.no_packaging_image', {
								default: 'No packaging photo available'
							})}
						</p>
					</div>
				{/if}
			</div>

			<div class="flex flex-col gap-3">
				<p class="text-base-content/60 text-xs sm:text-sm">
					{$_('product.edit.packaging_component.packaging_photo_desc', {
						default:
							'Upload a photo specifically showing the packaging materials, recycling symbols, and instructions.'
					})}
				</p>

				<input
					id="packaging-image-upload"
					type="file"
					accept="image/*"
					multiple
					class="hidden"
					disabled={isUploading}
					onchange={handlePackagingImageUpload}
				/>

				<button
					type="button"
					class="btn btn-outline btn-sm self-start"
					class:loading={isUploading}
					disabled={isUploading}
					onclick={triggerPackagingImageUpload}
				>
					{#if isUploading}
						<span class="loading loading-spinner h-4 w-4"></span>
						<span>{$_('product.edit.images.uploading', { default: 'Uploading...' })}</span>
					{:else}
						<IconMdiUpload class="h-4 w-4" />
						<span
							>{$_('product.edit.packaging_component.upload_packaging_photo', {
								default: 'Upload packaging photo'
							})}</span
						>
					{/if}
				</button>

				<p class="text-base-content/50 mt-1 max-w-md text-[10px] sm:text-xs">
					{$_('product.edit.packaging_component.multiple_uploads_guidance')}
				</p>
			</div>
		</div>
	</div>
</div>
