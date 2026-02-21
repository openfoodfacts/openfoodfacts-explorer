<script lang="ts">
	import { goto } from '$app/navigation';
	import { _ } from '$lib/i18n';
	import { updateBarcode } from '$lib/api';
	import { getToastCtx } from '$lib/stores/toasts';
	import Card from './Card.svelte';

	import IconMdiBarcode from '@iconify-svelte/mdi/barcode';

	type Props = {
		currentCode: string;
	};

	let { currentCode }: Props = $props();

	let newCode = $state('');
	let isSubmitting = $state(false);

	const toast = getToastCtx();

	async function handleSubmit() {
		const trimmedCode = newCode.trim();
		if (!trimmedCode || trimmedCode === currentCode) {
			return;
		}

		isSubmitting = true;

		try {
			const success = await updateBarcode(fetch, currentCode, trimmedCode);

			if (success) {
				toast.success($_('product.moderator.barcode_correction_success'));
				// Redirect to the new product page after a short delay
				setTimeout(() => {
					goto(`/products/${trimmedCode}`);
				}, 1500);
			} else {
				toast.error($_('product.moderator.barcode_correction_error'));
			}
		} catch {
			toast.error($_('product.moderator.barcode_correction_error'));
		} finally {
			isSubmitting = false;
		}
	}
</script>

<Card>
	<div class="flex flex-col gap-3">
		<div class="flex items-center gap-2">
			<IconMdiBarcode class="text-warning h-5 w-5" />
			<h2 class="text-lg font-bold">{$_('product.moderator.barcode_correction_title')}</h2>
		</div>

		<p class="text-base-content/70 text-sm">
			{$_('product.moderator.barcode_correction_description')}
		</p>

		<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
			<label class="input w-full">
				<span class="label">{$_('product.moderator.barcode_correction_title')}</span>
				<input
					type="text"
					bind:value={newCode}
					placeholder={$_('product.moderator.barcode_correction_placeholder')}
					disabled={isSubmitting}
				/>
			</label>

			<button
				class="btn btn-warning btn-sm sm:btn-md"
				onclick={handleSubmit}
				disabled={isSubmitting || !newCode.trim() || newCode.trim() === currentCode}
				type="button"
			>
				{#if isSubmitting}
					<span class="loading loading-spinner loading-sm"></span>
				{/if}
				{$_('product.moderator.barcode_correction_submit')}
			</button>
		</div>
	</div>
</Card>
