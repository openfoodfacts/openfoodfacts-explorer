<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from '../Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import {
		personalizedSearch,
		updateAttributePreference,
		type AttributeGroup,
		type UserPreference
	} from '$lib/stores/preferencesStore';

	export type PreferencesFormProps = {
		groups: AttributeGroup[] | Promise<AttributeGroup[]>;

		onPreferenceChange?: (preference: UserPreference) => void;
		onClose?: () => void;
	};

	let { groups, onPreferenceChange, onClose }: PreferencesFormProps = $props();

	function handlePreferenceChange(preference: UserPreference) {
		updateAttributePreference(preference);
		onPreferenceChange?.(preference);
	}

	$effect(() => {
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
			{#each groups as group (group.id)}
				<PreferenceSection {group} onChange={handlePreferenceChange} />
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
