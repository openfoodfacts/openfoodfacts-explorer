<script lang="ts">
	import { _ } from '$lib/i18n';

	interface Props {
		comment: string;
		onCommentChange: (value: string) => void;
	}

	let { comment, onCommentChange }: Props = $props();

	let showInfoComment = $state(false);

	function handleCommentChange(event: Event) {
		const target = event.target as HTMLTextAreaElement;
		onCommentChange(target.value);
	}
</script>

<div class="collapse-arrow bg-base-100 collapse shadow-md">
	<input type="checkbox" />
	<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
		<span class="icon-[mdi--comment-text] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
		{$_('product.edit.sections.comment')}
	</div>
	<div class="collapse-content">
		<button
			type="button"
			class="mb-2"
			aria-label="Info"
			onclick={() => (showInfoComment = !showInfoComment)}
		>
			<span
				class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
			></span>
		</button>
		{#if showInfoComment}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
				<span class="text-base-content/80 p-4 text-sm sm:text-base"
					>Optionally, add a comment to describe your changes or provide additional context.</span
				>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
					aria-label="Close"
					onclick={() => (showInfoComment = false)}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
			</div>
		{/if}
		<div class="form-control">
			<label class="label" for="comment-edit">
				<span class="label-text text-sm font-medium sm:text-base"
					>{$_('product.edit.comment')}</span
				>
			</label>
			<textarea
				id="comment-edit"
				class="textarea textarea-bordered w-full text-sm sm:text-base"
				placeholder={$_('product.edit.comment_placeholder')}
				value={comment}
				oninput={handleCommentChange}
				rows="3"
			></textarea>
		</div>
	</div>
</div>
