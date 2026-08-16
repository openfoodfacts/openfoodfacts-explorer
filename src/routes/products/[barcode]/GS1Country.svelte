<script lang="ts">
	import { _ } from '$lib/i18n';
	import Card from '$lib/ui/Card.svelte';

	interface Props {
		barcode: string;
	}

	let { barcode }: Props = $props();

	const gs1Allocations: Array<{ name: string; prefixes: number[]; code: string }> = [
		{ name: 'USA and Canada', prefixes: [0], code: 'US-CA' },
		{ name: 'USA', prefixes: [1], code: 'US' },
		{ name: 'France and Monaco', prefixes: [30, 31, 32, 33, 34, 35, 36, 37], code: 'FR-MC' },
		{ name: 'Bulgaria', prefixes: [380], code: 'BG' },
		{ name: 'Slovenia', prefixes: [383], code: 'SI' },
		{ name: 'Croatia', prefixes: [385], code: 'HR' },
		{ name: 'Bosnia and Herzegovina', prefixes: [387], code: 'BA' },
		{ name: 'Montenegro', prefixes: [389], code: 'ME' },
		{ name: 'Germany', prefixes: [40, 41, 42, 43, 44], code: 'DE' },
		{ name: 'Japan', prefixes: [45, 49], code: 'JP' },
		{ name: 'Russia', prefixes: [46], code: 'RU' },
		{ name: 'Kyrgyzstan', prefixes: [470], code: 'KG' },
		{ name: 'Taiwan', prefixes: [471], code: 'TW' },
		{ name: 'Estonia', prefixes: [474], code: 'EE' },
		{ name: 'Latvia', prefixes: [475], code: 'LV' },
		{ name: 'Azerbaijan', prefixes: [476], code: 'AZ' },
		{ name: 'Lithuania', prefixes: [477], code: 'LT' },
		{ name: 'Uzbekistan', prefixes: [478], code: 'UZ' },
		{ name: 'Sri Lanka', prefixes: [479], code: 'LK' },
		{ name: 'Philippines', prefixes: [480], code: 'PH' },
		{ name: 'Belarus', prefixes: [481], code: 'BY' },
		{ name: 'Ukraine', prefixes: [482], code: 'UA' },
		{ name: 'Turkmenistan', prefixes: [483], code: 'TM' },
		{ name: 'Moldova', prefixes: [484], code: 'MD' },
		{ name: 'Armenia', prefixes: [485], code: 'AM' },
		{ name: 'Georgia', prefixes: [486], code: 'GE' },
		{ name: 'Kazakhstan', prefixes: [487], code: 'KZ' },
		{ name: 'Tajikistan', prefixes: [488], code: 'TJ' },
		{ name: 'Hong Kong', prefixes: [489], code: 'HK' },
		{ name: 'United Kingdom', prefixes: [50], code: 'GB' },
		{ name: 'Greece', prefixes: [520, 521], code: 'GR' },
		{ name: 'Lebanon', prefixes: [528], code: 'LB' },
		{ name: 'Cyprus', prefixes: [529], code: 'CY' },
		{ name: 'Albania', prefixes: [530], code: 'AL' },
		{ name: 'North Macedonia', prefixes: [531], code: 'MK' },
		{ name: 'Malta', prefixes: [535], code: 'MT' },
		{ name: 'Ireland', prefixes: [539], code: 'IE' },
		{ name: 'Belgium and Luxembourg', prefixes: [54], code: 'BE-LU' },
		{ name: 'Portugal', prefixes: [560], code: 'PT' },
		{ name: 'Iceland', prefixes: [569], code: 'IS' },
		{ name: 'Denmark', prefixes: [57], code: 'DK' },
		{ name: 'Poland', prefixes: [590], code: 'PL' },
		{ name: 'Romania', prefixes: [594], code: 'RO' },
		{ name: 'Hungary', prefixes: [599], code: 'HU' },
		{ name: 'South Africa', prefixes: [600, 601], code: 'ZA' },
		{ name: 'Ghana', prefixes: [603], code: 'GH' },
		{ name: 'Senegal', prefixes: [604], code: 'SN' },
		{ name: 'Bahrain', prefixes: [608], code: 'BH' },
		{ name: 'Mauritius', prefixes: [609], code: 'MU' },
		{ name: 'Morocco', prefixes: [611], code: 'MA' },
		{ name: 'Algeria', prefixes: [613], code: 'DZ' },
		{ name: 'Nigeria', prefixes: [615], code: 'NG' },
		{ name: 'Kenya', prefixes: [616], code: 'KE' },
		{ name: "Côte d'Ivoire", prefixes: [618], code: 'CI' },
		{ name: 'Tunisia', prefixes: [619], code: 'TN' },
		{ name: 'Tanzania', prefixes: [620], code: 'TZ' },
		{ name: 'Syria', prefixes: [621], code: 'SY' },
		{ name: 'Egypt', prefixes: [622], code: 'EG' },
		{ name: 'Brunei', prefixes: [623], code: 'BN' },
		{ name: 'Libya', prefixes: [624], code: 'LY' },
		{ name: 'Jordan', prefixes: [625], code: 'JO' },
		{ name: 'Iran', prefixes: [626], code: 'IR' },
		{ name: 'Kuwait', prefixes: [627], code: 'KW' },
		{ name: 'Saudi Arabia', prefixes: [628], code: 'SA' },
		{ name: 'United Arab Emirates', prefixes: [629], code: 'AE' },
		{ name: 'Qatar', prefixes: [630], code: 'QA' },
		{ name: 'Finland', prefixes: [64], code: 'FI' },
		{ name: 'China', prefixes: [69], code: 'CN' },
		{ name: 'Norway', prefixes: [70], code: 'NO' },
		{ name: 'Israel', prefixes: [729], code: 'IL' },
		{ name: 'Sweden', prefixes: [73], code: 'SE' },
		{ name: 'Guatemala', prefixes: [740], code: 'GT' },
		{ name: 'El Salvador', prefixes: [741], code: 'SV' },
		{ name: 'Honduras', prefixes: [742], code: 'HN' },
		{ name: 'Nicaragua', prefixes: [743], code: 'NI' },
		{ name: 'Costa Rica', prefixes: [744], code: 'CR' },
		{ name: 'Panama', prefixes: [745], code: 'PA' },
		{ name: 'Dominican Republic', prefixes: [746], code: 'DO' },
		{ name: 'Mexico', prefixes: [750], code: 'MX' },
		{ name: 'Canada', prefixes: [754, 755], code: 'CA' },
		{ name: 'Venezuela', prefixes: [759], code: 'VE' },
		{ name: 'Switzerland and Liechtenstein', prefixes: [76], code: 'CH-LI' },
		{ name: 'Colombia', prefixes: [770, 771], code: 'CO' },
		{ name: 'Uruguay', prefixes: [773], code: 'UY' },
		{ name: 'Peru', prefixes: [775], code: 'PE' },
		{ name: 'Bolivia', prefixes: [777], code: 'BO' },
		{ name: 'Argentina', prefixes: [778, 779], code: 'AR' },
		{ name: 'Chile', prefixes: [780], code: 'CL' },
		{ name: 'Paraguay', prefixes: [784], code: 'PY' },
		{ name: 'Ecuador', prefixes: [786], code: 'EC' },
		{ name: 'Brazil', prefixes: [789, 790], code: 'BR' },
		{ name: 'Italy, San Marino, and Vatican City', prefixes: [80, 81, 82, 83], code: 'IT-SM-VA' },
		{ name: 'Spain, Andorra', prefixes: [84], code: 'ES-AD' },
		{ name: 'Cuba', prefixes: [850], code: 'CU' },
		{ name: 'Slovakia', prefixes: [858], code: 'SK' },
		{ name: 'Czech Republic', prefixes: [859], code: 'CZ' },
		{ name: 'Serbia', prefixes: [860], code: 'RS' },
		{ name: 'Mongolia', prefixes: [865], code: 'MN' },
		{ name: 'North Korea', prefixes: [867], code: 'KP' },
		{ name: 'Turkey', prefixes: [868, 869], code: 'TR' },
		{ name: 'Netherlands', prefixes: [87], code: 'NL' },
		{ name: 'South Korea', prefixes: [880], code: 'KR' },
		{ name: 'Myanmar', prefixes: [883], code: 'MM' },
		{ name: 'Cambodia', prefixes: [884], code: 'KH' },
		{ name: 'Thailand', prefixes: [885], code: 'TH' },
		{ name: 'Singapore', prefixes: [888], code: 'SG' },
		{ name: 'India', prefixes: [890], code: 'IN' },
		{ name: 'Vietnam', prefixes: [893], code: 'VN' },
		{ name: 'Bangladesh', prefixes: [894], code: 'BD' },
		{ name: 'Pakistan', prefixes: [896], code: 'PK' },
		{ name: 'Indonesia', prefixes: [899], code: 'ID' },
		{ name: 'Austria', prefixes: [90, 91], code: 'AT' },
		{ name: 'Australia', prefixes: [93], code: 'AU' },
		{ name: 'New Zealand', prefixes: [94], code: 'NZ' },
		{ name: 'Malaysia', prefixes: [955], code: 'MY' },
		{ name: 'Macau', prefixes: [958], code: 'MO' },
		{ name: 'GS1 Global Office: GTIN-8 allocations', prefixes: [96], code: '' },
		{ name: 'Serial publications', prefixes: [977], code: '' },
		{ name: '"Bookland"', prefixes: [978, 979], code: '' },
		{ name: 'Refund receipts', prefixes: [980], code: '' }
	];

	function getAllocation(barcode: string) {
		// Try with the first 3 digits
		let prefix = parseInt(barcode.slice(0, 3));
		for (const allocation of gs1Allocations) {
			if (allocation.prefixes.includes(prefix)) {
				return allocation;
			}
		}

		// Try with the first 2 digits
		prefix = parseInt(barcode.slice(0, 2));
		for (const allocation of gs1Allocations) {
			if (allocation.prefixes.includes(prefix)) {
				return allocation;
			}
		}

		// Try with the first digit
		prefix = parseInt(barcode.slice(0, 1));
		for (const allocation of gs1Allocations) {
			if (allocation.prefixes.includes(prefix)) {
				return allocation;
			}
		}

		return { name: 'Unknown', prefixes: [], code: '' };
	}

	function getFlagEmoji(countryCode: string) {
		const countryCodes = countryCode.split('-');

		return countryCodes
			.map((code) => {
				const codePoints = code
					.toUpperCase()
					.split('')
					.map((char) => 127397 + char.charCodeAt(0));
				return String.fromCodePoint(...codePoints);
			})
			.join('');
	}

	let allocation = $derived(getAllocation(barcode));
