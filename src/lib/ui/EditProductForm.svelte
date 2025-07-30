<script lang="ts">
	import ImagesStep from './edit-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './edit-product-steps/BasicInfoStep.svelte';
	import LanguagesStep from './edit-product-steps/LanguagesStep.svelte';
	import IngredientsStep from './edit-product-steps/IngredientsStep.svelte';
	import NutritionStep from './edit-product-steps/NutritionStep.svelte';
	import CommentStep from './edit-product-steps/CommentStep.svelte';

	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';
	import { _ } from '$lib/i18n';

	let {
		productStore,
		onSave
	}: { productStore: Writable<Product>; onSave: (data: Product) => void } = $props();

	let comment = $state('');

	function handleCommentChange(value: string) {
		comment = value;
	}

	function handleSubmit() {
		productStore.update((p) => {
			onSave(p);
			return p;
		});
	}
</script>

<div class="space-y-4">
	<!-- Images Section -->
	<ImagesStep {productStore} />

	<!-- Basic Info Section -->
	<BasicInfoStep {productStore} />

	<!-- Languages Section -->
	<LanguagesStep {productStore} />

	<!-- Ingredients Section -->
	<IngredientsStep {productStore} />

	<!-- Nutrition Section -->
	<NutritionStep {productStore} />

	<!-- Comment Section -->
	<CommentStep {comment} onCommentChange={handleCommentChange} />

	<div class="mt-8 flex justify-end">
		<button
			class="btn btn-primary w-full text-sm sm:w-auto sm:text-base"
			onclick={handleSubmit}
			type="button"
		>
			{$_('product.edit.save_btn')}
		</button>
	</div>
</div>
