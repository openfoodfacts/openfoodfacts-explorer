<script lang="ts">
	import NutriscoreA from './nutriscore-a.svg';
	import NutriscoreB from './nutriscore-b.svg';
	import NutriscoreC from './nutriscore-c.svg';
	import NutriscoreD from './nutriscore-d.svg';
	import NutriscoreE from './nutriscore-e.svg';
	import NutriscoreUnknown from './nutriscore-unknown.svg';

	const MAP: Record<string, string> = {
		a: NutriscoreA,
		b: NutriscoreB,
		c: NutriscoreC,
		d: NutriscoreD,
		e: NutriscoreE
	};

	export let grade: string;
	$: src = MAP[grade.toLowerCase()] ?? NutriscoreUnknown;
</script>

<a href="#nutriscore">
	<img alt="Nutriscore" {src} class="hover:brightness-90 transition-all duration-75" />
</a>
