<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	const SRC_MAP: Record<string, string> = {
		1: KP_ATTRIBUTE_IMG('nova-group-1.svg'),
		2: KP_ATTRIBUTE_IMG('nova-group-2.svg'),
		3: KP_ATTRIBUTE_IMG('nova-group-3.svg'),
		4: KP_ATTRIBUTE_IMG('nova-group-4.svg')
	};

	const SRC_UNKNOWN = KP_ATTRIBUTE_IMG('nova-group-unknown.svg');

	let { grade }: { grade: number } = $props();
	let src = $derived(SRC_MAP[grade] ?? SRC_UNKNOWN);

	let nova = $derived({
		1: 'Unprocessed or minimally processed foods',
		2: 'Processed culinary ingredients',
		3: 'Processed foods',
		4: 'Ultra processed foods',
	}[grade] ?? 'NOVA not computed');

	let textColor = $derived({
		1: 'text-green-700', 
		2: 'text-green-700',
		3: 'text-green-700',
		4: 'text-orange-700',
	}[grade] ?? 'text-black'); 

	let bgColor = $derived({
		1: 'bg-green-100 hover:bg-green-200', 
		2: 'bg-green-100 hover:bg-green-200', 
		3: 'bg-green-100 hover:bg-green-200', 
		4: 'bg-red-100 hover:bg-red-200',
	}[grade] ?? 'bg-gray-200 hover:bg-gray-300');
</script>

<a href="#nova" class="w-1/3 {bgColor} rounded-xl flex items-center justify-evenly gap-4 p-4">
	<img alt="Nova Score" {src} class="h-20 transition-all duration-75 hover:brightness-90" />
	<div class="{textColor} text-xl font-semibold">{nova}</div>
</a>
