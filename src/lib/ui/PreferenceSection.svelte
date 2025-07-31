<script lang="ts">
	import { _ } from '$lib/i18n';
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	type PreferenceOption = {
		id: string;
		label: string;
		icon: string;
		iconImg?: string;
		iconColor: string;
		description?: string;
		options: {
			value: string;
			label: string;
		}[];
	};

	type PreferenceSectionProps = {
		title: string;
		options: PreferenceOption[];
		expanded: boolean;
		onToggle: () => void;
		getValue: (id: string) => string;
		onChange: (category: string, preference: string, value: string) => void;
		category: string;
		showWarning?: boolean;
		warningText?: string;
	};

	let {
		title,
		options,
		expanded,
		onToggle,
		getValue,
		onChange,
		category,
		showWarning = false,
		warningText = ''
	}: PreferenceSectionProps = $props();
</script>

<div class="collapse bg-base-200 rounded-box" class:collapse-open={expanded}>
	<div 
		class="collapse-title text-lg font-medium flex items-center gap-2 cursor-pointer" 
		role="button"
		tabindex="0"
		onclick={onToggle}
		onkeydown={(e) => { 
			if (e.key === 'Enter' || e.key === ' ') { 
				e.preventDefault(); 
				onToggle(); 
			} 
		}}
		aria-expanded={expanded}
	>
		<span 
			class="icon-[mdi--chevron-down] transition-transform duration-200" 
			class:rotate-180={!expanded}
		></span>
		{title}
	</div>
	
	<div class="collapse-content space-y-4">
		{#if showWarning && warningText}
			<div class="bg-orange-100 dark:bg-orange-900/30 border border-orange-300 dark:border-orange-700 rounded-lg p-3 mb-4">
				<p class="text-sm text-orange-800 dark:text-orange-200">
					{warningText}
				</p>
			</div>
		{/if}
		
		{#each options as option}
			<div class="flex items-start gap-3 p-2">
				<!-- Icon -->
				<div class="flex-shrink-0 mt-1">
					{#if option.iconImg}
						<img 
							src={KP_ATTRIBUTE_IMG(option.iconImg)} 
							alt={option.label}
							class="md:h-10 md:w-10 h-8 w-8 object-contain"
						/>
					{/if}
				</div>

				<!-- Label and Options -->
				<div class="flex-1">
					<h4 class="text-sm font-medium text-base-content mb-2">{option.label}</h4>
					<div class="flex flex-wrap gap-4">
						{#each option.options as radioOption}
							<label class="flex items-center gap-2 cursor-pointer">
								<input
									type="radio"
									name={option.id}
									value={radioOption.value}
									class="radio radio-sm radio-primary"
									checked={getValue(option.id) === radioOption.value}
									onchange={() => onChange(category, option.id, radioOption.value)}
								/>
								<span class="text-sm text-base-content/80">{radioOption.label}</span>
							</label>
						{/each}
					</div>
					{#if option.description}
						<p class="text-xs text-base-content/60 mt-1">{option.description}</p>
					{/if}
				</div>
			</div>
		{/each}
	</div>
</div>
