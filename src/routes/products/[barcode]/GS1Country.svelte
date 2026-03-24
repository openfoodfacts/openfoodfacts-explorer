<script lang="ts">
	import Card from '$lib/ui/Card.svelte';

	interface Props {
		barcode: string;
	}

	let { barcode }: Props = $props();

	const gs1Country: Array<{ name: string; prefixes: number[]; code: string }> = [
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

	function getCountry(barcode: string) {
		// Try with the first 3 digits
		let prefix = parseInt(barcode.slice(0, 3));
		for (const country of gs1Country) {
			if (country.prefixes.includes(prefix)) {
				return country;
			}
		}

		// Try with the first 2 digits
		prefix = parseInt(barcode.slice(0, 2));
		for (const country of gs1Country) {
			if (country.prefixes.includes(prefix)) {
				return country;
			}
		}

		// Try with the first digit
		prefix = parseInt(barcode.slice(0, 1));
		for (const country of gs1Country) {
			if (country.prefixes.includes(prefix)) {
				return country;
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

	let country = $derived(getCountry(barcode));
</script>

<Card>
	<h1 class="my-4 text-2xl font-bold sm:text-4xl">Barcode information</h1>

	<div>
		<div class="flex items-center gap-2">
			<div class="text-xl sm:text-3xl">{getFlagEmoji(country.code)}</div>
			<p class="sm:text-md text-xs">
				<strong>GS1 Country:</strong>
				{country.name}
			</p>
		</div>

		<div class="my-4">
			<a
				class="btn btn-secondary"
				href="https://www.gs1.org/services/verified-by-gs1/results?gtin={barcode}"
				target="_blank"
				rel="noopener noreferrer"
			>
				Get more information from GS1
			</a>
		</div>
		<p class="text-secondary mt-4 text-end text-sm italic">
			Source: <a
				class="link"
				href="https://www.gs1.org/standards/id-keys/company-prefix"
				target="_blank"
				rel="noopener noreferrer">GS1</a
			>
		</p>
	</div>
</Card>
