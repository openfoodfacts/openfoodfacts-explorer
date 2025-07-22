<script lang="ts">
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
				on:click={onPrev}
				type="button"
				title="Back"
			>
				<span class="icon-[mdi--arrow-left] h-4 w-4"></span>
			</button>
		{/if}
	</div>
	<div>
		{#if currentStep < stepsLength - 1 && showNext}
			<button
				class="btn btn-circle btn-sm btn-primary"
				on:click={onNext}
				type="button"
				title="Next"
			>
				<span class="icon-[mdi--arrow-right] h-4 w-4"></span>
			</button>
		{/if}
	</div>
</div>
