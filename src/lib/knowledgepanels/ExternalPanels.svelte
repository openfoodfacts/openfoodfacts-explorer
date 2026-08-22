<script lang="ts">
	import { _ } from '$lib/i18n';
	import type {
		ExternalKnowledgePanelRequest,
		ExternalSourceMatchReason
	} from '$lib/api/externalSources';
	import IconMdiAccountCheck from '@iconify-svelte/mdi/account-check';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiEarth from '@iconify-svelte/mdi/earth';
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
	type RequestStatus = 'pending' | 'fulfilled' | 'empty' | 'rejected';
	let requestStatuses = $state<Record<string, RequestStatus>>({});

	$effect(() => {
		let cancelled = false;
		requestStatuses = Object.fromEntries(
			requests.map((request) => [request.source.id, 'pending' as RequestStatus])
		);

		for (const request of requests) {
			request.promise.then(
				(panel) => {
					if (!cancelled) {
						requestStatuses = {
							...requestStatuses,
							[request.source.id]: panel == null ? 'empty' : 'fulfilled'
						};
					}
				},
				() => {
					if (!cancelled) {
						requestStatuses = {
							...requestStatuses,
							[request.source.id]: 'rejected'
						};
					}
				}
			);
		}

		return () => {
			cancelled = true;
		};
	});

	function isExpanded(sourceId: string) {
		return expandedSources[sourceId] === true;
	}

	function toggleSource(sourceId: string) {
		expandedSources[sourceId] = !isExpanded(sourceId);
	}

	function reasonLabel(reason: ExternalSourceMatchReason): string {
		const labels: Record<ExternalSourceMatchReason, string> = {
			category: $_('product.external_sources.reason_category', { default: 'Category match' }),
			country: $_('product.external_sources.reason_country', { default: 'Country match' }),
			language: $_('product.external_sources.reason_language', { default: 'Language match' }),
			product_type: $_('product.external_sources.reason_product_type', {
				default: 'Product type match'
			}),
			public: $_('product.external_sources.reason_public', { default: 'Public source' }),
			moderator: $_('product.external_sources.reason_moderator', {
				default: 'Moderator access'
			}),
			account: $_('product.external_sources.reason_account', { default: 'Account access' })
		};
		return labels[reason];
	}
</script>

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
			{@const source = request.source}
			{@const panelId = `external-source-panel-${source.id}`}
			{#if requestStatuses[source.id] !== 'empty'}
				<article
					class="overflow-hidden rounded-box border border-base-300 bg-white shadow-md dark:bg-base-200"
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
											<span
												class="badge gap-1 border-base-300 bg-base-100/70 badge-sm text-base-content/70"
												title={reasonLabel(reason)}
											>
												{#if reason === 'category'}
													<IconMdiTagOutline class="h-3.5 w-3.5" aria-hidden="true" />
												{:else if reason === 'country'}
													<IconMdiEarth class="h-3.5 w-3.5" aria-hidden="true" />
												{:else if reason === 'language'}
													<IconMdiTranslate class="h-3.5 w-3.5" aria-hidden="true" />
												{:else if reason === 'product_type'}
													<IconMdiPackageVariantClosed class="h-3.5 w-3.5" aria-hidden="true" />
												{:else if reason === 'moderator'}
													<IconMdiShieldAccount class="h-3.5 w-3.5" aria-hidden="true" />
												{:else if reason === 'account'}
													<IconMdiAccountCheck class="h-3.5 w-3.5" aria-hidden="true" />
												{:else}
													<IconMdiEarth class="h-3.5 w-3.5" aria-hidden="true" />
												{/if}
												<span>{reasonLabel(reason)}</span>
											</span>
										{/each}
									</div>
								{/if}
							</div>
							{#if requestStatuses[source.id] === 'pending'}
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

					{#if isExpanded(source.id)}
						<div id={panelId} class="p-4 sm:p-6">
							{#await request.promise}
								<div class="space-y-3 py-2" aria-busy="true">
									<div class="h-4 w-1/3 skeleton"></div>
									<div class="h-4 w-full skeleton"></div>
									<div class="h-4 w-5/6 skeleton"></div>
								</div>
							{:then panels}
								{#if panels != null}
									<div class="mb-4 flex flex-wrap gap-x-4 gap-y-2 text-sm">
										{#if panels.provider_website}
											<a
												href={panels.provider_website}
												target="_blank"
												rel="noopener"
												class="link link-hover"
											>
												{$_('product.external_sources.provider_website', {
													default: 'Provider website'
												})}
											</a>
										{/if}
										{#if panels.privacy_policy_url}
											<a
												href={panels.privacy_policy_url}
												target="_blank"
												rel="noopener"
												class="link link-hover"
											>
												{$_('product.external_sources.privacy_policy', {
													default: 'Privacy policy'
												})}
											</a>
										{/if}
									</div>
									<Panels panels={panels.knowledgePanels} summary={false} />
								{/if}
							{:catch}
								<div class="alert alert-warning">
									<IconMdiEarth class="h-6 w-6 shrink-0" />
									<span>
										{$_('product.external_sources.error', {
											default: 'External sources could not be loaded.'
										})}
									</span>
								</div>
							{/await}
						</div>
					{/if}
				</article>
			{/if}
		{/each}
	</div>
</section>
