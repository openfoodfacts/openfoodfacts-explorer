<script lang="ts">
	import type { LogoAnnotation } from '@openfoodfacts/openfoodfacts-nodejs';
	import IconMdiAlert from '@iconify-svelte/mdi/alert';
	import IconMdiArrowLeft from '@iconify-svelte/mdi/arrow-left';
	import IconMdiCheckCircle from '@iconify-svelte/mdi/check-circle';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import { _ } from '#lib/i18n/index.js';
	import { createRobotoffApi } from '#lib/api.js';
	import LogoAnnotationCard from '#lib/ui/LogoAnnotationCard.svelte';

	type AnnotationType = LogoAnnotation['type'];
	type Logo = {
		logo_id: number;
		image_url?: string;
		type?: AnnotationType;
		value?: string;
		confidence?: number;
	};

	let { data }: { data: { barcode: string; logos: Logo[]; error?: string } } = $props();
	let removedLogos = $state<Set<number>>(new Set());
	let selectedAnnotations = $state<Record<number, AnnotationType>>({});
	let selectedValues = $state<Record<number, string>>({});
	let initialValuesLoaded = $state(false);
	let annotatingLogoId = $state<number | null>(null);
	let successMessage = $state<string | null>(null);
	let error = $state<string | null>(null);
	let logos = $derived(data.logos.filter((logo) => !removedLogos.has(logo.logo_id)));

	$effect(() => {
		if (initialValuesLoaded) return;
		for (const logo of data.logos) {
			if (logo.type) selectedAnnotations[logo.logo_id] = logo.type;
			if (logo.value) selectedValues[logo.logo_id] = logo.value;
		}
		initialValuesLoaded = true;
	});

	function handleAnnotationChange(logoId: number, value: AnnotationType | undefined) {
		if (value) selectedAnnotations[logoId] = value;
		else delete selectedAnnotations[logoId];
	}

	function handleValueChange(logoId: number, value: string) {
		selectedValues[logoId] = value;
	}

	async function annotateLogo(logoId: number) {
		const annotationType = selectedAnnotations[logoId];
		if (!annotationType) {
			error = $_('product.logo_annotations.select_type');
			return;
		}

		annotatingLogoId = logoId;
		error = null;
		successMessage = null;
		try {
			const response = await createRobotoffApi(fetch).annotateLogos([
				{ logo_id: logoId, type: annotationType, value: selectedValues[logoId] || null }
			]);
			if (!response.response.ok) {
				throw new Error(`Robotoff annotation failed (${response.response.status})`);
			}
			if (response.data?.annotated === 0) {
				throw new Error('Robotoff did not annotate the logo');
			}
			removedLogos = new Set([...removedLogos, logoId]);
			successMessage = $_('product.logo_annotations.success');
		} catch (err) {
			const message = err instanceof Error ? err.message : 'Unknown error';
			error =
				message.includes('(401)') || message.includes('(403)')
					? $_('product.login_required_body', {
							default:
								'You must be logged in to contribute to the database. Sign in to add or edit food product information.'
						})
					: $_('product.logo_annotations.error', { values: { message } });
			console.error('Error annotating logo:', err);
		} finally {
			annotatingLogoId = null;
		}
	}
</script>

<svelte:head>
	<title>{$_('product.logo_annotations.title')} - {data.barcode}</title>
</svelte:head>

<div class="min-h-screen bg-base-100 px-4 py-6 sm:px-6">
	<div class="mx-auto max-w-5xl">
		<div class="mb-6 flex items-center gap-3">
			<a href={`/products/${data.barcode}`} class="btn gap-2 btn-ghost btn-sm">
				<IconMdiArrowLeft class="h-5 w-5" />
				<span>{$_('product.logo_annotations.back')}</span>
			</a>
			<h1 class="flex-1 text-2xl font-bold">{$_('product.logo_annotations.title')}</h1>
			<span class="badge badge-lg">{logos.length}</span>
		</div>

		{#if error || data.error}
			<div class="mb-6 alert alert-error">
				<IconMdiAlert class="h-6 w-6 shrink-0" />
				<span>{error || data.error}</span>
			</div>
		{/if}
		{#if successMessage}
			<div class="mb-6 alert alert-success">
				<IconMdiCheckCircle class="h-6 w-6 shrink-0" />
				<span>{successMessage}</span>
			</div>
		{/if}

		{#if logos.length === 0}
			<div class="flex flex-col items-center justify-center py-12 text-center">
				<IconMdiInformation class="mb-4 h-16 w-16 opacity-50" />
				<h2 class="mb-2 text-lg font-semibold">{$_('product.logo_annotations.empty_title')}</h2>
				<p class="mb-6 text-sm text-base-content/70">
					{$_('product.logo_annotations.empty_description')}
				</p>
				<a href={`/products/${data.barcode}`} class="btn btn-primary btn-sm">
					{$_('product.logo_annotations.back')}
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
