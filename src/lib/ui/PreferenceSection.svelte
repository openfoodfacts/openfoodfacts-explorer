<script lang="ts">
	import { _ } from '$lib/i18n';

	type PreferenceOption = {
		id: string;
		label: string;
		icon: string;
		iconImg?: string;
		description?: string;
		options: {
			value: string;
			label: string;
		}[];
	};

	type PreferenceSectionProps = {
		title: string;
		options: PreferenceOption[];
		getValue: (id: string) => string;
		onChange: (category: string, preference: string, value: string) => void;
		category: string;
		showWarning?: boolean;
		warningText?: string;
	};

	let {
		title,
		options,
		getValue,
		onChange,
		category,
		showWarning = false,
		warningText = ''
	}: PreferenceSectionProps = $props();
</script>

<div class="bg-base-200 rounded-box collapse collapse-arrow">
	<input type="checkbox" checked />
	<div class="collapse-title text-lg font-medium">
		{title}
	</div>
	<div class="collapse-content space-y-4">
		{#if showWarning && warningText}
			<div
				class="mb-4 rounded-lg border border-orange-300 bg-orange-100 p-3 dark:border-orange-700 dark:bg-orange-900/30"
			>
				<p class="text-sm text-orange-800 dark:text-orange-200">
					{warningText}
				</p>
			</div>
		{/if}

		{#each options as option}
			<div class="flex items-start gap-3 p-2">
				<!-- Icon -->
				<div class="mt-1 flex-shrink-0">
					{#if option.iconImg}
						<img
							src={option.iconImg}
							alt={option.label}
							class="h-8 w-8 object-contain md:h-10 md:w-10"
						/>
					{/if}
				</div>

				<!-- Label and Options -->
				<div class="flex-1">
					<h4 class="text-base-content mb-2 text-sm font-medium">{option.label}</h4>
					<div class="flex flex-wrap gap-4">
						{#each option.options as radioOption}
							<label class="flex cursor-pointer items-center gap-2">
								<input
									type="radio"
									name={option.id}
									value={radioOption.value}
									class="radio radio-sm radio-primary"
									checked={getValue(option.id) === radioOption.value}
									onchange={() => onChange(category, option.id, radioOption.value)}
								/>
								<span class="text-base-content/80 text-sm">{radioOption.label}</span>
							</label>
						{/each}
					</div>
					{#if option.description}
						<p class="text-base-content/60 mt-1 text-xs">{option.description}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
