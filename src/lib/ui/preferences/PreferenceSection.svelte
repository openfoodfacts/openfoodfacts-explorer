<script lang="ts">
	import { _ } from '$lib/i18n';
	import {
		getPreferenceValue,
		personalizedSearch,
		type Attribute
	} from '$lib/stores/preferencesStore';

	type Props = {
		title: string;
		options: Attribute[];
		groupId: string;
		onChange: (category: string, preference: string, value: string) => void;
		warningText?: string;
	};

	let { title, options: attributes, onChange, groupId, warningText }: Props = $props();

	const DEFAULT_IMPORTANCE_VALUES = ['mandatory', 'very_important', 'important', 'not_important'];
</script>

<div class="bg-base-200 rounded-box collapse-arrow collapse">
	<input type="checkbox" checked />
	<div class="collapse-title text-lg font-medium">
		{title}
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
			{@const selectedValue = getPreferenceValue(
				$personalizedSearch.userPreferences,
				groupId,
				attribute.id!
			)}

			<div class="flex items-start gap-3 p-2">
				<!-- Icon -->
				<div class="mt-1 flex-shrink-0">
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
						{#each attribute.values || DEFAULT_IMPORTANCE_VALUES as value (value)}
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
					</div>
					{#if attribute.description}
						<p class="text-base-content/60 mt-1 text-xs">{attribute.description}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
