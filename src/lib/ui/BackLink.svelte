<script lang="ts">
	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';

	type Props = {
		href: string;
		label: string;
	};

	let { href, label }: Props = $props();
</script>

<a {href} class="btn btn-secondary btn-outline w-full">
	<IconMdiArrowLeft class="w-4" />
	{label}
</a>
