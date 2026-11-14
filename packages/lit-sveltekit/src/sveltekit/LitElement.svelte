<script lang="ts">
	import { splitWebComponentProps } from './splitWebComponentProps.js';
	import { LIT_SSR_STATE_ATTRIBUTE, serializeLitSsrState } from './ssrState.js';

	type RuntimeProps = { tag: string; ssr?: boolean; [name: string]: unknown };
	type LitElementProps = {
		tag: string;
		props: Record<string, unknown>;
	};

	function applyLitElementProperties(node: HTMLElement, initialProps: LitElementProps) {
		let currentProps = initialProps;
		let currentProperties: Record<string, unknown> = {};
		let active = true;

		function applyProps() {
			// Until registration, the allowlist is unavailable. whenDefined reapplies
			// the latest props after Lit's declared properties become available.
			const nextProperties = splitWebComponentProps(
				currentProps.tag,
				currentProps.props
			).properties;

			for (const name of Object.keys(currentProperties)) {
				if (!(name in nextProperties)) Reflect.set(node, name, undefined);
			}

			Object.assign(node, nextProperties);
			currentProperties = nextProperties;
			node.removeAttribute(LIT_SSR_STATE_ATTRIBUTE);
		}

		applyProps();
		if (typeof customElements !== 'undefined') {
			void customElements.whenDefined(initialProps.tag).then(() => {
				if (active) applyProps();
			});
		}

		return {
			update(nextProps: LitElementProps) {
				currentProps = nextProps;
				applyProps();
			},
			destroy() {
				active = false;
			}
		};
	}

	let { tag, ssr = false, ...props }: RuntimeProps = $props();
	const splitProps = $derived(splitWebComponentProps(tag, props));
	const ssrState = $derived(ssr ? serializeLitSsrState(props, {}) : '');
</script>

<svelte:element
	this={tag}
	{...splitProps.attributes}
	data-lit-ssr={ssrState || undefined}
	use:applyLitElementProperties={{ tag, props }}
></svelte:element>
