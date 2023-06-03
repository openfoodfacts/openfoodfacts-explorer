<script lang="ts">
	import type { PageData } from './$types';

	let barcode: string;

	export let data: PageData;
</script>

<div class="container xl:max-w-6xl mx-auto my-4 flex flex-col items-center">
	<div class="form-control">
		<div class="input-group">
			<input type="text" bind:value={barcode} class="input input-bordered" placeholder="Barcode" />

			<button
				class="btn btn-square px-10"
				on:click={() => (window.location.href = '/product/' + barcode)}
				disabled={barcode == null || barcode == ''}
			>
				Go
			</button>
		</div>
	</div>

	<div class="grid grid-cols-4 gap-4 mt-8">
		{#each data.streamed.products as productPromise}
			{#await productPromise then product}
				<div class="flex flex-row items-center">
					{#if product.image_front_small_url}
						<img src={product.image_front_small_url} class="w-16 h-16 mr-4" alt="Product front" />
					{/if}
					<a href={`/products/${product.code}`} class="link">
						{product.product_name ?? product.code}
					</a>
				</div>
			{/await}
		{/each}
	</div>
</div>
