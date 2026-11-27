import type { Spec, Mark } from 'vega';

/**
 * Applies a resolved theme color to the fill and stroke of top-level marks.
 * Vega cannot use CSS variables directly, so the color must be resolved
 * beforehand.
 *
 * @param marks - Marks from a compiled Vega spec.
 * @param primaryColor - Resolved primary theme color.
 * @returns New marks with updated enter and update encodings.
 */
export function patchMarksForDarkMode(marks: Mark[], primaryColor: string): Mark[] {
	const applyColorToMark = (mark: Mark): Mark =>
		({
			...mark,
			encode: {
				...mark.encode,
				update: {
					...mark.encode?.update,
					fill: { value: primaryColor },
					stroke: { value: primaryColor }
				},
				enter: { ...mark.encode?.enter, fill: { value: primaryColor } }
			}
		}) as Mark;

	return marks.map(applyColorToMark);
}

/**
 * Adapts a Vega spec to make band axis labels more readable.
 *
 * Removes two-letter language prefixes, wraps long labels at hyphens, and adds
 * a `labelsSideways` signal for rotating labels. Axes with existing label
 * encodings are left unchanged. The spec also gains band padding and
 * width-fitting autosize.
 *
 * @param spec - Vega spec to adapt.
 * @param bandScales - Names of scales whose axes should receive label encodings.
 * @param options - Band padding and estimated character width in pixels.
 * @returns A new spec with readable band labels.
 */
export function withReadableBandLabels(
	spec: Spec,
	bandScales: Set<string | undefined>,
	options: { bandPadding: number; charWidth: number } = { bandPadding: 0.2, charWidth: 6 }
): Spec {
	const labelWithoutLanguagePrefix = "replace(datum.label, regexp('^[a-z]{2}:'), '')";

	return {
		...spec,
		// resize: grow the height when the labels turn sideways after the first render.
		autosize: { type: 'fit-x', contains: 'padding', resize: true },
		signals: [...(spec.signals ?? []), { name: 'labelsSideways', value: false }],
		scales: spec.scales?.map((s) =>
			s.type === 'band' ? { ...s, padding: options.bandPadding } : s
		),
		axes: spec.axes?.map((axis) => {
			if (!bandScales.has(axis.scale) || axis.encode?.labels) return axis;
			const step = `bandwidth('${axis.scale}') / ${1 - options.bandPadding}`;
			const labelFits = `length(${labelWithoutLanguagePrefix}) * ${options.charWidth} <= ${step} - 4`;
			const wrappedLabel = `split(${labelWithoutLanguagePrefix}, '-')`;
			return {
				...axis,
				encode: {
					...axis.encode,
					labels: {
						update: {
							text: {
								signal: `labelsSideways || ${labelFits} ? ${labelWithoutLanguagePrefix} : ${wrappedLabel}`
							},
							angle: { signal: `labelsSideways ? -90 : 0` },
							align: { signal: `labelsSideways ? 'right' : 'center'` },
							baseline: { signal: `labelsSideways ? 'middle' : 'top'` }
						}
					}
				}
			};
		})
	};
}
