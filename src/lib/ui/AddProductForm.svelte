<script lang="ts">
import StepNav from '../../routes/products/[barcode]/edit/StepNav.svelte';
import TagsString from '../../routes/products/[barcode]/edit/TagsString.svelte';
import TraceabilityCodes from '../../routes/products/[barcode]/edit/TraceabilityCodes.svelte';
import PhotoManager from '../../routes/products/[barcode]/edit/PhotoManager.svelte';
import { _ } from '$lib/i18n';

type Props = {
  productStore: any;
  comment: any;
  currentStep: number;
  steps: string[];
  showInfoImages: boolean;
  showInfoBasic: boolean;
  showInfoLanguages: boolean;
  showInfoIngredients: boolean;
  showInfoNutrition: boolean;
  showInfoComment: boolean;
  prevStep: () => void;
  nextStep: () => void;
  goToStep: (i: number) => void;
  handleNutrimentInput: (e: Event, key: string) => void;
  addLanguage: (code: string) => void;
  getLanguage: (code: string) => string;
  getIngredientsImage: (code: string) => string | null;
  getNutritionImage: (code: string) => string | null;
  filteredLanguages: string[];
  categoryNames: string[];
  labelNames: string[];
  brandNames: string[];
  storeNames: string[];
  originNames: string[];
  countriesNames: string[];
  isSubmitting: boolean;
  submit: () => void;
};
let {
  productStore,
  comment,
  currentStep,
  steps,
  showInfoImages,
  showInfoBasic,
  showInfoLanguages,
  showInfoIngredients,
  showInfoNutrition,
  showInfoComment,
  prevStep,
  nextStep,
  goToStep,
  handleNutrimentInput,
  addLanguage,
  getLanguage,
  getIngredientsImage,
  getNutritionImage,
  filteredLanguages,
  categoryNames,
  labelNames,
  brandNames,
  storeNames,
  originNames,
  countriesNames,
  isSubmitting,
  submit
}: Props = $props();

</script>

