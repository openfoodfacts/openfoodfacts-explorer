<script lang="ts">
	import { _ } from '$lib/i18n';
	import { goto } from '$app/navigation';
	import { page } from '$app/state';

	import IconMdiLoading from '@iconify-svelte/mdi/loading';

	type Props = {
		isSubmitting: boolean;
		submit: () => Promise<void>;
		comment: string;
	};

	let { isSubmitting, submit, comment = $bindable() }: Props = $props();

	function cancel() {
		goto('/products/' + page.params.barcode);
	}
</script>

<div class="floating-edit-bar">
	<!-- Comment input -->
	<input
		type="text"
		class="floating-edit-bar__input"
		placeholder="Changes summary"
		bind:value={comment}
		disabled={isSubmitting}
	/>

	<!-- Save button -->
	<button type="button" class="floating-edit-bar__save" onclick={submit} disabled={isSubmitting}>
		{#if isSubmitting}
			<IconMdiLoading
				class="floating-edit-bar__icon floating-edit-bar__icon--spin"
				aria-hidden="true"
			/>
		{:else}
			<svg
				class="floating-edit-bar__icon"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="3"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<polyline points="20 6 9 17 4 12"></polyline>
			</svg>
		{/if}
		<span>{$_('product.edit.save_btn')}</span>
	</button>

	<!-- Cancel button -->
	<button type="button" class="floating-edit-bar__cancel" onclick={cancel} disabled={isSubmitting}>
		<svg class="floating-edit-bar__icon" viewBox="0 0 24 24" aria-hidden="true">
			<circle cx="12" cy="12" r="10" fill="#555" stroke="none" />
			<line x1="8" y1="8" x2="16" y2="16" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
			<line x1="16" y1="8" x2="8" y2="16" stroke="#fff" stroke-width="2.5" stroke-linecap="round" />
		</svg>
		<span>{$_('common.cancel')}</span>
	</button>
</div>

<style>
	/* ── Desktop layout (single row) ── */
	.floating-edit-bar {
		position: fixed;
		bottom: 0;
		left: 0;
		right: 0;
		z-index: 100;
		background-color: #341100;
		border-top: 1px solid #eee;
		padding: 14px;
		display: flex;
		flex-wrap: wrap;
		align-items: center;
		gap: 10px;
	}

	/* Input: 8/12 columns on desktop → full width on mobile */
	.floating-edit-bar__input {
		flex: 1 1 auto;
		/* Desktop: ~66% via flex, remaining space is taken by 2 buttons */
		height: 37px;
		padding: 8px;
		font-size: 14px;
		color: #333;
		background-color: #fff;
		border: 1px solid #ccc;
		border-radius: 0;
		outline: none;
		box-sizing: border-box;
	}

	.floating-edit-bar__input:focus {
		border-color: #66afe9;
		box-shadow: 0 0 0 3px rgba(102, 175, 233, 0.3);
	}

	.floating-edit-bar__input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Save: 2/12 columns on desktop → 50% on mobile */
	.floating-edit-bar__save {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 234px;
		height: 37px;
		padding: 0;
		font-size: 13px;
		font-weight: 600;
		color: #fff;
		background-color: #4fa125;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: background-color 0.15s ease;
	}

	.floating-edit-bar__save:hover:not(:disabled) {
		background-color: #3d8a1c;
	}

	.floating-edit-bar__save:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	/* Cancel: 2/12 columns on desktop → 50% on mobile */
	.floating-edit-bar__cancel {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 234px;
		height: 37px;
		padding: 0;
		font-size: 13px;
		font-weight: 600;
		color: #333;
		background-color: #ede0db;
		border: none;
		border-radius: 8px;
		cursor: pointer;
		white-space: nowrap;
		flex-shrink: 0;
		transition: background-color 0.15s ease;
	}

	.floating-edit-bar__cancel:hover:not(:disabled) {
		background-color: #d5cab8;
	}

	.floating-edit-bar__cancel:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.floating-edit-bar__icon {
		width: 16px;
		height: 16px;
		flex-shrink: 0;
	}

	.floating-edit-bar__icon--spin {
		animation: spin 1s linear infinite;
	}

	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	/* ── Mobile / small screens (matches Foundation small-12 + small-6 + small-6) ── */
	@media (max-width: 640px) {
		.floating-edit-bar {
			gap: 8px;
		}

		/* Input goes full width (row 1) */
		.floating-edit-bar__input {
			flex: 0 0 100%;
			width: 100%;
		}

		/* Buttons go side by side, each ~50% (row 2) */
		.floating-edit-bar__save,
		.floating-edit-bar__cancel {
			flex: 1 1 0;
			width: auto;
			min-width: 0;
		}
	}
</style>
