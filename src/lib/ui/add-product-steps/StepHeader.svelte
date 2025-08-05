<script lang="ts">
	import { _ } from '$lib/i18n';

	type Props = {
		currentStep: number;
		steps: string[];
		goToStep: (stepIndex: number) => void;
		onToggleInfo: () => void;
	};

	let { currentStep, steps, onToggleInfo, goToStep }: Props = $props();
</script>

<!-- Desktop step navigation -->
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

<!-- Mobile step header -->
<div class="navigation mb-6 md:hidden">
	<div class="my-2 flex flex-col items-center gap-4">
		<div class="bg-primary/10 flex items-center justify-center rounded-full">
			<div class="px-3 py-2 text-sm">
				<span class="text-primary/80 font-medium">
					{$_('common.step')}
					{`${currentStep + 1}`}
				</span>
				<span class="text-primary/60 font-medium">{$_('common.of')}{` ${steps.length}`}</span>
			</div>
		</div>
		<div class="flex items-center justify-center gap-2 px-4">
			<h2 class="text-primary text-xl font-semibold">
				{steps[currentStep]}
			</h2>
			<!-- Info icon for mobile, per step -->
			<button
				type="button"
				class="text-primary hover:text-primary/70 ml-2 flex cursor-pointer items-center text-2xl"
				aria-label="Info"
				onclick={onToggleInfo}
			>
				<span class="icon-[mdi--help-circle-outline]"></span>
			</button>
		</div>
	</div>
</div>
