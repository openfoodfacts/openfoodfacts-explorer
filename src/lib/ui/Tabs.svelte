<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiMenu from '@iconify-svelte/mdi/menu';

	interface Tab {
		label: string;
		i18nKey: string;
	}

	interface Props {
		tabs: readonly [Tab, ...Tab[]];
		activeTab?: string;
		onTabChange?: (tab: string) => void;
		groupName: string;
	}

	let { tabs, activeTab = tabs[0].label, onTabChange, groupName }: Props = $props();

	function handleTabChange(tab: string) {
		onTabChange?.(tab);
	}
</script>

<div role="tablist" class="tabs tabs-bordered mb-8 hidden gap-0 md:flex">
	{#each tabs as tab (tab.label)}
		<input
			type="radio"
			id={`tab-${tab.label}`}
			name={groupName}
			role="tab"
			class="tab"
			aria-label={$_(`${tab.i18nKey}`)}
			aria-controls={`tabpanel-${tab.label}`}
			aria-selected={activeTab === tab.label}
			checked={activeTab === tab.label}
			onchange={() => handleTabChange(tab.label)}
			value={tab.label}
		/>
	{/each}
</div>

<div class="mb-8 md:hidden">
	<div class="dropdown dropdown-bottom w-full">
		<button type="button" class="btn btn-block btn-outline gap-2" tabindex="0">
			<IconMdiMenu class="h-5 w-5" />
			{$_(`${tabs.find((t) => t.label === activeTab)?.i18nKey || ''}`)}
		</button>
		<ul class="dropdown-content menu bg-base-200 w-full p-2">
			{#each tabs as tab (tab.label)}
				<li>
					<button
						type="button"
						onclick={() => handleTabChange(tab.label)}
						class:active={activeTab === tab.label}
					>
						{$_(`${tab.i18nKey}`)}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
