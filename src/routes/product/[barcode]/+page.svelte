<script lang="ts">
	import { getOrDefault } from '$lib/taxo';
	import EcoScore from '$lib/ecoscore/EcoScore.svelte';
	import KnowledgePanels from '$lib/knowledgepanels/KnowledgePanels.svelte';
	import Nova from '$lib/nova/Nova.svelte';
	import NutriScore from '$lib/nutriscore/NutriScore.svelte';
	import type { PageData } from './$types';
	import { preferences } from '$lib/settings';

	export let data: PageData;
	$: product = data.state.product;

	$: lang = $preferences.lang;
</script>

<div class="container flex-col flex gap-4 xl:max-w-6xl mx-auto my-2">
	{#if data.state.status === 'success'}
		<div class="shadow-md rounded-2xl p-6 w-full bg-base-100 dark:bg-base-300">
			<div class="flex">
				<h1 class="font-bold text-4xl my-4">{product.product_name}</h1>
				<a
					href={'https://world.openfoodfacts.org/product/' + product.code}
					target="_blank"
					rel="noopener noreferrer"
					class="btn btn-secondary ml-auto"
				>
					Go to OpenFoodFacts
				</a>
			</div>

			<div class="flex gap-4">
				<div class="flex-grow">
					<div class="grid grid-cols-[max-content,1fr] gap-x-4 gap-y-1">
						<span class="font-bold text-end">Quantity:</span>
						<span>{product.quantity}</span>

						<span class="font-bold text-end">Brands:</span>
						<span>
							{#await data.taxo.brands}
								Loading...
							{:then brands}
								{#each product.brands_tags as tag, i}
									{#if i > 0}, {/if}
									{brands[tag] != null ? getOrDefault(brands[tag].name, lang) : tag}
								{/each}
							{/await}
						</span>

						<span class="font-bold text-end">Categories:</span>
						<span>
							{#await data.taxo.categories}
								Loading...
							{:then categories}
								{#each product.categories_tags as tag, i}
									{#if i > 0}, {/if}
									{categories[tag] != null ? getOrDefault(categories[tag].name, lang) : tag}
								{/each}
							{/await}
						</span>

						<span class="font-bold text-end">Stores:</span>
						<span>
							{#await data.taxo.stores}
								Loading...
							{:then stores}
								{#each product.stores_tags as tag, i}
									{#if i > 0}, {/if}
									{stores[tag] != null ? getOrDefault(stores[tag].name, lang) : tag}
								{/each}
							{/await}
						</span>

						<span class="font-bold text-end">Labels:</span>
						<span>
							{#await data.taxo.labels}
								Loading...
							{:then labels}
								{#each product.labels_tags as tag, i}
									{#if i > 0}, {/if}
									{labels[tag] != null ? getOrDefault(labels[tag].name, lang) : tag}
								{/each}
							{/await}
						</span>
					</div>
				</div>
				<div>
					<img
						src={product.image_front_url}
						alt={product.product_name}
						class="w-32 float-right rounded-lg"
					/>
				</div>
			</div>
		</div>

		<div class="p-3 w-full flex gap-4 justify-evenly">
			<NutriScore grade={product.nutriscore_grade} />
			<Nova grade={product.nova_group} />
			<EcoScore grade={product.ecoscore_grade} />
		</div>

		<KnowledgePanels knowledgePanels={product.knowledge_panels} />
	{/if}
</div>
