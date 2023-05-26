<script lang="ts">
	import EcoscoreA from './ecoscore-a.svg';
	import EcoscoreB from './ecoscore-b.svg';
	import EcoscoreC from './ecoscore-c.svg';
	import EcoscoreD from './ecoscore-d.svg';
	import EcoscoreE from './ecoscore-e.svg';
	import EcoscoreUnknown from './ecoscore-unknown.svg';

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

<img alt="Nutriscore" {src} />
