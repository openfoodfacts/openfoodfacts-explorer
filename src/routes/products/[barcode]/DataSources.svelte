<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import { _ } from '$lib/i18n';
	import IconMdiPencil from '@iconify-svelte/mdi/pencil';
	import IconMdiAlertCircle from '@iconify-svelte/mdi/alert-circle';
	import IconMdiCheck from '@iconify-svelte/mdi/check';
	import IconMdiCalendarPlus from '@iconify-svelte/mdi/calendar-plus';
	import type { ProductDataSection } from '$lib/api';
	import { page } from '$app/state';

	type Props = {
		product: ProductDataSection;
	};

	let { product }: Props = $props();

	function formatShortDate(unix: number | null | undefined): string {
		if (unix == null || unix === undefined || Number.isNaN(unix)) {
			return $_('product.datasources.unknown');
		}
		const date = new Date(unix * 1000);
		const options: Intl.DateTimeFormatOptions = {
			dateStyle: 'medium'
		};

		const userLanguage = navigator.language || 'en-GB';
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

		const userLanguage = navigator.language || 'en-GB';
		return new Intl.DateTimeFormat(userLanguage, options).format(date);
	}

	function formatTimeSince(unix: number | null | undefined): string {
		if (unix == null || unix === undefined || Number.isNaN(unix)) {
			return $_('product.datasources.unknown');
		}

		// TODO: on NodeJS 23, we can use Intl.DurationFormat
		const seconds = Math.floor(Date.now() / 1000) - unix;

		const intervals: { [key: string]: number } = {
			year: 31536000,
			month: 2592000,
			day: 86400,
			hour: 3600,
			minute: 60,
			second: 1
		};

		for (const i in intervals) {
			const interval = Math.floor(seconds / intervals[i]);
			if (interval >= 1) {
				return interval + ' ' + i + (interval > 1 ? 's' : '') + ' ago';
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

	<div class="stats max-lg:stats-vertical mt-4 w-full">
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
		<div class="collapse-arrow border-base-300 collapse mt-2 rounded border-1 text-sm">
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
							class="bg-base-300 text-base-content flex h-10 items-center justify-center rounded p-2 text-center"
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

	<a
		class="text-warning-content bg-warning mt-4 block rounded p-3 text-center font-bold hover:shadow"
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
