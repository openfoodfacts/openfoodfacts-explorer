<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import { API_HOST } from '#lib/const.js';
	import type { DataQualityErrorTag } from '#lib/api/facets.js';

	import IconMdiAlertOctagon from '@iconify-svelte/mdi/alert-octagon';
	import IconMdiArrowRight from '@iconify-svelte/mdi/arrow-right';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';

	type Props = {
		username: string;
		/** `count` is the number of error types, `tags` the most frequent ones first. */
		errors: { count: number; tags: DataQualityErrorTag[] };
	};

	let { username, errors }: Props = $props();

	const errorsUrl = $derived(
		`${API_HOST}/facets/editors/${encodeURIComponent(username)}/data-quality-errors`
	);
	// The bars are relative to the most frequent error, so the list reads as a ranking.
	const maxProducts = $derived(Math.max(1, ...errors.tags.map((tag) => tag.products)));

	const withoutLanguage = (id: string) => id.replace(/^[a-z]{2}:/, '');

	// `en:energy-value-in-kj-does-not-match` -> `Energy value in kj does not match`
	function label(id: string) {
		const text = withoutLanguage(id).replaceAll('-', ' ');
		return text.charAt(0).toUpperCase() + text.slice(1);
	}
</script>

<section class="mx-auto mt-12 w-full max-w-7xl px-4">
	<div class="rounded-3xl bg-base-200 p-6 sm:p-8">
		<div class="flex flex-wrap items-center gap-4">
			<span class="grid h-12 w-12 place-items-center rounded-xl bg-warning text-warning-content">
				<IconMdiAlertOctagon class="h-7 w-7" aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<h2 class="text-2xl font-bold sm:text-3xl">
					{$_('dashboard.quality_errors_title', {
						default: 'Data quality errors in the products you edited'
					})}
				</h2>
				<p class="mt-1 text-base-content/80">
					{$_('dashboard.quality_errors_description', {
						default: 'Starting with the most frequent.'
					})}
				</p>
			</div>
			<a class="btn btn-outline" href={errorsUrl} target="_blank" rel="noopener noreferrer">
				{$_('dashboard.quality_errors_action', {
					default: '{count, plural, one {See the error} other {See all # errors}}',
					values: { count: errors.count }
				})}
				<IconMdiOpenInNew class="h-5 w-5" aria-hidden="true" />
			</a>
		</div>

		<ol class="mt-6 flex flex-col gap-3">
			{#each errors.tags as tag, index (tag.id)}
				<li>
					<a
						class="group relative block overflow-hidden rounded-2xl bg-base-100 px-4 py-4 transition hover:shadow-md"
						href={`${errorsUrl}/${encodeURIComponent(withoutLanguage(tag.id))}`}
						target="_blank"
						rel="noopener noreferrer"
					>
						<!-- Share of the most frequent error, drawn behind the text. -->
						<span
							class="absolute inset-y-0 start-0 bg-warning/15 transition-colors group-hover:bg-warning/25"
							style:width="{(tag.products / maxProducts) * 100}%"
							aria-hidden="true"
						></span>
						<span class="relative flex items-center gap-4">
							<span
								class="grid size-8 shrink-0 place-items-center rounded-full bg-warning/25 text-sm font-bold"
								aria-hidden="true"
							>
								{index + 1}
							</span>
							<span class="min-w-0 flex-1 font-medium wrap-break-word">{label(tag.id)}</span>
							<span class="badge shrink-0 badge-warning">
								{$_('dashboard.quality_errors_products', {
									default: '{count, plural, one {# product} other {# products}}',
									values: { count: tag.products }
								})}
							</span>
							<IconMdiArrowRight
								class="h-5 w-5 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 rtl:rotate-180"
								aria-hidden="true"
							/>
						</span>
					</a>
				</li>
			{/each}
		</ol>
	</div>
</section>
