<script lang="ts">
	import { _ } from '$lib/i18n';

	type Props = {
		currentStep: number;
		stepsLength: number;
		isSubmitting: boolean;
		prevStep: () => void;
		nextStep: () => void;
		submit: () => void;
	};

	let { currentStep, stepsLength, isSubmitting, prevStep, nextStep, submit }: Props = $props();
</script>

<!-- Navigation Buttons for Add Mode -->
<div class="mt-8 flex justify-between gap-3">
	{#if currentStep > 0}
		<button
			class="btn btn-outline min-w-50 text-sm max-md:grow sm:text-base"
			onclick={prevStep}
			type="button"
		>
			<span class="icon-[mdi--arrow-left] mr-2"></span>{$_('common.back')}
		</button>
	{/if}

	{#if currentStep < stepsLength - 1}
		<button
			class="btn btn-secondary min-w-50 text-sm max-md:grow sm:text-base"
			onclick={nextStep}
			type="button"
		>
			{$_('common.next')}<span class="icon-[mdi--arrow-right] ml-2"></span>
		</button>
	{:else}
		<button
			class="btn btn-success min-w-50 text-sm max-md:grow sm:text-base"
			onclick={submit}
			disabled={isSubmitting}
			type="button"
		>
			{#if isSubmitting}
				<span class="loading loading-spinner loading-sm mr-2"></span>
			{/if}
			{$_('product.edit.add_product')}
		</button>
	{/if}
</div>
