<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from '../Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import {
		personalizedSearch,
		updateAttributePreference,
		type AttributeGroup
	} from '$lib/stores/preferencesStore';
	import { onMount } from 'svelte';

	export type PreferencesFormProps = {
		groups: AttributeGroup[] | Promise<AttributeGroup[]>;

		onPreferenceChange?: (category: string, preference: string, value: string) => void;
		onClose?: () => void;
	};

	let { groups, onPreferenceChange, onClose }: PreferencesFormProps = $props();

	function handlePreferenceChange(category: string, preference: string, value: string) {
		updateAttributePreference(category, preference, value);
		onPreferenceChange?.(category, preference, value);
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
