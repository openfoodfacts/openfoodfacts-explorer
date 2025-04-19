<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import type { Product } from '$lib/api';

	interface Props {
		productData: Product;
		unitSelection: Record<string, string>;
	}

	const { productData, unitSelection }: Props = $props();
</script>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Nutritional Information</h3>
	<table class="mt-4 w-full table-auto border-collapse border border-gray-300 sm:w-3/4 lg:w-1/2">
		<thead>
			<tr class="bg-secondary text-black">
				<th class="border border-gray-300 px-4 py-2">Nutrient</th>
				<th class="border border-gray-300 px-4 py-2">Value (per 100g)</th>
				<th class="border border-gray-300 px-4 py-2">Unit</th>
			</tr>
		</thead>
		<tbody>
			{#each Object.keys(unitSelection) as nutrient (nutrient)}
				<tr>
					<td class="border border-gray-300 px-4 py-2">{nutrient.replace('-', ' ')}</td>
					<td class="border border-gray-300 px-4 py-2">
						<input
							type="number"
							bind:value={
								productData.nutriments[(nutrient + '_100g') as keyof typeof productData.nutriments]
							}
							class="bg-base-300 w-full px-2 py-1 focus:outline-none"
						/>
					</td>
					<td class="border border-gray-300 px-4 py-2">
						<select
							bind:value={unitSelection[nutrient as keyof typeof unitSelection]}
							class="bg-base-300 border-none outline-none"
						>
							<option value="g">g</option>
							<option value="mg">mg</option>
							<option value="mcg">mcg/µg</option>
						</select>
					</td>
				</tr>
			{/each}
		</tbody>
	</table>
</Card>
