<script lang="ts">
	import { page } from '$app/state';
	import { _ } from '$lib/i18n';
	import { ERR_PRODUCT_NOT_FOUND, ERR_INVALID_BARCODE } from '$lib/api/errorUtils';

	type Props = { error: globalThis.App.Error };
	let { error }: Props = $props();

	let { status } = $derived(page);
	let { message, errors } = $derived(error);
	let isProductError = $derived(
		message === ERR_PRODUCT_NOT_FOUND || message === ERR_INVALID_BARCODE
	);
</script>

<div class="flex min-h-[50vh] w-full flex-col items-center justify-center p-4">
	{#if status === 404 && isProductError}
		<div class="card bg-base-100 w-full max-w-lg shadow-xl">
			<div class="card-body items-center p-8 text-center">
				<div class="mb-4 text-8xl grayscale-[20%]">🥝</div>
				<h1 class="text-3xl font-bold">
					{$_('product.not_found_title', { default: "We don't know this product yet!" })}
				</h1>
				<p class="text-base-content/80 py-4 text-lg">
					{$_('product.not_found_desc', {
						default: "You've discovered a new item. Be the hero who adds it to the database!"
					})}
				</p>
				<div class="card-actions mt-4 flex w-full flex-col gap-3">
					<a
						href="https://world.openfoodfacts.org/cgi/product.pl"
						class="btn btn-primary btn-lg text-primary-content w-full font-bold shadow-md"
					>
						<span class="text-xl">➕</span>
						{$_('product.add_product', { default: 'Add This Product' })}
					</a>
					<a href="/" class="btn btn-ghost btn-sm">
						{$_('general.search_again', { default: 'Search for something else' })}
					</a>
				</div>
			</div>
		</div>
	{:else if status === 400 && isProductError}
		<div class="card bg-base-100 w-full max-w-lg shadow-xl">
			<div class="card-body items-center p-8 text-center">
				<div class="mb-4 text-8xl grayscale-[20%]">🤔</div>
				<h1 class="text-3xl font-bold">
					{$_('product.invalid_barcode_title', { default: "Let's check that barcode" })}
				</h1>
				<p class="text-base-content/80 py-4 text-lg">
					{$_('product.invalid_barcode_desc', {
						default:
							"We couldn't recognize that product code. Barcodes are typically 8 or 13 digits long."
					})}
				</p>
				<div class="card-actions mt-4 flex w-full flex-col gap-3">
					<a href="/" class="btn btn-outline btn-lg hover:btn-primary w-full border-2 font-bold">
						🔍 {$_('general.try_search_again', { default: 'Try Search Again' })}
					</a>
				</div>
			</div>
		</div>
	{:else}
		<div class="card bg-base-100 border-error w-full max-w-2xl overflow-hidden border-2 shadow-xl">
			<div class="bg-error flex items-center gap-4 p-6">
				<div
					class="bg-base-100 text-error flex aspect-square shrink-0 items-center justify-center rounded-full p-3 shadow-sm"
				>
					<span class="icon-[mdi--alert-circle-outline] h-8 w-8"></span>
				</div>
				<div>
					<h3 class="text-error-content text-xl font-bold">
						{message || $_('general.unknown_error', { default: 'Something went wrong' })}
					</h3>
					<div class="badge bg-base-100 text-error badge-sm mt-1 border-none font-bold">
						Error {status}
					</div>
				</div>
			</div>

			<div class="card-body">
				{#if errors && errors.length > 0}
					<div class="collapse-arrow bg-base-200 border-base-300 rounded-box collapse border">
						<input type="checkbox" />
						<div class="collapse-title text-sm font-medium">
							Show Technical Details ({errors.length})
						</div>
						<div class="collapse-content">
							<ul class="list-disc overflow-x-auto py-2 pl-5 font-mono text-xs">
								{#each errors as err, i (i)}
									<li class="mb-2">
										{#if typeof err === 'string'}
											{err}
										{:else}
											<span class="font-bold">ID:</span>
											{err.message?.id ?? 'unknown'}
											{#if err.field?.value}
												<br /><span class="opacity-70">Value: {err.field.value}</span>
											{/if}
										{/if}
									</li>
								{/each}
							</ul>
						</div>
					</div>
				{:else}
					<p class="text-base-content/70">
						We track these errors automatically, but if the problem persists, feel free to report
						it.
					</p>
				{/if}

				<div class="card-actions mt-4 justify-end">
					<a href="/" class="btn btn-outline btn-sm">Return to Home</a>
				</div>
			</div>
		</div>
	{/if}
</div>
