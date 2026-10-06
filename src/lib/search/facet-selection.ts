export type FacetsSelection = {
	[facet: string]: {
		include: string[];
		exclude: string[];
	};
};

export function addIncludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const current = sel[facet] || { include: [], exclude: [] };
	const alreadyIncluded = current.include.includes(value);
	const inExclude = current.exclude ? current.exclude.includes(value) : false;

	if (alreadyIncluded && !inExclude) {
		return sel;
	}

	return {
		...sel,
		[facet]: {
			include: alreadyIncluded ? [...current.include] : [...current.include, value],
			exclude: current.exclude ? current.exclude.filter((v: string) => v !== value) : []
		}
	};
}

export function addExcludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const current = sel[facet] || { include: [], exclude: [] };
	const alreadyExcluded = current.exclude ? current.exclude.includes(value) : false;
	const inInclude = current.include ? current.include.includes(value) : false;

	if (alreadyExcluded && !inInclude) {
		return sel;
	}

	return {
		...sel,
		[facet]: {
			include: current.include ? current.include.filter((v: string) => v !== value) : [],
			exclude: alreadyExcluded ? [...current.exclude] : [...current.exclude, value]
		}
	};
}

export function removeIncludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...query };
	if (newQuery[facet]) {
		newQuery[facet] = {
			...newQuery[facet],
			include: newQuery[facet].include.filter((v: string) => v !== value)
		};
	}
	return newQuery;
}

export function removeExcludeFacet(
	query: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const newQuery: FacetsSelection = { ...query };
	if (newQuery[facet]) {
		newQuery[facet] = {
			...newQuery[facet],
			exclude: newQuery[facet].exclude.filter((v: string) => v !== value)
		};
	}
	return newQuery;
}

export function toggleIncludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const isCurrentlyIncluded = sel[facet]?.include?.includes(value);
	if (isCurrentlyIncluded) {
		return removeIncludeFacet(sel, facet, value);
	} else {
		const withoutExclude = removeExcludeFacet(sel, facet, value);
		return addIncludeFacet(withoutExclude, facet, value);
	}
}

export function toggleExcludeFacet(
	sel: FacetsSelection,
	facet: string,
	value: string
): FacetsSelection {
	const isCurrentlyExcluded = sel[facet]?.exclude?.includes(value);
	if (isCurrentlyExcluded) {
		return removeExcludeFacet(sel, facet, value);
	} else {
		const withoutInclude = removeIncludeFacet(sel, facet, value);
		return addExcludeFacet(withoutInclude, facet, value);
	}
}
