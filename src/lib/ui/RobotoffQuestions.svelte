<script lang="ts">
	import Card from './Card.svelte';
	import { preventDefault } from 'svelte/legacy';
	import OpenFoodFacts from '@openfoodfacts/openfoodfacts-nodejs';
	import type { RobotoffQuestion } from '$lib/api/robotoff';

	interface Props {
		questions: Promise<RobotoffQuestion[]>;
	}

	let { questions }: Props = $props();

	let answers: { insight_id: string; value: number }[] = $state([]);
	let requestState = $state<'loading' | 'answered' | 'error' | 'idle'>('error');

	async function reset() {
		answers = (await questions).map((question) => ({
			insight_id: question.insight_id,
			value: -1
		}));
		requestState = 'idle';
	}

	reset(); // initial call to set answers when questions is resolved.

	async function submitAnswers() {
		try {
			requestState = 'loading';
			const off = new OpenFoodFacts(fetch);
			const requests = answers.map((answer) => {
				const data = {
					insight_id: answer.insight_id,
					annotation: answer.value as 0 | 1 | -1
				};
				return off.robotoff.annotate(data);
			});
			await Promise.all(requests);
			requestState = 'answered';
		} catch (e) {
			requestState = 'error';
		}
	}
</script>

<Card>
	<h1 class="my-4 text-2xl font-bold sm:text-4xl">Questions</h1>
	{#await questions}
		<div class="skeleton dark:bg-base-300 h-28 bg-white p-4 shadow-md"></div>
	{:then resolvedQuestions}
		{console.log(answers)}
		{#if resolvedQuestions.length !== 0}
			{#if requestState == 'answered'}
				<p class="text-center">Thank you for your response</p>
			{:else if requestState == 'error'}
				<div class="text-error text-center">An error has occurred white submitting.</div>
				<button class="btn btn-primary mx-auto mt-2 block" onclick={reset}>Try again</button>
			{:else}
				<form onsubmit={preventDefault(submitAnswers)}>
					<div class="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-[1fr_max-content]">
						{#each resolvedQuestions as question, i}
							<div class="flex-grow">
								<div>{question.question}</div>
								{#if question.image_url}
									<img src={question.image_url} alt={question.question} class="h-20 w-20" />
								{/if}
								{#if question.value}
									<div class="font-semibold">{question.value}</div>
								{/if}
							</div>
							{#if answers[i] != undefined}
								<div class="join">
									{#each [-1, 0, 1] as value}
										<input
											type="radio"
											class="join-item btn border-base-300 flex-1"
											name={question.insight_id}
											bind:group={answers[i].value}
											{value}
											aria-label={value === 1 ? 'Yes' : value === 0 ? 'No' : 'Skip'}
											required
											disabled={requestState == 'loading'}
										/>
									{/each}
								</div>
							{/if}
						{/each}
					</div>
					<button class="btn btn-primary btn-block" disabled={requestState == 'loading'}>
						{#if requestState == 'loading'}
							<span class="loading loading-ring loading-lg mx-auto my-auto"></span>
						{:else}
							Submit
						{/if}
					</button>
				</form>
			{/if}
		{:else}
			<p class="text-center opacity-70">No questions found</p>
		{/if}
	{/await}
</Card>
