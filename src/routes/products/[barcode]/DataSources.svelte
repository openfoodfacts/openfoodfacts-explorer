<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import { _, getLocale } from '$lib/i18n';
	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiAlertCircle from '@iconify-svelte/mdi/alert-circle';
	import IconMdiCheck from '@iconify-svelte/mdi/check';
	import IconMdiCalendarPlus from '@iconify-svelte/mdi/calendar-plus';
	import type { ProductDataSection } from '$lib/api';
	import { extractProductSources, type ProductWithSources } from '$lib/api/sources';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';
	import IconMdiDatabase from '@iconify-svelte/mdi/database';
	import { page } from '$app/state';

	// Polyfill for Intl.DurationFormat, which is not yet supported in all environments (e.g. NodeJS 22)
	import '@formatjs/intl-durationformat/polyfill.js';

	type Props = {
		product: ProductDataSection & ProductWithSources;
	};

	let { product }: Props = $props();
	let externalSources = $derived(extractProductSources(product));
	function formatShortDate(unix: number | null | undefined): string {
		if (unix == null || unix === undefined || Number.isNaN(unix)) {
			return $_('product.datasources.unknown');
		}
		const date = new Date(unix * 1000);
		const options: Intl.DateTimeFormatOptions = {
			dateStyle: 'medium'
		};
		const userLanguage = getLocale();
		return new Intl.DateTimeFormat(userLanguage, options).format(date);
	}

	function formatFullDate(unix: number | null | undefined): string {
		if (unix == null || unix === undefined || Number.isNaN(unix)) {
			return $_('product.datasources.unknown');
		}
		const date = new Date(unix * 1000);
		const options: Intl.DateTimeFormatOptions = {
			dateStyle: 'medium',
			timeStyle: 'short'
		};
		const userLanguage = getLocale();
		return new Intl.DateTimeFormat(userLanguage, options).format(date);
	}

	function formatTimeSince(unix: number | null | undefined): string {
		if (unix == null || unix === undefined || Number.isNaN(unix)) {
			return $_('product.datasources.unknown');
		}

		const seconds = Math.floor((Date.now() - unix * 1000) / 1000);
		const durations: Record<string, number> = {
			year: 365 * 24 * 3600,
			month: 30 * 24 * 3600,
			week: 7 * 24 * 3600,
			day: 24 * 3600,
			hour: 3600,
			minute: 60,
			second: 1
		};

		const rtf = new Intl.RelativeTimeFormat(getLocale(), {
			numeric: 'always'
		});

		for (const unit in durations) {
			const value = Math.floor(seconds / durations[unit]);
			if (value >= 1) {
				return rtf.format(-value, unit as Intl.RelativeTimeFormatUnit);
			}
		}

		return $_('product.datasources.just_now');
	}

	function oldnessClass(unix: number | null | undefined): string {
		if (unix == null || unix === undefined || Number.isNaN(unix)) {
			return 'stat-warning';
		}

		const seconds = Math.floor(Date.now() / 1000) - unix;

		if (seconds < 30 * 24 * 3600) {
			// less than 30 days
			return 'text-success';
		} else if (seconds < 90 * 24 * 3600) {
			// less than 90 days
			return 'text-info';
		} else if (seconds < 180 * 24 * 3600) {
			// less than 180 days
			return 'text-warning';
		} else {
			return 'text-error';
		}
	}

	function formatState(state: string): string {
		if (state.startsWith('en:')) {
			state = state.slice(3);
		}
		return state.replace(/-/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
	}

	const doneStates = $derived(
		(product.states_hierarchy ?? [])
			.filter((state: string) => !state.includes('to-be-completed'))
			.map((state: string) => ({ key: state, label: formatState(state) }))
	);

	const toDoStates = $derived(
		(product.states_hierarchy ?? [])
			.filter((state: string) => state.includes('to-be-completed'))
			.map((state: string) => ({ key: state, label: formatState(state) }))
	);
</script>

{#snippet user(user: string | null)}
	<a href="/users/{user}" class="break-all underline">
		{user ?? $_('product.datasources.unknown')}
	</a>
{/snippet}

<Card>
	<h1 class="text-4xl font-bold">{$_('product.datasources.title')}</h1>

	<div class="stats mt-4 w-full max-lg:stats-vertical">
		<!-- Last edit -->
		<div class={['stat', oldnessClass(product.last_modified_t)]}>
			<div class="stat-title">{$_('product.datasources.last_edit_title')}</div>
			<div class="stat-figure">
				<IconMdiPencil class="h-8 w-8" />
			</div>
			<div class="stat-value" title={formatFullDate(product.last_modified_t)}>
				{formatTimeSince(product.last_modified_t)}
			</div>
			<div class="stat-desc">
				{$_('product.datasources.user')}
				<a href="/users/{product.last_editor}" class="underline">
					{product.last_editor ?? $_('product.datasources.unknown')}
				</a>
			</div>
		</div>

		<!-- Last check -->
		<div
			class={[
				'stat',
				oldnessClass(product.last_checked_t),
				(product.last_checked_t === null ||
					product.last_checked_t === undefined ||
					Number.isNaN(product.last_checked_t)) &&
					'text-warning'
			]}
		>
			<div class="stat-title">{$_('product.datasources.last_check_title')}</div>
			<div class="stat-figure">
				{#if product.last_checked_t === null || product.last_checked_t === undefined || Number.isNaN(product.last_checked_t)}
					<IconMdiAlertCircle class="h-8 w-8" />
				{:else}
					<IconMdiCheck class="h-8 w-8" />
				{/if}
			</div>
			<div class="stat-value" title={formatFullDate(product.last_checked_t)}>
				{#if product.last_checked_t}
					{formatTimeSince(product.last_checked_t)}
				{:else}
					{$_('product.datasources.never_checked')}
				{/if}
			</div>
			<div class="stat-desc">
				{#if product.checkers_tags && product.checkers_tags.length > 0}
					{@const last_checker = product.checkers_tags[0]}
					{$_('product.datasources.user')}
					<a href="/users/{last_checker}" class="underline">
						{last_checker ?? $_('product.datasources.unknown')}
					</a>
				{:else}
					{$_('product.datasources.check_be_first')}
				{/if}
			</div>
		</div>

		<!-- Added -->
		<div class="stat">
			<div class="stat-title">{$_('product.datasources.added_on_title')}</div>
			<div class="stat-figure">
				<IconMdiCalendarPlus class="h-8 w-8" />
			</div>
			<div class="stat-value" title={formatFullDate(product.created_t)}>
				{formatShortDate(product.created_t)}
			</div>
			<div class="stat-desc">
				{$_('product.datasources.user')}
				<a href="/users/{product.creator}" class="underline">
					{product.creator ?? $_('product.datasources.unknown')}
				</a>
			</div>
		</div>
	</div>

	<!-- Editors -->
	{#if product.editors_tags && product.editors_tags.length > 1}
		<div class="collapse-arrow collapse mt-2 rounded border-1 border-base-300 text-sm">
			<input type="checkbox" />
			<span class="collapse-title text-gray-600 dark:text-gray-300">
				{$_('product.datasources.also_edited_by')}
			</span>
			<ul class="collapse-content grid grid-cols-2 gap-2 md:grid-cols-4 lg:grid-cols-6">
				{#each product.editors_tags as editor, i (i)}
					<li>
						<a
							href="/users/{editor}"
							title={editor ?? $_('product.datasources.unknown')}
							class="flex h-10 items-center justify-center rounded bg-base-300 p-2 text-center text-base-content"
						>
							<span class="truncate align-middle">
								{editor ?? $_('product.datasources.unknown')}
							</span>
						</a>
					</li>
				{/each}
			</ul>
		</div>
	{/if}

	<!-- Checkers -->
	{#if product.checkers_tags && product.checkers_tags.length > 1}
		<p class="mt-2 text-sm">
			<span class="text-gray-600 dark:text-gray-300">
				{$_('product.datasources.also_checked_by')}
			</span>
			{#each product.checkers_tags.slice(1) as checker, i (i)}
				{#if i > 0},
				{/if}
				{@render user(checker)}
			{/each}
		</p>
	{/if}

	{#if externalSources.length > 0}
		<div class="mt-6 rounded-box border border-base-300 bg-base-100 p-4">
			<h2 class="flex items-center gap-2 text-xl font-bold">
				<IconMdiDatabase class="h-5 w-5 text-primary" />
				{$_('datasources.external_sources_title', { default: 'External Data Sources' })}
			</h2>
			<p class="mt-1 text-sm text-base-content/70">
				{$_('datasources.external_sources_subtitle', {
					default:
						'This product contains data imported from external organizations, databases, or manufacturers.'
				})}
			</p>

			<div class="mt-4 flex flex-col gap-4">
				{#each externalSources as source, i (source.id ?? i)}
					<div class="card bg-base-200 p-4 text-sm shadow-sm">
						<div class="flex flex-wrap items-center justify-between gap-2">
							<span class="text-base font-bold">
								{source.name || source.id || $_('datasources.source_name', { default: 'Source' })}
							</span>
							{#if source.url}
								<a
									href={source.url}
									target="_blank"
									rel="noopener noreferrer"
									class="btn gap-1 btn-outline btn-xs"
								>
									<span>{$_('datasources.view_source', { default: 'Visit source' })}</span>
									<IconMdiOpenInNew class="h-3.5 w-3.5" />
								</a>
							{/if}
						</div>

						<div class="mt-2 grid grid-cols-1 gap-2 text-xs text-base-content/80 sm:grid-cols-2">
							{#if source.source_licence}
								<div>
									<span class="font-semibold"
										>{$_('datasources.license', { default: 'License' })}:</span
									>
									{#if source.source_licence_url}
										<a
											href={source.source_licence_url}
											target="_blank"
											rel="noopener noreferrer"
											class="ml-1 underline"
										>
											{source.source_licence}
										</a>
									{:else}
										<span class="ml-1">{source.source_licence}</span>
									{/if}
								</div>
							{/if}

							{#if source.import_t}
								<div>
									<span class="font-semibold"
										>{$_('datasources.import_date', { default: 'Imported on' })}:</span
									>
									<span class="ml-1">{formatShortDate(source.import_t)}</span>
								</div>
							{/if}
						</div>

						{#if source.fields && source.fields.length > 0}
							<div class="mt-3">
								<span class="mb-1 block text-xs font-semibold text-base-content/70">
									{$_('datasources.source_fields', { default: 'Fields provided' })}:
								</span>
								<div class="flex flex-wrap gap-1">
									{#each source.fields as field (field)}
										<span class="badge badge-sm badge-neutral">{field}</span>
									{/each}
								</div>
							</div>
						{/if}
					</div>
				{/each}
			</div>
		</div>
	{/if}

	<a
		class="mt-4 block rounded bg-warning p-3 text-center font-bold text-warning-content hover:shadow"
		href="{page.url.pathname}/edit"
	>
		{$_('product.datasources.incomplete_or_incorrect')}
	</a>

	<div class="divider"></div>

	{#if doneStates.length > 0}
		<div class="mt-4 space-x-1">
			<p class="my-2 font-bold">{$_('product.datasources.done')}:</p>
			{#each doneStates as state, i (i)}
				<a href="/facets/states/{state.key}" class="badge badge-secondary"> {state.label}</a>
			{/each}
		</div>
	{/if}

	{#if toDoStates.length > 0}
		<div class="mt-4 space-x-1">
			<p class="my-2 font-bold">{$_('product.datasources.toDo')}:</p>
			{#each toDoStates as state, i (i)}
				<a href="/facets/states/{state.key}" class="badge badge-secondary"> {state.label}</a>
			{/each}
		</div>
	{/if}
</Card>
