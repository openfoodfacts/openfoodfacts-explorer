<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from '$lib/ui/Card.svelte';
	import { HUNGER_GAMES_LOGOS_URL } from '$lib/const';
	import IconMdiTarget from '@iconify-svelte/mdi/target';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';

	let { barcode }: { barcode: string } = $props();
</script>

<Card>
	<div class="space-y-4">
		<div class="flex items-center gap-3">
			<IconMdiTarget class="h-6 w-6 shrink-0 text-primary" aria-hidden="true" />
			<h2 class="text-xl font-bold md:text-2xl">
				{$_('product.hunger_games.title', { default: 'Hunger Games - Logo Annotation' })}
			</h2>
		</div>

		<p class="text-sm text-base-content/80">
			{$_('product.hunger_games.description', {
				default:
					'Help improve logo recognition on Open Food Facts by verifying and annotating logos on this product packaging.'
			})}
		</p>

		<div>
			<a
				href={HUNGER_GAMES_LOGOS_URL(barcode)}
				class="btn gap-2 btn-secondary btn-sm sm:btn-md"
				target="_blank"
				rel="noopener noreferrer"
			>
				<span
					>{$_('product.hunger_games.button', {
						default: 'Help annotate logos on this product'
					})}</span
				>
				<IconMdiOpenInNew class="h-4 w-4" aria-hidden="true" />
			</a>
		</div>
	</div>
</Card>