</script>

<Card>
	<h1 class="my-4 text-2xl font-bold sm:text-4xl">
		{$_('product.gs1.title', { default: 'GS1 barcode information' })}
	</h1>

	<div class="space-y-4 text-sm sm:text-base">
		<p>
			{$_('product.gs1.intro', {
				default:
					'GS1 provides standards for product barcodes. The prefix at the beginning of a barcode is associated with the company or organisation that registered it.'
			})}
			<em class="ml-1 text-base-content/70">
				{$_('product.gs1.important', {
					default:
						'This does not indicate where the product was manufactured or its country of origin.'
				})}
			</em>
		</p>

		<div class="rounded-lg border border-base-300 bg-base-200 p-4">
			<h2 class="mb-2 font-semibold">
				{$_('product.gs1.prefix_title', { default: 'Prefix allocation' })}
			</h2>
			<div class="flex items-center gap-2">
				{#if allocation.code}
					<div class="text-xl sm:text-3xl" aria-hidden="true">{getFlagEmoji(allocation.code)}</div>
				{/if}
				<p>
					<strong>{$_('product.gs1.prefix_label', { default: 'Registered through:' })}</strong>
					{allocation.name}
				</p>
			</div>
			<p class="mt-2 text-sm text-base-content/70">
				{$_('product.gs1.prefix_note', {
					default:
						'The location shown here refers to the GS1 registration, not the product’s origin.'
				})}
			</p>
		</div>

		<div>
			<h2 class="mb-2 font-semibold">
				{$_('product.gs1.verified_title', { default: 'More information' })}
			</h2>
			<p>
				{$_('product.gs1.verified_description', {
					default:
						'Verified by GS1 may provide more information about the company and product linked to this barcode.'
				})}
			</p>
		</div>

		<div>
			<a
				class="btn btn-secondary"
				href="https://www.gs1.org/services/verified-by-gs1/results?gtin={barcode}"
				target="_blank"
				rel="noopener noreferrer"
			>
				{$_('product.gs1.verified_link', { default: 'View this barcode on GS1' })}
			</a>
		</div>
		<p class="text-end text-sm text-secondary italic">
			{$_('product.gs1.source_label', { default: 'Source:' })}
			<a
				class="link"
				href="https://www.gs1.org/standards/id-keys/company-prefix"
				target="_blank"
				rel="noopener noreferrer"
				>{$_('product.gs1.source_link', { default: 'GS1 prefix standards' })}</a
			>
		</p>
	</div>
</Card>
