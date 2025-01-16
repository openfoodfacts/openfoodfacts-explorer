<script lang="ts">
	import EcoscoreA from './green-score-a.svg';
	import EcoscoreB from './green-score-b.svg';
	import EcoscoreC from './green-score-c.svg';
	import EcoscoreD from './green-score-d.svg';
	import EcoscoreE from './green-score-e.svg';
	import EcoscoreUnknown from './green-score-unknown.svg';

	const MAP: Record<string, string> = {
		a: EcoscoreA,
		b: EcoscoreB,
		c: EcoscoreC,
		d: EcoscoreD,
		e: EcoscoreE
	};

	export let grade: string;
	$: src = MAP[grade.toLowerCase()] ?? EcoscoreUnknown;
</script>

<img alt="Nutriscore" {src} class="transition-all duration-75 hover:brightness-90" />
