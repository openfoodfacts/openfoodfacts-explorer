<script lang="ts">
	import { _ } from '$lib/i18n';
	import { fly } from 'svelte/transition';

	import IconMdiContentSave from '@iconify-svelte/mdi/content-save';
	import IconMdiLoading from '@iconify-svelte/mdi/loading';

	type Props = {
		isSubmitting: boolean;
		submit: () => Promise<void>;
		/** Whether the sticky button is visible (i.e. edit mode is active) */
		visible?: boolean;
	};

	let { isSubmitting, submit, visible = true }: Props = $props();
</script>

{#if visible}
	<div class="fixed right-6 bottom-6 z-50" transition:fly={{ y: 24, duration: 200 }} role="none">
		<button
			type="button"
			class="btn btn-primary flex items-center gap-2 rounded-full px-5 shadow-xl"
			class:loading={isSubmitting}
			onclick={submit}
			disabled={isSubmitting}
			aria-label={$_('product.edit.save_btn')}
			title={$_('product.edit.save_btn')}
		>
			{#if isSubmitting}
				<IconMdiLoading class="h-5 w-5 animate-spin" aria-hidden="true" />
			{:else}
				<IconMdiContentSave class="h-5 w-5" aria-hidden="true" />
			{/if}
			<span class="hidden sm:inline">{$_('product.edit.save_btn')}</span>
		</button>
	</div>
{/if}
