<script>
	import { derived } from 'svelte/store';
	import { preferences } from '$lib/settings';

	const imageUrl = derived(preferences, ($preferences) =>
		$preferences.theme === 'dark'
			? 'https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.svg'
			: 'https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg'
	);
</script>

<picture>
	<img src={$imageUrl} alt="OpenFoodFacts Explorer" />
</picture>
