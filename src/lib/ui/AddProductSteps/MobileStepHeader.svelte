<script lang="ts">
	import { _ } from '$lib/i18n';

	interface Props {
		currentStep: number;
		steps: string[];
		onToggleInfo: () => void;
	}

	let { currentStep, steps, onToggleInfo }: Props = $props();
</script>

<div class="mb-6 block md:hidden">
	<div class="space-y-2 text-center">
		<div class="bg-primary/10 inline-flex items-center gap-2 rounded-full px-3 py-1">
			<span class="text-primary/80 text-xs font-medium"
				>{$_('common.step')}{` ${currentStep + 1}`}</span
			>
			<span class="text-primary/60 text-xs font-medium">{$_('common.of')}{` ${steps.length}`}</span>
		</div>
		<div class="flex items-center justify-center gap-2 px-4">
			<h2 class="text-primary text-center text-xl leading-tight font-semibold">
				{steps[currentStep]}
			</h2>
			<!-- Info icon for mobile, per step -->
			<button
				type="button"
				class="ml-2 flex items-center"
				aria-label="Info"
				onclick={onToggleInfo}
			>
				<span class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-6 w-6"
				></span>
			</button>
		</div>
	</div>
</div>
