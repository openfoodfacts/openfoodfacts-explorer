<script lang="ts">
	import NutriscoreA from './nutriscore-a.svg';
	import NutriscoreB from './nutriscore-b.svg';
	import NutriscoreC from './nutriscore-c.svg';
	import NutriscoreD from './nutriscore-d.svg';
	import NutriscoreE from './nutriscore-e.svg';
	import NutriscoreUnknown from './nutriscore-unknown.svg';

	export let nutriscoreGrade: string;
	let src: string;
	$: {
		src =
			{
				a: NutriscoreA,
				b: NutriscoreB,
				c: NutriscoreC,
				d: NutriscoreD,
				e: NutriscoreE
			}[nutriscoreGrade.toLowerCase()] ?? NutriscoreUnknown;
	}
</script>

<img alt="Nutriscore" {src} />
