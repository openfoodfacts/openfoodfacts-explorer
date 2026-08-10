<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiStoreOff from '@iconify-svelte/mdi/store-off';
	import type { Product } from '$lib/api';
	import { trackOffEvent } from '$lib/analytics';

	type Props = {
		product: Product;
	};

	let { product = $bindable() }: Props = $props();

	let isObsolete = $derived(product.obsolete === 'on');

	function handleToggle(e: Event) {
		const target = e.target as HTMLInputElement;
		product.obsolete = target.checked ? 'on' : '';
		trackOffEvent('product', 'delete_toggle', target.checked ? 'on' : 'off');
	}
</script>

<div class="flex flex-col gap-3 p-2">
	<div class="flex items-center gap-2">
		<IconMdiStoreOff class="h-5 w-5 text-warning" />
		<h2 class="text-lg font-bold">
			{$_('product.moderator.obsolete_title', { default: 'Product taken off the market' })}
		</h2>
	</div>

	<div class="alert text-sm leading-relaxed alert-warning">
		<span>
			<strong class="font-bold"
				>{$_('product.moderator.obsolete_important_note_prefix', {
					default: 'Important note:'
				})}</strong
			>{$_('product.moderator.obsolete_important_note_body', {
				default:
					' This product is no longer sold. The data is kept for reference only. This product does not appear in regular searches and is not taken into account for statistics.'
			})}
		</span>
	</div>

	<div class="mt-1 flex flex-col gap-4">
		<div class="form-control">
			<label class="label cursor-pointer justify-start gap-3">
				<input
					type="checkbox"
					class="checkbox checkbox-sm checkbox-warning"
					checked={isObsolete}
					onchange={handleToggle}
				/>
				<span class="label-text"
					>{$_('product.moderator.obsolete_checkbox_label', {
						default: 'Product taken off the market'
					})}</span
				>
			</label>
		</div>

		{#if product.obsolete === 'on'}
			<div class="alert py-2 text-sm alert-warning">
				<span
					>{$_('product.moderator.obsolete_badge', {
						default: 'Product taken off the market'
					})}</span
				>
			</div>
		{/if}
	</div>
</div>
