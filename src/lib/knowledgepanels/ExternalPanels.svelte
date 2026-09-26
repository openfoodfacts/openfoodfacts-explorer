<script lang="ts">
	import { _ } from '$lib/i18n';
	import type { ComponentType } from 'svelte';
	import type {
		ExternalKnowledgePanelResult,
		ExternalKnowledgePanelRequest,
		ExternalSourceMatchReason
	} from '$lib/api/externalSources';
	import IconMdiAccountCheck from '@iconify-svelte/mdi/account-check';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiEarth from '@iconify-svelte/mdi/earth';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';
	import IconMdiPackageVariantClosed from '@iconify-svelte/mdi/package-variant-closed';
	import IconMdiShieldAccount from '@iconify-svelte/mdi/shield-account';
	import IconMdiTagOutline from '@iconify-svelte/mdi/tag-outline';
	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import Panels from './Panels.svelte';

	type Props = {
		requests: ExternalKnowledgePanelRequest[];
	};

	let { requests }: Props = $props();
	let expandedSources = $state<Record<string, boolean>>({});

	type MatchReasonMetadata = {
		key: string;
		fallback: string;
		icon: ComponentType;
	};

	const matchReasonMetadata: Record<ExternalSourceMatchReason, MatchReasonMetadata> = {
		category: {
			key: 'product.external_sources.reason_category',
			fallback: 'Category match',
			icon: IconMdiTagOutline
		},
		country: {
			key: 'product.external_sources.reason_country',
			fallback: 'Country match',
			icon: IconMdiEarth
		},
		language: {
			key: 'product.external_sources.reason_language',
			fallback: 'Language match',
			icon: IconMdiTranslate
		},
		product_type: {
			key: 'product.external_sources.reason_product_type',
			fallback: 'Product type match',
			icon: IconMdiPackageVariantClosed
		},
		public: {
			key: 'product.external_sources.reason_public',
			fallback: 'Public source',
			icon: IconMdiEarth
		},
		moderator: {
			key: 'product.external_sources.reason_moderator',
			fallback: 'Moderator access',
			icon: IconMdiShieldAccount
		},
		account: {
			key: 'product.external_sources.reason_account',
			fallback: 'Account access',
			icon: IconMdiAccountCheck
		}
	};

	function isExpanded(sourceId: string) {
		return expandedSources[sourceId] === true;
	}

	function toggleSource(sourceId: string) {
		expandedSources[sourceId] = !isExpanded(sourceId);
	}
</script>

{#snippet sourceCard(
	request: ExternalKnowledgePanelRequest,
	state: 'loading' | 'ready' | 'error',
	panels: ExternalKnowledgePanelResult | null
)}
	{@const source = request.source}
	{@const panelId = `external-source-panel-${encodeURIComponent(source.id)}`}
	<div
		class="overflow-hidden rounded-box border border-base-300 bg-base-100 shadow-md dark:bg-base-200"
	>
		<header class="border-b border-base-300 bg-base-200">
			<button
				type="button"
				class="flex w-full cursor-pointer items-start gap-4 p-4 text-left hover:bg-base-300/50 sm:p-6"
				aria-expanded={isExpanded(source.id)}
				aria-controls={panelId}
				onclick={() => toggleSource(source.id)}
			>
				{#if source.icon_url}
					<div
						class="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-base-100 p-2"
					>
						<img class="h-full w-full object-contain" src={source.icon_url} alt="" />
					</div>
				{/if}
				<div class="min-w-0 grow">
					<p class="text-xs font-semibold tracking-widest text-secondary uppercase">
						{$_('product.external_sources.source_label', { default: 'External source' })}
					</p>
					<h3 class="text-2xl font-bold">{source.name}</h3>
					{#if source.provider_name && source.provider_name !== source.name}
						<p class="text-sm text-base-content/70">{source.provider_name}</p>
					{/if}
					{#if source.description}
						<p class="mt-2">{source.description}</p>
					{/if}
					{#if request.matchReasons?.length}
						<div class="mt-3 flex flex-wrap gap-2">
							{#each request.matchReasons as reason (reason)}
								{@const metadata = matchReasonMetadata[reason]}
								{@const reasonLabel = $_(metadata.key, { default: metadata.fallback })}
								<span
									class="badge gap-1 border-base-300 bg-base-100/70 badge-sm text-base-content/70"
									title={reasonLabel}
								>
									<metadata.icon class="h-3.5 w-3.5" aria-hidden="true" />
									<span>{reasonLabel}</span>
								</span>
							{/each}
						</div>
					{/if}
				</div>
				{#if state === 'loading'}
					<span class="loading mt-1 loading-sm shrink-0 loading-spinner"></span>
				{:else}
					<IconMdiChevronDown
						class={[
							'mt-1 h-6 w-6 shrink-0 transition-transform',
							isExpanded(source.id) && 'rotate-180'
						]}
						aria-hidden="true"
					/>
				{/if}
			</button>
		</header>

		<div id={panelId} class="p-4 sm:p-6" hidden={!isExpanded(source.id)}>
			{#if isExpanded(source.id)}
				{#if state === 'loading'}
					<div class="space-y-3 py-2" aria-busy="true">
						<div class="h-4 w-1/3 skeleton"></div>
						<div class="h-4 w-full skeleton"></div>
						<div class="h-4 w-5/6 skeleton"></div>
					</div>
				{:else if state === 'error'}
					<div class="alert alert-warning">
						<IconMdiEarth class="h-6 w-6 shrink-0" />
						<span>
							{$_('product.external_sources.error', {
								default: 'External sources could not be loaded.'
							})}
						</span>
					</div>
				{:else if panels != null}
					<Panels panels={panels.knowledgePanels} roots={['root']} summary={false} />
					{#if source.provider_website || source.privacy_policy_url}
						<div class="mt-6 flex flex-wrap gap-2 border-t border-base-300 pt-4">
							{#if source.provider_website}
								<a
									href={source.provider_website}
									target="_blank"
									rel="noopener"
									class="badge gap-1 border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
								>
									{$_('product.external_sources.provider_website', {
										default: 'Provider website'
									})}
									<IconMdiOpenInNew class="h-3.5 w-3.5" aria-hidden="true" />
								</a>
							{/if}
							{#if source.privacy_policy_url}
								<a
									href={source.privacy_policy_url}
									target="_blank"
									rel="noopener"
									class="badge gap-1 border-base-300 bg-base-100 text-base-content/70 hover:bg-base-200"
								>
									{$_('product.external_sources.privacy_policy', {
										default: 'Privacy policy'
									})}
									<IconMdiOpenInNew class="h-3.5 w-3.5" aria-hidden="true" />
								</a>
							{/if}
						</div>
					{/if}
				{/if}
			{/if}
		</div>
	</div>
{/snippet}

<section aria-labelledby="external-sources-title">
	<h2 id="external-sources-title" class="text-3xl font-bold">
		{$_('product.external_sources.title', { default: 'External sources' })}
	</h2>
	<p class="mt-2 text-base-content/70">
		{$_('product.external_sources.description', {
			default: 'Additional information provided by organizations outside Open Food Facts.'
		})}
	</p>

	<div class="mt-6 space-y-6">
		{#each requests as request (request.source.id)}
			{#await request.promise}
				{@render sourceCard(request, 'loading', null)}
			{:then panels}
				{#if panels != null}
					{@render sourceCard(request, 'ready', panels)}
				{/if}
			{:catch}
				{@render sourceCard(request, 'error', null)}
			{/await}
		{/each}
	</div>
</section>
