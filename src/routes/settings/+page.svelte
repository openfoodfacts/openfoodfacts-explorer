<script lang="ts">
	import { preferences } from '$lib/settings';
	import { _ } from '$lib/i18n';
	import { locale } from '$lib/i18n';
	import PreferencesForm from '$lib/ui/preferences/PreferencesForm.svelte';
	import type { AttributeGroup } from '$lib/stores/preferencesStore';
	import { userInfo, getPermissionsCtx } from '$lib/stores/user';
	import { getToastCtx } from '$lib/stores/toasts';
	import { untrack, tick } from 'svelte';

	import IconMdiShieldAccount from '@iconify-svelte/mdi/shield-account';
	import IconMdiAccount from '@iconify-svelte/mdi/account';
	import IconMaterialTranslate from '@iconify-svelte/material-symbols/translate';
	import IconMaterialPublic from '@iconify-svelte/material-symbols/public';
	import IconMaterialUniversalCurrencyAlt from '@iconify-svelte/material-symbols/universal-currency-alt';
	import IconMdiGithub from '@iconify-svelte/mdi/github';
	import IconMdiTools from '@iconify-svelte/mdi/tools';

	import type { PageProps } from './$types';

	const GITHUB_REPO_URL = 'https://github.com/openfoodfacts/openfoodfacts-explorer';

	let { data }: PageProps = $props();
	let { attributeGroups } = $derived(data);

	const permissions = getPermissionsCtx();
	const toast = getToastCtx();

	let openDropdown = $state<'lang' | 'country' | 'currency' | null>(null);

	let langFilter = $state('');
	let countryFilter = $state('');
	let currencyFilter = $state('');

	function getCurrencyLabel(code: string) {
		try {
			const fullName = new Intl.DisplayNames(['en'], { type: 'currency' }).of(code);
			return `${code} — ${fullName}`;
		} catch (e) {
			return code;
		}
	}

	let selectedLang = $derived(
		Object.values(data.languages).find((l) => l.language_code_2.en === $preferences.lang)
	);
	let selectedCountry = $derived(
		$preferences.country === 'world'
			? { name: { en: $_('world_option') } }
			: Object.values(data.countries).find((c) => c.country_code_2.en === $preferences.country)
	);
	let selectedCurrencyLabel = $derived(getCurrencyLabel($preferences.currency));

	async function toggleDropdown(name: 'lang' | 'country' | 'currency') {
		if (openDropdown === name) {
			openDropdown = null;
		} else {
			openDropdown = name;
			await tick();
			const input = document.getElementById(`${name}-search-input`);
			input?.focus();
		}
	}

	function handleDropdownKeydown(e: KeyboardEvent, name: 'lang' | 'country' | 'currency') {
		if (e.key === 'Escape') {
			e.preventDefault();
			openDropdown = null;
			const trigger = document.getElementById(`${name}-trigger-btn`);
			trigger?.focus();
		}
	}

	let lastCountry = $preferences.country;
	const countryToCurrency: Record<string, string> = {
		AD: 'EUR',
		AE: 'AED',
		AF: 'AFN',
		AG: 'XCD',
		AI: 'XCD',
		AL: 'ALL',
		AM: 'AMD',
		AN: 'ANG',
		AO: 'AOA',
		AQ: 'USD',
		AR: 'ARS',
		AS: 'USD',
		AT: 'EUR',
		AU: 'AUD',
		AW: 'AWG',
		AX: 'EUR',
		AZ: 'AZN',
		BA: 'BAM',
		BB: 'BBD',
		BD: 'BDT',
		BE: 'EUR',
		BF: 'XOF',
		BG: 'EUR',
		BH: 'BHD',
		BI: 'BIF',
		BJ: 'XOF',
		BL: 'EUR',
		BM: 'BMD',
		BN: 'BND',
		BO: 'BOB',
		BQ: 'USD',
		BR: 'BRL',
		BS: 'BSD',
		BT: 'BTN',
		BV: 'NOK',
		BW: 'BWP',
		BY: 'BYN',
		BZ: 'BZD',
		CA: 'CAD',
		CC: 'AUD',
		CD: 'CDF',
		CF: 'XAF',
		CG: 'XAF',
		CH: 'CHF',
		CI: 'XOF',
		CK: 'NZD',
		CL: 'CLP',
		CM: 'XAF',
		CN: 'CNY',
		CO: 'COP',
		CR: 'CRC',
		CU: 'CUP',
		CV: 'CVE',
		CW: 'ANG',
		CX: 'AUD',
		CY: 'EUR',
		CZ: 'CZK',
		DE: 'EUR',
		DJ: 'DJF',
		DK: 'DKK',
		DM: 'XCD',
		DO: 'DOP',
		DZ: 'DZD',
		EC: 'USD',
		EE: 'EUR',
		EG: 'EGP',
		EH: 'MAD',
		ER: 'ERN',
		ES: 'EUR',
		ET: 'ETB',
		FI: 'EUR',
		FJ: 'FJD',
		FK: 'FKP',
		FM: 'USD',
		FO: 'DKK',
		FR: 'EUR',
		GA: 'XAF',
		GB: 'GBP',
		GD: 'XCD',
		GE: 'GEL',
		GF: 'EUR',
		GG: 'GBP',
		GH: 'GHS',
		GI: 'GIP',
		GL: 'DKK',
		GM: 'GMD',
		GN: 'GNF',
		GP: 'EUR',
		GQ: 'XAF',
		GR: 'EUR',
		GS: 'FKP',
		GT: 'GTQ',
		GU: 'USD',
		GW: 'XOF',
		GY: 'GYD',
		HK: 'HKD',
		HM: 'AUD',
		HN: 'HNL',
		HR: 'EUR',
		HT: 'HTG',
		HU: 'HUF',
		ID: 'IDR',
		IE: 'EUR',
		IL: 'ILS',
		IM: 'GBP',
		IN: 'INR',
		IO: 'USD',
		IQ: 'IQD',
		IR: 'IRR',
		IS: 'ISK',
		IT: 'EUR',
		JE: 'GBP',
		JM: 'JMD',
		JO: 'JOD',
		JP: 'JPY',
		KE: 'KES',
		KG: 'KGS',
		KH: 'KHR',
		KI: 'AUD',
		KM: 'KMF',
		KN: 'XCD',
		KP: 'KPW',
		KR: 'KRW',
		KW: 'KWD',
		KY: 'KYD',
		KZ: 'KZT',
		LA: 'LAK',
		LB: 'LBP',
		LC: 'XCD',
		LI: 'CHF',
		LK: 'LKR',
		LR: 'LRD',
		LS: 'LSL',
		LT: 'EUR',
		LU: 'EUR',
		LV: 'EUR',
		LY: 'LYD',
		MA: 'MAD',
		MC: 'EUR',
		MD: 'MDL',
		ME: 'EUR',
		MF: 'EUR',
		MG: 'MGA',
		MH: 'USD',
		MK: 'MKD',
		ML: 'XOF',
		MM: 'MMK',
		MN: 'MNT',
		MO: 'MOP',
		MP: 'USD',
		MQ: 'EUR',
		MR: 'MRU',
		MS: 'XCD',
		MT: 'EUR',
		MU: 'MUR',
		MV: 'MVR',
		MW: 'MWK',
		MX: 'MXN',
		MY: 'MYR',
		MZ: 'MZN',
		NA: 'NAD',
		NC: 'XPF',
		NE: 'XOF',
		NF: 'AUD',
		NG: 'NGN',
		NI: 'NIO',
		NL: 'EUR',
		NO: 'NOK',
		NP: 'NPR',
		NR: 'AUD',
		NU: 'NZD',
		NZ: 'NZD',
		OM: 'OMR',
		PA: 'PAB',
		PE: 'PEN',
		PF: 'XPF',
		PG: 'PGK',
		PH: 'PHP',
		PK: 'PKR',
		PL: 'PLN',
		PM: 'EUR',
		PN: 'NZD',
		PR: 'USD',
		PS: 'ILS',
		PT: 'EUR',
		PW: 'USD',
		PY: 'PYG',
		QA: 'QAR',
		RE: 'EUR',
		RO: 'RON',
		RS: 'RSD',
		RU: 'RUB',
		RW: 'RWF',
		SA: 'SAR',
		SB: 'SBD',
		SC: 'SCR',
		SD: 'SDG',
		SE: 'SEK',
		SG: 'SGD',
		SH: 'SHP',
		SI: 'EUR',
		SJ: 'NOK',
		SK: 'EUR',
		SL: 'SLE',
		SM: 'EUR',
		SN: 'XOF',
		SO: 'SOS',
		SR: 'SRD',
		SS: 'SSP',
		ST: 'STN',
		SV: 'USD',
		SX: 'ANG',
		SY: 'SYP',
		SZ: 'SZL',
		TC: 'USD',
		TD: 'XAF',
		TF: 'EUR',
		TG: 'XOF',
		TH: 'THB',
		TJ: 'TJS',
		TK: 'NZD',
		TL: 'USD',
		TM: 'TMT',
		TN: 'TND',
		TO: 'TOP',
		TR: 'TRY',
		TT: 'TTD',
		TV: 'AUD',
		TW: 'TWD',
		TZ: 'TZS',
		UA: 'UAH',
		UG: 'UGX',
		UM: 'USD',
		US: 'USD',
		UY: 'UYU',
		UZ: 'UZS',
		VA: 'EUR',
		VC: 'XCD',
		VE: 'VED',
		VG: 'USD',
		VI: 'USD',
		VN: 'VND',
		VU: 'VUV',
		WF: 'XPF',
		WS: 'WST',
		XK: 'EUR',
		YE: 'YER',
		YT: 'EUR',
		ZA: 'ZAR',
		ZM: 'ZMW',
		ZW: 'ZWG'
	};

	$effect(() => {
		const country = $preferences.country;
		if (country !== lastCountry) {
			lastCountry = country;
			untrack(() => {
				if (country && countryToCurrency[country]) {
					const targetCurrency = countryToCurrency[country];
					if ($preferences.currency !== targetCurrency) {
						$preferences.currency = targetCurrency;
						toast.success(`Currency auto-updated to ${targetCurrency} based on selected country.`);
					}
				}
			});
		}
	});