<!-- Step-by-step guided form UI, copy from +page.svelte add mode -->
<div class="mb-6 block md:hidden">
  <div class="space-y-2 text-center">
    <div class="bg-primary/10 inline-flex items-center gap-2 rounded-full px-3 py-1">
      <span class="text-primary/80 text-xs font-medium">{$_('common.step')}{` ${currentStep + 1}`}</span>
      <span class="text-primary/60 text-xs font-medium">{$_('common.of')}{` ${steps.length}`}</span>
    </div>
    <div class="flex items-center justify-center gap-2 px-4">
      <h2 class="text-base-content text-center text-xl leading-tight font-semibold">{steps[currentStep]}</h2>
      <!-- Info icon for mobile, per step -->
      {#if currentStep === 0}
        <button type="button" class="ml-2 flex items-center" aria-label="Info" onclick={() => showInfoImages = !showInfoImages}>
          <span class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-6 w-6"></span>
        </button>
      {:else if currentStep === 1}
        <button type="button" class="ml-2 flex items-center" aria-label="Info" onclick={() => showInfoBasic = !showInfoBasic}>
          <span class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-6 w-6"></span>
        </button>
      {:else if currentStep === 2}
        <button type="button" class="ml-2 flex items-center" aria-label="Info" onclick={() => showInfoLanguages = !showInfoLanguages}>
          <span class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-6 w-6"></span>
        </button>
      {:else if currentStep === 3}
        <button type="button" class="ml-2 flex items-center" aria-label="Info" onclick={() => showInfoIngredients = !showInfoIngredients}>
          <span class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-6 w-6"></span>
        </button>
      {:else if currentStep === 4}
        <button type="button" class="ml-2 flex items-center" aria-label="Info" onclick={() => showInfoNutrition = !showInfoNutrition}>
          <span class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-6 w-6"></span>
        </button>
      {:else if currentStep === 5}
        <button type="button" class="ml-2 flex items-center" aria-label="Info" onclick={() => showInfoComment = !showInfoComment}>
          <span class="icon-[mdi--help-circle-outline] text-primary hover:text-primary/70 h-6 w-6"></span>
        </button>
      {/if}
    </div>
  </div>
</div>

<div class="mb-6 hidden md:block">
  <ul class="steps w-full text-xs sm:text-sm">
    {#each steps as step, i}
      <li class="step {i <= currentStep ? 'step-primary' : ''}">
        <button type="button" class="h-full w-full cursor-pointer border-none bg-transparent p-2 text-xs text-inherit transition-colors sm:text-sm" onclick={() => goToStep(i)} aria-label={`Go to step ${i + 1}: ${step}`}>{step}</button>
      </li>
    {/each}
  </ul>
</div>


<!-- Step 1: Images -->
{#if currentStep === 0}
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-4 sm:p-6">
      <h2 class="text-primary mb-6 flex hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl">
        <span class="icon-[mdi--image-multiple] mr-1 h-6 w-6 align-middle"></span>
        {$_('product.edit.sections.images')}
        <button type="button" class="ml-2 align-middle" aria-label="Info" onclick={() => showInfoImages = !showInfoImages}>
          <span class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"></span>
        </button>
      </h2>
      {#if showInfoImages}
        <div class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm">
          <button type="button" class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1" aria-label="Close" onclick={() => showInfoImages = false}>
            <span class="icon-[mdi--close] text-primary h-5 w-5"></span>
          </button>
          <span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
          <span class="text-base-content/80 p-6 text-sm sm:text-base">{$_('product.edit.info.images')}</span>
        </div>
      {/if}
      <StepNav {currentStep} stepsLength={steps.length} onPrev={prevStep} onNext={nextStep} />
      <PhotoManager product={productStore} />
    </div>
  </div>
{/if}

<!-- Step 2: Basic Info -->
{#if currentStep === 1}
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-4 sm:p-6">
      <h2 class="text-primary mb-6 flex hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl">
        <span class="icon-[mdi--information] mr-1 h-6 w-6 align-middle"></span>
        {$_('product.edit.sections.basic_info')}
        <button type="button" class="ml-2 align-middle" aria-label="Info" onclick={() => showInfoBasic = !showInfoBasic}>
          <span class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"></span>
        </button>
      </h2>
      {#if showInfoBasic}
        <div class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm">
          <button type="button" class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1" aria-label="Close" onclick={() => showInfoBasic = false}>
            <span class="icon-[mdi--close] text-primary h-5 w-5"></span>
          </button>
          <span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
          <span class="text-base-content/80 p-6 text-sm sm:text-base">{$_('product.edit.info.basic_info')}</span>
        </div>
      {/if}
      <StepNav {currentStep} stepsLength={steps.length} onPrev={prevStep} onNext={nextStep} />
      <div class="space-y-6 overflow-hidden">
        <!-- Primary Fields Grid -->
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.quantity')}</span>
            </label>
            <input type="text" class="input input-bordered w-full text-sm sm:text-base" bind:value={productStore.quantity} placeholder="e.g., 250g, 1L, 500ml" />
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.packaging')}</span>
            </label>
            <input type="text" class="input input-bordered w-full text-sm sm:text-base" bind:value={productStore.packaging} placeholder="e.g., plastic bottle, glass jar" />
          </div>
        </div>
        <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.manufacturing_places')}</span>
            </label>
            <input type="text" class="input input-bordered w-full text-sm sm:text-base" bind:value={productStore.manufacturing_places} placeholder="e.g., France, Italy" />
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.emb_code')}</span>
            </label>
            <input type="text" class="input input-bordered w-full text-sm sm:text-base" bind:value={productStore.emb_codes} placeholder="e.g., EMB 12345" />
          </div>
        </div>
        <div class="form-control w-full">
          <label class="label">
            <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.website_url')}</span>
          </label>
          <input type="url" class="input input-bordered w-full text-sm sm:text-base" bind:value={productStore.link} placeholder="https://example.com" />
        </div>
        <!-- Tags Section -->
        <div class="divider">
          <span class="text-sm font-medium opacity-60">Product Tags</span>
        </div>
        <div class="space-y-4">
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.categories')}</span>
            </label>
            <div class="w-full">
              <TagsString bind:tagsString={productStore.categories} autocomplete={categoryNames} />
            </div>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.labels')}</span>
            </label>
            <div class="w-full">
              <TagsString bind:tagsString={productStore.labels} autocomplete={labelNames} />
            </div>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.brands')}</span>
            </label>
            <div class="w-full">
              <TagsString bind:tagsString={productStore.brands} autocomplete={brandNames} />
            </div>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.stores')}</span>
            </label>
            <div class="w-full">
              <TagsString bind:tagsString={productStore.stores} autocomplete={storeNames} />
            </div>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.origins')}</span>
            </label>
            <div class="w-full">
              <TagsString bind:tagsString={productStore.origins} autocomplete={originNames} />
            </div>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.countries')}</span>
            </label>
            <div class="w-full">
              <TagsString bind:tagsString={productStore.countries} autocomplete={countriesNames} />
            </div>
          </div>
          <div class="form-control w-full">
            <label class="label">
              <span class="label-text text-sm font-medium sm:text-base">Traceability Codes</span>
            </label>
            <div class="w-full">
              <TraceabilityCodes bind:traceabilityCodes={productStore.emb_codes} autocomplete={[]} />
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Step 3: Languages -->
{#if currentStep === 2}
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-4 sm:p-6">
      <h2 class="text-primary mb-6 flex hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl">
        <span class="icon-[mdi--translate] mr-1 h-6 w-6 align-middle"></span>
        {$_('product.edit.sections.languages')}
        <button type="button" class="ml-2 align-middle" aria-label="Info" onclick={() => showInfoLanguages = !showInfoLanguages}>
          <span class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"></span>
        </button>
      </h2>
      {#if showInfoLanguages}
        <div class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm">
          <button type="button" class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1" aria-label="Close" onclick={() => showInfoLanguages = false}>
            <span class="icon-[mdi--close] text-primary h-5 w-5"></span>
          </button>
          <span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
          <span class="text-base-content/80 p-6 text-sm sm:text-base">{$_('product.edit.info.languages')}</span>
        </div>
      {/if}
      <StepNav {currentStep} stepsLength={steps.length} onPrev={prevStep} onNext={nextStep} />
      <div class="collapse-arrow bg-base-200 collapse">
        <input type="checkbox" />
        <div class="collapse-title text-sm font-semibold sm:text-base">{$_('product.edit.add_language')}</div>
        <div class="collapse-content">
          <label class="input w-full text-sm sm:text-base">
            <span class="icon-[mdi--search] h-5 w-5"></span>
            <input type="search" placeholder={$_('product.edit.search_languages')} bind:value={productStore.languageSearch} class="text-sm sm:text-base" />
          </label>
          {#if filteredLanguages.length === 0}
            <p class="mt-4 text-center text-sm opacity-70 sm:text-base">{$_('product.edit.no_languages_found')}</p>
          {:else}
            <div class="mt-2 grid max-h-96 grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-2 overflow-auto sm:grid-cols-[repeat(auto-fill,minmax(200px,1fr))]">
              {#each filteredLanguages as code (code)}
                <button class="btn btn-ghost text-xs sm:text-sm" onclick={() => addLanguage(code)}>{getLanguage(code)}</button>
              {/each}
            </div>
          {/if}
        </div>
      </div>
      <div class="tabs tabs-box mt-4">
        {#each Object.keys(productStore.languages_codes ?? {}) as code (code)}
          <input type="radio" name="name_tabs" class="tab text-xs sm:text-sm" aria-label={getLanguage(code)} checked={code === productStore.lang} />
          <div class="tab-content form-control p-6">
            <label class="label text-sm sm:text-base">{$_('product.edit.name')} ({getLanguage(code)})</label>
            <input type="text" class="input input-bordered w-full text-sm sm:text-base" bind:value={productStore[`product_name_${code}`]} />
          </div>
        {/each}
        {#if Object.keys(productStore.languages_codes ?? {}).length === 0}
          <div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Step 4: Ingredients -->
{#if currentStep === 3}
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-4 sm:p-6">
      <h2 class="text-primary mb-6 flex hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl">
        <span class="icon-[mdi--format-list-bulleted] mr-1 h-6 w-6 align-middle"></span>
        {$_('product.edit.sections.ingredients')}
        <button type="button" class="ml-2 align-middle" aria-label="Info" onclick={() => showInfoIngredients = !showInfoIngredients}>
          <span class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"></span>
        </button>
      </h2>
      {#if showInfoIngredients}
        <div class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm">
          <button type="button" class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1" aria-label="Close" onclick={() => showInfoIngredients = false}>
            <span class="icon-[mdi--close] text-primary h-5 w-5"></span>
          </button>
          <span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
          <span class="text-base-content/80 p-6 text-sm sm:text-base">{$_('product.edit.info.ingredients')}</span>
        </div>
      {/if}
      <StepNav {currentStep} stepsLength={steps.length} onPrev={prevStep} onNext={nextStep} />
      <div class="tabs tabs-box">
        {#each Object.keys(productStore.languages_codes ?? {}) as code (code)}
          <input type="radio" name="ingredients_tabs" class="tab text-xs sm:text-sm" aria-label={getLanguage(code)} checked={code === productStore.lang} />
          <div class="tab-content form-control p-6">
            {#if getIngredientsImage(code)}
              <img src={getIngredientsImage(code)} alt="Ingredients" class="mb-4" />
            {:else}
              <p class="alert alert-warning mb-4 text-sm sm:text-base">{$_('product.edit.no_ingredients_image')}</p>
            {/if}
            <label class="label text-sm sm:text-base">{$_('product.edit.ingredients_list')} ({getLanguage(code)})</label>
            <div class="form-control mb-4">
              <textarea class="textarea textarea-bordered h-40 w-full text-sm sm:text-base" bind:value={productStore[`ingredients_text_${code}`]}></textarea>
            </div>
          </div>
        {/each}
        {#if Object.keys(productStore.languages_codes ?? {}).length === 0}
          <div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Step 5: Nutrition -->
{#if currentStep === 4}
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-4 sm:p-6">
      <h2 class="text-primary mb-6 flex hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl">
        <span class="icon-[mdi--nutrition] mr-1 h-6 w-6 align-middle"></span>
        {$_('product.edit.sections.nutrition')}
        <button type="button" class="ml-2 align-middle" aria-label="Info" onclick={() => showInfoNutrition = !showInfoNutrition}>
          <span class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"></span>
        </button>
      </h2>
      {#if showInfoNutrition}
        <div class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm">
          <button type="button" class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1" aria-label="Close" onclick={() => showInfoNutrition = false}>
            <span class="icon-[mdi--close] text-primary h-5 w-5"></span>
          </button>
          <span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
          <span class="text-base-content/80 p-6 text-sm sm:text-base">{$_('product.edit.info.nutrition')}</span>
        </div>
      {/if}
      <StepNav {currentStep} stepsLength={steps.length} onPrev={prevStep} onNext={nextStep} />
      <div class="tabs tabs-box mb-4">
        {#each Object.keys(productStore.languages_codes ?? {}) as code (code)}
          <input type="radio" name="nutrition_image_tabs" class="tab text-xs sm:text-sm" aria-label={getLanguage(code)} checked={code === productStore.lang} />
          <div class="tab-content p-6">
            {#if getNutritionImage(code)}
              <img src={getNutritionImage(code)} alt={`Nutrition facts for ${getLanguage(code)}`} class="mb-4 h-auto max-w-full" />
            {:else}
              <p class="alert alert-warning mb-4 text-sm sm:text-base">{$_('product.edit.no_nutrition_image')}</p>
            {/if}
          </div>
        {/each}
        {#if Object.keys(productStore.languages_codes ?? {}).length === 0}
          <div class="alert alert-warning text-sm sm:text-base">{$_('product.edit.no_languages_found')}</div>
        {/if}
      </div>
      <div class="space-y-6">
        <div class="form-control">
          <label class="label">
            <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.serving_size')}</span>
          </label>
          <input type="text" class="input input-bordered w-full text-sm sm:text-base" bind:value={productStore.serving_size} placeholder="e.g., 100g, 1 serving (30g)" />
        </div>
        <div class="form-control">
          <label class="label cursor-pointer justify-start gap-3">
            <input type="checkbox" class="checkbox" bind:checked={productStore.no_nutrition_data} />
            <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.no_nutrition_data')}</span>
          </label>
        </div>
        {#if !productStore.no_nutrition_data}
          <div class="space-y-6">
            <div class="divider">
              <span class="text-sm font-medium opacity-60">Nutritional Values</span>
            </div>
            <!-- Energy -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Energy (kJ)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.['energy-kj_100g'] ?? ''} oninput={(e) => handleNutrimentInput(e, 'energy-kj_100g')} placeholder="2100" step="1" min="0" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Energy (kcal)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.['energy-kcal_100g'] ?? ''} oninput={(e) => handleNutrimentInput(e, 'energy-kcal_100g')} placeholder="500" step="1" min="0" />
              </div>
            </div>
            <!-- Macronutrients -->
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Fat (g)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.fat_100g ?? ''} oninput={(e) => handleNutrimentInput(e, 'fat_100g')} placeholder="10.5" step="0.1" min="0" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Saturated Fat (g)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.['saturated-fat_100g'] ?? ''} oninput={(e) => handleNutrimentInput(e, 'saturated-fat_100g')} placeholder="3.2" step="0.1" min="0" />
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Carbohydrates (g)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.carbohydrates_100g ?? ''} oninput={(e) => handleNutrimentInput(e, 'carbohydrates_100g')} placeholder="60.0" step="0.1" min="0" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Sugars (g)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.sugars_100g ?? ''} oninput={(e) => handleNutrimentInput(e, 'sugars_100g')} placeholder="5.0" step="0.1" min="0" />
              </div>
            </div>
            <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Proteins (g)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.proteins_100g ?? ''} oninput={(e) => handleNutrimentInput(e, 'proteins_100g')} placeholder="12.0" step="0.1" min="0" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Salt (g)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.salt_100g ?? ''} oninput={(e) => handleNutrimentInput(e, 'salt_100g')} placeholder="1.2" step="0.01" min="0" />
              </div>
              <div class="form-control">
                <label class="label">
                  <span class="label-text text-sm font-medium sm:text-base">Sodium (g)</span>
                </label>
                <input type="number" class="input input-bordered w-full text-sm sm:text-base" value={productStore.nutriments?.sodium_100g ?? ''} oninput={(e) => handleNutrimentInput(e, 'sodium_100g')} placeholder="0.48" step="0.01" min="0" />
              </div>
            </div>
          </div>
        {:else}
          <div class="alert alert-info">
            <span class="icon-[mdi--information] h-5 w-5"></span>
            <span class="text-sm sm:text-base">{$_('product.edit.no_nutrition_specified')}</span>
          </div>
        {/if}
      </div>
    </div>
  </div>
{/if}

<!-- Step 6: Comment -->
{#if currentStep === 5}
  <div class="card bg-base-100 shadow-md">
    <div class="card-body p-4 sm:p-6">
      <h2 class="text-primary mb-6 flex hidden items-center justify-center gap-2 text-center text-base font-bold md:block md:text-lg lg:text-xl xl:text-2xl">
        <span class="icon-[mdi--comment-text] mr-1 h-6 w-6 align-middle"></span>
        {$_('product.edit.sections.comment')}
        <button type="button" class="ml-2 align-middle" aria-label="Info" onclick={() => showInfoComment = !showInfoComment}>
          <span class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"></span>
        </button>
      </h2>
      {#if showInfoComment}
        <div class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm">
          <button type="button" class="hover:bg-primary/10 absolute top-2 right-2 m-2 rounded p-1" aria-label="Close" onclick={() => showInfoComment = false}>
            <span class="icon-[mdi--close] text-primary h-5 w-5"></span>
          </button>
          <span class="icon-[mdi--information] text-primary mt-0.5 h-6 w-6 flex-shrink-0"></span>
          <span class="text-base-content/80 p-6 text-sm sm:text-base">{$_('product.edit.info.comment')}</span>
        </div>
      {/if}
      <StepNav {currentStep} stepsLength={steps.length} onPrev={prevStep} onNext={nextStep} showNext={false} />
      <div class="space-y-6">
        <div class="mb-6 text-center">
          <p class="text-base-content/60 text-sm">Add a comment about your changes (optional)</p>
        </div>
        <div class="form-control">
          <label class="label">
            <span class="label-text text-sm font-medium sm:text-base">{$_('product.edit.comment')}</span>
          </label>
          <textarea id="comment" class="textarea textarea-bordered w-full text-sm sm:text-base" placeholder={$_('product.edit.comment_placeholder')} bind:value={comment} rows="3"></textarea>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Navigation Buttons for Add Mode -->
<div class="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
  <div class="flex">
    {#if currentStep > 0}
      <button class="btn btn-outline w-full text-sm sm:w-auto sm:text-base" onclick={prevStep} type="button">
        <span class="icon-[mdi--arrow-left] mr-2"></span>{$_('common.back')}
      </button>
    {/if}
  </div>
  <div class="flex">
    {#if currentStep < steps.length - 1}
      <button class="btn btn-primary w-full text-sm sm:w-auto sm:text-base" onclick={nextStep} type="button">
        {$_('common.next')}<span class="icon-[mdi--arrow-right] ml-2"></span>
      </button>
    {:else}
      <button class="btn btn-primary w-full text-sm sm:w-auto sm:text-base" onclick={submit} disabled={isSubmitting} type="button">
        {#if isSubmitting}
          <span class="loading loading-spinner loading-sm mr-2"></span>
        {/if}
        {$_('product.edit.add_product')}
      </button>
    {/if}
  </div>
</div>
