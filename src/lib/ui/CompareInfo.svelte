<script lang="ts">
	import { _ } from '#lib/i18n/index.js';
	import { onMount } from 'svelte';
	import IconMdiInformationOutline from '@iconify-svelte/mdi/information-outline';
	import IconMdiClose from '@iconify-svelte/mdi/close';

	let { text, placement = 'bottom' }: { text: string; placement?: 'top' | 'bottom' } = $props();
	const id = $props.id();
	let button: HTMLButtonElement;
	let popover: HTMLDivElement;
	let ready = $state(false);
	let open = $state(false);
	let left = $state(0);
	let top = $state(0);

	onMount(() => {
		ready = true;
	});

	function close() {
		if (popover.matches(':popover-open')) popover.hidePopover();
	}

	function handleFocus(event: FocusEvent) {
		if (
			event.target instanceof Node &&
			event.target !== button &&
			!popover.contains(event.target)
		) {
			close();
		}
	}

	function handleToggle(event: ToggleEvent) {
		open = event.newState === 'open';
		if (!open) return;
		const trigger = button.getBoundingClientRect();
		const panel = popover.getBoundingClientRect();
		const gap = 8;
		const margin = 16;
		left = Math.max(
			margin,
			Math.min(trigger.right - panel.width, window.innerWidth - panel.width - margin)
		);
		const above = trigger.top - panel.height - gap;
		const below = trigger.bottom + gap;
		const preferredTop = placement === 'top' ? above : below;
		const alternateTop = placement === 'top' ? below : above;
		top = Math.max(
			margin,
			Math.min(
				preferredTop >= margin && preferredTop + panel.height <= window.innerHeight - margin
					? preferredTop
					: alternateTop,
				window.innerHeight - panel.height - margin
			)
		);
	}
</script>

<svelte:window onfocusin={handleFocus} onresize={close} onscroll={close} />

<button
	bind:this={button}
	type="button"
	class="btn btn-circle btn-ghost btn-sm md:btn-md"
	aria-label={$_('compare.info_label', { default: 'About product comparison' })}
	aria-controls={id}
	aria-expanded={open}
	popovertarget={id}
	disabled={!ready}
>
	<IconMdiInformationOutline class="h-5 w-5" aria-hidden="true" />
</button>
<div
	bind:this={popover}
	{id}
	popover="auto"
	role="dialog"
	aria-label={$_('compare.info_label', { default: 'About product comparison' })}
	aria-describedby="{id}-description"
	ontoggle={handleToggle}
	class="fixed max-h-[calc(100dvh-2rem)] w-80 max-w-[calc(100vw-2rem)] overflow-y-auto rounded-box border border-base-300 bg-base-100 p-4 text-base-content shadow-lg"
	style:right={open ? 'auto' : undefined}
	style:bottom={open ? 'auto' : undefined}
	style:margin={open ? '0' : undefined}
	style:left="{left}px"
	style:top="{top}px"
>
	<div class="flex items-start gap-2">
		<p id="{id}-description" class="min-w-0 flex-1 text-sm leading-relaxed">{text}</p>
		<button
			type="button"
			class="btn btn-circle shrink-0 btn-ghost btn-xs"
			popovertarget={id}
			popovertargetaction="hide"
			aria-label={$_('common.close', { default: 'Close' })}
		>
			<IconMdiClose class="h-4 w-4" aria-hidden="true" />
		</button>
	</div>
</div>
