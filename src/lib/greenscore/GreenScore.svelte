<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	const MAP: Record<string, string> = {
		a: KP_ATTRIBUTE_IMG('green-score-a.svg'),
		b: KP_ATTRIBUTE_IMG('green-score-b.svg'),
		c: KP_ATTRIBUTE_IMG('green-score-c.svg'),
		d: KP_ATTRIBUTE_IMG('green-score-d.svg'),
		e: KP_ATTRIBUTE_IMG('green-score-unknown.svg')
	};

	let SRC_UNKNOWN = KP_ATTRIBUTE_IMG('green-score-unknown.svg');

	let { grade }: { grade: string } = $props();
	
	let src = $derived(MAP[grade.toLowerCase()] ?? SRC_UNKNOWN);

	let GreenScore = $derived({
		a: 'Very low environmental impact',
		b: 'low environmental impact',
		c: 'Moderate environmental impact',
		d: 'High environmental impact',
	}[grade.toLowerCase()] ?? 'Unknown impact');
	
	let textColor = $derived({
		a: 'text-green-700', 
		b: 'text-green-700',
		c: 'text-yellow-800',
		d: 'text-orange-700',
	}[grade.toLowerCase()] ?? 'text-black'); 

	let bgColor = $derived({
		a: 'bg-green-100 hover:bg-green-200', 
		b: 'bg-green-100 hover:bg-green-200', 
		c: 'bg-orange-100 hover:bg-orange-200',
		d: 'bg-red-100 hover:bg-red-200',
	}[grade.toLowerCase()] ?? 'bg-gray-200 hover:bg-gray-300'); 

</script>

<a href={src} class="flex items-center h-full w-full p-4 gap-4 rounded-xl {bgColor} transition-all duration-75 hover:bg-opacity-90">
	<img alt="Green-Score" {src} class="h-20" />
	<div class="flex flex-col">
		<div class="text-xl font-semibold {textColor}">Green-Score {grade.toUpperCase()}</div>
		<div class="text-black">{GreenScore}</div>
	</div>
</a>