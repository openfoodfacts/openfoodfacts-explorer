<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getLanguageName } from '$lib/languages';

	import IconMdiLanguage from '@iconify-svelte/mdi/language';

	type Props = {
		product: Product;
	};

	let { product = $bindable() }: Props = $props();
</script>

<div class="mb-6 rounded-lg border border-base-200 bg-base-300 p-4 shadow-sm">
	<div class="form-control w-full">
		<span class="label-text text-sm font-semibold sm:text-base">
			{$_('product.edit.packaging_component.recycling_instructions')}
		</span>
		<p class="mb-2 text-xs text-base-content/60">
			{$_('product.edit.packaging_component.recycling_instructions_desc')}
		</p>

		<div class="tabs-lift tabs">
			{#if Object.keys(product.languages_codes ?? {}).length === 0}
				<div class="alert text-sm alert-warning sm:text-base">
					{$_('product.edit.no_languages_found')}
				</div>
			{:else}
				<div class="tab tab-disabled cursor-default">
					<IconMdiLanguage class="mr-1 h-5 w-5 align-middle" />
				</div>
			{/if}

			{#each Object.keys(product.languages_codes ?? {}) as code (code)}
				<input
					type="radio"
					name="packaging_text_tabs"
					class="tab text-xs sm:text-sm"
					aria-label={getLanguageName(code)}
					checked={code === product.lang}
				/>
				<div class="form-control tab-content border-base-300 bg-base-100 p-6">
					<label class="label text-sm sm:text-base" for={`packaging-text-${code}`}>
						{$_('product.edit.packaging_component.recycling_instructions')} ({getLanguageName(
							code
						)})
					</label>
					<textarea
						id={`packaging-text-${code}`}
						class="textarea-bordered textarea h-24 w-full"
						placeholder={$_('product.edit.packaging_component.recycling_instructions_placeholder')}
						value={product[`packaging_text_${code}`] ?? ''}
						oninput={(e) => {
							product = {
								...product,
								[`packaging_text_${code}`]: (e.currentTarget as HTMLTextAreaElement).value
							};
						}}></textarea>
				</div>
			{/each}
		</div>

		<div class="mt-2 space-y-1">
			<p class="text-xs text-base-content/70">
				&rarr; {$_('product.edit.packaging_component.recycling_instructions_list')}
			</p>
			<p class="text-xs text-base-content/70">
				&rarr; {$_('product.edit.packaging_component.recycling_instructions_specificity')}
			</p>
			<p class="text-xs text-base-content/70">
				&rarr; {$_('product.edit.packaging_component.recycling_instructions_combination')}
			</p>
			<p class="text-xs">
				<span class="font-semibold text-success"
					>{$_('product.edit.packaging_component.recycling_instructions_examples_label')}</span
				>
				<span class="text-success"
					>{$_('product.edit.packaging_component.recycling_instructions_examples')}</span
				>
			</p>
		</div>
	</div>
</div>
