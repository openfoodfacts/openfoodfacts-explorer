<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from './Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import {
		userPreferences,
		attributeGroups,
		updatePreference,
		resetToDefaults,
		classifyProductsEnabled,
		getPreferenceValue
	} from '$lib/stores/preferencesStore';

	// Type for the API response which has optional fields
	type ApiAttributeGroup = {
		id?: string;
		name?: string;
		attributes?: {
			id?: string;
			name?: string;
			icon_url?: string;
			setting_name?: string;
			setting_note?: string;
			default?: string;
			panel_id?: string;
			values?: string[];
		}[];
		warning?: string;
	};

	type PreferencesFormProps = {
		onPreferenceChange?: (category: string, preference: string, value: string) => void;
		showClassifyToggle?: boolean;
		classifyProducts?: boolean;
		onClassifyToggle?: (value: boolean) => void;
		onClose?: () => void;
	};

	let {
		onPreferenceChange = () => {},
		showClassifyToggle = true,
		classifyProducts = $classifyProductsEnabled,
		onClassifyToggle = () => {},
		onClose = () => {}
	}: PreferencesFormProps = $props();

	function handlePreferenceChange(category: string, preference: string, value: string) {
		updatePreference(category, preference, value);
		onPreferenceChange(category, preference, value);
	}

	function handleResetToDefaults() {
		resetToDefaults(onPreferenceChange);
	}

	function handleClassifyToggle() {
		classifyProductsEnabled.set(classifyProducts);
		onClassifyToggle(classifyProducts);
	}

	// Reactive function to get values from the store
	const getValueFromCategory = (category: string, id: string) => {
		return getPreferenceValue($userPreferences, category, id);
	};

	let resolvedAttributeGroups: ApiAttributeGroup[] = $state([]);
	let isLoading = $state(true);

	$effect(() => {
		attributeGroups
			.then((groups) => {
				resolvedAttributeGroups = groups || [];
				isLoading = false;
			})
			.catch((error) => {
				console.error('Failed to load attribute groups:', error);
				resolvedAttributeGroups = [];
				isLoading = false;
			});
	});

	// Dynamic sections based on resolved attribute groups
	const sections = $derived(
		resolvedAttributeGroups.map((group) => ({
			id: group.id || '',
			title: group.name || '',
			options: (group.attributes || []).map((attribute) => ({
				id: attribute.id || '',
				label: attribute.setting_name || attribute.name || '',
				icon: attribute.id || '',
				iconImg: attribute.icon_url,
				options: (attribute.values || []).map((value) => ({
					value,
					label: $_(`preferences.options.${value}`) || value
				})),
				description: 'setting_note' in attribute ? attribute.setting_note : undefined
			})),
			showWarning: group.id === 'allergens',
			warningText: group.warning || ''
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
				<button class="btn md:btn-sm btn-primary btn-xs" onclick={handleResetToDefaults}>
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
					title={section.title}
					options={section.options}
					getValue={(id) => getValueFromCategory(section.id, id)}
					onChange={handlePreferenceChange}
					category={section.id}
					showWarning={section.showWarning}
					warningText={section.warningText}
				/>
			{/each}
		{/if}

		<!-- Close Button -->
		<div class="border-base-300 flex justify-end border-t pt-4">
			<button class="btn btn-primary" onclick={onClose}>
				{$_('preferences.close')}
			</button>
		</div>
	</div>
</Card>
