# Client IP forwarding during server rendering

Server-side requests using SvelteKit's request-scoped `fetch` send `X-Real-IP` to
the explicitly allowed origins in the private runtime environment variable
`CLIENT_IP_ALLOWED_ORIGINS`, a space-separated list of HTTPS origins. It defaults
to `https://world.openfoodfacts.org https://world.openfoodfacts.net`; set it to
an empty value to disable forwarding. Paths, credentials, query strings and
fragments are not allowed. Requests with a forwarded address reject redirects
to prevent the address from reaching a different origin. Global `fetch` calls do
not pass through this hook.

The Node adapter must be configured for the deployment's actual proxy chain so
that `event.getClientAddress()` returns the visitor's address. In particular,
configure `ADDRESS_HEADER` and, if appropriate, `XFF_DEPTH` as described in the
[SvelteKit Node adapter documentation](https://svelte.dev/docs/kit/adapter-node#Environment-variables-ADDRESS_HEADER-and-XFF_DEPTH).
Only trust forwarded headers when direct access to the app is restricted and the
trusted proxy sanitizes them. The receiving API must likewise accept `X-Real-IP`
only from trusted Explorer infrastructure. If no address is available, the
header is omitted.
