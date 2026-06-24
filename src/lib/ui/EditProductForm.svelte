<script lang="ts">
	import { onMount } from 'svelte';
	import ImagesStep from './edit-product-steps/ImagesStep.svelte';
	import BasicInfoStep from './edit-product-steps/BasicInfoStep.svelte';
	import LanguagesStep from './edit-product-steps/LanguagesStep.svelte';
	import IngredientsStep from './edit-product-steps/IngredientsStep.svelte';
	import NutritionStep from './edit-product-steps/NutritionStep.svelte';
	import PackagingStep from './edit-product-steps/PackagingStep.svelte';
	import CommentStep from './edit-product-steps/CommentStep.svelte';
	import EditProductSidebar from './EditProductSidebar.svelte';

	import IconMdiTranslate from '@iconify-svelte/mdi/translate';
	import IconMdiImageMultiple from '@iconify-svelte/mdi/image-multiple';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiFormatListBulleted from '@iconify-svelte/mdi/format-list-bulleted';
	import IconMdiNutrition from '@iconify-svelte/mdi/nutrition';
	import IconMdiPackageVariant from '@iconify-svelte/mdi/package-variant';
	import IconMdiCommentText from '@iconify-svelte/mdi/comment-text';
	import IconMdiShieldAccount from '@iconify-svelte/mdi/shield-account';
	import IconMdiTagMultiple from '@iconify-svelte/mdi/tag-multiple';
	import IconMdiOpenInNew from '@iconify-svelte/mdi/open-in-new';

	import type { Product } from '$lib/api';
	import { _ } from '$lib/i18n';
	import { preferences } from '$lib/settings';
	import { getPermissionsCtx } from '$lib/stores/user';
	import BarcodeCorrectionCard from './BarcodeCorrectionCard.svelte';
	import DeleteProductCard from './DeleteProductCard.svelte';
	import ObsoleteProductCard from './ObsoleteProductCard.svelte';
	type Props = {
		product: Product;

		getIngredientsImage: (language: string) => string | null;
		getNutritionImage: (language: string) => string | null;
		getPackagingImage: (language: string) => string | null;

		// Submission

		isSubmitting: boolean;
		submit: () => Promise<void>;
		onCorrectBarcode: (newCode: string) => Promise<void>;
		onDeleteProduct?: (comment: string) => Promise<void>;
		comment: string;
		handleNutrimentInput: (e: Event, key: string) => void;

		// Language

		addLanguage: (code: string) => void;
		languages: string[];

		// Taxonomy entries

		categoryNames: string[];
		labelNames: string[];
		brandNames: string[];
		storeNames: string[];
		originNames: string[];
		countriesNames: string[];
		units: string[];
		allergenNames: string[];
	};

	let {
		product = $bindable(),
		comment = $bindable(),
		handleNutrimentInput,
		addLanguage,
		getIngredientsImage,
		getNutritionImage,
		getPackagingImage,
		languages,
		categoryNames,
		labelNames,
		brandNames,
		storeNames,
		originNames,
		countriesNames,
		units,
		allergenNames,
		isSubmitting,
		submit,
		onCorrectBarcode,
		onDeleteProduct
	}: Props = $props();

	function getOpenPricesUrl(code: string): string {
		const params = new URLSearchParams({ code });
		return `https://prices.openfoodfacts.org/prices/add/single?${params}`;
	}

	const permissions = getPermissionsCtx();

	let sidebar = $state<ReturnType<typeof EditProductSidebar>>();
	let isMobile = $state(false);

	onMount(() => {
		const updateMobileState = () => {
			isMobile = window.innerWidth < 1024;
		};
		updateMobileState();
		window.addEventListener('resize', updateMobileState);
		return () => window.removeEventListener('resize', updateMobileState);
	});

	function handleCollapseToggle(id: string) {
		sidebar?.handleCollapseToggle(id);
	}
</script>

