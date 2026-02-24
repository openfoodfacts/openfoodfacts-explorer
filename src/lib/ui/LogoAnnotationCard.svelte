<script lang="ts">
	import Card from '$lib/ui/Card.svelte';
	import type { LogoAnnotation } from '@openfoodfacts/openfoodfacts-nodejs';

	import IconMdiLoading from '@iconify-svelte/mdi/loading';
	import IconMdiInformation from '@iconify-svelte/mdi/information';

	type AnnotationType = LogoAnnotation['type'];

	interface LogoImage {
		logo_id: number;
		image_url?: string;
		type?: string;
		value?: string;
		confidence?: number;
	}

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

	interface Props {
		logo: LogoImage;
		selectedAnnotation: AnnotationType | undefined;
		selectedValue: string;
		isAnnotating: boolean;
		onAnnotationChange: (logoId: number, value: AnnotationType | undefined) => void;
		onValueChange: (logoId: number, value: string) => void;
		onAnnotate: (logoId: number) => void;
	}

	let {
		logo,
		selectedAnnotation,
		selectedValue,
		isAnnotating,
		onAnnotationChange,
		onValueChange,
		onAnnotate
	}: Props = $props();
</script>

<Card>
	<div class="flex flex-col h-full">
		<div class="mb-4 overflow-hidden rounded-lg bg-base-200 h-48">
			{#if logo.image_url}
				<img
					src={logo.image_url}
					alt="Logo crop"
					class="h-full w-full object-cover"
				/>
			{:else}
				<div class="flex items-center justify-center h-full">
					<IconMdiInformation class="h-12 w-12 opacity-30" />
				</div>
			{/if}
		</div>

		<div class="mb-4 space-y-2">
			{#if logo.type}
				<div>
					<span class="text-xs font-semibold text-base-content/70">TYPE</span>
					<p class="rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-900 dark:bg-blue-900/30 dark:text-blue-300 w-fit">
						{logo.type}
					</p>
				</div>
			{/if}
			{#if logo.value}
				<div>
					<span class="text-xs font-semibold text-base-content/70">VALUE</span>
					<p class="text-sm text-base-content/70">{logo.value}</p>
				</div>
			{/if}
			{#if logo.confidence}
				<div>
					<span class="text-xs font-semibold text-base-content/70">CONFIDENCE</span>
					<div class="flex items-center gap-2 mt-1">
						<progress
							class="progress progress-info h-1.5 flex-1"
							value={logo.confidence}
							max="1"
						></progress>
						<span class="text-xs font-medium w-10 text-right">
							{(logo.confidence * 100).toFixed(0)}%
						</span>
					</div>
				</div>
			{/if}
		</div>

		<div class="space-y-3 border-t border-base-300 pt-4 mt-auto">
			<div>
				<label for="annotation-{logo.logo_id}" class="mb-2 block text-xs font-semibold">
					ANNOTATION TYPE
				</label>
				<select
					id="annotation-{logo.logo_id}"
					class="select select-bordered select-sm w-full"
					value={selectedAnnotation || ''}
					onchange={(e) => {
						const value = e.currentTarget.value as AnnotationType;
						onAnnotationChange(logo.logo_id, value || undefined);
					}}
				>
					<option value="">Choose type...</option>
					{#each annotationOptions as option}
						<option value={option}>
							{option.replace(/_/g, ' ')}
						</option>
					{/each}
				</select>
			</div>
			<div>
				<label for="value-{logo.logo_id}" class="mb-2 block text-xs font-semibold">
					ANNOTATION VALUE
				</label>
				<input
					id="value-{logo.logo_id}"
					type="text"
					class="input input-bordered input-sm w-full"
					value={selectedValue || ''}
					placeholder="Enter value..."
					oninput={(e) => {
						onValueChange(logo.logo_id, e.currentTarget.value);
					}}
				/>
			</div>

			<button
				class="btn btn-primary btn-sm w-full"
				disabled={isAnnotating || !selectedAnnotation || selectedValue.trim() === ''}
				onclick={() => onAnnotate(logo.logo_id)}
			>
				{#if isAnnotating}
					<IconMdiLoading class="h-4 w-4 animate-spin" />
					Submitting...
				{:else}
					Annotate
				{/if}
			</button>
		</div>
	</div>
</Card>