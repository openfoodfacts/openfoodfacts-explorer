<script lang="ts">
	import { onMount } from 'svelte';

	let activeSection = $state('introduction');

	const sections = [
		{ id: 'introduction', label: 'Introduction' },
		{ id: 'why-add', label: 'Why Add Your Data?' },
		{ id: 'how-to-add', label: 'How to Add Data' },
		{ id: 'licence', label: 'Licence' },
		{ id: 'what-data', label: 'What Data?' },
		{ id: 'manual-addition', label: 'Manual Addition' },
		{ id: 'automated-addition', label: 'Automated Addition' },
		{ id: 'picture-format', label: 'Picture Format' },
		{ id: 'data-format', label: 'Data Format' },
		{ id: 'sending', label: 'Sending Photos & Data' },
		{ id: 'faq', label: 'FAQ' }
	];

	function scrollTo(id: string) {
		const el = document.getElementById(id);
		if (el) {
			el.scrollIntoView({ behavior: 'smooth', block: 'start' });
		}
		activeSection = id;
	}

	onMount(() => {
		const observer = new IntersectionObserver(
			(entries) => {
				for (const entry of entries) {
					if (entry.isIntersecting) {
						activeSection = entry.target.id;
					}
				}
			},
			{ rootMargin: '-20% 0px -70% 0px' }
		);

		sections.forEach(({ id }) => {
			const el = document.getElementById(id);
			if (el) observer.observe(el);
		});

		return () => observer.disconnect();
	});

	const requiredFields = [
		{
			field: 'code',
			desc: 'Product barcode as it appears on the packaging (EAN-13, EAN-8 or other)'
		},
		{
			field: 'lang',
			desc: '2-letter code of the main language of the product (e.g. fr for French)'
		},
		{ field: 'product_name_[lang]', desc: 'Product name in the main language' },
		{ field: 'generic_name_[lang]', desc: 'Generic product name' },
		{ field: 'brands', desc: 'Brands (comma-separated for multiple brands/sub-brands)' },
		{ field: 'quantity', desc: 'Quantity with unit (e.g. 120 g (4 x 30 g))' },
		{ field: 'categories', desc: 'Product category in the main language' },
		{ field: 'countries', desc: 'Countries where sold, in main language (comma-separated)' },
		{
			field: 'ingredients_text_[lang]',
			desc: 'List of ingredients; allergens in CAPITALS or highlighted'
		},
		{ field: 'allergens', desc: 'Allergens in the main language, comma-separated' },
		{ field: 'traces', desc: 'Traces of allergens, comma-separated' }
	];

	const nutritionFields = [
		{ field: 'energy_100g', desc: 'Energy in kJ' },
		{ field: 'fat_100g', desc: 'Fat (g)' },
		{ field: 'saturated-fat_100g', desc: 'Saturated fat (g)' },
		{ field: 'carbohydrates_100g', desc: 'Carbohydrates (g)' },
		{ field: 'sugars_100g', desc: 'Sugars (g)' },
		{ field: 'proteins_100g', desc: 'Proteins (g)' },
		{ field: 'salt_100g', desc: 'Salt (g)' },
		{ field: 'fiber_100g', desc: 'Fibers (g) — recommended for Nutri-Score' },
		{
			field: 'fruits-vegetables-nuts_100g',
			desc: '% of fruits, vegetables and nuts — recommended for Nutri-Score'
		}
	];

	const optionalFields = [
		{ field: 'labels', desc: 'Labels on the packaging (e.g. AB Bio, MSC, Max Havelaar)' },
		{ field: 'origins', desc: 'Origins of ingredients (e.g. Peru, Périgord)' },
		{ field: 'packaging', desc: 'Materials and forms of packaging (e.g. can, aluminum)' },
		{ field: 'manufacturing_places', desc: 'Manufacturing locations (cities, countries)' },
		{ field: 'emb_codes', desc: 'Packager codes and European sanitary stamps' },
		{ field: 'stores', desc: 'Places of sale (supermarket chain names)' },
		{ field: 'nutri_score', desc: 'Nutri-Score rating A–E (only if indicated on package)' },
		{ field: 'serving_size', desc: 'Quantity of a serving with unit' }
	];

	const faqs = [
		{
			q: 'Is the listing of products free?',
			a: 'The import of data is completely free. Open Food Facts does not accept any retribution for the inclusion of data. They are very pleased when producers contribute data to food transparency.'
		},
		{
			q: 'Will producer data overwrite data entered by contributors?',
			a: 'Producer data is automatically controlled with consistency-checking algorithms, then reviewed by contributors. Once verified, it will replace and/or supplement contributor-entered data. For regular automated imports, the data will replace contributor updates at each import — unless a manifest error is reported.'
		},
		{
			q: 'Is it possible to delete products that are no longer sold?',
			a: 'Products that disappear from shelves are archived (not deleted) so they remain available for scientific purposes such as food cohorts. Historical data is also welcome. Producers can send lists of barcodes removed from sale so products can be labelled appropriately.'
		},
		{
			q: 'Can animal products, cosmetics and other non-food products be integrated?',
			a: 'Specific sister projects exist for these: Open Beauty Facts (cosmetics), Open Pet Food Facts (animal feed), and Open Products Facts (other products). Open Food Facts is happy to help import your products into the appropriate project.'
		}
	];
