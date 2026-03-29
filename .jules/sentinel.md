## 2024-05-18 - Incorrect Regex Parsing for Svelte
**Vulnerability:** N/A (Tooling Issue)
**Learning:** Svelte files and standard HTML parsing using regular expressions can be deceiving. Our custom python script attempting to find `<a target="_blank">` tags failed because Svelte syntax can span multiple lines natively, and simple regex heuristics failed to accurately map the `rel="noopener noreferrer"` present on subsequent lines.
**Prevention:** Rely on robust HTML/Svelte parsers or AST tools instead of quick regex searches when refactoring security-critical components in Svelte files to prevent accidental data duplication and false positives.
