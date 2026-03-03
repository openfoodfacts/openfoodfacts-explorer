<script lang="ts">
	import IconMdiArrowUp from '@iconify-svelte/mdi/arrow-up';
	import { _ } from '$lib/i18n';

	let isVisible = $state(false);

	function scrollToTop() {
		window.scrollTo({
			top: 0,
			behavior: 'smooth'
		});
	}

	function handleScroll() {
		isVisible = window.scrollY > 200;
	}
</script>

<svelte:window onscroll={handleScroll} />

{#if isVisible}
	<div class="fixed right-6 bottom-6 z-50">
		<button
			class="btn btn-circle btn-primary shadow-lg"
			onclick={scrollToTop}
			aria-label={$_('action.scroll_to_top', { default: 'Scroll to top' })}
		>
			<IconMdiArrowUp class="h-6 w-6" />
		</button>
	</div>
{/if}
