<script lang="ts">
	import cytoscape from 'cytoscape';
	import type { Core, ElementDefinition } from 'cytoscape';

	import type { TaxoNode, Taxonomy } from '@openfoodfacts/openfoodfacts-nodejs';

	import { getOrDefault } from '$lib/api';
	import { preferences } from '$lib/settings';

	type Props = {
		id: string;
		onclick?: (nodeId: string) => void;
		node: TaxoNode;
		taxonomy: Taxonomy;
	};

	let { node, taxonomy, onclick, id }: Props = $props();

	let container: HTMLDivElement | null = null;
	let cy: Core | null = null;

	let darkMode = $derived(
		window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches
	);

	// TailwindCSS palette colors (hex values)
	const light = {
		current: '#f59e42', // orange-500
		parent: '#3b82f6', // blue-500
		child: '#22c55e', // green-500
		edge: '#d1d5db', // gray-300
		bg: '#fff',
		text: '#18181b', // gray-900
		outline: '#fff'
	};
	const dark = {
		current: '#fb923c', // orange-400
		parent: '#60a5fa', // blue-400
		child: '#4ade80', // green-400
		edge: '#4b5563', // gray-600
		bg: '#18181b', // gray-900
		text: '#f3f4f6', // gray-100
		outline: '#18181b' // gray-900
	};

	function getElements(): ElementDefinition[] {
		const elements: ElementDefinition[] = [];

		// Add current node
		elements.push({
			data: {
				id: id,
				label: getOrDefault(node.name, $preferences.lang),
				type: 'current'
			}
		});

		// Add parents and edges
		if (node.parents) {
			for (const parentId of node.parents) {
				const parent = taxonomy[parentId];
				elements.push({
					data: {
						id: parentId,
						label: getOrDefault(parent.name, $preferences.lang),
						type: 'parent'
					}
				});
				elements.push({
					data: {
						id: `${parentId}->${id}`,
						source: parentId,
						target: id
					}
				});
			}
		}

		// Add children and edges
		if (node.children) {
			for (const childId of node.children) {
				const child = taxonomy[childId];
				elements.push({
					data: {
						id: childId,
						label: getOrDefault(child.name, $preferences.lang),
						type: 'child'
					}
				});
				elements.push({
					data: {
						id: `${id}->${childId}`,
						source: id,
						target: childId
					}
				});
			}
		}

		return elements;
	}

	function renderGraph() {
		if (!container) return;

		const colors = darkMode ? dark : light;
		cy = cytoscape({
			container,
			elements: getElements(),
			style: [
				{
					selector: 'node[type="current"]',
					style: {
						'background-color': colors.current,
						label: 'data(label)',
						'font-weight': 'bold',
						'text-valign': 'top',
						'text-halign': 'center',
						'text-margin-y': -20,
						color: colors.text,
						'border-width': 3,
						'border-color': colors.current,
						width: 40,
						height: 40,
						'font-size': 18,
						'text-outline-width': 2,
						'text-outline-color': colors.outline
					}
				},
				{
					selector: 'node[type="parent"]',
					style: {
						'background-color': colors.parent,
						label: 'data(label)',
						color: colors.text,
						'text-valign': 'center',
						'text-halign': 'left',
						'text-margin-x': -15,
						width: 30,
						height: 30,
						'font-size': 15,
						'text-outline-width': 2,
						'text-outline-color': colors.outline
					}
				},
				{
					selector: 'node[type="child"]',
					style: {
						'background-color': colors.child,
						label: 'data(label)',
						color: colors.text,
						'text-valign': 'center',
						'text-halign': 'right',
						'text-margin-x': 15,
						width: 30,
						height: 30,
						'font-size': 15,
						'text-outline-width': 2,
						'text-outline-color': colors.outline
					}
				},
				{
					selector: 'edge',
					style: {
						width: 3,
						'line-color': colors.edge,
						'target-arrow-color': colors.edge,
						'target-arrow-shape': 'triangle',
						'curve-style': 'bezier'
					}
				}
			],
			layout: {
				name: 'breadthfirst',
				directed: true,
				roots: node.parents && node.parents.length > 0 ? node.parents : [id],
				padding: 30,
				spacingFactor: 2,
				direction: 'rightward'
			}
		});

		cy.fit(); // fit graph to container
	}

	// Navigation on node click (attach once after render)
	function attachCytoscapeNavigation() {
		if (!cy) return;
		cy.off('tap'); // Remove previous handlers
		cy.on('tap', 'node', function (evt) {
			const clickedId = evt.target.id();
			const nodeType = evt.target.data('type');
			if (nodeType === 'current') return; // Ignore clicks on the current node
			onclick?.(clickedId);
		});
	}

	$effect(() => {
		const fitOnResize = () => {
			if (cy) cy.fit();
		};
		window.addEventListener('resize', fitOnResize);
		return () => {
			window.removeEventListener('resize', fitOnResize);
		};
	});

	$effect(() => {
		// bind to these variables changes
		const _ = { darkMode, taxonomy, node };

		renderGraph();
		attachCytoscapeNavigation();

		return () => {
			if (cy) {
				cy.destroy();
				cy = null;
			}
		};
	});
</script>

<div
	bind:this={container}
	class="h-96 w-full rounded border bg-white"
	style="background-color: {darkMode ? dark.bg : light.bg};"
	role="region"
	aria-label="Taxonomy graph"
></div>

<style>
	.h-96 {
		height: 24rem;
	}
</style>
