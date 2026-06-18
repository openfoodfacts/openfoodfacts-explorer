<script lang="ts">
	import { onMount, onDestroy } from 'svelte';
	import { _ } from '$lib/i18n';

	import chocoBarIcon from '$lib/assets/chocolate-bar.svg';
	import cheeseIcon from '$lib/assets/cheese.svg';
	import butterIcon from '$lib/assets/butter.svg';
	import eggIcon from '$lib/assets/egg-01.svg';
	import pastaIcon from '$lib/assets/pasta.svg';

	const foodIcons = [chocoBarIcon, cheeseIcon, butterIcon, eggIcon, pastaIcon];

	const funnyMessages: Array<{ text: string; emoji: string }> = [
		{ text: 'Scanning barcodes...', emoji: '🔍' },
		{ text: 'Counting Nutri-Score points...', emoji: '🧮' },
		{ text: 'Asking the cheese for its opinion...', emoji: '🧀' },
		{ text: 'Warming up the toaster...', emoji: '🍞' },
		{ text: 'Checking if the milk is still fresh...', emoji: '🥛' },
		{ text: 'Negotiating with the pasta...', emoji: '🍝' },
		{ text: 'Teaching an egg to stand up...', emoji: '🥚' },
		{ text: 'Consulting the butter oracle...', emoji: '🧈' },
		{ text: 'Translating food labels...', emoji: '🌍' },
		{ text: 'Folding the chocolate wrapper...', emoji: '🍫' },
		{ text: 'Herding free-range data...', emoji: '🐔' },
		{ text: 'Waiting for the dough to rise...', emoji: '⏳' }
	];

	let { reason }: { reason?: string } = $props();

	let messageIndex = $state(0);

	let intervalId: ReturnType<typeof setInterval>;

	onMount(() => {
		intervalId = setInterval(() => {
			messageIndex = (messageIndex + 1) % funnyMessages.length;
		}, 2400);
	});

	onDestroy(() => {
		clearInterval(intervalId);
	});

	const currentMessage = $derived(funnyMessages[messageIndex]);
</script>

<div class="loading-container flex min-h-[60vh] flex-col items-center justify-center gap-10 px-4">
	<!-- Bouncing food icons row -->
	<div class="flex items-end gap-4 mb-4">
		{#each foodIcons as icon, i (icon)}
			<img
				src={icon}
				alt=""
				aria-hidden="true"
				class={['h-14 w-14 sm:h-18 sm:w-18 icon-bounce-img', i > 2 && 'hidden md:block']}
				style="animation-delay: {i * 0.15}s;"
			/>
		{/each}
	</div>

	<!-- Optional reason -->
	{#if reason}
		<p class="text-lg font-semibold text-base-content">{reason}</p>
	{/if}

	<!-- Rotating funny message -->
	<div class="text-center">
		<p class={['text-base-content transition-opacity duration-300', reason || 'text-xl']}>
			<span class="mr-2" aria-hidden="true">{currentMessage.emoji}</span>
			{$_('loading.message', { default: currentMessage.text })}
		</p>
	</div>

	<!-- DaisyUI indeterminate progress -->
	<progress class="progress progress-secondary mt-4 w-64"></progress>
</div>

<style>
	@keyframes bounce {
		0%,
		100% {
			transform: translateY(0);
		}
		50% {
			transform: translateY(-12px);
		}
	}

	.icon-bounce-img {
		animation: bounce 1.2s ease-in-out infinite;
	}
</style>
