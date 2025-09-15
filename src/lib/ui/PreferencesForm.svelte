<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from './Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import {
		personalizedSearch,
		updatePreference,
		resetToDefaults,
		getPreferenceValue,
		attributesToDefaultPreferences,
		type AttributeGroup,
		type Attribute
	} from '$lib/stores/preferencesStore';

	export type PreferencesFormProps = {
		onPreferenceChange?: (category: string, preference: string, value: string) => void;
		showClassifyToggle?: boolean;
		classifyProducts?: boolean;
		onClassifyToggle?: (value: boolean) => void;
		onClose?: () => void;
		attributeGroups?: AttributeGroup[];
	};

	let {
		onPreferenceChange = () => {},
		showClassifyToggle = true,
		classifyProducts = $personalizedSearch.classifyProductsEnabled,
		onClassifyToggle = () => {},
		onClose,
		attributeGroups = []
	}: PreferencesFormProps = $props();

	function handlePreferenceChange(category: string, preference: string, value: string) {
		updatePreference(category, preference, value);
		onPreferenceChange(category, preference, value);
	}

	function handleResetToDefaults() {
		const defaults = attributesToDefaultPreferences(attributeGroups);
		resetToDefaults(defaults);
	}

	function handleClassifyToggle() {
		personalizedSearch.update((store) => ({
			...store,
			classifyProductsEnabled: classifyProducts
		}));
		onClassifyToggle(classifyProducts);
	}

	const getSelectedValue = (category: string, id: string) =>
		getPreferenceValue($personalizedSearch.userPreferences, category, id);

	let isLoading = $derived(!attributeGroups || attributeGroups.length === 0);

	const DEFAULT_IMPORTANCE_VALUES = ['mandatory', 'very_important', 'important', 'not_important'];

	const validGroups = $derived(
		attributeGroups.filter((group) => group.id && group.name && group.attributes)
	);

	const createOptionObjects = (values: string[]) =>
		values.map((value) => ({ value, label: $_(`preferences.options.${value}`) || value }));

	const processAttribute = (attribute: Attribute, groupId: string) => {
		const attributeValues = attribute.values?.length ? attribute.values : DEFAULT_IMPORTANCE_VALUES;
		return {
			id: attribute.id!,
			label: attribute.setting_name || attribute.name,
			iconImg: attribute.icon_url,
			options: createOptionObjects(attributeValues),
			selectedValue: getSelectedValue(groupId, attribute.id!),
			description: attribute.setting_note
		};
	};

	const sections = $derived.by(() =>
		validGroups.map((group) => ({
			id: group.id!,
			title: group.name!,
			options: group.attributes!.filter((a) => a.id).map((a) => processAttribute(a, group.id!)),
			showWarning: group.id === 'allergens',
			warningText: group.warning
		}))
	);
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
					onclick={handleResetToDefaults}
					disabled={isLoading}
				>
					{$_('preferences.use_default')}
				</button>
				<span class="ml-2 text-sm">{$_('preferences.default_description')}</span>
			</div>
		{/if}

		<!-- Preference Sections -->
		{#if isLoading}
			<div class="flex items-center justify-center py-8">
				<span class="loading loading-spinner loading-lg"></span>
				<span class="ml-2">Loading preferences...</span>
			</div>
		{:else}
			{#each sections as section (section.id)}
				<PreferenceSection
					title={section.title || ''}
					options={section.options || []}
					onChange={handlePreferenceChange}
					category={section.id || ''}
					showWarning={section.showWarning || false}
					warningText={section.warningText || ''}
				/>
			{/each}
		{/if}

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
