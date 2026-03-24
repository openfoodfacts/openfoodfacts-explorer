import js from '@eslint/js';
import ts from 'typescript-eslint';
import svelte from 'eslint-plugin-svelte';
import prettier from 'eslint-config-prettier';
import globals from 'globals';
import svelteConfig from './svelte.config.js';

export default [
	js.configs.recommended,
	...ts.configs.recommended,
	...svelte.configs['flat/recommended'],
	prettier,
	...svelte.configs['flat/prettier'],
	{
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node
			}
		}
	},
	{
		files: ['**/*.svelte', '**/*.svelte.ts', '**/*.svelte.js'],
		// See more details at: https://typescript-eslint.io/packages/parser/
		languageOptions: {
			parserOptions: {
				projectService: true,
				extraFileExtensions: ['.svelte'], // Add support for additional file extensions, such as .svelte
				parser: ts.parser,

				svelteConfig
			}
		}
	},
	{
		files: ['svelte.config.js'],
		languageOptions: {
			globals: { ...globals.node }
		}
	},
	{
		ignores: [
			'**/*.cjs',
			'**/.DS_Store',
			'**/node_modules',
			'build',
			'.svelte-kit',
			'package',
			'**/.env',
			'**/.env.*',
			'!**/.env.example',
			'**/pnpm-lock.yaml',
			'**/package-lock.json',
			'**/yarn.lock',
			'.vercel'
		]
	},
	{
		rules: {
			'@typescript-eslint/no-unused-vars': [
				'error',
				{
					varsIgnorePattern: '^_$',
					argsIgnorePattern: '^_$'
				}
			],
			// Re-enable when the following issues are resolved:
			// - https://github.com/sveltejs/eslint-plugin-svelte/issues/1336
			// - https://github.com/sveltejs/eslint-plugin-svelte/issues/1329
			// - https://github.com/sveltejs/eslint-plugin-svelte/issues/1327
			// - https://github.com/sveltejs/eslint-plugin-svelte/issues/1324
			'svelte/no-navigation-without-resolve': 'off'
		}
	}
];
