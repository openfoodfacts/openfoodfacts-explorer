<script lang="ts">
	import type { Nutriments } from '$lib/api/nutriments';
	import Card from '$lib/ui/Card.svelte';

	interface Props {
		nutriments: Nutriments;
	}

	let { nutriments }: Props = $props();

	let proteins = $state(nutriments.proteins || 0);
	let carbohydrates = $state(nutriments.carbohydrates || 0);
	let fat = $state(nutriments.fat || 0);

	let calculatedEnergy = $derived(proteins * 4 + carbohydrates * 4 + fat * 9);

	// Calculate energy in kJ (1 kcal = 4.184 kJ)
	let calculatedEnergyKj = $derived(calculatedEnergy * 4.184);

	$effect(() => {
		nutriments.proteins = proteins;
		nutriments.carbohydrates = carbohydrates;
		nutriments.fat = fat;
		nutriments.energy = calculatedEnergy;
		nutriments['energy-kcal'] = calculatedEnergy;
		nutriments['energy-kj'] = calculatedEnergyKj;
	});
</script>

<Card>
	<h3 class="mb-4 text-3xl font-bold">Energy Calculation</h3>
	<div class="form-control mb-4">
		<label for="proteins" class="label">
			<span class="label-text">Proteins (g)</span>
		</label>
		<input
			id="proteins"
			type="number"
			class="input input-bordered w-full"
			bind:value={proteins}
			step="0.1"
		/>
	</div>
	<div class="form-control mb-4">
		<label for="carbohydrates" class="label">
			<span class="label-text">Carbohydrates (g)</span>
		</label>
		<input
			id="carbohydrates"
			type="number"
			class="input input-bordered w-full"
			bind:value={carbohydrates}
			step="0.1"
		/>
	</div>
	<div class="form-control mb-4">
		<label for="fat" class="label">
			<span class="label-text">Fat (g)</span>
		</label>
		<input id="fat" type="number" class="input input-bordered w-full" bind:value={fat} step="0.1" />
	</div>
	<div class="grid grid-cols-2 gap-4">
		<div class="bg-base-200 rounded-lg p-4">
			<h3 class="mb-2 text-sm font-semibold">Calculated Energy</h3>
			<p class="text-2xl font-bold">{calculatedEnergy.toFixed(1)} kcal</p>
		</div>
		<div class="bg-base-200 rounded-lg p-4">
			<h3 class="mb-2 text-sm font-semibold">Calculated Energy</h3>
			<p class="text-2xl font-bold">{calculatedEnergyKj.toFixed(1)} kJ</p>
		</div>
	</div>
</Card>
