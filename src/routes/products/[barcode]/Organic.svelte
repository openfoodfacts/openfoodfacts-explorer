<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	const NOVA_MAP: Record<
		number,
		{ name: string; desc: string; src: string; textColor: string; bgColor: string }
	> = {
		0: {
			name: 'Missing information: organic product?',
			desc: 'Organic products promote ecological sustainability and biodiversity.',
			src: KP_ATTRIBUTE_IMG('organic-unknown.svg'),
			textColor: 'text-black',
			bgColor: 'bg-gray-200 hover:bg-gray-300'
		},
		1: {
			name: 'Organic Product',
			desc: 'Promotes ecological sustainability and biodiversity.',
			src: KP_ATTRIBUTE_IMG('organic.svg'),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		2: {
			name: 'Not an organic product',
			desc: 'Organic products promote ecological, sustainability and biodiversity.',
			src: KP_ATTRIBUTE_IMG('not-organic.svg'),
			textColor: 'text-red-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		}
	};

	let { labels }: { labels: string } = $props();
	let isOrganic;

	if (labels == '') {
		isOrganic = 0;
	} else {
		isOrganic = labels.toLowerCase().includes('organic') ? 1 : 2;
	}
	console.log('organic ', isOrganic);
	let { name, desc, src, textColor, bgColor } = $derived(NOVA_MAP[isOrganic] ?? NOVA_MAP[0]);
</script>

<div
	class="flex h-full w-full items-center justify-evenly gap-4 rounded-xl p-4 md:max-lg:flex-col {bgColor}"
>
	<img alt="Nova Score" {src} class="h-20 transition-all duration-75 hover:brightness-90" />
	<div class="flex flex-col">
		<div class="{textColor} text-xl font-semibold">{name}</div>
		<div class="text-sm text-black">{desc}</div>
	</div>
</div>
