<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiMenu from '@iconify-svelte/mdi/menu';

	interface Props {
		tabs: readonly string[];
		activeTab?: string;
		i18nPrefix?: string;
		onTabChange?: (tab: string) => void;
	}

	let { tabs, activeTab = tabs[0], i18nPrefix = 'settings.tab', onTabChange }: Props = $props();

	function handleTabChange(tab: string) {
		if (onTabChange) {
			onTabChange(tab);
		}
	}
</script>

<div role="tablist" class="tabs tabs-bordered mb-8 hidden gap-0 md:flex">
	{#each tabs as tab (tab)}
		<input
			type="radio"
			id={`tab-${tab}`}
			name="ui-tabs"
			role="tab"
			class="tab"
			aria-label={$_(`${i18nPrefix}.${tab}`)}
			aria-controls={`tabpanel-${tab}`}
			aria-selected={activeTab === tab}
			checked={activeTab === tab}
			onchange={() => handleTabChange(tab)}
			value={tab}
		/>
	{/each}
</div>

<div class="mb-8 md:hidden">
	<div class="dropdown dropdown-bottom w-full">
		<button class="btn btn-block btn-outline gap-2" tabindex="0">
			<IconMdiMenu class="h-5 w-5" />
			{$_(`${i18nPrefix}.${activeTab}`)}
		</button>
		<ul class="dropdown-content menu bg-base-200 w-full p-2">
			{#each tabs as tab (tab)}
				<li>
					<button onclick={() => handleTabChange(tab)} class:active={activeTab === tab}>
						{$_(`${i18nPrefix}.${tab}`)}
					</button>
				</li>
			{/each}
		</ul>
	</div>
</div>
