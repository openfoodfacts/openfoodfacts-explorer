import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const customElementName = /^[a-z][a-z0-9._-]*-[a-z0-9._-]+$/;
const componentIdentifier = /^[$A-Z_a-z][$\w]*$/;
const virtualModuleName = 'virtual:lit-svelte/components';
const pluginDirectory = fileURLToPath(new URL('.', import.meta.url));

export type LitSvelteWrapperSource = {
	/** Path to the source package's Custom Elements Manifest, relative to the Vite root. */
	manifestPath: string;
	/** Prefix added to the component name and generated Svelte wrapper filename. */
	componentPrefix?: string;
};

type CustomElementsManifest = {
	modules?: Array<{
		declarations?: Array<{
			customElement?: boolean;
			tagName?: string;
			name?: string;
		}>;
	}>;
};

type GeneratedComponent = {
	tagName: string;
	componentName: string;
	fileName: string;
};

function relativeModuleSpecifier(fromDirectory: string, targetPath: string): string {
	const path = relative(fromDirectory, targetPath).split(sep).join('/');
	return path.startsWith('.') ? path : `./${path}`;
}

function getComponentName(tag: string, declaredName?: string): string {
	if (declaredName) return declaredName;
	return tag
		.split(/[^a-zA-Z0-9_$]+/)
		.filter(Boolean)
		.map((part) => part[0].toUpperCase() + part.slice(1))
		.join('');
}

export async function generateLitSvelteComponents(
	projectRoot: string,
	sources: readonly LitSvelteWrapperSource[]
): Promise<GeneratedComponent[]> {
	const outputDirectory = resolve(projectRoot, '.svelte-kit/generated/lit-svelte');
	const components: GeneratedComponent[] = [];
	const tags = new Set<string>();
	const componentNames = new Set<string>();

	for (const source of sources) {
		const manifestFilePath = resolve(projectRoot, source.manifestPath);
		const manifest = JSON.parse(await readFile(manifestFilePath, 'utf8')) as CustomElementsManifest;

		for (const module of manifest.modules ?? []) {
			for (const declaration of module.declarations ?? []) {
				if (!declaration.customElement || !declaration.tagName) continue;
				const { tagName } = declaration;
				if (!customElementName.test(tagName)) {
					throw new Error(`Invalid custom-element tag in manifest: ${tagName}`);
				}
				if (tags.has(tagName)) {
					throw new Error(`Duplicate custom-element tag across manifests: ${tagName}`);
				}

				const componentName = `${source.componentPrefix ?? ''}${getComponentName(tagName, declaration.name)}`;
				if (!componentIdentifier.test(componentName)) {
					throw new Error(
						`Invalid generated Svelte component name: ${componentName}. Check the manifest name and componentPrefix.`
					);
				}
				if (componentNames.has(componentName)) {
					throw new Error(`Duplicate generated Svelte component name: ${componentName}`);
				}

				tags.add(tagName);
				componentNames.add(componentName);
				components.push({
					tagName,
					componentName,
					fileName: `${componentName}.svelte`
				});
			}
		}
	}

	if (components.length === 0) {
		throw new Error(
			'No custom-element declarations found in the configured Custom Elements Manifests.'
		);
	}

	await mkdir(outputDirectory, { recursive: true });
	const adapterImport = relativeModuleSpecifier(
		outputDirectory,
		resolve(pluginDirectory, '../sveltekit/LitElement.svelte')
	);
	const typesImport = relativeModuleSpecifier(
		outputDirectory,
		resolve(pluginDirectory, '../sveltekit/types.js')
	);
	await Promise.all(
		components.map(async ({ tagName, fileName }) => {
			const filePath = resolve(outputDirectory, fileName);
			const source = `<script lang="ts">
	import LitElement from '${adapterImport}';
	import type { WebComponentWrapperProps } from '${typesImport}';

	let props: WebComponentWrapperProps<'${tagName}'> = $props();
</script>

<LitElement tag="${tagName}" {...props} />
`;
			let currentSource: string | undefined;
			try {
				currentSource = await readFile(filePath, 'utf8');
			} catch {
				// The generated adapter does not exist yet.
			}
			if (currentSource !== source) await writeFile(filePath, source, 'utf8');
		})
	);

	const declarations = [...components]
		.sort((left, right) => left.componentName.localeCompare(right.componentName))
		.map(
			({ tagName, componentName }) =>
				`\texport const ${componentName}: Component<WebComponentWrapperProps<'${tagName}'>>;`
		)
		.join('\n');
	const declarationFile = `declare module '${virtualModuleName}' {\n\timport type { Component } from 'svelte';\n\timport type { WebComponentWrapperProps } from '${typesImport}';\n${declarations}\n}\n`;
	const declarationPath = resolve(outputDirectory, 'components.d.ts');
	let currentDeclarations: string | undefined;
	try {
		currentDeclarations = await readFile(declarationPath, 'utf8');
	} catch {
		// The generated type declaration does not exist yet.
	}
	if (currentDeclarations !== declarationFile) {
		await writeFile(declarationPath, declarationFile, 'utf8');
	}

	return components;
}
