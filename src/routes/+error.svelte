<script lang="ts">
	import { page } from '$app/state';

	let message = $derived(page.error?.message);
	let errors = $derived(page.error?.errors);

	$effect(() => {
		for (const error of errors ?? []) {
			console.error(error);
		}
	});

	function isError(error: string) {
		return errors?.some((e) => e.message.id === error) ?? false;
	}
</script>

<div class="alert alert-error">
	<div>
		<h1 class="mb-3 text-xl font-bold">{message}</h1>

		{#if errors != null}
			{#if isError('product_not_found')}
				<h2>Product not found</h2>
			{:else}
				<p>
					{errors.length} error{#if errors.length > 1}s{/if} occurred:
				</p>

				<ul class="list-disc">
					{#each errors as error, i (i)}
						<li class="ms-4 mb-2 list-none">
							<ul
								class="border-l-error-content grid grid-cols-[auto_auto] gap-x-2 border-l-2 ps-2 font-mono text-xs"
							>
								<span class="text-right">Impact ID:</span>
								<span>{error.impact.id}</span>

								<span class="text-right">Message ID:</span>
								<span>{error.message.id}</span>

								{#if error.field}
									<span class="text-right">Caused by:</span>
									<span>
										<code>{error.field.id}</code> has value
										<code>{error.field.value.length != 0 ? error.field.value : '<empty>'}</code>
									</span>
								{/if}
							</ul>
						</li>
					{/each}
				</ul>
			{/if}
		{/if}
	</div>
</div>