<div class="relative w-full lg:grid lg:grid-cols-[auto_1fr] lg:gap-8">
	<EditProductSidebar bind:this={sidebar} />

	<div class="space-y-4 min-w-0 w-full">
		<!-- Languages Section -->
		<div id="languages" class="collapse-arrow bg-base-200 collapse shadow-md">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('languages');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiTranslate class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.languages')}
			</div>
			<div class="collapse-content">
				<LanguagesStep bind:product {addLanguage} codes={languages} editMode />
			</div>
		</div>

		<!-- Images Section -->
		<div id="images" class="collapse-arrow bg-base-200 collapse shadow-md">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('images');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiImageMultiple class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.images')}
			</div>
			<div class="collapse-content">
				<ImagesStep bind:product editMode />
			</div>
		</div>

		<!-- Basic Info Section -->
		<div id="basic-info" class="collapse-arrow bg-base-200 collapse overflow-visible shadow-md">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('basic-info');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiInformation class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.basic_info')}
			</div>
			<div class="collapse-content">
				<BasicInfoStep
					bind:product
					{brandNames}
					{categoryNames}
					{countriesNames}
					{labelNames}
					{originNames}
					{storeNames}
					editMode
				/>
			</div>
		</div>

		<!-- Ingredients Section -->
		<div id="ingredients" class="collapse-arrow bg-base-200 collapse overflow-visible shadow-md">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('ingredients');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiFormatListBulleted class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.ingredients')}
			</div>
			<div class="collapse-content">
				<IngredientsStep bind:product {getIngredientsImage} {allergenNames} editMode />
			</div>
		</div>

		<!-- Nutrition Section -->
		<!-- overflow-visible is needed for the sticky image -->
		<div id="nutrition" class="collapse-arrow bg-base-200 collapse overflow-visible shadow-md">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('nutrition');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiNutrition class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.nutrition')}
			</div>
			<div class="collapse-content">
				<NutritionStep bind:product {units} {getNutritionImage} {handleNutrimentInput} editMode />
			</div>
		</div>

		<!-- Prices Section -->
		<div id="prices" class="collapse-arrow bg-base-200 collapse shadow-md">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('prices');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiTagMultiple class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.prices')}
			</div>
			<div class="collapse-content">
				<p class="text-base-content/70 mt-2 mb-4 text-sm">
					{$_('product.edit.info.prices')}
				</p>
				{#if product.code != null}
					<a
						href={getOpenPricesUrl(product.code)}
						class="btn btn-secondary btn-sm"
						target="_blank"
						rel="noopener noreferrer"
					>
						<IconMdiOpenInNew class="mr-1 h-4 w-4" />
						{$_('product.edit.prices.add_price_btn')}
					</a>
				{/if}
			</div>
		</div>

		<!-- Packaging Section -->
		<div class="collapse-arrow bg-base-200 collapse overflow-visible shadow-md" id="packaging">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('packaging');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiPackageVariant class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.packaging')}
			</div>
			<div class="collapse-content">
				<PackagingStep bind:product {getPackagingImage} editMode />
			</div>
		</div>

		<!-- Comment Section -->
		<div id="comment" class="collapse-arrow bg-base-200 collapse shadow-md">
			<input
				type="checkbox"
				checked={isMobile ? false : $preferences.editing.expandAllSections}
				onchange={(e) => {
					if (e.isTrusted) handleCollapseToggle('comment');
				}}
			/>
			<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
				<IconMdiCommentText class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
				{$_('product.edit.sections.comment')}
			</div>
			<div class="collapse-content">
				<CommentStep bind:comment editMode />
			</div>
		</div>

		<!-- Moderator Tools Section -->
		{#if permissions.isModerator && $preferences.moderator}
			<div
				id="moderator-tools"
				class="collapse-arrow bg-base-200 collapse overflow-visible shadow-md"
			>
				<input
					type="checkbox"
					checked={isMobile ? false : $preferences.editing.expandAllSections}
					onchange={(e) => {
						if (e.isTrusted) handleCollapseToggle('moderator-tools');
					}}
				/>
				<div class="collapse-title text-warning flex items-center text-sm font-bold sm:text-base">
					<IconMdiShieldAccount class="mr-2 h-4 w-4 sm:h-5 sm:w-5" />
					{$_('product.edit.sections.moderator_tools')}
				</div>
				<div class="collapse-content">
					<p class="text-base-content/70 mb-4 text-sm">
						{$_('product.edit.info.moderator_tools')}
					</p>
					<BarcodeCorrectionCard currentCode={product.code} onCorrect={onCorrectBarcode} />
					<div class="divider"></div>
					<ObsoleteProductCard bind:product />
					{#if onDeleteProduct}
						<div class="divider"></div>
						<DeleteProductCard
							barcode={product.code}
							productName={product.product_name || product.product_name_en || ''}
							onDelete={onDeleteProduct}
						/>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</div>

<div class="mt-8 flex justify-end">
	<button
		class="btn btn-primary w-full text-sm sm:w-auto sm:text-base"
		onclick={submit}
		disabled={isSubmitting}
		aria-busy={isSubmitting}
		type="button"
	>
		{#if isSubmitting}
			<span class="loading loading-spinner loading-xs sm:loading-sm mr-2" aria-hidden="true"></span>
		{/if}
		{$_('product.edit.save_btn')}
	</button>
</div>
