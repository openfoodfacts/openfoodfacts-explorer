<script lang="ts">
	import { page } from '$app/stores';

	function getLcNameOrDefault(obj: { lc_name?: string; name?: string }) {
		let name = obj.lc_name;
		if (name == null || name == '') {
			name = obj.name;
		}

		if (name == null || name == '') {
			name = '<no name>';
		}

		return name;
	}
</script>

<div class="alert alert-error">
	<div>
		<h1 class="mb-3 text-xl font-bold">
			{$page.error?.message}
		</h1>

		{#if $page.error?.errors != null}
			{@const errors = $page.error.errors}

			<p>
				{errors.length} error{#if errors.length > 1}s{/if} occurred:
			</p>

			<ul class="list-disc">
				{#each errors as error}
					<li class="mb-2 ms-4">
						<h3>
							<span class="font-bold">
								{getLcNameOrDefault(error.impact)}:
							</span>
							<span>
								{getLcNameOrDefault(error.message)}
							</span>
						</h3>
						<div class="font-mono text-xs">
							<p>Impact ID: {error.impact.id}</p>
							<p>Message ID: {error.message.id}</p>
							{#if error.field}
								<p>
									Caused by field `{error.field.id}` with value `{error.field.value.length != 0
										? error.field.value
										: '<empty>'}`
								</p>
							{/if}
						</div>
					</li>
				{/each}
			</ul>
		{/if}
	</div>
</div>
