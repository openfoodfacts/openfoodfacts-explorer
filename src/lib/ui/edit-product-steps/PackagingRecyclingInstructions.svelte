<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { Product } from '$lib/api';
	import { getLanguageName } from '$lib/languages';

	type Props = {
		product: Product;
	};

	let { product = $bindable() }: Props = $props();
</script>

<div class="bg-base-100 border-base-300 mb-6 rounded-lg border p-4 shadow-sm">
	<div class="form-control w-full">
		<span class="label-text text-sm font-semibold sm:text-base">
			{$_('product.edit.packaging_component.recycling_instructions')}
		</span>
		<p class="text-base-content/60 mb-2 text-xs">
			{$_('product.edit.packaging_component.recycling_instructions_desc')}
		</p>

		<div class="tabs tabs-box">
			{#if Object.keys(product.languages_codes ?? {}).length === 0}
				<div class="alert alert-warning text-sm sm:text-base">
					{$_('product.edit.no_languages_found')}
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
				<div class="tab-content form-control p-6">
					<label class="label text-sm sm:text-base" for={`packaging-text-${code}`}>
						{$_('product.edit.packaging_component.recycling_instructions')} ({getLanguageName(
							code
						)})
					</label>
					<textarea
						id={`packaging-text-${code}`}
						class="textarea textarea-bordered h-24 w-full"
						placeholder={$_('product.edit.packaging_component.recycling_instructions_placeholder')}
						bind:value={product[`packaging_text_${code}`]}
					></textarea>
				</div>
			{/each}
		</div>

		<div class="mt-2 space-y-1">
			<p class="text-base-content/70 text-xs">
				&rarr; {$_('product.edit.packaging_component.recycling_instructions_list')}
			</p>
			<p class="text-base-content/70 text-xs">
				&rarr; {$_('product.edit.packaging_component.recycling_instructions_specificity')}
			</p>
			<p class="text-base-content/70 text-xs">
				&rarr; {$_('product.edit.packaging_component.recycling_instructions_combination')}
			</p>
			<p class="text-xs">
				<span class="text-success font-semibold"
					>{$_('product.edit.packaging_component.recycling_instructions_examples_label')}</span
				>
				<span class="text-success"
					>{$_('product.edit.packaging_component.recycling_instructions_examples')}</span
				>
			</p>
		</div>
	</div>
</div>
