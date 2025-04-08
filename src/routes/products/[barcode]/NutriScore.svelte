<script lang="ts">
	import { KP_ATTRIBUTE_IMG } from '$lib/const';

	type Props = { grade: string; lang?: string };
	let { grade, lang = 'en' }: Props = $props();

	const NUTRI_MAP: Record<
		string,
		{ name: string; src: string; textColor: string; bgColor: string }
	> = {
		a: {
			name: 'Good Nutritional quality',
			src: KP_ATTRIBUTE_IMG(`nutriscore-a-new-${lang}.svg`),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		b: {
			name: 'Good Nutritional quality',
			src: KP_ATTRIBUTE_IMG(`nutriscore-b-new-${lang}.svg`),
			textColor: 'text-green-700',
			bgColor: 'bg-green-100 hover:bg-green-200'
		},
		c: {
			name: 'Average Nutritional quality',
			src: KP_ATTRIBUTE_IMG(`nutriscore-c-new-${lang}.svg`),
			textColor: 'text-yellow-800',
			bgColor: 'bg-orange-100 hover:bg-orange-200'
		},
		d: {
			name: 'Lower Nutritional quality',
			src: KP_ATTRIBUTE_IMG(`nutriscore-d-new-${lang}.svg`),
			textColor: 'text-red-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		},
		e: {
			name: 'Lower Nutritional quality',
			src: KP_ATTRIBUTE_IMG(`nutriscore-e-new-${lang}.svg`),
			textColor: 'text-red-700',
			bgColor: 'bg-red-100 hover:bg-red-200'
		},
		unknown: {
			name: 'Unknown Nutritional quality',
			src: KP_ATTRIBUTE_IMG(`nutriscore-unknown-new-${lang}.svg`),
			textColor: 'text-black',
			bgColor: 'bg-gray-200 hover:bg-gray-300'
		}
	};

	let normalizedGrade = $derived(grade.toLowerCase());
	let { name, src, textColor, bgColor } = $derived(NUTRI_MAP[normalizedGrade] ?? NUTRI_MAP.unknown);
</script>

<div
	class="flex h-full w-full items-center justify-evenly gap-4 rounded-xl p-4 md:max-lg:flex-col {bgColor}"
>
	<img alt="Nutri-Score" {src} class="h-16" />
	<div class="flex flex-col">
		<div class="text-xl {textColor} font-semibold">Nutri-Score {grade.toUpperCase()}</div>
		<div class="text-sm text-black">{name}</div>
	</div>
</div>
