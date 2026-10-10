<script lang="ts">
	import { _ } from '$lib/i18n';
	import { getLanguageName } from '$lib/languages';
	import type { PhotoTextMismatch } from '$lib/utils/photoTextMismatch';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';

	type Props = {
		mismatches: PhotoTextMismatch[];
		onSaveAnyway: () => void;
	};

	let { mismatches, onSaveAnyway }: Props = $props();

	let dialogEl: HTMLDialogElement | null = $state(null);

	export function open() {
		dialogEl?.showModal();
	}

	function close() {
		dialogEl?.close();
	}

	function getMessage(mismatch: PhotoTextMismatch) {
		const values = { language: getLanguageName(mismatch.lang) };
		return mismatch.type === 'ingredients'
			? $_('product.edit.photo_text_mismatch.ingredients', {
					values,
					default:
						'The ingredients photo ({language}) was changed, but the ingredients list was not updated.'
				})
			: $_('product.edit.photo_text_mismatch.nutrition', {
					values,
					default:
						'The nutrition photo ({language}) was changed, but the nutrition facts were not updated.'
				});
	}
</script>

<dialog
	bind:this={dialogEl}
	class="modal modal-bottom sm:modal-middle"
	aria-labelledby="photo-text-mismatch-title"
>
	<div class="modal-box flex flex-col gap-4 border border-warning/20">
		<div class="flex items-start gap-3 text-warning">
			<IconMdiAlert class="mt-0.5 h-6 w-6 shrink-0" />
			<div class="flex flex-col gap-1">
				<h3 id="photo-text-mismatch-title" class="text-lg font-bold">
					{$_('product.edit.photo_text_mismatch.title', {
						default: 'Photo changed without updating the data'
					})}
				</h3>
				<p class="text-sm text-base-content/75">
					{$_('product.edit.photo_text_mismatch.description', {
						default: 'Please check that the information still matches the new photos before saving.'
					})}
				</p>
			</div>
		</div>

		<ul class="list-disc space-y-1 pl-6 text-sm">
			{#each mismatches as mismatch (`${mismatch.type}_${mismatch.lang}`)}
				<li>{getMessage(mismatch)}</li>
			{/each}
		</ul>

		<div class="modal-action mt-0">
			<button
				type="button"
				class="btn btn-outline"
				onclick={() => {
					close();
					onSaveAnyway();
				}}
			>
				{$_('product.edit.photo_text_mismatch.save_anyway', { default: 'Save anyway' })}
			</button>
			<button type="button" class="btn btn-primary" onclick={close}>
				{$_('product.edit.photo_text_mismatch.review', { default: 'Review' })}
			</button>
		</div>
	</div>
	<form method="dialog" class="modal-backdrop">
		<button>{$_('product.edit.photo_text_mismatch.close', { default: 'Close' })}</button>
	</form>
</dialog>
