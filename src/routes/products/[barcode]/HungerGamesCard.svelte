<script lang="ts">
	import { _ } from '$lib/i18n';
	import { userInfo } from '$lib/stores/user';
	import Card from '$lib/ui/Card.svelte';
	import IconMdiController from '@iconify-svelte/mdi/controller';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';
	import IconMdiAccountCircle from '@iconify-svelte/mdi/account-circle';
	import IconMdiTrophy from '@iconify-svelte/mdi/trophy';

	type Props = {
		barcode: string;
	};

	let { barcode }: Props = $props();

	let isLoggedIn = $derived($userInfo != null);
	let username = $derived($userInfo?.preferred_username ?? '');

	const productHungerGamesUrl = $derived(
		`https://hunger.openfoodfacts.org/questions?barcode=${encodeURIComponent(barcode)}`
	);

	const userHungerGamesUrl = $derived(
		username
			? `https://hunger.openfoodfacts.org/?user=${encodeURIComponent(username)}`
			: 'https://hunger.openfoodfacts.org/'
	);
</script>

<Card>
	<div class="flex flex-col gap-4">
		<div class="flex flex-wrap items-center justify-between gap-2 border-b border-base-300 pb-3">
			<div class="flex items-center gap-2">
				<div
					class="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary"
				>
					<IconMdiController class="h-6 w-6" aria-hidden="true" />
				</div>
				<div>
					<h2 class="text-xl font-bold">
						{$_('product.hunger_games.title', { default: 'Hunger Games' })}
					</h2>
					<p class="text-xs text-base-content/70">
						{$_('product.hunger_games.subtitle', {
							default: 'Gamified annotations for Open Food Facts'
						})}
					</p>
				</div>
			</div>

			{#if isLoggedIn}
				<div class="badge gap-1 px-3 py-3 text-xs font-semibold badge-success">
					<IconMdiAccountCircle class="h-4 w-4" aria-hidden="true" />
					<span>
						{$_('product.hunger_games.logged_in_as', {
							default: 'Logged in as {username}',
							values: { username }
						})}
					</span>
				</div>
			{:else}
				<div class="badge gap-1 px-3 py-3 text-xs font-semibold badge-warning">
					<span>
						{$_('product.hunger_games.guest_mode', { default: 'Guest Mode' })}
					</span>
				</div>
			{/if}
		</div>

		<p class="text-sm leading-relaxed text-base-content/80">
			{$_('product.hunger_games.description', {
				default:
					'Answer quick questions on Hunger Games to help annotate and verify missing data for this product and earn contribution points.'
			})}
		</p>

		{#if !isLoggedIn}
			<div class="alert px-3 py-2 text-xs alert-info">
				<span>
					{$_('product.hunger_games.login_prompt', {
						default: 'Log in to track your contribution progress and scores in Hunger Games.'
					})}
				</span>
			</div>
		{/if}

		<div class="flex flex-wrap gap-3 pt-2">
			<a
				href={productHungerGamesUrl}
				target="_blank"
				rel="noopener noreferrer"
				class="btn gap-2 btn-primary btn-sm md:btn-md"
				aria-label={$_('product.hunger_games.answer_questions', {
					default: 'Answer questions for this product on Hunger Games'
				})}
			>
				<IconMdiController class="h-5 w-5" aria-hidden="true" />
				<span>
					{$_('product.hunger_games.answer_questions', {
						default: 'Answer questions for this product'
					})}
				</span>
				<IconMdiOpenInNew class="h-4 w-4 opacity-70" aria-hidden="true" />
			</a>

			{#if isLoggedIn}
				<a
					href={userHungerGamesUrl}
					target="_blank"
					rel="noopener noreferrer"
					class="btn gap-2 btn-secondary btn-sm md:btn-md"
					aria-label={$_('product.hunger_games.track_scores', {
						default: 'Track my Hunger Games scores'
					})}
				>
					<IconMdiTrophy class="h-5 w-5" aria-hidden="true" />
					<span>
						{$_('product.hunger_games.track_scores', {
							default: 'Track my scores'
						})}
					</span>
					<IconMdiOpenInNew class="h-4 w-4 opacity-70" aria-hidden="true" />
				</a>
			{/if}
		</div>
	</div>
</Card>