</script>

<svelte:window onclick={() => (openDropdown = null)} />

<div class="mx-auto my-8">
	<p class="mb-4 font-semibold">{$_('settings.section_user')}</p>
	{#if $userInfo}
		<p class="mb-4 text-center text-xl font-medium">
			{$_('settings.logged_in_as', { values: { username: $userInfo.preferred_username } })}
		</p>
		<div class="flex justify-center gap-2">
			<span class="badge badge-accent badge-xl">
				<IconMdiAccount class="h-4 w-4" />
				<span class="">{$_('auth.role.user')}</span>
			</span>
			{#if permissions.isAdmin}
				<span class="badge badge-primary badge-xl">
					<IconMdiShieldAccount class="h-4 w-4" />
					<span class="">{$_('auth.role.admin')}</span>
				</span>
			{/if}
			{#if permissions.isModerator}
				<span class="badge badge-secondary badge-xl">
					<IconMdiShieldAccount class="h-4 w-4" />
					<span class="">{$_('auth.role.moderator')}</span>
				</span>
			{/if}
		</div>
	{:else}
		<p class="mb-2 text-center text-sm font-medium">{$_('settings.not_logged_in')}</p>
	{/if}

	<div class="divider my-4"></div>

	<p class="mb-4 font-semibold">{$_('settings.news')}</p>
	<news-feed
		url="https://raw.githubusercontent.com/openfoodfacts/smooth-app_assets/refs/heads/main/prod/tagline/web/main.json"
	></news-feed>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.section_general')}</p>

	<div class="mx-auto grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
		<label
			for="lang-trigger-btn"
			class="flex items-center gap-2 justify-self-start md:justify-self-end"
		>
			<IconMaterialTranslate class="h-5 w-5" />
			{$_('general.language')}:
		</label>
		<div
			class="dropdown w-full md:w-auto"
			class:dropdown-open={openDropdown === 'lang'}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => handleDropdownKeydown(e, 'lang')}
			role="none"
		>
			<button
				id="lang-trigger-btn"
				type="button"
				class="btn select select-bordered w-full min-w-[200px] flex-nowrap justify-between md:w-auto"
				onclick={() => toggleDropdown('lang')}
			>
				<span
					>{selectedLang
						? `${selectedLang.name['en']} (${selectedLang.name[selectedLang.language_code_2.en]})`
						: 'Select Language'}</span
				>
			</button>
			<div
				class="dropdown-content menu bg-base-100 rounded-box border-base-300 z-50 mt-1 w-64 border p-2 shadow-lg"
			>
				<input
					id="lang-search-input"
					type="text"
					class="input input-bordered input-sm mb-2 w-full"
					placeholder="Filter languages..."
					bind:value={langFilter}
				/>
				<ul class="flex max-h-60 w-full flex-col gap-1 overflow-y-auto">
					{#each Object.keys(data.languages).toSorted((a, b) => {
						const langA = data.languages[a];
						const langB = data.languages[b];
						let matchA = false;
						let matchB = false;
						try {
							matchA = new Intl.Locale(langA.language_code_2.en).maximize().region === $preferences.country;
						} catch (e) {}
						try {
							matchB = new Intl.Locale(langB.language_code_2.en).maximize().region === $preferences.country;
						} catch (e) {}
						if (matchA && !matchB) return -1;
						if (!matchA && matchB) return 1;
						return a.localeCompare(b);
					}) as langKey (langKey)}
						{@const lang = data.languages[langKey]}
						{@const isSelected = $preferences.lang === lang.language_code_2.en}
						{@const matchesFilter =
							!langFilter ||
							(lang.name['en'] || '').toLowerCase().includes(langFilter.toLowerCase()) ||
							(lang.name[lang.language_code_2.en] || '')
								.toLowerCase()
								.includes(langFilter.toLowerCase()) ||
							(lang.language_code_2.en || '').toLowerCase().includes(langFilter.toLowerCase())}
						{#if isSelected || matchesFilter}
							<li>
								<button
									type="button"
									class="w-full flex-nowrap justify-start text-left font-normal"
									class:active={isSelected}
									onclick={() => {
										$preferences.lang = lang.language_code_2.en;
										locale.set(lang.language_code_2.en);
										openDropdown = null;
									}}
								>
									{lang.name['en']} ({lang.name[lang.language_code_2.en]})
								</button>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		</div>

		<label for="country-trigger-btn" class="flex items-center gap-2">
			<IconMaterialPublic class="h-5 w-5" />
			{$_('general.country')}:
		</label>
		<div
			class="dropdown w-full md:w-auto"
			class:dropdown-open={openDropdown === 'country'}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => handleDropdownKeydown(e, 'country')}
			role="none"
		>
			<button
				id="country-trigger-btn"
				type="button"
				class="btn select select-bordered w-full min-w-[200px] flex-nowrap justify-between md:w-auto"
				onclick={() => toggleDropdown('country')}
			>
				<span>{selectedCountry ? selectedCountry.name['en'] : $preferences.country}</span>
			</button>
			<div
				class="dropdown-content menu bg-base-100 rounded-box border-base-300 z-50 mt-1 w-64 border p-2 shadow-lg"
			>
				<input
					id="country-search-input"
					type="text"
					class="input input-bordered input-sm mb-2 w-full"
					placeholder="Filter countries..."
					bind:value={countryFilter}
				/>
				<ul class="flex max-h-60 w-full flex-col gap-1 overflow-y-auto">
					{#if $preferences.country === 'world' || !countryFilter || $_('world_option')
							.toLowerCase()
							.includes(countryFilter.toLowerCase())}
						<li>
							<button
								type="button"
								class="w-full flex-nowrap justify-start text-left font-normal"
								class:active={$preferences.country === 'world'}
								onclick={() => {
									$preferences.country = 'world';
									openDropdown = null;
								}}
							>
								{$_('world_option')}
							</button>
						</li>
					{/if}

					{#each Object.keys(data.countries).toSorted() as countryKey (countryKey)}
						{@const country = data.countries[countryKey]}
						{@const code2 = country.country_code_2.en}
						{@const isSelected = $preferences.country === code2}
						{@const matchesFilter =
							!countryFilter ||
							(country.name['en'] || '').toLowerCase().includes(countryFilter.toLowerCase()) ||
							(code2 || '').toLowerCase().includes(countryFilter.toLowerCase())}
						{#if isSelected || matchesFilter}
							<li>
								<button
									type="button"
									class="w-full flex-nowrap justify-start text-left font-normal"
									class:active={isSelected}
									onclick={() => {
										$preferences.country = code2;
										openDropdown = null;
									}}
								>
									{country.name['en']}
								</button>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		</div>

		<label for="currency-trigger-btn" class="flex items-center gap-2">
			<IconMaterialUniversalCurrencyAlt class="h-5 w-5" />
			{$_('general.currency')}:
		</label>
		<div
			class="dropdown w-full md:w-auto"
			class:dropdown-open={openDropdown === 'currency'}
			onclick={(e) => e.stopPropagation()}
			onkeydown={(e) => handleDropdownKeydown(e, 'currency')}
			role="none"
		>
			<button
				id="currency-trigger-btn"
				type="button"
				class="btn select select-bordered w-full min-w-[200px] flex-nowrap justify-between md:w-auto"
				onclick={() => toggleDropdown('currency')}
			>
				<span>{selectedCurrencyLabel}</span>
			</button>
			<div
				class="dropdown-content menu bg-base-100 rounded-box border-base-300 z-50 mt-1 w-64 border p-2 shadow-lg"
			>
				<input
					id="currency-search-input"
					type="text"
					class="input input-bordered input-sm mb-2 w-full"
					placeholder="Filter currencies..."
					bind:value={currencyFilter}
				/>
				<ul class="flex max-h-60 w-full flex-col gap-1 overflow-y-auto">
					{#each data.currencies as currency (currency)}
						{@const isSelected = $preferences.currency === currency}
						{@const fullName =
							new Intl.DisplayNames(['en'], { type: 'currency' }).of(currency) || ''}
						{@const matchesFilter =
							!currencyFilter ||
							currency.toLowerCase().includes(currencyFilter.toLowerCase()) ||
							fullName.toLowerCase().includes(currencyFilter.toLowerCase())}
						{#if isSelected || matchesFilter}
							<li>
								<button
									type="button"
									class="w-full flex-nowrap justify-start text-left font-normal"
									class:active={isSelected}
									onclick={() => {
										$preferences.currency = currency;
										openDropdown = null;
									}}
								>
									{currency} — {new Intl.DisplayNames(['en'], { type: 'currency' }).of(currency)}
								</button>
							</li>
						{/if}
					{/each}
				</ul>
			</div>
		</div>
	</div>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.section_editing')}</p>

	<div class="mx-auto grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
		<label for="expanded-sections">
			{$_('settings.expand_all_sections')}:
		</label>
		<input
			id="expanded-sections"
			type="checkbox"
			class="toggle toggle-primary"
			bind:checked={$preferences.editing.expandAllSections}
		/>

		<label for="display-prices">
			{$_('settings.display_prices_in_search')}:
		</label>
		<input
			id="display-prices"
			type="checkbox"
			class="toggle toggle-primary"
			bind:checked={$preferences.displayPricesInSearch}
		/>
	</div>

	<p class="mt-8 mb-4 font-semibold">{$_('settings.influences')}</p>

	<!-- FIXME: Remove cast when id gets changes to a required property in SDK -->

	<PreferencesForm groups={attributeGroups as AttributeGroup[]} />
</div>

<div class="divider my-8"></div>

<div class="mt-8 flex justify-center">
	<a
		class="btn btn-outline"
		href={GITHUB_REPO_URL}
		target="_blank"
		rel="noopener noreferrer"
		aria-label={$_('settings.github_link')}
	>
		<IconMdiGithub class="h-5 w-5" />
		<span class="ml-2">{$_('settings.github_cta')}</span>
	</a>
</div>

<div class="divider my-8"></div>

<h2 class="my-4 text-center text-2xl font-bold">{$_('settings.dev_settings_title')}</h2>

<div class="mx-auto mb-8 grid w-max grid-cols-1 gap-4 md:grid-cols-[auto_1fr]">
	<label
		for="dev-mode-toggle"
		class="flex items-center gap-2 justify-self-start md:justify-self-end"
	>
		<IconMdiTools class="h-5 w-5" />
		{$_('settings.moderator_mode')}:
	</label>
	<input
		id="dev-mode-toggle"
		type="checkbox"
		class="toggle toggle-accent"
		bind:checked={$preferences.moderator}
	/>
</div>
