<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiMenu from '@iconify-svelte/mdi/menu';
	import type { Component, ComponentType } from 'svelte';

	type Tab = {
		label: string;
		i18nKey: string;
		icon?: Component | ComponentType;
	};

	type Props = {
		tabs: readonly [Tab, ...Tab[]];
		activeTab?: string;
		onTabChange?: (tab: string) => void;
		groupName: string;
	};

	let { tabs, activeTab = tabs[0].label, onTabChange, groupName }: Props = $props();

	let currentTab = $derived(tabs.find((t) => t.label === activeTab));

	function handleTabChange(tab: string) {
		onTabChange?.(tab);
	}
</script>

<div role="tablist" class="tabs tabs-lift mb-8 hidden gap-0 md:flex">
	{#each tabs as tab (tab.label)}
		<label
			class="tab min-w-max gap-2 px-6"
			class:tab-active={activeTab === tab.label}
			for={`tab-${tab.label}`}
		>
			<input
				type="radio"
				id={`tab-${tab.label}`}
				name={groupName}
				role="tab"
				class="hidden"
				autocomplete="off"
				aria-controls={`tabpanel-${tab.label}`}
				aria-selected={activeTab === tab.label}
				checked={activeTab === tab.label}
				onchange={() => handleTabChange(tab.label)}
				value={tab.label}
			/>
			{#if tab.icon}
				<tab.icon class="h-5 w-5" />
			{/if}
			<span>{$_(`${tab.i18nKey}`)}</span>
		</label>
	{/each}
</div>

<div class="mb-8 md:hidden">
	<div class="dropdown dropdown-bottom w-full">
		<button type="button" class="btn btn-block btn-outline gap-2" tabindex="0">
			{#if currentTab?.icon}
				<currentTab.icon class="h-5 w-5" />
			{/if}
			<IconMdiMenu class="h-5 w-5" />
			{$_(`${currentTab?.i18nKey || ''}`)}
		</button>
		<ul class="dropdown-content menu bg-base-200 z-1 w-full p-2 shadow-lg">
			{#each tabs as tab (tab.label)}
				<li>
					<button
						type="button"
						onclick={() => handleTabChange(tab.label)}
						class:active={activeTab === tab.label}
						class="flex items-center gap-2"
					>
						{#if tab.icon}
							<tab.icon class="h-5 w-5" />
						{/if}
						{$_(`${tab.i18nKey}`)}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
