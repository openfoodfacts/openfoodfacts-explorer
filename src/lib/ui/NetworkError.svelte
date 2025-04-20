<script lang="ts">
	import { _ } from '$lib/i18n';
</script>

<div
	class="alert alert-error text-error-content bg-error bg-opacity-10 rounded-xl p-6 font-semibold shadow-lg"
>
	<div class="flex flex-col">
		<h1 class="mb-3 text-xl font-bold">{$_('errors.network.title')}</h1>

		<p class="mb-4 text-sm">
			{$_('errors.network.message')}
			<br />
		</p>

		<p class="text-sm">
			{$_('errors.network.instructions')}
			<a href="https://status.openfoodfacts.org/" target="_blank" rel="noopener" class="link">
				Open Food Facts Status Page
			</a>
		</p>
	</div>
</div>
