<script lang="ts">
	import { page } from '$app/stores';
</script>

<div class="alert alert-error">
	<div>
		<h1 class="font-bold text-xl mb-3">
			{$page.error?.message}
		</h1>

		{#if $page.error?.errors != null}
			{@const errors = $page.error.errors}

			<p>
				{errors.length} error{#if errors.length > 1}s{/if} occurred:
			</p>

			<ul class="list-disc">
				{#each errors as error}
					<li class="ms-4 mb-2">
						<h3>
							<span class="font-bold me-2">
								{error['impact']['lc_name']}:
							</span>
							{error['message']['lc_name']}
							(id: <code class="font-mono">{error['message']['id']}</code>)
						</h3>
						<p class="text-xs font-mono">
							{#if error.field}
								Caused by field `{error.field.id}` with value `{error.field.value}`
							{/if}
						</p>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
