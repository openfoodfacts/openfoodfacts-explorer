<script lang="ts">
	import { page } from '$app/stores';

	$: message = $page.error?.message;
	$: errors = $page.error?.errors;

	$: {
		for (const error of errors ?? []) {
			console.error(error);
		}
	}

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
					{#each errors as error}
						<li class="mb-2 ms-4 list-none">
							<ul
								class="grid grid-cols-[auto,auto] gap-x-2 border-l-2 border-l-error-content ps-2 font-mono text-xs"
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
