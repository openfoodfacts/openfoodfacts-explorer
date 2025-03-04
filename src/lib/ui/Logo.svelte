<script>
	import { onMount } from 'svelte';
	import settings from '$lib/settings';

	let imageUrl = 'https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.svg';

	onMount(() => {
		settings.subscribe(($settings) => {
			imageUrl =
				$settings.theme === 'dark'
					? 'https://static.openfoodfacts.org/images/logos/off-logo-horizontal-dark.svg'
					: 'https://static.openfoodfacts.org/images/logos/off-logo-horizontal-light.svg';
		});
	});
</script>

<picture>
	<img src={imageUrl} alt="OpenFoodFacts Explorer" />
</picture>
