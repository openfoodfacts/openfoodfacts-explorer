<script lang="ts">
	import Tags from './Tags.svelte';

	const TRACEABILITY_CODES_URL =
		'https://wiki.openfoodfacts.org/Food_Traceability_Codes/EU_Food_establishments';

	interface Props {
		traceabilityCodes?: string;
		autocomplete?: readonly string[];
		onChange?: (event: { traceabilityCodes: string }) => void;
	}

	let { traceabilityCodes = $bindable(''), autocomplete = [], onChange }: Props = $props();

	// Create an array of codes from the comma-separated string
	let traceabilityCodesArray = $derived.by(() => {
		const codeStr = traceabilityCodes.trim();

		if (codeStr === '') return [];
		return codeStr.split(',');
	});

	function handleChange(tags: string[]) {
		traceabilityCodes = tags.join(',');
		onChange?.({ traceabilityCodes });
	}
</script>

<div class="mb-4">
	<div class="mb-2">
		<label for="traceability-codes">Traceability Codes (EU Food Establishments)</label>
		<div class="mb-1 text-xs text-gray-500">
			Examples: FR 38.012.001 CE, ES 12.03456/B CE, IT 1234 L CE
		</div>
	</div>
	<Tags tags={traceabilityCodesArray} {autocomplete} onChange={handleChange} />
	<div class="mt-1 text-xs">
		<p>Format depends on country (e.g., FR XX.XXX.XXX CE for France)</p>
		<p>
			More info: <a href={TRACEABILITY_CODES_URL} target="_blank" class="link">
				Food Traceability Codes Wiki
			</a>
		</p>
	</div>
</div>
