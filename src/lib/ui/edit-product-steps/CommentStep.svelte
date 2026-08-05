<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiCommentText from '@iconify-svelte/mdi/comment-text';
	import IconMdiHelpCircleOutline from '@iconify-svelte/mdi/help-circle-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';
	import IconMdiInformation from '@iconify-svelte/mdi/information';

	type Props = { comment: string; editMode?: boolean };
	let { comment = $bindable(), editMode = false }: Props = $props();

	let showInfo = $state(false);
	function toggleInfo() {
		showInfo = !showInfo;
	}
</script>

{#if !editMode}
	<h2
		class="mb-6 items-center justify-center gap-2 text-center text-base font-bold text-primary md:text-lg lg:text-xl xl:text-2xl"
	>
		<IconMdiCommentText class="mr-1 h-6 w-6 align-middle" />
		{$_('product.edit.sections.comment')}
		<button type="button" class="ml-2 align-middle" aria-label="Info" onclick={toggleInfo}>
			<IconMdiHelpCircleOutline
				class="ml-4 h-6 w-6 text-primary hover:cursor-pointer hover:text-primary/70"
			/>
		</button>
	</h2>
	{#if showInfo}
		<div
			class="relative mb-4 flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 p-4 text-sm text-primary-content shadow-sm"
		>
			<button
				type="button"
				class="absolute top-2 right-2 m-2 rounded p-1 hover:bg-primary/10"
				aria-label="Close"
				onclick={toggleInfo}
			>
				<IconMdiClose class="h-5 w-5 text-primary" />
			</button>
			<IconMdiInformation class="mt-0.5 h-6 w-6 flex-shrink-0 text-primary" />
			<span class="p-6 text-sm text-base-content/80 sm:text-base"
				>{$_('product.edit.info.comment')}</span
			>
		</div>
	{/if}
{/if}
<div class="space-y-6">
	<div class="mb-6 text-center">
		<p class="text-sm text-base-content/60">{$_('product.edit.comment_description')}</p>
	</div>
	<div class="form-control">
		<label class="label" for="comment">
			<span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.comment')}</span>
		</label>
		<textarea
			id="comment"
			class="textarea-bordered textarea w-full text-sm sm:text-base"
			placeholder={$_('product.edit.comment_placeholder')}
			bind:value={comment}
			rows="3"></textarea>
	</div>
</div>
