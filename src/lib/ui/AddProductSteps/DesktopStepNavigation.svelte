<script lang="ts">
	interface Props {
		currentStep: number;
		steps: string[];
		goToStep: (stepIndex: number) => void;
	}

	let { currentStep, steps, goToStep }: Props = $props();
</script>

<div class="mb-6 hidden md:block">
	<ul class="steps w-full text-xs sm:text-sm">
		{#each steps as step, i (step)}
			<li class="step {i <= currentStep ? 'step-secondary' : ''}">
				<button
					type="button"
					class="h-full w-full cursor-pointer border-none bg-transparent p-2 text-xs text-inherit transition-colors sm:text-sm"
					onclick={() => goToStep(i)}
					aria-label={`Go to step ${i + 1}: ${step}`}>{step}</button
				>
			</li>
		{/each}
	</ul>
</div>
