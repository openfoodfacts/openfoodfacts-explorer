<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	const GRADE_MAP: Record<
		string,
		{ name: string; src: string; textColor: string; bgColor: string }
	> = {
		a: {
			name: 'Very low environmental impact',
			src: KP_ATTRIBUTE_IMG('green-score-a.svg'),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		b: {
			name: 'Low environmental impact',
			src: KP_ATTRIBUTE_IMG('green-score-b.svg'),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		c: {
			name: 'Moderate environmental impact',
			src: KP_ATTRIBUTE_IMG('green-score-c.svg'),
			textColor: 'text-yellow-800',
			bgColor: 'bg-orange-100 hover:bg-orange-200'
		},
		d: {
			name: 'High environmental impact',
			src: KP_ATTRIBUTE_IMG('green-score-d.svg'),
			textColor: 'text-orange-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		},
		unknown: {
			name: 'Unknown impact',
			src: KP_ATTRIBUTE_IMG('green-score-unknown.svg'),
			textColor: 'text-black',
			bgColor: 'bg-gray-200 hover:bg-gray-300'
		}
	};

	let { grade }: { grade: string } = $props();
	let normalizedGrade = $derived(grade.toLowerCase());
	let { name, src, textColor, bgColor } = $derived(GRADE_MAP[normalizedGrade]);
</script>

<div
	class="flex h-full w-full items-center justify-evenly gap-4 rounded-xl p-4 md:max-lg:flex-col {bgColor}"
>
	<img alt="Green-Score" {src} class="h-20" />
	<div class="flex flex-col">
		<div class="text-xl font-semibold {textColor}">Green-Score {grade.toUpperCase()}</div>
		<div class="text-black">{name}</div>
	</div>
</div>
