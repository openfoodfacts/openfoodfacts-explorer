<script lang="ts">
	import { page } from '$app/state';
	import { _ } from '$lib/i18n';
	import { ERR_PRODUCT_NOT_FOUND, ERR_INVALID_BARCODE } from '$lib/api/errorUtils';
	import IconMdiAlertCircleOutline from '@iconify-svelte/mdi/alert-circle-outline';
	import { resolve } from '$app/paths';

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
		<div class="card w-full max-w-lg bg-base-100 shadow-xl">
			<div class="card-body items-center p-8 text-center">
				<div class="mb-4 text-8xl grayscale-[20%]">🥝</div>
				<h1 class="text-3xl font-bold">
					{$_('product.not_found_title', { default: "We don't know this product yet!" })}
				</h1>
				<p class="py-4 text-lg text-base-content/80">
					{$_('product.not_found_desc', {
						default: "You've discovered a new item. Be the hero who adds it to the database!"
					})}
				</p>
				<div class="mt-4 card-actions flex w-full flex-col gap-3">
					<a
						href={resolve(`/products/${page.params.barcode}/edit`)}
						class="btn w-full font-bold text-primary-content shadow-md btn-lg btn-primary"
					>
						<span class="text-xl">➕</span>
						{$_('product.add_product', { default: 'Add This Product' })}
					</a>
					<a href={resolve('/')} class="btn btn-ghost btn-sm">
						{$_('general.search_again', { default: 'Search for something else' })}
					</a>
				</div>
			</div>
		</div>
	{:else if status === 400 && isProductError}
		<div class="card w-full max-w-lg bg-base-100 shadow-xl">
			<div class="card-body items-center p-8 text-center">
				<div class="mb-4 text-8xl grayscale-[20%]">🤔</div>
				<h1 class="text-3xl font-bold">
					{$_('product.invalid_barcode_title', { default: "Let's check that barcode" })}
				</h1>
				<p class="py-4 text-lg text-base-content/80">
					{$_('product.invalid_barcode_desc', {
						default:
							"We couldn't recognize that product code. Barcodes are typically 8 or 13 digits long."
					})}
				</p>
				<div class="mt-4 card-actions flex w-full flex-col gap-3">
					<a
						href={resolve('/')}
						class="btn w-full border-2 btn-outline font-bold btn-lg hover:btn-primary"
					>
						🔍 {$_('general.try_search_again', { default: 'Try Search Again' })}
					</a>
				</div>
			</div>
		</div>
	{:else}
		<div class="card w-full max-w-2xl overflow-hidden border-2 border-error bg-base-100 shadow-xl">
			<div class="flex items-center gap-4 bg-error p-6">
				<div
					class="flex aspect-square shrink-0 items-center justify-center rounded-full bg-base-100 p-3 text-error shadow-sm"
				>
					<IconMdiAlertCircleOutline class="h-8 w-8" />
				</div>
				<div>
					<h3 class="text-xl font-bold text-error-content">
						{message || $_('general.unknown_error', { default: 'Something went wrong' })}
					</h3>
					<div class="mt-1 badge border-none bg-base-100 badge-sm font-bold text-error">
						Error {status}
					</div>
				</div>
			</div>

			<div class="card-body">
				{#if errors && errors.length > 0}
					<div class="collapse-arrow collapse rounded-box border border-base-300 bg-base-200">
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

				<div class="mt-4 card-actions justify-end">
					<a href={resolve('/')} class="btn btn-outline btn-sm">
						{$_('navigation.return_to_home', { default: 'Return to Home' })}
					</a>
				</div>
			</div>
		</div>
	{/if}
</div>
