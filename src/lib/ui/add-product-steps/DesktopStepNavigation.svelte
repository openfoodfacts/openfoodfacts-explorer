<script lang="ts">
	type Props = {
		currentStep: number;
		steps: string[];
		goToStep: (stepIndex: number) => void;
	};

	let { currentStep, steps, goToStep }: Props = $props();
</script>

<div class="mb-6 hidden md:block">
	<ul class="steps w-full text-xs sm:text-sm">
		{#each steps as step, i (step)}
			<button
				type="button"
				class="step {i <= currentStep ? 'step-secondary' : ''} cursor-pointer transition-colors"
				onclick={() => goToStep(i)}
				aria-label={`Go to step ${i + 1}: ${step}`}
			>
				{step}
			</button>
		{/each}
	</ul>
</div>
