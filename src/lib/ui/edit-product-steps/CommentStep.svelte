<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiCommentText from '@iconify-svelte/mdi/comment-text';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';

	type Props = { comment: string };
	let { comment = $bindable() }: Props = $props();

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

<h2
	class="text-primary mb-6 items-center justify-center gap-2 text-center text-base font-bold md:text-lg lg:text-xl xl:text-2xl"
>
	<IconMdiCommentText class="mr-1 h-6 w-6 align-middle" />
	{$_('product.edit.sections.comment')}
	<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
		<IconMdiHelpCircleOutline
			class="hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
		/>
	</button>
</h2>
{#if showInfo}
	<div
		class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
	>
		<button
			type="button"
			class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1"
			aria-label="Close"
			onclick={toggleInfo}
		>
			<IconMdiClose class="text-primary h-5 w-5" />
		</button>
		<IconMdiInformation class="text-primary mt-0.5 h-6 w-6 flex-shrink-0" />
		<span class="text-base-content/80 p-6 text-sm sm:text-base"
			>{$_('product.edit.info.comment')}</span
		>
	</div>
{/if}
<div class="space-y-6">
	<div class="mb-6 text-center">
		<p class="text-base-content/60 text-sm">{$_('product.edit.comment_description')}</p>
	</div>
	<div class="form-control">
		<label class="label" for="comment">
			<span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.comment')}</span>
		</label>
		<textarea
			id="comment"
			class="textarea textarea-bordered w-full text-sm sm:text-base"
			placeholder={$_('product.edit.comment_placeholder')}
			bind:value={comment}
			rows="3"
		></textarea>
	</div>
</div>
