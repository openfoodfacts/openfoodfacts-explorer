<script lang="ts">
	import TagsString from '../../../routes/products/[barcode]/edit/TagsString.svelte';
	import TraceabilityCodes from '../../../routes/products/[barcode]/edit/TraceabilityCodes.svelte';
	import type { Writable } from 'svelte/store';
	import type { Product } from '$lib/api';
	import { _ } from '$lib/i18n';

	interface Props {
		productStore: Writable<Product>;
	}

	let { productStore }: Props = $props();

	let showInfoBasic = $state(false);
</script>

<div class="collapse-arrow bg-base-100 collapse shadow-md">
	<input type="checkbox" />
	<div class="collapse-title flex items-center text-sm font-bold sm:text-base">
		<span class="icon-[mdi--information] mr-2 h-4 w-4 sm:h-5 sm:w-5"></span>
		{$_('product.edit.sections.basic_info')}
	</div>
	<div class="collapse-content overflow-hidden">
		<button
			type="button"
			class="mb-2"
			aria-label="Info"
			onclick={() => (showInfoBasic = !showInfoBasic)}
		>
			<span
				class="icon-[mdi--help-circle-outline] hover:text-primary/70 text-primary ml-4 h-6 w-6 hover:cursor-pointer"
			></span>
		</button>
		{#if showInfoBasic}
			<div
				class="border-primary/30 bg-primary/5 text-primary-content relative mb-4 flex items-center gap-2 rounded-lg border p-4 text-sm shadow-sm"
			>
				<span class="icon-[mdi--information] text-primary mt-0.5 flex-shrink-0"></span>
				<span class="text-base-content/80 p-4 text-sm sm:text-base"
					>{$_('product.edit.info.basic_info')}</span
				>
				<button
					type="button"
					class="hover:bg-primary/10 absolute top-2 right-2 rounded p-1"
					aria-label="Close"
					onclick={() => (showInfoBasic = false)}
				>
					<span class="icon-[mdi--close] text-primary h-5 w-5"></span>
				</button>
			</div>
		{/if}
		<!-- Basic Product Information -->
		<div class="space-y-6">
			<!-- Primary Fields Grid -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="form-control w-full">
					<label class="label" for="quantity-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.quantity')}</span
						>
					</label>
					<input
						id="quantity-edit"
						type="text"
						class="input input-bordered w-full text-sm sm:text-base"
						bind:value={$productStore.quantity}
						placeholder="e.g., 250g, 1L, 500ml"
					/>
				</div>
				<div class="form-control w-full">
					<label class="label" for="packaging-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.packaging')}</span
						>
					</label>
					<input
						id="packaging-edit"
						type="text"
						class="input input-bordered w-full text-sm sm:text-base"
						bind:value={$productStore.packaging}
						placeholder="e.g., plastic bottle, glass jar"
					/>
				</div>
				<div class="form-control w-full">
					<label class="label" for="manufacturing-places-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.manufacturing_places')}</span
						>
					</label>
					<input
						id="manufacturing-places-edit"
						type="text"
						class="input input-bordered w-full text-sm sm:text-base"
						bind:value={$productStore.manufacturing_places}
						placeholder="e.g., France, Italy"
					/>
				</div>
			</div>
			<!-- Secondary Fields Grid -->
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
				<div class="form-control w-full">
					<label class="label" for="emb-codes-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.emb_code')}</span
						>
					</label>
					<input
						id="emb-codes-edit"
						type="text"
						class="input input-bordered w-full text-sm sm:text-base"
						bind:value={$productStore.emb_codes}
						placeholder="e.g., EMB 12345"
					/>
				</div>
				<div class="form-control w-full">
					<label class="label" for="website-url-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.website_url')}</span
						>
					</label>
					<input
						id="website-url-edit"
						type="url"
						class="input input-bordered w-full text-sm sm:text-base"
						bind:value={$productStore.link}
						placeholder="https://example.com"
					/>
				</div>
			</div>
		</div>
		<!-- Tags Section -->
		<div class="divider my-6">
			<span class="text-sm font-medium opacity-60">Product Tags</span>
		</div>
		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="form-control w-full">
					<label class="label" for="categories-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.categories')}</span
						>
					</label>
					<TagsString bind:tagsString={$productStore.categories} autocomplete={[]} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="labels-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.labels')}</span
						>
					</label>
					<TagsString bind:tagsString={$productStore.labels} autocomplete={[]} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="brands-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.brands')}</span
						>
					</label>
					<TagsString bind:tagsString={$productStore.brands} autocomplete={[]} />
				</div>
			</div>
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
				<div class="form-control w-full">
					<label class="label" for="stores-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.stores')}</span
						>
					</label>
					<TagsString bind:tagsString={$productStore.stores} autocomplete={[]} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="origins-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.origins')}</span
						>
					</label>
					<TagsString bind:tagsString={$productStore.origins} autocomplete={[]} />
				</div>
				<div class="form-control w-full">
					<label class="label" for="countries-edit">
						<span class="label-text text-sm font-medium sm:text-base"
							>{$_('product.edit.countries')}</span
						>
					</label>
					<TagsString bind:tagsString={$productStore.countries} autocomplete={[]} />
				</div>
			</div>
			<div class="form-control w-full">
				<label class="label" for="traceability-codes-edit">
					<span class="label-text text-sm font-medium sm:text-base">Traceability Codes</span>
				</label>
				<TraceabilityCodes bind:traceabilityCodes={$productStore.emb_codes} autocomplete={[]} />
			</div>
		</div>
	</div>
</div>
