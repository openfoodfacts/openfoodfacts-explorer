<script lang="ts">
	import { _, getLocale } from '#lib/i18n/index.js';
	import { OPEN_PRICES_BASE_URL } from '#lib/const.js';
	import type { OpenPricesChallenge, OpenPricesUserBadge } from '#lib/api/prices.js';

	import IconMdiCartOutline from '@iconify-svelte/mdi/cart-outline';
	import IconMdiMedalOutline from '@iconify-svelte/mdi/medal-outline';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';

	type Props = {
		username: string;
		prices: { challenges: OpenPricesChallenge[]; badges: OpenPricesUserBadge[] };
	};

	let { username, prices }: Props = $props();

	const pricesUrl = OPEN_PRICES_BASE_URL.replace(/\/$/, '');
	const profileUrl = $derived(`${pricesUrl}/users/${encodeURIComponent(username)}`);

	function formatShortDate(date: string | null) {
		if (!date) return '';
		return new Intl.DateTimeFormat(getLocale(), { day: 'numeric', month: 'short' }).format(
			new Date(date)
		);
	}

	const formatDate = (date: string) =>
		new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' }).format(new Date(date));
</script>

<section class="mx-auto mt-12 w-full max-w-7xl px-4">
	<div class="rounded-3xl bg-base-200 p-6 sm:p-8">
		<div class="flex flex-wrap items-center gap-4">
			<span class="grid h-12 w-12 place-items-center rounded-xl bg-primary text-primary-content">
				<IconMdiCartOutline class="h-7 w-7" aria-hidden="true" />
			</span>
			<div class="min-w-0 flex-1">
				<h2 class="text-2xl font-bold sm:text-3xl">
					{$_('dashboard.open_prices_title', { default: 'Open Prices' })}
				</h2>
				<p class="mt-1 text-base-content/80">
					{$_('dashboard.open_prices_description', {
						default: 'Your badges and the challenges you can join.'
					})}
				</p>
			</div>
			<a class="btn btn-outline" href={profileUrl} target="_blank" rel="noopener noreferrer">
				{$_('dashboard.open_prices_profile_action', { default: 'Your profile' })}
				<IconMdiOpenInNew class="h-5 w-5" aria-hidden="true" />
			</a>
		</div>

		<div class="mt-6 grid gap-6 lg:grid-cols-2">
			<div class="flex flex-col">
				<h3 class="text-lg font-semibold">
					{$_('dashboard.open_prices_challenges', { default: 'Challenges' })}
				</h3>
				{#if prices.challenges.length > 0}
					<ul class="mt-3 flex flex-col gap-2">
						{#each prices.challenges as challenge (challenge.id)}
							<li>
								<a
									class="flex items-center gap-4 rounded-xl bg-base-100 px-4 py-3 transition hover:bg-base-300"
									href={`${pricesUrl}/challenges/${challenge.id}`}
									target="_blank"
									rel="noopener noreferrer"
								>
									<span class="text-3xl" aria-hidden="true">{challenge.icon ?? '🏁'}</span>
									<span class="min-w-0 flex-1">
										<span class="block font-semibold wrap-break-word">
											{challenge.title ?? `#${challenge.id}`}
										</span>
										{#if challenge.subtitle}
											<span class="block text-sm text-base-content/70">{challenge.subtitle}</span>
										{/if}
										<span class="block text-sm text-base-content/70">
											{formatShortDate(challenge.start_date)} – {formatShortDate(
												challenge.end_date
											)}
										</span>
									</span>
									<span
										class="badge shrink-0 {challenge.status === 'ONGOING'
											? 'badge-success'
											: 'badge-info'}"
									>
										{challenge.status === 'ONGOING'
											? $_('dashboard.challenge_ongoing', { default: 'Ongoing' })
											: $_('dashboard.challenge_upcoming', { default: 'Upcoming' })}
									</span>
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-3 text-base-content/70">
						{$_('dashboard.open_prices_no_challenges', {
							default: 'No challenge is running right now.'
						})}
					</p>
				{/if}
				<!-- Pushes the button to the bottom so both columns end on the same line. -->
				<div class="grow"></div>
				<a
					class="btn mt-4 w-full btn-outline"
					href={`${pricesUrl}/challenges`}
					target="_blank"
					rel="noopener noreferrer"
				>
					{$_('dashboard.open_prices_challenges_action', { default: 'See all challenges' })}
					<IconMdiOpenInNew class="h-5 w-5" aria-hidden="true" />
				</a>
			</div>

			<div class="flex flex-col">
				<h3 class="text-lg font-semibold">
					{$_('dashboard.open_prices_badges', { default: 'Your badges' })}
				</h3>
				{#if prices.badges.length > 0}
					<ul class="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
						{#each prices.badges as { id, badge, achieved_at } (id)}
							<li
								class="flex items-center gap-3 rounded-xl bg-base-100 px-4 py-3"
								title={badge.description ?? undefined}
							>
								{#if badge.image_url}
									<img
										src={badge.image_url}
										alt=""
										loading="lazy"
										class="size-10 shrink-0 object-contain"
									/>
								{:else}
									<span
										class="grid size-10 shrink-0 place-items-center rounded-full bg-secondary text-secondary-content"
									>
										<IconMdiMedalOutline class="h-6 w-6" aria-hidden="true" />
									</span>
								{/if}
								<span class="min-w-0">
									<span class="block font-semibold wrap-break-word">{badge.name}</span>
									<span class="block text-sm text-base-content/70">{formatDate(achieved_at)}</span>
								</span>
							</li>
						{/each}
					</ul>
				{:else}
					<p class="mt-3 text-base-content/70">
						{$_('dashboard.open_prices_no_badges', {
							default: 'Add a price on Open Prices to earn your first badge.'
						})}
					</p>
				{/if}
				<div class="grow"></div>
				<a
					class="btn mt-4 w-full btn-outline"
					href={`${profileUrl}/badges`}
					target="_blank"
					rel="noopener noreferrer"
				>
					{$_('dashboard.open_prices_badges_action', { default: 'All your badges' })}
					<IconMdiOpenInNew class="h-5 w-5" aria-hidden="true" />
				</a>
			</div>
		</div>
	</div>
</section>
