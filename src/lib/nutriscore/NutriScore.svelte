<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	type Props = { grade: string; lang?: string };
	let { grade, lang = 'en' }: Props = $props();

	let srcMap: Record<string, string> = $derived({
		a: KP_ATTRIBUTE_IMG('nutriscore-a-new-' + lang + '.svg'),
		b: KP_ATTRIBUTE_IMG('nutriscore-b-new-' + lang + '.svg'),
		c: KP_ATTRIBUTE_IMG('nutriscore-c-new-' + lang + '.svg'),
		d: KP_ATTRIBUTE_IMG('nutriscore-d-new-' + lang + '.svg'),
		e: KP_ATTRIBUTE_IMG('nutriscore-e-new-' + lang + '.svg')
	});

	let srcUnknown = $derived(KP_ATTRIBUTE_IMG('nutriscore-unknown-new-' + lang + '.svg'));

	let src = $derived(srcMap[grade.toLowerCase()] ?? srcUnknown);

	let nutritionalQuality = $derived({
		a: 'Good Nutritional quality',
		b: 'Good Nutritional quality',
		c: 'Average Nutritional quality',
		d: 'Lower Nutritional quality',
		e: 'Lower Nutritional quality',
	}[grade.toLowerCase()] ?? 'Unknown Nutritional quality');
	
	let textColor = $derived({
		a: 'text-green-700', 
		b: 'text-green-700',
		c: 'text-yellow-800',
		d: 'text-red-700',
		e: 'text-red-700',
	}[grade.toLowerCase()] ?? 'text-black'); 

	let bgColor = $derived({
		a: 'bg-green-100 hover:bg-green-200', 
		b: 'bg-green-100 hover:bg-green-200', 
		c: 'bg-orange-100 hover:bg-orange-200',
		d: 'bg-red-100 hover:bg-red-200',
		e: 'bg-red-100 hover:bg-red-200',
	}[grade.toLowerCase()] ?? 'bg-gray-200 hover:bg-gray-300'); 
	
</script>

<a href="#health_card" class="{bgColor} flex w-1/3 justify-evenly gap-2 items-center p-2 rounded-lg">
	<img alt="Nutri-Score" {src} class="h-16" />
	<div class="flex flex-col">
		<div class="text-xl {textColor} font-semibold">Nutri-Score {grade.toUpperCase()}</div>
		<div class="text-black text-sm">{nutritionalQuality}</div>
	</div>
</a>
