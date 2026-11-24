<script lang="ts">
	import { _, getLocale } from '#lib/i18n/index.js';
	import { resolve } from '#lib/paths.js';
	import IconMdiChevronLeft from '@iconify-svelte/mdi/chevron-left';
	import IconMdiChevronRight from '@iconify-svelte/mdi/chevron-right';

	type Props = {
		code: string;
		rev: number;
		latestRev?: number;
		editor?: string;
		modifiedT: number;
	};
	let { code, rev, latestRev, editor, modifiedT }: Props = $props();

	let date = $derived(
		new Intl.DateTimeFormat(getLocale(), { dateStyle: 'long' }).format(new Date(modifiedT * 1000))
	);
</script>

<div role="status" class="alert flex flex-wrap items-center justify-between gap-3 alert-info">
	<div class="flex flex-col">
		<span class="font-bold">
			{$_('product.revision.title', { default: 'You are viewing an old version of this product' })}
		</span>
		<span>
			{#if latestRev == null}
				{$_('product.revision.number', { values: { rev }, default: `Revision ${rev}` })}
			{:else if editor}
				{$_('product.revision.details', {
					values: { rev, latestRev, editor, date },
					default: `Revision ${rev} of ${latestRev}, by ${editor} on ${date}`
				})}
			{:else}
				{$_('product.revision.details_no_editor', {
					values: { rev, latestRev, date },
					default: `Revision ${rev} of ${latestRev}, on ${date}`
				})}
			{/if}
		</span>
	</div>
	<div class="flex flex-wrap items-center gap-x-2 gap-y-2">
		{#if rev > 1}
			<a
				class="btn btn-ghost px-0 btn-sm"
				href={`${resolve('/products/[barcode]', { barcode: code })}?rev=${rev - 1}`}
			>
				<IconMdiChevronLeft class="h-4 w-4" aria-hidden="true" />
				{$_('product.revision.number', {
					values: { rev: rev - 1 },
					default: `Revision ${rev - 1}`
				})}
			</a>
		{/if}
		{#if latestRev == null || rev < latestRev}
			<a
				class="btn btn-ghost px-0 btn-sm"
				href={`${resolve('/products/[barcode]', { barcode: code })}?rev=${rev + 1}`}
			>
				{$_('product.revision.number', {
					values: { rev: rev + 1 },
					default: `Revision ${rev + 1}`
				})}
				<IconMdiChevronRight class="h-4 w-4" aria-hidden="true" />
			</a>
		{/if}
		<a class="btn btn-primary btn-sm" href={resolve('/products/[barcode]', { barcode: code })}>
			{$_('product.revision.current', { default: 'See the current version' })}
		</a>
	</div>
</div>
