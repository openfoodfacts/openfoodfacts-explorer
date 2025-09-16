<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from './Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import {
		personalizedSearch,
		updatePreference,
		resetToDefaults,
		attributesToDefaultPreferences,
		type AttributeGroup
	} from '$lib/stores/preferencesStore';
	import { onMount } from 'svelte';

	export type PreferencesFormProps = {
		showClassifyToggle?: boolean;
		classifyProducts?: boolean;
		groups: AttributeGroup[] | Promise<AttributeGroup[]>;

		onPreferenceChange?: (category: string, preference: string, value: string) => void;
		onClassifyToggle?: (value: boolean) => void;
		onClose?: () => void;
	};

	let {
		groups,
		showClassifyToggle = true,
		classifyProducts = $personalizedSearch.classifyProductsEnabled,
		onPreferenceChange,
		onClassifyToggle,
		onClose
	}: PreferencesFormProps = $props();

	function handlePreferenceChange(category: string, preference: string, value: string) {
		updatePreference(category, preference, value);
		onPreferenceChange?.(category, preference, value);
	}

	function handleResetToDefaults(groups: AttributeGroup[]) {
		const defaults = attributesToDefaultPreferences(groups);
		resetToDefaults(defaults);
	}

	function handleClassifyToggle() {
		personalizedSearch.update((store) => ({
			...store,
			classifyProductsEnabled: classifyProducts
		}));
		onClassifyToggle?.(classifyProducts);
	}

	onMount(() => {
		const unsubscribe = personalizedSearch.subscribe((value) => {
			console.debug('Personalized Search Store Updated:', value);
		});

		return () => {
			unsubscribe();
		};
	});
</script>

<Card>
	<div class="space-y-6">
		<!-- Header -->
		<div class="mb-6">
			<h2 class="text-base-content mb-2 text-xl font-semibold">{$_('preferences.title')}</h2>
			<p class="text-base-content/70 text-sm">
				{$_('preferences.subtitle')}
			</p>
		</div>

		<!-- Preference Sections -->
		{#await groups}
			<div class="flex items-center justify-center py-8">
				<span class="loading loading-spinner loading-lg"></span>
				<span class="ml-2">Loading preferences...</span>
			</div>
		{:then groups}
			<!-- Classify Products Toggle -->
			{#if showClassifyToggle}
				<div class="form-control">
					<label class="label cursor-pointer justify-start gap-3">
						<input
							type="checkbox"
							class="toggle toggle-primary"
							bind:checked={classifyProducts}
							onchange={handleClassifyToggle}
						/>
						<span class="label-text text-sm text-wrap">{$_('preferences.classify_products')}</span>
					</label>
				</div>

				<div class="mb-4 rounded-lg bg-orange-50 p-3 dark:bg-orange-900/20">
					<button
						class="btn md:btn-sm btn-primary btn-xs"
						onclick={() => handleResetToDefaults(groups)}
					>
						{$_('preferences.use_default')}
					</button>
					<span class="ml-2 text-sm">{$_('preferences.default_description')}</span>
				</div>
			{/if}
			{#each groups as group (group.id)}
				<PreferenceSection
					title={group.name || ''}
					groupId={group.id}
					options={group.attributes ?? []}
					onChange={handlePreferenceChange}
					warningText={group.warning}
				/>
			{/each}
		{/await}

		<!-- Close Button -->
		{#if onClose}
			<div class="border-base-300 flex justify-end border-t pt-4">
				<button class="btn btn-primary" onclick={onClose}>
					{$_('preferences.close')}
				</button>
			</div>
		{/if}
	</div>
</Card>
