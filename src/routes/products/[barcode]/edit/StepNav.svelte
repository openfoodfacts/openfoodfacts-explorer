<script lang="ts">
	import { _ } from '$lib/i18n';

	type Props = {
		currentStep: number;
		stepsLength: number;
		onPrev: () => void;
		onNext: () => void;
		showNext?: boolean;
	};
	let { currentStep, stepsLength, onPrev, onNext, showNext = true }: Props = $props();
</script>

<div class="mb-6 flex items-center justify-between">
	<div>
		{#if currentStep > 0}
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
		{#if currentStep < stepsLength - 1 && showNext}
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
