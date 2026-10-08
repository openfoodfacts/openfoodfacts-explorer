<script lang="ts">
	import type { ProductSource } from '$lib/api/sources';
	import { _ } from '$lib/i18n';
	import IconMdiDatabase from '@iconify-svelte/mdi/database';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';

	interface Props {
		source?: ProductSource;
		fieldName?: string;
	}

	let { source, fieldName }: Props = $props();

	let label = $derived(
		source?.name ||
			(source?.id ? source.id.replace(/^(org-|source-)/, '') : '') ||
			$_('source_badge.source', { default: 'External source' })
	);
</script>

{#if source}
	{#if source.url}
		<a
			href={source.url}
			target="_blank"
			rel="noopener noreferrer"
			class="badge gap-1 badge-outline text-xs badge-sm transition-colors hover:badge-primary"
			title={$_('source_badge.imported_from', {
				default: 'Source: {source}',
				values: { source: label }
			})}
			data-field={fieldName}
		>
			<IconMdiDatabase class="h-3 w-3" />
			<span class="max-w-[120px] truncate">{label}</span>
			<IconMdiOpenInNew class="h-2.5 w-2.5 opacity-60" />
		</a>
	{:else}
		<span
			class="badge gap-1 badge-ghost text-xs badge-sm"
			title={$_('source_badge.imported_from', {
				default: 'Source: {source}',
				values: { source: label }
			})}
			data-field={fieldName}
		>
			<IconMdiDatabase class="h-3 w-3" />
			<span class="max-w-[120px] truncate">{label}</span>
		</span>
	{/if}
{/if}
