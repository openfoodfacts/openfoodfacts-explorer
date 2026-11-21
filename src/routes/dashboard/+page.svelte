<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { userInfo } from '#lib/stores/user.js';
	import { getFacetValue } from '#lib/api/facets.js';
	import { QueryApi } from '@openfoodfacts/openfoodfacts-nodejs';
	import { PUBLIC_QUERY_BASE_URL } from '$app/env/public';
	import { getToastCtx } from '#lib/stores/toasts.js';
	import { getLeaderboardPosition } from '#lib/leaderboard.js';
	import { createCertificateBlob, downloadBlob, type CertificateRow } from '#lib/certificate.js';
	import { _, getNumberFormatter } from '#lib/i18n/index.js';
	import { resolve } from '#lib/paths.js';
	import Metadata from '#lib/Metadata.svelte';
	import SearchBar from '#lib/ui/SearchBar.svelte';
	import WcProductCard from '#lib/ui/WcProductCard.svelte';

	import chocoBarIcon from '#lib/assets/chocolate-bar.svg';
	import cheeseIcon from '#lib/assets/cheese.svg';
	import ShoppingCartIcon from '../users/[user]/shopping-cart.svg';
	import ScaleIcon from '../users/[user]/scale.svg';
	import CameraIcon from '../users/[user]/camera.svg';
	import IconMdiBarcodeScan from '@iconify-svelte/mdi/barcode-scan';
	import IconMdiArrowRight from '@iconify-svelte/mdi/arrow-right';
	import IconMdiAccountCircle from '@iconify-svelte/mdi/account-circle';
	import IconMdiPlusCircleOutline from '@iconify-svelte/mdi/plus-circle-outline';
	import IconMdiTagMultipleOutline from '@iconify-svelte/mdi/tag-multiple-outline';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';
	import IconMdiLightbulbOnOutline from '@iconify-svelte/mdi/lightbulb-on-outline';
	import IconMdiLock from '@iconify-svelte/mdi/lock';
	import IconMdiCartOutline from '@iconify-svelte/mdi/cart-outline';
	import IconMdiScaleBalance from '@iconify-svelte/mdi/scale-balance';
	import IconMdiCameraOutline from '@iconify-svelte/mdi/camera-outline';
	import IconMdiMedalOutline from '@iconify-svelte/mdi/medal-outline';
	import IconMdiCheckBold from '@iconify-svelte/mdi/check-bold';
	import IconMdiChevronDown from '@iconify-svelte/mdi/chevron-down';
	import IconMdiShareVariant from '@iconify-svelte/mdi/share-variant';
	import IconMdiHistory from '@iconify-svelte/mdi/history';
	import IconMdiTrophyOutline from '@iconify-svelte/mdi/trophy-outline';
	import {
		countUnlockedBadges,
		type ContributionKind,
		getContributorLevel,
		getMilestoneProgress,
		LEVELS,
		MILESTONES_BY_KIND,
		TOTAL_BADGES
	} from '#lib/milestones.js';
	import { FUN_FACTS } from '#lib/funFacts.js';
	import { burstConfetti } from '#lib/confetti.js';
	import { getGreetingPeriod, pickGreeting, seededRandom } from '#lib/greetings.js';

	// Start from a different fact each day, then let the user flip through them.
	let factIndex = $state(Math.floor(Date.now() / 86_400_000) % FUN_FACTS.length);
	const fact = $derived(FUN_FACTS[factIndex]);

	// Badge colours by position in the scale: bronze, silver, gold, then rarer tiers.
	// Full class names are listed so Tailwind can see them.
	const BADGE_TIERS = [
		'bg-secondary text-secondary-content',
		'bg-secondary text-secondary-content',
		'bg-base-content/25 text-base-content',
		'bg-base-content/25 text-base-content',
		'bg-warning text-warning-content',
		'bg-warning text-warning-content',
		'bg-info text-info-content',
		'bg-info text-info-content',
		'bg-accent text-accent-content',
		'bg-accent text-accent-content'
	] as const;
	// The last badge of every scale is always the special one.
	const MAX_BADGES = Math.max(...Object.values(MILESTONES_BY_KIND).map((scale) => scale.length));
	// Shared shape of every badge circle, locked or not.
	const BADGE_SHAPE =
		'relative flex h-10 w-10 flex-col items-center justify-center rounded-full text-xs font-bold select-none sm:h-11 sm:w-11 lg:h-12 lg:w-12 lg:text-sm xl:h-14 xl:w-14';

	// Confetti from the centre of the clicked badge; the top badge of a scale gets a bigger burst.
	function celebrate(event: MouseEvent, big: boolean) {
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		burstConfetti({
			x: rect.left + rect.width / 2,
			y: rect.top + rect.height / 2,
			count: big ? 180 : 90,
			emojiRatio: big ? 0.5 : 0.2
		});
	}
	const TOP_BADGE_TIER = 'bg-neutral text-neutral-content ring-2 ring-warning';

	let searchQuery = $state('');
	let barcode = $state('');
	let barcodeInvalid = $state(false);

	const username = $derived($userInfo?.preferred_username);

	// A playful greeting that follows the visitor's local time of day.
	const now = new Date();
	const greeting = $derived(
		pickGreeting(
			now.getHours(),
			// Random, but the same during a time of day for a given user, so reloads do not change it.
			seededRandom(`${now.toDateString()}|${getGreetingPeriod(now.getHours())}|${username}`),
			now.getDay()
		)
	);
	const formatNumber = (n: number) => getNumberFormatter().format(n);
	// Short form (25K) for the small badge circles, where a full number does not fit.
	const formatCompact = (n: number) => getNumberFormatter({ notation: 'compact' }).format(n);
	const levelName = (key: string, fallback: string) =>
		$_(`landing.levels.${key}`, { default: fallback });

	const toasts = getToastCtx();

	// The ladder of levels is a <details>: close it on Escape and when clicking elsewhere.
	let ladder = $state<HTMLDetailsElement>();
	function closeLadder() {
		if (ladder) ladder.open = false;
	}

	// The rows of badges drawn on the certificate, in the same order as on this page.
	function certificateRows(counts: Record<ContributionKind, number>): CertificateRow[] {
		return stats.map((stat) => {
			const scale = MILESTONES_BY_KIND[stat.key];
			const progress = getMilestoneProgress(counts[stat.key], scale);
			return {
				label: stat.badge,
				badges: scale.map((milestone, index) => ({
					label: formatCompact(milestone),
					unlocked: progress.unlocked.includes(milestone),
					tier: index,
					isTop: index === scale.length - 1
				}))
			};
		});
	}

	const CERTIFICATE_FILE_NAME = 'open-food-facts-certificate.png';

	// Share a certificate image: with the native share sheet when it can send files, otherwise
	// as a download. If the image cannot be made, only the text is shared.
	async function shareProgress(
		level: string,
		unlocked: number,
		counts: Record<ContributionKind, number>
	) {
		const text = $_('landing.share_text', {
			default: 'I am a {level} on Open Food Facts, with {count} of {total} badges!',
			values: { level, count: unlocked, total: TOTAL_BADGES }
		});
		const url = new URL(resolve('/'), window.location.origin).href;

		try {
			const blob = await createCertificateBlob({
				username: username ?? '',
				levelName: level,
				badgesText: $_('landing.badges_progress', {
					default: '{count} of {total} badges',
					values: { count: unlocked, total: TOTAL_BADGES }
				}),
				title: $_('landing.certificate_title', { default: 'Certificate of contribution' }),
				awardedTo: $_('landing.certificate_awarded_to', { default: 'Awarded to' }),
				footer: `${$_('landing.title', { default: 'Open Food Facts Explorer' })} · ${new Date().toLocaleDateString(undefined, { dateStyle: 'long' })}`,
				rows: certificateRows(counts)
			}).catch((error) => {
				console.error('Could not create the certificate:', error);
				return null;
			});

			if (blob) {
				const file = new File([blob], CERTIFICATE_FILE_NAME, { type: 'image/png' });
				if (navigator.canShare?.({ files: [file] })) {
					await navigator.share({ files: [file], text, url });
					return;
				}
				// No file sharing here (most desktops): save the image instead.
				downloadBlob(blob, CERTIFICATE_FILE_NAME);
				toasts.success($_('landing.certificate_saved', { default: 'Certificate saved' }));
				return;
			}

			if (navigator.share) {
				await navigator.share({ text, url });
				return;
			}
			await navigator.clipboard.writeText(`${text} ${url}`);
			toasts.success($_('landing.share_copied', { default: 'Copied to the clipboard' }));
		} catch (error) {
			// Closing the share sheet is not an error.
			if (error instanceof DOMException && error.name === 'AbortError') return;
			toasts.error($_('landing.share_failed', { default: 'Could not share, please try again' }));
		}
	}

	// Anonymous visitors are sent to the login page and come back here afterwards.
	onMount(() => {
		if (!$userInfo) {
			window.location.href = `${resolve('oauth/login')}?redirect=${encodeURIComponent(resolve('/dashboard'))}`;
		}
	});

	// Adding a product starts from its barcode, same rule as the search page.
	function addProduct(event: SubmitEvent) {
		event.preventDefault();
		const cleaned = barcode.replace(/[\s-]/g, '');
		barcodeInvalid = !/^\d{5,18}$/.test(cleaned);
		if (barcodeInvalid) return;
		goto(resolve('/products/[barcode]/edit', { barcode: cleaned }));
	}

	// One request per facet: `editors` also provides the recent edits list.
	const contributions = $derived.by(() => {
		if (!username) return Promise.resolve(null);
		const user = encodeURIComponent(username);
		const load = (facet: string, pageSize: number) =>
			getFacetValue(fetch, facet, user, { page: 1, pageSize, sortBy: 'last_modified_t' });

		return Promise.all([load('contributors', 1), load('editors', 6), load('photographers', 1)])
			.then(([contributor, editor, photographer]) => ({ contributor, editor, photographer }))
			.catch((error) => {
				console.error('Could not load contributions:', error);
				return null;
			});
	});

	// Where the user stands among editors. Both queries run in the browser, after the counters
	// above are known, and any failure just hides the ranking.
	const TOP_EDITORS = 500;
	const leaderboard = $derived.by(async () => {
		const data = await contributions;
		if (!data || !PUBLIC_QUERY_BASE_URL) return null;

		try {
			const client = new QueryApi(fetch, { baseUrl: PUBLIC_QUERY_BASE_URL });
			const [top, total] = await Promise.all([
				client.getFacetValues('editors_tags', { limit: TOP_EDITORS }),
				client.countFacetValues('editors_tags')
			]);
			const position = getLeaderboardPosition(
				top.map((editor) => editor.count),
				data.editor.count
			);
			return position ? { position, total } : null;
		} catch (error) {
			console.error('Could not load the editors leaderboard:', error);
			return null;
		}
	});

	// A product the user edited a while ago, to check it is still up to date. Older edits are
	// more likely to be stale, so they come from the second page; the pick is stable for a day.
	const revisit = $derived.by(async () => {
		const user = username;
		const data = await contributions;
		if (!user || !data || data.editor.count === 0) return null;

		const older =
			data.editor.count > 6
				? await getFacetValue(fetch, 'editors', encodeURIComponent(user), {
						page: 2,
						pageSize: 24,
						sortBy: 'last_modified_t'
					}).catch(() => null)
				: null;
		const pool = older && older.products.length > 0 ? older.products : data.editor.products;
		const random = seededRandom(`${now.toDateString()}|revisit|${user}`);
		return pool[Math.floor(random() * pool.length)] ?? null;
	});

	const stats = $derived([
		{
			facet: 'contributors',
			key: 'contributor' as const,
			label: $_('dashboard.products_created', { default: 'Products created' }),
			badge: $_('landing.badge_creator', { default: 'Creator' }),
			icon: ShoppingCartIcon,
			badgeIcon: IconMdiCartOutline
		},
		{
			facet: 'editors',
			key: 'editor' as const,
			label: $_('dashboard.products_edited', { default: 'Products edited' }),
			badge: $_('landing.badge_editor', { default: 'Editor' }),
			icon: ScaleIcon,
			badgeIcon: IconMdiScaleBalance
		},
		{
			facet: 'photographers',
			key: 'photographer' as const,
			label: $_('dashboard.products_photographed', { default: 'Products photographed' }),
			badge: $_('landing.badge_photographer', { default: 'Photographer' }),
			icon: CameraIcon,
			badgeIcon: IconMdiCameraOutline
		}
	]);
