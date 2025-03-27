<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	const NOVA_MAP: Record<
		number,
		{ name: string; src: string; textColor: string; bgColor: string }
	> = {
		1: {
			name: 'Unprocessed or minimally processed foods',
			src: KP_ATTRIBUTE_IMG('nova-group-1.svg'),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		2: {
			name: 'Processed culinary ingredients',
			src: KP_ATTRIBUTE_IMG('nova-group-2.svg'),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		3: {
			name: 'Processed foods',
			src: KP_ATTRIBUTE_IMG('nova-group-3.svg'),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		4: {
			name: 'Ultra processed foods',
			src: KP_ATTRIBUTE_IMG('nova-group-4.svg'),
			textColor: 'text-orange-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		},
		0: {
			name: 'NOVA not computed',
			src: KP_ATTRIBUTE_IMG('nova-group-unknown.svg'),
			textColor: 'text-black',
			bgColor: 'bg-gray-200 hover:bg-gray-300'
		}
	};

	let { grade }: { grade: number } = $props();

	let { name, src, textColor, bgColor } = $derived(NOVA_MAP[grade] ?? NOVA_MAP[0]);
</script>

<div
	class="flex h-full w-full items-center justify-evenly gap-4 rounded-xl p-4 md:max-lg:flex-col {bgColor}"
>
	<img alt="Nova Score" {src} class="h-20 transition-all duration-75 hover:brightness-90" />
	<div class="{textColor} text-xl font-semibold">{name}</div>
</div>
