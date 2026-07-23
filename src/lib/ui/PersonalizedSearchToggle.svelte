<script lang="ts">
	import { _ } from '$lib/i18n';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
</script>

<div class="form-control">
	<label
		class="label w-full cursor-pointer justify-start gap-4 rounded-2xl border border-base-200/40 bg-white/90 px-6 py-4 shadow-lg backdrop-blur-sm dark:bg-base-300/50"
	>
		<input
			type="checkbox"
			class="toggle toggle-lg toggle-primary"
			bind:checked={$personalizedSearch.classifyProductsEnabled}
		/>
		<div class="flex min-w-0 flex-1 flex-col gap-1">
			<span class="label-text text-base font-medium break-words whitespace-normal">
				{$_('preferences.classify_products', {
					default: 'Enable Personalized Product Classification'
				})}
			</span>
			<span class="text-xs break-words whitespace-normal text-base-content/60">
				{$_('preferences.classify_products_desc', {
					default: 'Enable personalized product classification based on your preferences.'
				})}
			</span>
		</div>
	</label>
</div>
