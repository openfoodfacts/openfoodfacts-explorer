<script lang="ts">
	import type { LogoAnnotation } from '@openfoodfacts/openfoodfacts-nodejs';
	import IconMdiInformation from '@iconify-svelte/mdi/information';
	import IconMdiLoading from '@iconify-svelte/mdi/loading';
	import { _ } from '#lib/i18n/index.js';
	import Card from '#lib/ui/Card.svelte';

	type AnnotationType = LogoAnnotation['type'];
	type Logo = {
		logo_id: number;
		image_url?: string;
		confidence?: number;
	};
	const annotationOptions: AnnotationType[] = [
		'brand',
		'label',
		'category',
		'no_logo',
		'nutritional_label',
		'packager_code',
		'packaging',
		'qr_code',
		'store'
	];
	let {
		logo,
		selectedAnnotation,
		selectedValue,
		isAnnotating,
		onAnnotationChange,
		onValueChange,
		onAnnotate
	}: {
		logo: Logo;
		selectedAnnotation: AnnotationType | undefined;
		selectedValue: string;
		isAnnotating: boolean;
		onAnnotationChange: (logoId: number, value: AnnotationType | undefined) => void;
		onValueChange: (logoId: number, value: string) => void;
		onAnnotate: (logoId: number) => void;
	} = $props();
</script>

<Card>
	<div class="flex h-full flex-col">
		<div class="mb-3 h-48 overflow-hidden rounded-lg bg-base-200">
			{#if logo.image_url}
				<img
					src={logo.image_url}
					alt={$_('product.logo_annotations.image_alt')}
					class="h-full w-full object-cover"
				/>
			{:else}
				<div class="flex h-full items-center justify-center">
					<IconMdiInformation class="h-12 w-12 opacity-30" />
				</div>
			{/if}
		</div>
		{#if logo.confidence != null}
			<div class="mb-2">
				<div class="mb-1 flex justify-between text-xs font-semibold">
					<span>{$_('product.logo_annotations.confidence')}</span>
					<span>{(logo.confidence * 100).toFixed(0)}%</span>
				</div>
				<progress
					class="progress w-full progress-secondary"
					value={logo.confidence}
					max="1"
					aria-label={$_('product.logo_annotations.confidence')}
				></progress>
			</div>
		{/if}
		<div class="mt-auto space-y-2 border-t border-base-300 pt-3">
			<label for="annotation-{logo.logo_id}" class="block text-xs font-semibold"
				>{$_('product.logo_annotations.annotation_type')}</label
			>
			<select
				id="annotation-{logo.logo_id}"
				class="select-bordered select w-full select-sm"
				value={selectedAnnotation || ''}
				onchange={(event) =>
					onAnnotationChange(
						logo.logo_id,
						((event.currentTarget as HTMLSelectElement).value as AnnotationType) || undefined
					)}
			>
				<option value="">{$_('product.logo_annotations.choose_type')}</option>
				{#each annotationOptions as option (option)}<option value={option}
						>{option.replace(/_/g, ' ')}</option
					>{/each}
			</select>
			<label for="value-{logo.logo_id}" class="block text-xs font-semibold"
				>{$_('product.logo_annotations.value')}</label
			>
			<input
				id="value-{logo.logo_id}"
				type="text"
				class="input-bordered input w-full input-sm"
				value={selectedValue}
				placeholder={$_('product.logo_annotations.value_placeholder')}
				oninput={(event) =>
					onValueChange(logo.logo_id, (event.currentTarget as HTMLInputElement).value)}
			/>
			<button
				class="btn w-full btn-secondary btn-sm"
				disabled={isAnnotating || !selectedAnnotation || !selectedValue.trim()}
				onclick={() => onAnnotate(logo.logo_id)}
			>
				{#if isAnnotating}<IconMdiLoading class="h-4 w-4 animate-spin" />{:else}{$_(
						'product.logo_annotations.submit'
					)}{/if}
			</button>
		</div>
	</div>
</Card>
