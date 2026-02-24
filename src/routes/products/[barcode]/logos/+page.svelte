<script lang="ts">
	import { createRobotoffApi } from '$lib/api';
	import type { LogoAnnotation } from '@openfoodfacts/openfoodfacts-nodejs';
	import LogoAnnotationCard from '$lib/ui/LogoAnnotationCard.svelte';

	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';
	import IconMdiCheckCircle from '@iconify-svelte/mdi/check-circle';
	import IconMdiInformation from '@iconify-svelte/mdi/information';

	interface LogoImage {
		logo_id: number;
		image_url?: string;
		type?: string;
		value?: string;
		confidence?: number;
	}

	type AnnotationType = LogoAnnotation['type'];

	interface PageProps {
		data: {
			barcode: string;
			logos: LogoImage[];
			logoCount: number;
			error?: string;
		};
	}

	let { data }: PageProps = $props();

	let removedLogos = $state<Set<number>>(new Set());
	let selectedAnnotations = $state<Record<number, AnnotationType>>({});
	let selectedValues = $state<Record<number, string>>({});

	$effect(() => {
		selectedAnnotations = Object.fromEntries(
			(data.logos || []).filter((l) => l.type).map((l) => [l.logo_id, l.type as AnnotationType])
		);
		selectedValues = Object.fromEntries(
			(data.logos || []).filter((l) => l.value).map((l) => [l.logo_id, l.value as string])
		);
	});

	let annotatingLogoId: number | null = $state(null);
	let successMessage = $state<string | null>(null);
	let error = $state<string | null>(null);

	let displayedError = $derived(error || data.error || null);
	let logos = $derived((data.logos || []).filter((logo) => !removedLogos.has(logo.logo_id)));

	function handleAnnotationChange(logoId: number, value: AnnotationType | undefined) {
		if (value) {
			selectedAnnotations[logoId] = value;
		} else {
			delete selectedAnnotations[logoId];
		}
	}

	function handleValueChange(logoId: number, value: string) {
		selectedValues[logoId] = value;
	}

	async function annotateLogo(logoId: number) {
		const annotationType = selectedAnnotations[logoId];
		if (!annotationType) {
			error = 'Please select an annotation type';
			return;
		}

		annotatingLogoId = logoId;
		error = null;
		successMessage = null;

		try {
			const robotoff = createRobotoffApi(fetch);
			const annotationValue = selectedValues[logoId] || '';

			const annotation = {
				logo_id: logoId,
				type: annotationType,
				value: annotationValue || null
			};

			const response = await robotoff.annotateLogos([annotation]);
			if (response.data) {
				successMessage = `Logo annotated successfully!`;

				removedLogos = new Set(removedLogos.add(logoId));
				delete selectedAnnotations[logoId];
				delete selectedValues[logoId];

				setTimeout(() => {
					successMessage = null;
				}, 3000);
			}
		} catch (err) {
			error = `Error annotating logo: ${err instanceof Error ? err.message : 'Unknown error'}`;
			console.error('Error annotating logo:', err);
		} finally {
			annotatingLogoId = null;
		}
	}
</script>

<svelte:head>
	<title>Logo Annotations - Product {data.barcode}</title>
</svelte:head>

<div class="flex min-h-screen flex-col bg-base-100">

	<div class="border-b border-base-300 bg-base-200 px-4 py-4 sm:px-6">
		<div class="mx-auto max-w-4xl">
			<div class="flex items-center gap-3">
				<a href={`/products/${data.barcode}`} class="btn btn-ghost btn-sm gap-2" title="Back to product">
					<IconMdiArrowLeft class="h-5 w-5" />
				</a>
				<h1 class="flex-1 text-2xl font-bold">Logo Annotations</h1>
				<span class="badge badge-lg">{logos.length}</span>
			</div>
		</div>
	</div>

	<div class="flex-1 px-4 py-6 sm:px-6">
		<div class="mx-auto max-w-4xl">
			{#if displayedError}
				<div class="alert alert-error mb-6">
					<IconMdiAlert class="h-6 w-6 shrink-0" />
				<div>
						<h3 class="font-bold">Error</h3>
						<div class="text-xs">{displayedError}</div>
					</div>
				</div>
			{/if}

			{#if successMessage}
				<div class="alert alert-success mb-6">
					<IconMdiCheckCircle class="h-6 w-6 shrink-0" />
					<div class="text-xs">{successMessage}</div>
				</div>
			{/if}

			{#if logos.length === 0}
				<div class="flex flex-col items-center justify-center py-12">
					<IconMdiInformation class="mb-4 h-16 w-16 opacity-50" />
					<h3 class="mb-2 text-lg font-semibold">No Logos to Annotate</h3>
					<p class="mb-6 text-center text-sm opacity-70">
						All logos for this product have been annotated or there are no logos detected.
					</p>
					<a href={`/products/${data.barcode}`} class="btn btn-primary btn-sm">
						<IconMdiArrowLeft class="h-4 w-4" />
						Back to Product
					</a>
				</div>
			{:else}
				<div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
					{#each logos as logo (logo.logo_id)}
						<LogoAnnotationCard
							{logo}
							selectedAnnotation={selectedAnnotations[logo.logo_id]}
							selectedValue={selectedValues[logo.logo_id] || ''}
							isAnnotating={annotatingLogoId === logo.logo_id}
							onAnnotationChange={handleAnnotationChange}
							onValueChange={handleValueChange}
							onAnnotate={annotateLogo}
						/>
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>