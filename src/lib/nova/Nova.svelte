<script lang="ts">
	import Nova1 from './nova-group-1.svg';
	import Nova2 from './nova-group-2.svg';
	import Nova3 from './nova-group-3.svg';
	import Nova4 from './nova-group-4.svg';
	import NovaUnknown from './nova-group-unknown.svg';

	const MAP: Record<string, string> = {
		1: Nova1,
		2: Nova2,
		3: Nova3,
		4: Nova4
	};

	export let grade: number;
	$: src = MAP[grade] ?? NovaUnknown;
</script>

<img alt="Nutriscore" {src} />
