<script lang="ts">
	import { _ } from '$lib/i18n';
	import { personalizedSearch } from '$lib/stores/preferencesStore';
</script>

<div class="form-control">
	<label
		class="label border-base-200/40 dark:bg-base-300/50 w-full cursor-pointer justify-start gap-4 rounded-2xl border bg-white/90 px-6 py-4 shadow-lg backdrop-blur-sm"
	>
		<input
			type="checkbox"
			class="toggle toggle-primary toggle-lg"
			bind:checked={$personalizedSearch.classifyProductsEnabled}
		/>
		<div class="flex flex-col gap-1">
			<span class="label-text text-base font-medium">
				{$_('preferences.classify_products', {
					default: 'Enable Personalized Product Classification'
				})}
			</span>
			<span class="text-base-content/60 text-xs">
				{$_('preferences.classify_products_desc', {
					default: 'Enable personalized product classification based on your preferences.'
				})}
			</span>
		</div>
	</label>
</div>
