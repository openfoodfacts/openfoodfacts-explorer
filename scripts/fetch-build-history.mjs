import { execFileSync } from 'node:child_process';

// Vercel's shallow checkout may not include release tags or a configured remote.
const owner = process.env.VERCEL_GIT_REPO_OWNER || 'openfoodfacts';
const repo = process.env.VERCEL_GIT_REPO_SLUG || 'openfoodfacts-explorer';
const repositoryUrl = `https://github.com/${owner}/${repo}.git`;
const isShallow =
	execFileSync('git', ['rev-parse', '--is-shallow-repository'], { encoding: 'utf8' }).trim() ===
	'true';

execFileSync('git', ['fetch', '--tags', ...(isShallow ? ['--unshallow'] : []), repositoryUrl], {
	stdio: 'inherit'
});
