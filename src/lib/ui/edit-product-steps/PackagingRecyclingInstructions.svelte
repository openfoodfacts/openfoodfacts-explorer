<script lang="ts">
	import { _ } from '$lib/i18n';

	type Props = {
		packagingText?: string;
		lang: string;
	};

	let { packagingText = $bindable(''), lang }: Props = $props();
	let currentLang = $derived(lang || 'en');
</script>

<div class="bg-base-100 border-base-300 mb-6 rounded-lg border p-4 shadow-sm">
	<div class="form-control w-full">
		<label class="label" for="packaging_text_main">
			<span class="label-text text-sm font-semibold sm:text-base">
				{$_('product.edit.packaging_component.recycling_instructions')}
				<span class="text-base-content/50 ml-1 font-normal">({currentLang})</span>
			</span>
		</label>
		<p class="text-base-content/60 mb-2 text-xs">
			{$_('product.edit.packaging_component.recycling_instructions_desc')}
		</p>
		<textarea
			id="packaging_text_main"
			class="textarea textarea-bordered h-24 w-full"
			placeholder={$_('product.edit.packaging_component.recycling_instructions_placeholder')}
			bind:value={packagingText}
		></textarea>
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
