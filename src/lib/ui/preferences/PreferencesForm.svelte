<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import Card from '../Card.svelte';
	import PreferenceSection from './PreferenceSection.svelte';
	import {
		attributesToDefaultPreferences,
		personalizedSearch,
		resetToDefaults,
		updateAttributePreference,
		type AttributeGroup,
		type UserPreference
	} from '#lib/stores/preferencesStore.js';
	import { onMount } from 'svelte';

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

	// Groups are open unless listed here, so a group the server adds later starts open.
	let collapsed = $state<Record<string, boolean>>({});
	let resetDialog: HTMLDialogElement | undefined = $state();

	function collapseAll(groups: AttributeGroup[]) {
		collapsed = Object.fromEntries(groups.map((group) => [group.id, true]));
	}

	function confirmReset(groups: AttributeGroup[]) {
		resetToDefaults(attributesToDefaultPreferences(groups));
		resetDialog?.close();
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
			<h2 class="mb-2 text-xl font-semibold text-base-content">{$_('preferences.title')}</h2>
			<p class="text-sm text-base-content/70">
				{$_('preferences.subtitle')}
			</p>
		</div>

		<!-- Preference Sections -->
		{#await groups}
			<div class="flex items-center justify-center py-8">
				<span class="loading loading-lg loading-spinner"></span>
				<span class="ml-2">
					{$_('preferences.loading', { default: 'Loading preferences…' })}
				</span>
			</div>
		{:then groups}
			<div class="flex flex-wrap items-center gap-2">
				<button type="button" class="btn btn-ghost btn-sm" onclick={() => (collapsed = {})}>
					{$_('preferences.expand_all', { default: 'Expand all' })}
				</button>
				<button type="button" class="btn btn-ghost btn-sm" onclick={() => collapseAll(groups)}>
					{$_('preferences.collapse_all', { default: 'Collapse all' })}
				</button>
				<button
					type="button"
					class="btn ml-auto btn-outline btn-sm"
					onclick={() => resetDialog?.showModal()}
				>
					{$_('preferences.use_default', { default: 'Use default preferences' })}
				</button>
			</div>

			{#each groups as group (group.id)}
				<PreferenceSection
					{group}
					open={!collapsed[group.id]}
					onChange={handlePreferenceChange}
					onToggle={(open) => (collapsed[group.id] = !open)}
				/>
			{/each}

			<dialog
				bind:this={resetDialog}
				class="modal modal-bottom sm:modal-middle"
				aria-labelledby="reset-preferences-title"
			>
				<div class="modal-box">
					<h3 id="reset-preferences-title" class="text-lg font-bold">
						{$_('preferences.reset_confirm_title', { default: 'Use default preferences?' })}
					</h3>
					<p class="mt-2 text-sm text-base-content/75">
						{$_('preferences.reset_confirm_body', {
							default: 'Your current choices will be replaced with the default preferences.'
						})}
					</p>
					<div class="modal-action">
						<button type="button" class="btn btn-outline" onclick={() => resetDialog?.close()}>
							{$_('common.cancel', { default: 'Cancel' })}
						</button>
						<button type="button" class="btn btn-primary" onclick={() => confirmReset(groups)}>
							{$_('preferences.reset_confirm_action', { default: 'Use defaults' })}
						</button>
					</div>
				</div>
				<form method="dialog" class="modal-backdrop">
					<button>{$_('preferences.close')}</button>
				</form>
			</dialog>
		{/await}

		<!-- Close Button -->
		{#if onClose}
			<div class="flex justify-end border-t border-base-300 pt-4">
				<button class="btn btn-primary" onclick={onClose}>
					{$_('preferences.close')}
				</button>
			</div>
		{/if}
	</div>
</Card>
