import { getContext, setContext } from 'svelte';
import type { QualityError } from '$lib/utils/dataQuality';

export type DataQualityContext = {
	readonly isEnabled: boolean;
	readonly errors: QualityError[];
	forField: (field: string) => QualityError | undefined;
	forSection: (section: string) => QualityError[];
};

const DATA_QUALITY_KEY = 'data-quality-ctx';

export function setDataQualityCtx(ctx: () => DataQualityContext) {
	setContext(DATA_QUALITY_KEY, ctx);
}

export function getDataQualityCtx(): DataQualityContext {
	const lambda = getContext(DATA_QUALITY_KEY) as (() => DataQualityContext) | undefined;
	if (!lambda) {
		return {
			isEnabled: false,
			errors: [],
			forField: () => undefined,
			forSection: () => []
		};
	}
	return lambda();
}
