<script lang="ts">
	import { _ } from '$lib/i18n';
	import IconMdiChevronUp from '@iconify-svelte/mdi/chevron-up';
	import { fly } from 'svelte/transition';

	let y = $state(0);
	let visible = $derived(y > 300);

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}
</script>

<svelte:window bind:scrollY={y} />

{#if visible}
	<div class="fixed right-6 bottom-6 z-40" transition:fly={{ y: 20, duration: 300 }}>
		<button
			class="btn btn-circle btn-primary shadow-xl hover:scale-105 active:scale-95 transition-transform duration-200"
			onclick={scrollToTop}
			aria-label={$_('common.scroll_to_top', { default: 'Scroll to top' })}
			title={$_('common.scroll_to_top', { default: 'Scroll to top' })}
		>
			<IconMdiChevronUp class="h-6 w-6" />
		</button>
	</div>
{/if}
