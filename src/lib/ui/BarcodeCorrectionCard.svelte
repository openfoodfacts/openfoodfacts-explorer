<script lang="ts">
	import { _ } from '$lib/i18n';

	import IconMdiBarcode from '@iconify-svelte/mdi/barcode';

	type Props = {
		currentCode: string;
		onCorrect: (newCode: string) => Promise<void>;
	};

	let { currentCode, onCorrect }: Props = $props();

	let newCode = $state('');
	let isSubmitting = $state(false);

	async function handleSubmit() {
		const trimmedCode = newCode.trim();
		if (!trimmedCode || trimmedCode === currentCode) {
			return;
		}

		isSubmitting = true;

		try {
			await onCorrect(trimmedCode);
		} finally {
			isSubmitting = false;
		}
	}
</script>

<div class="flex flex-col gap-3 p-2">
	<div class="flex items-center gap-2">
		<IconMdiBarcode class="h-5 w-5 text-warning" />
		<h2 class="text-lg font-bold">{$_('product.moderator.barcode_correction_title')}</h2>
	</div>

	<p class="text-sm text-base-content/70">
		{$_('product.moderator.barcode_correction_description')}
	</p>

	<div class="flex flex-col gap-2 sm:flex-row sm:items-end">
		<label class="input w-full">
			<span class="label">{$_('product.moderator.barcode_correction_new_code_label')}</span>
			<input
				type="text"
				bind:value={newCode}
				placeholder={$_('product.moderator.barcode_correction_placeholder')}
				disabled={isSubmitting}
			/>
		</label>

		<button
			class="btn btn-sm btn-warning sm:btn-md"
			onclick={handleSubmit}
			disabled={isSubmitting || !newCode.trim() || newCode.trim() === currentCode}
			type="button"
		>
			{#if isSubmitting}
				<span class="loading loading-sm loading-spinner"></span>
			{/if}
			{$_('product.moderator.barcode_correction_submit')}
		</button>
	</div>
</div>