</script>

<svelte:head>
	<title>Guide for Producers — Open Food Facts</title>
	<meta
		name="description"
		content="Learn how to add your product photos and data directly to the Open Food Facts database as a producer."
	/>
</svelte:head>

<div class="bg-base-100 min-h-screen">
	<!-- Page hero -->
	<div class="bg-base-200 border-base-300 border-b">
		<div class="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
			<div class="mb-2 flex items-center gap-3">
				<span
					class="badge badge-primary badge-outline text-xs font-semibold tracking-wide uppercase"
					>Producers</span
				>
			</div>
			<h1 class="text-base-content text-3xl font-bold sm:text-4xl">Guide for Producers</h1>
			<p class="text-base-content/70 mt-3 max-w-2xl text-base leading-relaxed">
				This guide explains why and how producers can directly integrate photos and product data
				into the Open Food Facts database using our platform for producers.
			</p>
		</div>
	</div>

	<div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
		<div class="flex items-start gap-8">
			<!-- Sticky sidebar (desktop) -->
			<aside class="sticky top-6 hidden w-60 shrink-0 self-start lg:block">
				<div class="card bg-base-200 shadow-sm">
					<div class="card-body p-3">
						<p
							class="text-base-content/50 px-2 pb-1 text-xs font-semibold tracking-widest uppercase"
						>
							Contents
						</p>
						<ul class="menu menu-sm gap-0.5 p-0">
							{#each sections as { id, label }}
								<li>
									<button
										class:active={activeSection === id}
										class="rounded-lg text-left text-sm"
										onclick={() => scrollTo(id)}
									>
										{label}
									</button>
								</li>
							{/each}
						</ul>
					</div>
				</div>
			</aside>

			<!-- Mobile top nav -->
			<div class="-mt-2 mb-4 w-full lg:hidden">
				<details class="collapse-arrow bg-base-200 border-base-300 collapse rounded-xl border">
					<summary class="collapse-title text-sm font-semibold">Jump to section…</summary>
					<div class="collapse-content">
						<ul class="menu menu-sm">
							{#each sections as { id, label }}
								<li>
									<button onclick={() => scrollTo(id)} class="text-left">{label}</button>
								</li>
							{/each}
						</ul>
					</div>
				</details>
			</div>

			<!-- Main content -->
			<main class="min-w-0 flex-1 space-y-6">
				<!-- Introduction -->
				<div
					id="introduction"
					class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm"
				>
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
							<h2 class="card-title text-lg">Introduction</h2>
						</div>
						<p class="text-base-content/80 leading-relaxed">
							The photos and data on the food products referenced in the Open Food Facts database
							come from two sources:
						</p>
						<ul class="mt-3 space-y-2">
							<li class="flex gap-2">
								<span class="text-primary mt-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
									>
								</span>
								<span class="text-base-content/80 text-sm">
									<strong>Crowdsourcing</strong> through mobile apps and the Open Food Facts website —
									contributors scan barcodes, send product photos, ingredient lists, nutrition charts,
									and enter structured data.
								</span>
							</li>
							<li class="flex gap-2">
								<span class="text-primary mt-1">
									<svg
										xmlns="http://www.w3.org/2000/svg"
										class="h-4 w-4"
										fill="none"
										viewBox="0 0 24 24"
										stroke="currentColor"
										stroke-width="2"
										><path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7" /></svg
									>
								</span>
								<span class="text-base-content/80 text-sm">
									<strong>Direct producer submissions</strong> — data added manually or automatically
									by the manufacturers themselves.
								</span>
							</li>
						</ul>
					</div>
				</div>

				<!-- Why add -->
				<div id="why-add" class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm">
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
							<h2 class="card-title text-lg">Why Add Your Product Data?</h2>
						</div>
						<div class="mt-2 grid gap-3 sm:grid-cols-2">
							{#each [{ icon: '✅', title: 'Complete & accurate', desc: 'Your data is complete, up to date, and without risk of error.' }, { icon: '📸', title: 'Better quality photos', desc: 'Professional photos vs. contributor shots taken in variable conditions.' }, { icon: '📱', title: '100+ applications', desc: 'Your data becomes available in more than 100 downstream apps.' }, { icon: '📊', title: 'Product statistics', desc: 'Get statistics and export your products enriched with Nutri-Score and other indicators.' }] as benefit}
								<div class="bg-base-200 flex gap-3 rounded-xl p-4">
									<span class="shrink-0 text-2xl">{benefit.icon}</span>
									<div>
										<p class="text-base-content text-sm font-semibold">{benefit.title}</p>
										<p class="text-base-content/70 mt-0.5 text-xs leading-relaxed">
											{benefit.desc}
										</p>
									</div>
								</div>
							{/each}
						</div>
						<div class="bg-primary/5 border-primary/20 mt-4 rounded-xl border p-4">
							<p class="text-primary mb-1 text-sm font-semibold">Producers already on board</p>
							<p class="text-base-content/70 text-sm">
								A growing number of high-profile French producers already send us their data:
								<span class="text-base-content font-medium"
									>Fleury Michon, Sodebo, System U, Carrefour, Casino, Franprix, Monoprix.</span
								>
							</p>
						</div>
					</div>
				</div>

				<!-- How to add -->
				<div id="how-to-add" class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm">
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/></svg
							>
							<h2 class="card-title text-lg">How to Add Data</h2>
						</div>
						<p class="text-base-content/80 text-sm leading-relaxed">
							All your data can be integrated: ingredients, nutritional information, labels,
							packaging materials, traceability, preparation instructions, recycling info, carbon
							footprint, and more. Open Food Facts regularly adds new fields based on package
							information or manufacturer input.
						</p>
						<div class="bg-base-200 mt-3 rounded-xl p-4">
							<p class="mb-1 text-sm font-semibold">Multilingual support</p>
							<p class="text-base-content/70 text-sm">
								The database, site, and apps are fully multilingual. If you have photos and data in
								multiple languages, they can all be integrated.
							</p>
						</div>
					</div>
				</div>

				<!-- Licence -->
				<div id="licence" class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm">
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
								/></svg
							>
							<h2 class="card-title text-lg">Licence</h2>
						</div>
						<div class="mt-2 flex flex-col gap-3 sm:flex-row">
							<div class="bg-base-200 flex-1 rounded-xl p-4">
								<p class="text-base-content/50 mb-1 text-xs font-bold tracking-wide uppercase">
									Data
								</p>
								<p class="text-sm font-semibold">Open Database License (ODbL)</p>
								<p class="text-base-content/60 mt-1 text-xs">
									Freely reusable by all and for all purposes.
								</p>
							</div>
							<div class="bg-base-200 flex-1 rounded-xl p-4">
								<p class="text-base-content/50 mb-1 text-xs font-bold tracking-wide uppercase">
									Photos
								</p>
								<p class="text-sm font-semibold">Creative Commons CC-BY-SA</p>
								<p class="text-base-content/60 mt-1 text-xs">Attribution required; share-alike.</p>
							</div>
						</div>
						<p class="text-base-content/50 mt-3 text-xs">
							For more information, see the Terms of Use, Contribution, and Reuse on the Open Food
							Facts website.
						</p>
					</div>
				</div>

				<!-- What data -->
				<div id="what-data" class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm">
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8 4"
								/></svg
							>
							<h2 class="card-title text-lg">What Data to Send?</h2>
						</div>
						<p class="text-base-content/80 text-sm leading-relaxed">
							One of the fundamental principles of Open Food Facts is that users must be able to
							verify information from a photo. You are therefore required to send photos of the
							product and packaging alongside structured data.
						</p>
						<div class="alert alert-info alert-soft mt-3 text-sm">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="h-4 w-4"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
							<span
								>Recently added fields include carbon footprint and packaging data, already
								highlighted in apps to support recycling behaviour changes.</span
							>
						</div>
					</div>
				</div>

				<!-- Manual addition -->
				<div
					id="manual-addition"
					class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm"
				>
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
								/></svg
							>
							<h2 class="card-title text-lg">Manual Addition</h2>
						</div>
						<p class="text-base-content/80 text-sm leading-relaxed">
							If you have a small number of products whose formulation doesn't change often, you can
							create an account on Open Food Facts and add photos and data yourself.
						</p>
						<div class="mt-3 space-y-2">
							<div
								class="bg-success/10 border-success/20 flex items-start gap-3 rounded-xl border p-3"
							>
								<span class="badge badge-success badge-sm mt-0.5 shrink-0">Recommended</span>
								<p class="text-base-content/80 text-sm">
									Add photos and enter information directly via the Open Food Facts website.
								</p>
							</div>
							<div class="bg-base-200 flex items-start gap-3 rounded-xl p-3">
								<span class="badge badge-neutral badge-sm mt-0.5 shrink-0">Alternative</span>
								<p class="text-base-content/80 text-sm">
									Use the Android mobile app to scan, photograph, and enter a product completely.
								</p>
							</div>
						</div>
						<p class="text-base-content/50 mt-3 text-xs">
							Please notify Open Food Facts when you add products yourself so your account can be
							flagged as a producer account, and the information is attributed to your company.
						</p>
					</div>
				</div>

				<!-- Automated addition -->
				<div
					id="automated-addition"
					class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm"
				>
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
								/></svg
							>
							<h2 class="card-title text-lg">Automated Addition</h2>
						</div>
						<p class="text-base-content/80 text-sm leading-relaxed">
							For larger or frequently-updated product ranges, Open Food Facts has defined a
							standard format for images and data to make importing easier and faster.
						</p>
					</div>
				</div>

				<!-- Picture format -->
				<div
					id="picture-format"
					class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm"
				>
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
								/></svg
							>
							<h2 class="card-title text-lg">Picture Format</h2>
						</div>

						<div class="mt-2">
							<p class="text-base-content mb-2 text-sm font-semibold">
								Required images (minimum 3)
							</p>
							<div class="grid gap-2 sm:grid-cols-3">
								{#each [{ label: 'Front view', note: 'On white background; avoid 3/4 views' }, { label: 'Ingredients list', note: 'Full text visible' }, { label: 'Nutritional table', note: 'Per 100g / 100ml' }] as img}
									<div class="bg-base-200 rounded-xl p-3 text-center">
										<p class="text-sm font-semibold">{img.label}</p>
										<p class="text-base-content/60 mt-1 text-xs">{img.note}</p>
									</div>
								{/each}
							</div>
							<p class="text-base-content/60 mt-2 text-xs">
								Front, ingredients and nutrition must be provided in at least the main product
								language. Additional images (verso, flat packaging view, other angles) are optional
								but encouraged.
							</p>
						</div>

						<div class="divider my-3"></div>

						<div class="grid gap-4 sm:grid-cols-2">
							<div>
								<p class="mb-1 text-sm font-semibold">File format</p>
								<ul class="text-base-content/70 space-y-1 text-sm">
									<li>• JPEG or PNG</li>
									<li>• At least <strong>2000 px</strong> wide or tall</li>
								</ul>
							</div>
							<div>
								<p class="mb-1 text-sm font-semibold">File naming</p>
								<code class="bg-base-300 block rounded px-2 py-1 font-mono text-xs break-all">
									[barcode]_[type]_[lang].[jpg|png]
								</code>
								<p class="text-base-content/50 mt-1 text-xs">
									e.g. <code class="font-mono">3660140808750_front_en.jpg</code>
								</p>
								<p class="text-base-content/50 mt-2 text-xs">
									Types: <code class="font-mono">front</code>,
									<code class="font-mono">ingredients</code>,
									<code class="font-mono">nutrition</code>, <code class="font-mono">back</code>, or
									any custom name (a–z, no spaces).
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- Data format -->
				<div id="data-format" class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm">
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M3 10h18M3 14h18M10 4v16M4 4h16a1 1 0 011 1v14a1 1 0 01-1 1H4a1 1 0 01-1-1V5a1 1 0 011-1z"
								/></svg
							>
							<h2 class="card-title text-lg">Data Format</h2>
						</div>
						<p class="text-base-content/70 text-sm leading-relaxed">
							Data must be provided as an <strong>XLS or CSV file</strong> (tab-separated) with
							<strong>UTF-8</strong> encoding. The first row contains field names; each subsequent row
							is a product. Field order doesn't matter; not all columns need to be present.
						</p>

						<!-- Required fields -->
						<div class="mt-4">
							<div class="mb-2 flex items-center gap-2">
								<span class="badge badge-error badge-sm">Required</span>
								<p class="text-sm font-semibold">Product fields</p>
							</div>
							<div class="border-base-300 overflow-x-auto rounded-xl border">
								<table class="table-sm table">
									<thead>
										<tr class="bg-base-200">
											<th class="text-xs font-bold">Field</th>
											<th class="text-xs font-bold">Description</th>
										</tr>
									</thead>
									<tbody>
										{#each requiredFields as { field, desc }}
											<tr>
												<td><code class="text-primary font-mono text-xs">{field}</code></td>
												<td class="text-base-content/70 text-xs">{desc}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
						</div>

						<!-- Nutrition fields -->
						<div class="mt-4">
							<div class="mb-2 flex items-center gap-2">
								<span class="badge badge-error badge-sm">Required</span>
								<p class="text-sm font-semibold">Nutritional values (per 100g / 100ml, no units)</p>
							</div>
							<div class="border-base-300 overflow-x-auto rounded-xl border">
								<table class="table-sm table">
									<thead>
										<tr class="bg-base-200">
											<th class="text-xs font-bold">Field</th>
											<th class="text-xs font-bold">Description</th>
										</tr>
									</thead>
									<tbody>
										{#each nutritionFields as { field, desc }}
											<tr>
												<td><code class="text-primary font-mono text-xs">{field}</code></td>
												<td class="text-base-content/70 text-xs">{desc}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
							<p class="text-base-content/50 mt-2 text-xs">
								For prepared product values (with water, milk, etc.), add <code class="font-mono"
									>_prepared</code
								>
								to the field name (e.g. <code class="font-mono">energy_prepared_100g</code>).
							</p>
						</div>

						<!-- Optional fields -->
						<div class="mt-4">
							<div class="mb-2 flex items-center gap-2">
								<span class="badge badge-ghost badge-sm">Optional</span>
								<p class="text-sm font-semibold">Additional fields</p>
							</div>
							<div class="border-base-300 overflow-x-auto rounded-xl border">
								<table class="table-sm table">
									<thead>
										<tr class="bg-base-200">
											<th class="text-xs font-bold">Field</th>
											<th class="text-xs font-bold">Description</th>
										</tr>
									</thead>
									<tbody>
										{#each optionalFields as { field, desc }}
											<tr>
												<td><code class="text-primary font-mono text-xs">{field}</code></td>
												<td class="text-base-content/70 text-xs">{desc}</td>
											</tr>
										{/each}
									</tbody>
								</table>
							</div>
							<p class="text-base-content/50 mt-2 text-xs">
								Many additional nutrient fields are available (vitamins, minerals, fatty acids,
								etc.). Contact Open Food Facts if you have data not covered by existing fields —
								they can add new ones.
							</p>
						</div>
					</div>
				</div>

				<!-- Sending -->
				<div id="sending" class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm">
					<div class="card-body">
						<div class="mb-1 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
								/></svg
							>
							<h2 class="card-title text-lg">Sending Photos & Data</h2>
						</div>
						<div class="mt-2 grid gap-3 sm:grid-cols-2">
							<div class="bg-base-200 rounded-xl p-4">
								<p class="mb-1 text-sm font-semibold">Small batches (&lt; 1,000 products)</p>
								<p class="text-base-content/70 text-xs leading-relaxed">
									Send the CSV by email and photos via WeTransfer, Google Drive, or Dropbox — or any
									convenient method.
								</p>
							</div>
							<div class="bg-base-200 rounded-xl p-4">
								<p class="mb-1 text-sm font-semibold">Large or frequent updates</p>
								<p class="text-base-content/70 text-xs leading-relaxed">
									Open Food Facts can provision a dedicated SFTP space for manual or automated
									delivery. Contact them to set this up.
								</p>
							</div>
						</div>
					</div>
				</div>

				<!-- FAQ -->
				<div id="faq" class="card bg-base-100 border-base-300 scroll-mt-6 border shadow-sm">
					<div class="card-body">
						<div class="mb-2 flex items-center gap-2">
							<svg
								xmlns="http://www.w3.org/2000/svg"
								class="text-primary h-5 w-5"
								fill="none"
								viewBox="0 0 24 24"
								stroke="currentColor"
								stroke-width="2"
								><path
									stroke-linecap="round"
									stroke-linejoin="round"
									d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
								/></svg
							>
							<h2 class="card-title text-lg">Frequently Asked Questions</h2>
						</div>
						<div class="mt-1 space-y-3">
							{#each faqs as { q, a }}
								<div class="collapse-arrow bg-base-200 collapse rounded-xl">
									<input type="checkbox" />
									<div class="collapse-title pe-10 text-sm font-semibold">{q}</div>
									<div class="collapse-content">
										<p class="text-base-content/70 text-sm leading-relaxed">{a}</p>
									</div>
								</div>
							{/each}
						</div>
					</div>
				</div>
			</main>
		</div>
	</div>
</div>
