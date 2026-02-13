<script lang="ts">
	import { _ } from '$lib/i18n';
	import {
		getAttributePreferenceValue,
		personalizedSearch,
		type AttributeGroup,
		type AttributeParameters
	} from '$lib/stores/preferencesStore';
	import Tags from '../../../routes/products/[barcode]/edit/Tags.svelte';

	type Props = {
		group: AttributeGroup;
		onChange: (category: string, preference: string, value: string) => void;
	};

	let { group, onChange }: Props = $props();

	let { name: groupName, id: groupId, attributes = [], warning: warningText } = $derived(group);
</script>

{#snippet showParams(params: AttributeParameters)}
	{#if params.type === 'tags'}
		<Tags />
	{:else}
		<!-- Fallback for unknown parameter types -->
		<div class="text-sm text-red-500">Unknown parameter type: {params.type}</div>
	{/if}
{/snippet}

<div class="bg-base-200 rounded-box collapse-arrow collapse">
	<input type="checkbox" checked />
	<div class="collapse-title text-lg font-medium">
		{groupName || groupId || 'Unnamed Group'}
	</div>
	<div class="collapse-content space-y-4">
		{#if warningText}
			<div
				class="mb-4 rounded-lg border border-orange-300 bg-orange-100 p-3 dark:border-orange-700 dark:bg-orange-900/30"
			>
				<p class="text-sm text-orange-800 dark:text-orange-200">
					{warningText}
				</p>
			</div>
		{/if}

		{#each attributes as attribute (attribute.id)}
			<div class="flex items-start gap-3 p-2">
				<!-- Icon -->
				<div class="mt-1 shrink-0">
					{#if attribute.icon_url}
						<img
							src={attribute.icon_url}
							alt={attribute.setting_name || attribute.name}
							class="h-8 w-8 object-contain md:h-10 md:w-10"
						/>
					{/if}
				</div>

				<!-- Label and Options -->
				<div class="flex-1">
					<h4 class="text-base-content mb-2 text-sm font-medium">
						{attribute.setting_name || attribute.name || attribute.id || 'Unknown'}
					</h4>
					<div class="flex flex-wrap gap-4">
						<!-- If it has `parameters`, use them first, otherwise fall back to `values -->
						{#if attribute.parameters}
							{#each attribute.parameters as param (param.id)}
								{@render showParams(param)}
							{/each}
						{:else if attribute.values}
							{@const selectedValue = getAttributePreferenceValue(
								$personalizedSearch.userPreferences,
								groupId,
								attribute.id!
							)}
							{#each attribute.values as value (value)}
								<label class="flex cursor-pointer items-center gap-2">
									<input
										type="radio"
										name={`${groupId}.${attribute.id}`}
										{value}
										class="radio radio-sm radio-primary"
										checked={selectedValue === value}
										onchange={() => onChange(groupId, attribute.id, value)}
									/>
									<span class="text-base-content/80 text-sm">
										{$_(`preferences.options.${value}`) || value}
									</span>
								</label>
							{/each}
						{/if}
					</div>
					{#if attribute.description}
						<p class="text-base-content/60 mt-1 text-xs">{attribute.description}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
