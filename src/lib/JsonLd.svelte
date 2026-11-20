<script lang="ts">
	type Context = string | Record<string, unknown> | null;

	type Props = {
		type: string;
		data: Record<string, unknown>;
		context?: Context | Context[];
	};
	let { type, data, context = 'https://schema.org' }: Props = $props();

	function escapeJsonLd(json: string) {
		return json.replaceAll('<', '\\u003c').replaceAll('&', '\\u0026');
	}

	const fullJsonLD = $derived({ ...data, '@context': context, '@type': type });
	const escapedJson = $derived(escapeJsonLd(JSON.stringify(fullJsonLD)));
</script>

<svelte:head>
	<svelte:element this={"script"} type="application/ld+json">{escapedJson}</svelte:element>
</svelte:head>
