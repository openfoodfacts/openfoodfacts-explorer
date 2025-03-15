<script lang="ts">
	import { getProductImage, ProductsApi, type Product } from '$lib/api';
	import { capitalize } from '$lib/utils';
	import ISO6391 from 'iso-639-1';

	interface Props {
		product: Product;
	}

	let { product }: Props = $props();

	function getLanguage(code: string) {
		return ISO6391.getName(code);
	}
	const imageKeys = $derived(Object.keys(product.images));
	const rawImageKeys = $derived(imageKeys.filter((key) => key.match(/^\d+$/)));
	const imageTypes = ['front', 'nutrition', 'ingredients', 'packaging'];
	let selectedType = $state(imageTypes[0]);
	let chosenImageId: string | undefined = $state();
	let selectedLanguageCode = $state('en');
	let modal: HTMLDialogElement | null = null;

	async function unselectImageasync(key: string) {
		console.group('Product added/edited');
		console.debug('Submitting', product);
		const ok = await new ProductsApi(fetch).unselectProductImage(product.code, key);
		console.debug('Submitted', ok);
		console.groupEnd();
		if (ok) {
			console.log('Product', product);
			// TODO: Remove the image from the product
			// This implementation is not tested, as the API is returning a CORS error
			delete product.images[key];
		}
	}

	async function selectImage() {
		if (!chosenImageId) {
			return;
		}
		console.group('Product added/edited');
		console.debug('Submitting', product);
		const ok = await new ProductsApi(fetch).selectProductImage(
			product.code,
			chosenImageId,
			`${selectedType}_${selectedLanguageCode}`
		);
		console.debug('Submitted', ok);
		console.groupEnd();
		if (ok) {
			console.log('Product', product);
			// TODO: Add the image to the product
			// Blocked by the CORS error
		}
	}

	function chooseImage(key: string) {
		chosenImageId = key;
		modal?.showModal();
	}
</script>

<div class="collapse-arrow dark:bg-base-200 collapse bg-white p-2 shadow-md">
	<input type="checkbox" />
	<div class="collapse-title font-semibold">Manage Photos</div>
	<div class="collapse-content text-sm">
		<div class="tabs">
			{#each Object.keys(product.languages_codes) as code}
				<input
					type="radio"
					name="image_tabs"
					class="tab"
					aria-label={getLanguage(code)}
					bind:group={selectedLanguageCode}
					value={code}
					checked={code === product.lang}
				/>
			{/each}

			<select bind:value={selectedType} class="select mt-2 w-full">
				{#each imageTypes as type}
					<option value={type}>{capitalize(type)}</option>
				{/each}
			</select>
			<div class=" form-control w-full p-2">
				<div class="flex">
					{#if product.images[`${selectedType}_${selectedLanguageCode}`]}
						<div class="flex-1 space-y-2 p-2">
							<div>
								This image is selected as the {selectedType} image for {getLanguage(
									selectedLanguageCode
								)}
							</div>
							<img
								src={getProductImage(
									product.code,
									`${selectedType}_${selectedLanguageCode}`,
									product.images[`${selectedType}_${selectedLanguageCode}`]
								)}
								alt={`${selectedType}_${selectedLanguageCode}`}
								class="bg-base-100 max-h-96 w-full rounded-lg object-contain p-2 shadow-md"
							/>
							<button
								class="btn btn-primary"
								onclick={() => unselectImageasync(`${selectedType}_${selectedLanguageCode}`)}
								>Unselect this image</button
							>
						</div>
					{:else}
						<div class="flex-1 p-2">
							<div class="text-center opacity-70">
								No image selected as the {selectedType} image for {getLanguage(
									selectedLanguageCode
								)}
							</div>
						</div>
					{/if}
				</div>
			</div>
		</div>
		<h2 class="mt-4 mb-2 font-semibold">Available images</h2>
		<div class="grid grid-cols-[repeat(auto-fill,minmax(100px,1fr))] place-items-center gap-4">
			{#each rawImageKeys as key}
				<button
					class="btn btn-block border-base-300 block aspect-square h-auto rounded-lg p-2"
					onclick={() => chooseImage(key)}
				>
					<img
						src={getProductImage(product.code, key, product.images[key], '100')}
						alt={key}
						class=" h-full w-full rounded-lg object-contain"
					/>
				</button>
			{/each}
		</div>

		<dialog class="modal" bind:this={modal}>
			<div class="modal-box">
				{#if chosenImageId}
					<img
						src={getProductImage(product.code, chosenImageId, product.images[chosenImageId])}
						alt={chosenImageId}
						class="bg-base-200 max-h-96 w-full rounded-lg object-contain"
					/>
				{/if}
				<div class="modal-action">
					<form method="dialog">
						<button class="btn">Close</button>
					</form>
					<button onclick={selectImage} class="btn btn-primary"
						>Select this as {selectedType} image</button
					>
				</div>
			</div>
		</dialog>
	</div>
</div>
