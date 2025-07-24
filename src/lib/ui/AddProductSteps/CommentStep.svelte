<script lang="ts">
	import StepNav from '../../../routes/products/[barcode]/edit/StepNav.svelte';
	import { _ } from '$lib/i18n';

	interface Props {
		comment: string;
		currentStep: number;
		stepsLength: number;
		showInfoComment: boolean;
		prevStep: () => void;
		nextStep: () => void;
		onToggleInfo: () => void;
		onCommentChange: (value: string) => void;
	}

	let { 
		comment, 
		currentStep, 
		stepsLength, 
		showInfoComment, 
		prevStep, 
		nextStep, 
		onToggleInfo, 
		onCommentChange 
	}: Props = $props();
</script>

<div class="card bg-base-100 shadow-md">
	<div class="card-body p-4 sm:p-6">
		<h2
			class="text-primary mb-6 hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl"
		>
			<span class="icon-[mdi--comment-text] mr-1 h-6 w-6 align-middle"></span>
			{$_('product.edit.sections.comment')}
			<button
				type="button"
				class="ml-2 align-middle"
				aria-label="Info"
				onclick={onToggleInfo}
			>
				<span
					class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
				></span>
			</button>
		</h2>
		{#if showInfoComment}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1"
					aria-label="Close"
					onclick={onToggleInfo}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
				<span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
				<span class="text-base-content/80 p-6 text-sm sm:text-base"
					>{$_('product.edit.info.comment')}</span
				>
			</div>
		{/if}
		<StepNav
			{currentStep}
			{stepsLength}
			onPrev={prevStep}
			onNext={nextStep}
			showNext={false}
		/>
		<div class="space-y-6">
			<div class="mb-6 text-center">
				<p class="text-base-content/60 text-sm">Add a comment about your changes (optional)</p>
			</div>
			<div class="form-control">
				<label class="label" for="comment">
					<span class="label-text text-sm font-medium sm:text-base"
						>{$_('product.edit.comment')}</span
					>
				</label>
				<textarea
					id="comment"
					class="textarea textarea-bordered w-full text-sm sm:text-base"
					placeholder={$_('product.edit.comment_placeholder')}
					value={comment}
					oninput={(e) => onCommentChange(e.currentTarget.value)}
					rows="3"
				></textarea>
			</div>
		</div>
	</div>
</div>