</script>

<Metadata
	title={$_('landing.contributor_home', { default: 'Your contributor space' })}
	description={$_('landing.contributor_intro', {
		default: 'Find a product, add what you know, and help everyone make informed choices.'
	})}
/>

<svelte:window
	onkeydown={(event) => event.key === 'Escape' && closeLadder()}
	onclick={(event) => {
		if (ladder?.open && !ladder.contains(event.target as Node)) closeLadder();
	}}
/>

{#if username}
	<section class="mx-auto w-full max-w-7xl px-4 pt-4 sm:pt-6">
		<div
			class="flex flex-col gap-4 rounded-2xl bg-secondary/10 p-5 sm:flex-row sm:items-center sm:p-6"
		>
			<span
				class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-secondary text-secondary-content"
			>
				<IconMdiLightbulbOnOutline class="h-7 w-7" aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<h2 class="text-sm font-semibold tracking-wide text-secondary uppercase">
					{$_('landing.did_you_know', { default: 'Did you know?' })}
				</h2>
				<p class="mt-1" aria-live="polite">
					{$_(`landing.facts.${fact.key}`, { default: fact.fallback })}
				</p>
			</div>
			<button
				type="button"
				class="btn btn-outline btn-secondary btn-sm"
				onclick={() => (factIndex = (factIndex + 1) % FUN_FACTS.length)}
			>
				{$_('landing.another_fact', { default: 'Another fact' })}
			</button>
		</div>
	</section>

	<section class="mx-auto mt-6 w-full max-w-7xl px-4">
		<div class="relative grid overflow-hidden rounded-3xl bg-base-200 lg:grid-cols-[1.35fr_1fr]">
			<img
				src={cheeseIcon}
				alt=""
				aria-hidden="true"
				class="pointer-events-none absolute -top-10 -right-8 w-36 rotate-12 opacity-4 sm:w-48 lg:right-[38%]"
			/>
			<img
				src={chocoBarIcon}
				alt=""
				aria-hidden="true"
				class="pointer-events-none absolute -bottom-16 -left-14 w-36 -rotate-12 opacity-3 sm:w-44"
			/>
			<div class="relative flex flex-col justify-center px-6 py-10 sm:px-10 lg:py-14">
				<h1 class="mb-4 max-w-xl text-4xl leading-tight font-bold text-base-content sm:text-5xl">
					{$_(greeting.key, { default: greeting.fallback, values: { user: username } })}
				</h1>
				{#await contributions}
					<!-- Same footprint as the level pill, so nothing jumps when it loads. -->
					<div class="mt-3 h-7 w-56 skeleton rounded-full" aria-hidden="true"></div>
				{:then data}
					{#if data}
						{@const unlocked = countUnlockedBadges({
							contributor: data.contributor.count,
							editor: data.editor.count,
							photographer: data.photographer.count
						})}
						{@const level = getContributorLevel(unlocked)}
						{@const nextLevel = LEVELS.find((candidate) => candidate.minBadges > unlocked)}
						<details class="dropdown mt-3 w-fit" bind:this={ladder}>
							<summary
								class="inline-flex cursor-pointer list-none items-center gap-2 rounded-full bg-secondary px-3 py-1 text-sm font-semibold text-secondary-content select-none [&::-webkit-details-marker]:hidden"
							>
								<IconMdiMedalOutline class="h-4 w-4" aria-hidden="true" />
								<span>{levelName(level.key, level.fallback)}</span>
								<span class="font-normal opacity-80">
									· {$_('landing.badges_progress', {
										default: '{count} of {total} badges',
										values: { count: unlocked, total: TOTAL_BADGES }
									})}
								</span>
								<IconMdiChevronDown class="h-4 w-4 opacity-80" aria-hidden="true" />
							</summary>
							<div
								class="dropdown-content z-10 mt-2 w-72 rounded-2xl border border-base-content/10 bg-base-100 p-4 text-base-content shadow-lg"
							>
								<h3 class="text-sm font-bold">
									{$_('landing.level_ladder', { default: 'Levels' })}
								</h3>
								<ol class="mt-3 space-y-2">
									{#each LEVELS as step (step.key)}
										{@const reached = unlocked >= step.minBadges}
										<li
											class="flex items-center gap-2 text-sm {reached
												? ''
												: 'text-base-content/50'}"
										>
											{#if reached}
												<IconMdiCheckBold class="h-4 w-4 text-success" aria-hidden="true" />
											{:else}
												<IconMdiLock class="h-4 w-4" aria-hidden="true" />
											{/if}
											<span class="flex-1 {step.key === level.key ? 'font-bold' : ''}">
												{levelName(step.key, step.fallback)}
											</span>
											<span class="text-xs">
												{$_('landing.level_badges_needed', {
													default: '{count} badges',
													values: { count: step.minBadges }
												})}
											</span>
										</li>
									{/each}
								</ol>
								{#if nextLevel}
									<progress
										class="progress mt-3 w-full progress-primary"
										value={(unlocked - level.minBadges) / (nextLevel.minBadges - level.minBadges)}
										max="1"
										aria-label={$_('landing.level_ladder', { default: 'Levels' })}
									></progress>
									<p class="mt-2 text-xs text-base-content/70">
										{$_('landing.level_next', {
											default: '{count} more badges to become {level}',
											values: {
												count: nextLevel.minBadges - unlocked,
												level: levelName(nextLevel.key, nextLevel.fallback)
											}
										})}
									</p>
								{:else}
									<p class="mt-3 text-xs text-base-content/70">
										{$_('landing.level_top', { default: 'You reached the top level' })}
									</p>
								{/if}
							</div>
						</details>
					{/if}
				{/await}
				<p class="mt-4 max-w-lg text-base-content/85">
					{$_('landing.contributor_intro', {
						default: 'Find a product, add what you know, and help everyone make informed choices.'
					})}
				</p>
				<div class="mt-7 max-w-xl">
					<SearchBar
						bind:searchQuery
						onSearch={(query) => goto(resolve('/search') + '?' + new URLSearchParams({ q: query }))}
					/>
				</div>
			</div>

			<div class="relative flex flex-col justify-center gap-3 bg-base-300/60 p-5 sm:p-8">
				<a
					class="group flex items-center gap-4 rounded-2xl bg-primary p-5 text-primary-content transition hover:opacity-90"
					href={resolve('/scan')}
				>
					<span class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-primary-content/15">
						<IconMdiBarcodeScan class="h-7 w-7" aria-hidden="true" />
					</span>
					<span class="min-w-0 flex-1">
						<span class="block text-lg font-bold">
							{$_('landing.scan_product', { default: 'Scan a product' })}
						</span>
						<span class="mt-1 block text-sm text-primary-content/75">
							{$_('landing.scan_product_description', { default: 'Find a product by its barcode' })}
						</span>
					</span>
					<IconMdiArrowRight
						class="h-5 w-5 shrink-0 transition-transform group-hover:translate-x-1"
						aria-hidden="true"
					/>
				</a>

				<form
					class="rounded-2xl border border-base-content/10 bg-base-100 p-5"
					onsubmit={addProduct}
					novalidate
				>
					<div class="flex items-center gap-4">
						<span
							class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-base-200 text-secondary"
						>
							<IconMdiPlusCircleOutline class="h-7 w-7" aria-hidden="true" />
						</span>
						<div class="min-w-0 flex-1">
							<label class="block text-lg font-bold" for="add-product-barcode">
								{$_('landing.add_product', { default: 'Add a product' })}
							</label>
							<p class="mt-1 text-sm text-base-content/70">
								{$_('landing.add_product_description', {
									default: 'Enter its barcode to start a new entry'
								})}
							</p>
						</div>
					</div>
					<div class="join mt-4 w-full">
						<input
							id="add-product-barcode"
							class="input-bordered input join-item w-full {barcodeInvalid ? 'input-error' : ''}"
							type="text"
							inputmode="numeric"
							autocomplete="off"
							placeholder={$_('landing.barcode_placeholder', { default: 'e.g. 3017620422003' })}
							aria-invalid={barcodeInvalid}
							aria-describedby={barcodeInvalid ? 'add-product-barcode-error' : undefined}
							bind:value={barcode}
							oninput={() => (barcodeInvalid = false)}
						/>
						<button class="btn join-item btn-primary" type="submit">
							{$_('landing.add_product_action', { default: 'Add' })}
						</button>
					</div>
					{#if barcodeInvalid}
						<p id="add-product-barcode-error" class="mt-2 text-sm text-error" role="alert">
							{$_('qr.invalid_barcode', { default: 'Scanned code is not a valid barcode' })}
						</p>
					{/if}
				</form>
			</div>
		</div>
	</section>

	<section class="mx-auto mt-12 w-full max-w-7xl px-4">
		<h2 class="text-2xl font-bold">
			{$_('landing.your_impact', { default: 'Your impact' })}
		</h2>

		{#await contributions}
			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				{#each stats as stat (stat.facet)}
					<div class="h-28 skeleton rounded-2xl"></div>
				{/each}
			</div>
			<div class="mt-4 h-80 skeleton rounded-2xl"></div>
		{:then data}
			<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
				{#each stats as stat (stat.facet)}
					<a
						class="group flex items-center gap-4 rounded-2xl border border-base-content/10 bg-base-100 p-5 transition hover:border-primary/40 hover:bg-base-200"
						href={resolve('/facets/[facet]/[value]', { facet: stat.facet, value: username })}
					>
						<span class="grid h-14 w-14 shrink-0 place-items-center rounded-xl bg-base-200">
							<img src={stat.icon} alt="" aria-hidden="true" class="w-8" />
						</span>
						<span class="min-w-0 flex-1">
							<span class="block text-3xl font-bold">
								{data ? formatNumber(data[stat.key].count) : '--'}
							</span>
							<span class="block text-sm text-base-content/70">{stat.label}</span>
							{#if data}
								{@const progress = getMilestoneProgress(
									data[stat.key].count,
									MILESTONES_BY_KIND[stat.key]
								)}
								<progress
									class="progress mt-2 w-full progress-primary"
									value={progress.ratio}
									max="1"
									aria-label={$_('landing.milestone_progress', {
										default: 'Progress to the next {label} badge',
										values: { label: stat.badge }
									})}
								></progress>
								<span class="mt-1 block text-xs text-base-content/60">
									{#if progress.next !== null}
										{$_('landing.milestone_to_go', {
											default: '{remaining} to go for the {target} badge',
											values: {
												remaining: formatNumber(progress.remaining),
												target: formatNumber(progress.next)
											}
										})}
									{:else}
										{$_('landing.milestone_complete', { default: 'Every badge unlocked' })}
									{/if}
								</span>
							{/if}
						</span>
						<IconMdiArrowRight
							class="h-5 w-5 shrink-0 text-base-content/40 transition group-hover:translate-x-1 group-hover:text-primary"
							aria-hidden="true"
						/>
					</a>
				{/each}
			</div>
			{#if data}
				{@const badgeCounts = {
					contributor: data.contributor.count,
					editor: data.editor.count,
					photographer: data.photographer.count
				}}
				{@const badgeTotal = countUnlockedBadges(badgeCounts)}
				{@const badgeLevel = getContributorLevel(badgeTotal)}
				<div class="mt-4 rounded-2xl border border-base-content/10 bg-base-100 p-5 sm:p-6">
					<div class="flex flex-wrap items-center justify-between gap-2">
						<h3 class="text-lg font-bold">{$_('landing.badges', { default: 'Badges' })}</h3>
						<button
							type="button"
							class="btn btn-outline btn-sm"
							onclick={() =>
								shareProgress(
									levelName(badgeLevel.key, badgeLevel.fallback),
									badgeTotal,
									badgeCounts
								)}
						>
							<IconMdiShareVariant class="h-4 w-4" aria-hidden="true" />
							{$_('landing.share', { default: 'Share' })}
						</button>
					</div>
					<ul class="mt-2 divide-y divide-base-content/10">
						{#each stats as stat (stat.facet)}
							{@const progress = getMilestoneProgress(
								data[stat.key].count,
								MILESTONES_BY_KIND[stat.key]
							)}
							<li class="flex flex-col gap-3 py-4 lg:flex-row lg:items-center lg:gap-6">
								<span class="text-sm font-semibold text-base-content/70 lg:w-32 lg:shrink-0">
									{stat.badge}
								</span>
								<ul
									class="grid flex-1 grid-cols-4 justify-items-center gap-x-2 gap-y-3 sm:grid-cols-7 lg:grid-cols-(--cols)"
									style="--cols: repeat({MAX_BADGES}, minmax(0, 1fr))"
								>
									{#each MILESTONES_BY_KIND[stat.key] as milestone, index (milestone)}
										{@const unlocked = progress.unlocked.includes(milestone)}
										{@const isNext = milestone === progress.next}
										{@const isTop = index === MILESTONES_BY_KIND[stat.key].length - 1}
										{@const tier = isTop
											? TOP_BADGE_TIER
											: BADGE_TIERS[Math.min(index, BADGE_TIERS.length - 1)]}
										{@const CategoryIcon = stat.badgeIcon}
										{@const tip = unlocked
											? $_('landing.badge_tip_unlocked', {
													default: '{count} {label}',
													values: {
														count: formatNumber(milestone),
														label: stat.label.toLowerCase()
													}
												})
											: $_('landing.badge_tip_locked', {
													default: '{count} {label}: {remaining} to go',
													values: {
														count: formatNumber(milestone),
														label: stat.label.toLowerCase(),
														remaining: formatNumber(milestone - data[stat.key].count)
													}
												})}
										{#snippet face()}
											<CategoryIcon class="mb-0.5 hidden h-4 w-4 xl:block" aria-hidden="true" />
											<span class="leading-none">{formatCompact(milestone)}</span>
											{#if isNext}
												<span
													class="pointer-events-none absolute inset-0 rounded-full ring-2 ring-primary/40 motion-safe:animate-pulse"
													aria-hidden="true"
												></span>
											{/if}
											{#if unlocked}
												<IconMdiCheckBold
													class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-success p-0.5 text-success-content"
													aria-hidden="true"
												/>
											{:else}
												<IconMdiLock
													class="absolute -right-1 -bottom-1 h-4 w-4 rounded-full bg-base-200 p-0.5"
													aria-hidden="true"
												/>
											{/if}
											<span class="sr-only">
												{unlocked
													? $_('landing.badge_unlocked', {
															default: '{badge} badge {count}: unlocked',
															values: { badge: stat.badge, count: formatNumber(milestone) }
														})
													: $_('landing.badge_locked', {
															default: '{badge} badge {count}: locked',
															values: { badge: stat.badge, count: formatNumber(milestone) }
														})}
											</span>
										{/snippet}
										<li class="tooltip" data-tip={tip}>
											{#if unlocked}
												<button
													type="button"
													onclick={(event) => celebrate(event, isTop)}
													class="{BADGE_SHAPE} {tier} cursor-pointer shadow focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary motion-safe:transition-transform motion-safe:hover:scale-110 motion-safe:active:scale-95"
												>
													{@render face()}
												</button>
											{:else}
												<div
													class="{BADGE_SHAPE} {isNext
														? 'text-base-content/70'
														: 'border border-dashed border-base-content/30 text-base-content/40'}"
												>
													{@render face()}
												</div>
											{/if}
										</li>
									{/each}
								</ul>
							</li>
						{/each}
					</ul>
				</div>
			{/if}
		{/await}

		<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
			<a
				class="group flex items-center gap-4 rounded-2xl border border-base-content/10 bg-base-100 p-5 transition hover:border-primary/40 hover:bg-base-200"
				href={resolve('/users/[user]', { user: username })}
			>
				<span
					class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-base-200 text-secondary"
				>
					<IconMdiAccountCircle class="h-7 w-7" aria-hidden="true" />
				</span>
				<span class="min-w-0 flex-1">
					<span class="block text-lg font-bold">
						{$_('landing.your_profile', { default: 'Your profile' })}
					</span>
					<span class="mt-1 block text-sm text-base-content/70">
						{$_('landing.profile_description', {
							default: 'See everything you have contributed'
						})}
					</span>
				</span>
				<IconMdiArrowRight
					class="h-5 w-5 shrink-0 text-base-content/40 transition group-hover:translate-x-1 group-hover:text-primary"
					aria-hidden="true"
				/>
			</a>
			<a
				class="group flex items-center gap-4 rounded-2xl border border-base-content/10 bg-base-100 p-5 transition hover:border-primary/40 hover:bg-base-200"
				href="https://prices.openfoodfacts.org/dashboard"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span
					class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-base-200 text-secondary"
				>
					<IconMdiTagMultipleOutline class="h-7 w-7" aria-hidden="true" />
				</span>
				<span class="min-w-0 flex-1">
					<span class="block text-lg font-bold">
						{$_('dashboard.open_prices_dashboard', { default: 'Open Prices dashboard' })}
					</span>
					<span class="mt-1 block text-sm text-base-content/70">
						{$_('landing.open_prices_description', {
							default: 'Track the prices you have shared'
						})}
					</span>
				</span>
				<IconMdiOpenInNew
					class="h-5 w-5 shrink-0 text-base-content/40 transition group-hover:text-primary"
					aria-hidden="true"
				/>
			</a>
			<a
				class="group flex items-center gap-4 rounded-2xl border border-base-content/10 bg-base-100 p-5 transition hover:border-primary/40 hover:bg-base-200"
				href={resolve('/facets/[facet]', { facet: 'editors' })}
			>
				<span
					class="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-base-200 text-secondary"
				>
					<IconMdiTrophyOutline class="h-7 w-7" aria-hidden="true" />
				</span>
				<span class="min-w-0 flex-1">
					<span class="block text-lg font-bold">
						{$_('landing.leaderboard_title', { default: 'Where you stand' })}
					</span>
					<span class="mt-1 block text-sm text-base-content/70">
						{#await leaderboard}
							<span class="inline-block h-4 w-40 skeleton"></span>
						{:then standing}
							{#if standing?.position.kind === 'rank'}
								{$_('landing.leaderboard_rank', {
									default: '#{rank} of {total} editors',
									values: {
										rank: formatNumber(standing.position.rank),
										total: formatNumber(standing.total)
									}
								})}
							{:else if standing?.position.kind === 'outside'}
								{$_('landing.leaderboard_outside', {
									default: 'Outside the top {top} of {total} editors: keep going!',
									values: {
										top: formatNumber(standing.position.top),
										total: formatNumber(standing.total)
									}
								})}
							{:else}
								{$_('landing.leaderboard_default', { default: 'See the top editors' })}
							{/if}
						{/await}
					</span>
				</span>
				<IconMdiArrowRight
					class="h-5 w-5 shrink-0 text-base-content/40 transition group-hover:translate-x-1 group-hover:text-primary"
					aria-hidden="true"
				/>
			</a>
		</div>
	</section>

	{#await revisit}
		<!-- Same footprint as the loaded section, so the page below does not jump. -->
		<section class="mx-auto mt-12 mb-16 w-full max-w-7xl px-4" aria-hidden="true">
			<div class="h-96 skeleton rounded-3xl md:h-72"></div>
		</section>
	{:then product}
		{#if product}
			<section class="mx-auto mt-12 mb-16 w-full max-w-7xl px-4">
				<div
					class="grid items-center gap-6 rounded-3xl bg-base-200 p-6 sm:p-8 md:grid-cols-[1fr_22rem]"
				>
					<div class="flex flex-col items-start gap-4">
						<span
							class="grid h-12 w-12 place-items-center rounded-xl bg-secondary text-secondary-content"
						>
							<IconMdiHistory class="h-7 w-7" aria-hidden="true" />
						</span>
						<div>
							<h2 class="text-2xl font-bold sm:text-3xl">
								{$_('landing.revisit_title', { default: 'Worth a second look' })}
							</h2>
							<p class="mt-2 max-w-lg text-base-content/80">
								{$_('landing.revisit_description', {
									default:
										'You edited this product a while ago. Is the information still up to date?'
								})}
							</p>
						</div>
						<a
							class="btn btn-primary"
							href={resolve('/products/[barcode]/edit', { barcode: product.code })}
						>
							{$_('landing.revisit_action', { default: 'Review this product' })}
							<IconMdiArrowRight class="h-5 w-5" aria-hidden="true" />
						</a>
					</div>
					<div class="w-full max-w-sm justify-self-center md:justify-self-end">
						<WcProductCard {product} />
					</div>
				</div>
			</section>
		{/if}
	{/await}
	<section class="mx-auto mt-12 mb-16 w-full max-w-7xl px-4">
		<h2 class="text-2xl font-bold">
			{$_('landing.recent_contributions', { default: 'Recently updated products you edited' })}
		</h2>
		{#await contributions}
			<p class="mt-4 text-base-content/70">{$_('general.loading', { default: 'Loading…' })}</p>
		{:then data}
			{#if data && data.editor.products.length > 0}
				<div class="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
					{#each data.editor.products.slice(0, 6) as product (product.code)}
						<WcProductCard {product} />
					{/each}
				</div>
				<a
					href={resolve('/facets/[facet]/[value]', { facet: 'editors', value: username })}
					class="btn mt-4 w-full btn-outline"
				>
					{$_('dashboard.view_all_edits', { default: 'View all edits' })}
				</a>
			{:else if data}
				<p class="mt-4 text-base-content/70">
					{$_('landing.no_recent_contributions', {
						default: 'Your edited products will appear here.'
					})}
				</p>
			{:else}
				<p class="mt-4 text-base-content/70">
					{$_('landing.recent_contributions_unavailable', {
						default: 'Your recent contributions are temporarily unavailable.'
					})}
				</p>
			{/if}
		{/await}
	</section>
{/if}
