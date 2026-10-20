export type ExpansionController = {
	expandedPanels: Record<string, boolean>;
	allPanelsExpanded: boolean;
	register: (id: string, defaultExpanded: boolean) => () => void;
	updateDefault: (id: string, defaultExpanded: boolean) => void;
	setExpanded: (id: string, expanded: boolean) => void;
	toggleAll: () => void;
	reset: () => void;
};

export function createExpansionController(): ExpansionController {
	let expandedPanels = $state<Record<string, boolean>>({});
	let registeredPanels = $state<Record<string, number>>({});
	let panelDefaults = $state<Record<string, boolean>>({});

	const allPanelsExpanded = $derived.by(() => {
		const panelIds = Object.keys(registeredPanels);

		return panelIds.length > 0 && panelIds.every((id) => expandedPanels[id] ?? false);
	});

	function register(id: string, defaultExpanded: boolean) {
		registeredPanels = {
			...registeredPanels,
			[id]: (registeredPanels[id] ?? 0) + 1
		};

		if (expandedPanels[id] === undefined) {
			expandedPanels = { ...expandedPanels, [id]: defaultExpanded };
		}
		panelDefaults = { ...panelDefaults, [id]: defaultExpanded };

		return () => {
			const count = registeredPanels[id];
			if (count === undefined) return;

			if (count === 1) {
				const remaining = { ...registeredPanels };
				delete remaining[id];
				registeredPanels = remaining;
				const remainingDefaults = { ...panelDefaults };
				delete remainingDefaults[id];
				panelDefaults = remainingDefaults;
			} else {
				registeredPanels = { ...registeredPanels, [id]: count - 1 };
			}
		};
	}

	function setExpanded(id: string, expanded: boolean) {
		expandedPanels = { ...expandedPanels, [id]: expanded };
	}

	function updateDefault(id: string, defaultExpanded: boolean) {
		if (registeredPanels[id] === undefined || panelDefaults[id] === defaultExpanded) {
			return;
		}
		panelDefaults = { ...panelDefaults, [id]: defaultExpanded };
		expandedPanels = { ...expandedPanels, [id]: defaultExpanded };
	}

	function toggleAll() {
		const expanded = !allPanelsExpanded;
		expandedPanels = Object.fromEntries(Object.keys(registeredPanels).map((id) => [id, expanded]));
	}

	function reset() {
		expandedPanels = { ...panelDefaults };
	}

	return {
		get expandedPanels() {
			return expandedPanels;
		},
		get allPanelsExpanded() {
			return allPanelsExpanded;
		},
		register,
		updateDefault,
		setExpanded,
		toggleAll,
		reset
	};
}
