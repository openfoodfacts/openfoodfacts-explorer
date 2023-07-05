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
				on:click={() => (window.location.href = '/products/' + barcode)}
				disabled={barcode == null || barcode == ''}
			>
				Go
			</button>
		</div>
	</div>

	<div class="mt-8">
		{#await data.streamed.products}
			<progress class="progress progress-secondary" />
		{:then products}
			<div class="grid grid-cols-4 gap-4">
				{#each products as product}
					<a
						href={`/products/${product.code}`}
						class="btn btn-ghost h-auto p-2 justify-normal text-start"
					>
						<div class="flex flex-row items-center">
							{#if product.image_front_small_url}
								<img
									src={product.image_front_small_url}
									class="w-16 h-16 flex-shrink-0 object-cover rounded-lg mr-4"
									alt="Product front"
								/>
							{/if}
							<p>
								{product.product_name ?? product.code}
							</p>
						</div>
					</a>
				{/each}
			</div>
		{/await}
	</div>
</div>
