<script lang="ts">
	import { _ } from '$lib/i18n';

	type Props = {
		onPrev?: () => void;
		onNext?: () => void;
	};
	let { onPrev, onNext }: Props = $props();
</script>

<div class="mb-6 flex items-center justify-between">
	<div>
		{#if onPrev != null}
			<button
				class="btn btn-circle btn-sm btn-outline"
				onclick={onPrev}
				type="button"
				title={$_('common.back')}
				aria-label={$_('common.back')}
			>
				<span class="icon-[mdi--arrow-left] h-4 w-4"></span>
			</button>
		{/if}
	</div>
	<div>
		{#if onNext != null}
			<button
				class="btn btn-circle btn-sm btn-secondary"
				onclick={onNext}
				type="button"
				title={$_('common.next')}
				aria-label={$_('common.next')}
			>
				<span class="icon-[mdi--arrow-right] h-4 w-4"></span>
			</button>
		{/if}
	</div>
</div>
