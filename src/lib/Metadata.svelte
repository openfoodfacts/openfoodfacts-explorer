<script lang="ts">
	import { page } from '$app/state';

	type Props = {
		title: string;
		description: string;
		imageUrl?: string;
		url?: string;
		type?: 'website' | 'product' | 'article' | 'profile';
	};

	let {
		title,
		description,
		imageUrl = '',
		url = page.url.toString(),
		type = 'website'
	}: Props = $props();
</script>

<svelte:head>
	<!-- HTML Meta Tags -->
	<title>{title}</title>
	<meta property="og:logo" content="/favicon.ico" />
	<meta name="description" content={description} />

	<!-- Facebook Meta Tags -->
	<meta property="og:url" content={url} />
	<meta property="og:type" content={type} />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={imageUrl} />

	<!-- Twitter Meta Tags -->
	<meta name="twitter:card" content="summary_large_image" />
	<meta property="twitter:domain" content="openfoodfacts-explorer.vercel.app" />
	<meta property="twitter:url" content={url} />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />
</svelte:head>
