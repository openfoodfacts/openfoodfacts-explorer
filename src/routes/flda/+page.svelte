<script lang="ts">
	import { dev } from '$app/environment';
	import { parseCSV } from './parsing';

	const TESTJSON = `{
  "columns": {
    "Time": {
      "type": "time"
    },
    "Meal": {
      "type": "meal",
      "values": {
        "Petit-déjeuner": "breakfast",
        "Dîner": "dinner"
      }
    },
    "Recipe": {
      "type": "recipe"
    },
    "Food": {
      "type": "food"
    },
    "Amount": {
      "type": "entered_quantity"
    },
    "Measure": {
      "type": "entered_unit"
    },
	"Quantity": {
	  "type": "quantity"
	},
    "Unit": {
      "type": "unit"
    },
    "Protein": {
      "type": "facet",
      "code": "protein"
    },
	"Carbohydrate": {
	  "type": "facet",
	  "code": "carbohydrates"
	},
	"Fat": {
	  "type": "facet",
	  "code": "fat"
	},
	"Source": {
	  "type": "source",
	  "values": {
		"GTIN": {
		  "source": "gtin",
		  "location": "https://world.openfoodfacts.org/product/{code}"
		},
		"PLU": {
		  "source": "plu",
		  "location": "https://world.openfoodfacts.org/plu/{code}"
		}
	  }
	},
	"Code": {
	  "type": "code"
	},
	"Image": {
	  "type": "image"
	}
  },
  "locale": "fr-FR",
  "timezone": "Europe/Paris"
}
`;

	const TESTCSV = `Time,Meal,Recipe,Food,Amount,Measure,Quantity,Unit,Protein,Carbohydrate,Fat,Source,Code,Image
1-May-2025 6:00am,Breakfast,,Kelloggs Corn Flakes,1,portion,30,g,"0,3",24,1,GTIN,5059319030487,https://images.openfoodfacts.org/images/products/505/931/903/0487/front_en.3.400.jpg
1-May-2025 6:00am,Breakfast,,Whole Milk,"0,5",pint,284,ml,"3,1","10,2","4,3",GTIN,5060066960071,https://images.openfoodfacts.org/images/products/506/006/696/0071/front_en.3.400.jpg
1-May-2025 9:00am,Snack,Coffee,Instant Coffee Powder,1,teaspoon,4,g,0,"0,1",0,GTIN,4056489440628,https://images.openfoodfacts.net/images/products/405/648/944/0628/front_en.26.400.jpg
1-May-2025 9:00am,Snack,Coffee,Whole Milk,20,ml,20,ml,"1,3","1,2","1,2",GTIN,5060066960071,https://images.openfoodfacts.org/images/products/506/006/696/0071/front_en.3.400.jpg
`;

	// The overall metadata structure
	type MealMetadata = {
		columns: { [column: string]: MealMetadataColumn };
		locale: string;
		timezone: string;
		[key: string]: unknown; // Allow additional properties
	};

	type TimeColumn = { type: 'time' };
	type MealColumn = {
		type: 'meal';
		values: Record<
			string,
			| 'breakfast'
			| 'second-breakfast'
			| 'brunch'
			| 'elevenses'
			| 'lunch'
			| 'tea'
			| 'dinner'
			| 'supper'
			| 'high-tea'
			| 'siu-yeh'
			| 'snack'
			| 'daily'
		>;
	};

	type RecipeColumn = { type: 'recipe' };
	type FoodColumn = { type: 'food' };
	type EnteredQuantityColumn = { type: 'entered_quantity' };
	type EnteredUnitColumn = { type: 'entered_unit' };
	type QuantityColumn = { type: 'quantity' };
	type UnitColumn = { type: 'unit' };
	type CodeColumn = { type: 'code' };
	type ImageColumn = { type: 'image' };

	type FacetColumn = {
		type: 'facet';
		code: string;
		factor: number;
	};

	type SourceColumn = {
		type: 'source';
		values: Record<string, { source: 'gtin' | 'plu'; location: string }>;
	};

	type AdditionalColumn = {
		type: string;
		[key: string]: unknown;
	};

	type MealMetadataColumn =
		| TimeColumn
		| MealColumn
		| RecipeColumn
		| FoodColumn
		| EnteredQuantityColumn
		| EnteredUnitColumn
		| QuantityColumn
		| UnitColumn
		| FacetColumn
		| SourceColumn
		| CodeColumn
		| ImageColumn
		| AdditionalColumn;

	let mealCsvFile: File | null = $state(null);
	let mealMetaFile: File | null = $state(null);

	let csvData: Record<string, string>[] = $state(dev ? parseCSV(TESTCSV) : []);
	let metaData: MealMetadata | null = $state(dev ? JSON.parse(TESTJSON) : null);

	let error: string | null = $state(null);
	let loading = $state(false);

	async function handleFiles() {
		error = null;
		loading = true;
		csvData = [];
		metaData = null;
		try {
			if (!mealCsvFile || !mealMetaFile) {
				error = 'Please select both files.';
				loading = false;
				return;
			}
			// Read and parse meal_metadata.json
			const metaText = await mealMetaFile.text();
			metaData = JSON.parse(metaText);
			// Read and parse meal.csv
			const csvText = await mealCsvFile.text();
			csvData = parseCSV(csvText);
		} catch (e) {
			error = 'Failed to load files: ' + (e instanceof Error ? e.message : String(e));
		}
		loading = false;
	}

	function orderColumns(columns: { [column: string]: MealMetadataColumn }): string[] {
		// Define a preferred order for known column types
		const preferredOrder = [
			'time',
			'image',
			'food',
			'meal',
			'recipe',
			'entered_quantity',
			'entered_unit',
			'quantity',
			'unit',
			'protein',
			'carbohydrates',
			'fat',
			'source',
			'code'
		];

		return Object.keys(columns).sort((a, b) => {
			const typeA = columns[a].type;
			const typeB = columns[b].type;
			const indexA = preferredOrder.indexOf(typeA);
			const indexB = preferredOrder.indexOf(typeB);
			if (indexA === -1 && indexB === -1) {
				return a.localeCompare(b); // Both unknown types, sort alphabetically
			} else if (indexA === -1) {
				return 1; // A is unknown, B comes first
			} else if (indexB === -1) {
				return -1; // B is unknown, A comes first
			} else {
				return indexA - indexB; // Both known types, sort by preferred order
			}
		});
	}
</script>

<div class="mx-auto p-4">
	<h1 class="mb-4 text-2xl font-bold">Food Logging Data Viewer</h1>
	<div class="mb-4 grid grid-cols-[auto_1fr] gap-2">
		<label for="mealCsvFile">
			<span class="font-semibold">meal.csv</span>
		</label>
		<input
			name="mealCsvFile"
			type="file"
			class="file-input"
			accept=".csv"
			onchange={(e) => {
				const input = e.target as HTMLInputElement | null;
				mealCsvFile = input?.files?.[0] ?? null;
			}}
		/>

		<label for="mealMetaFile">
			<span class="font-semibold">meal_metadata.json</span>
		</label>
		<input
			name="mealMetaFile"
			type="file"
			class="file-input"
			accept=".json"
			onchange={(e) => {
				const input = e.target as HTMLInputElement | null;
				mealMetaFile = input?.files?.[0] ?? null;
			}}
		/>
	</div>

	<button class="btn btn-primary mt-2 w-full" onclick={handleFiles} disabled={loading}>
		{loading ? 'Loading…' : 'Load Files'}
	</button>
	{#if error}
		<div class="text-red-600">{error}</div>
	{/if}

	{#if metaData && csvData.length}
		<h2 class="mt-6 mb-2 text-xl font-semibold">Meal Entries</h2>
		<div class="overflow-x-auto">
			<table class="table-zebra table w-full text-sm">
				<thead>
					<tr>
						{#each orderColumns(metaData.columns) as key (key)}
							<th class="px-2 py-1"> {key} </th>
						{/each}
					</tr>
				</thead>
				<tbody>
					{#each csvData as row, rowIdx (row.barcode ?? rowIdx)}
						<tr>
							{#each orderColumns(metaData.columns) as key (key)}
								{@const col = metaData.columns[key]}
								<td class="px-2 py-1 align-middle">
									{#if col?.type === 'image' && row[key]}
										<img alt="Product" src={row[key]} class="h-10 w-10 object-contain" />
									{:else}
										{row[key]}
									{/if}
								</td>
							{/each}
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</div>
