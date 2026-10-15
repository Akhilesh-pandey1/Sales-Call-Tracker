# Security & Performance Baseline

Pasted in full into the Standards sub-agent prompt. Two binding rules from the smell baseline apply here too: the repo overrides (a documented repo standard suppresses a baseline flag), and skip anything tooling already enforces. One difference: **security findings are hard violations; performance findings are judgement calls** unless they match a listed bottleneck pattern.

## Security

- **Unvalidated input** — user input reaching logic or storage without validation/sanitization at the boundary.
- **Secrets in code** — credentials, tokens, API keys in source, logs, or tests.
- **Missing auth/authz** — an endpoint or action reachable without the identity or permission check it needs.
- **IDOR** — an object fetched by id from user input without an ownership/permission check on the result (user A reading user B's record).
- **Injection** — SQL/HTML/shell built by string concatenation instead of parameterized queries, encoding, or argument arrays.
- **Mass assignment** — request-body fields copied straight into a model or update, letting callers set fields they shouldn't (role, price, owner).
- **XSS** — user content rendered without encoding, or via `dangerouslySetInnerHTML` / `v-html`.
- **Untrusted external data** — third-party API responses, webhooks, CSV imports, or config treated as trusted instead of validated at the boundary.
- **Error leakage** — stack traces, query text, or internal paths returned to the client.
- **Unbounded expensive operations** — auth, search, or export endpoints with no rate limit.

## Performance

- **N+1 queries** — a list fetch issuing one query per row inside a loop.
- **Unbounded fetch** — list endpoints without LIMIT/pagination; selecting all columns where few are used.
- **Missing index for a new query** — a new WHERE/ORDER BY on columns with no supporting index.
- **Sync work that should be async** — email, SMS, or file generation inline in the request path.
- **Hot-path allocation** — large objects, buffers, or deep copies rebuilt per request/render where they could be reused or streamed.
- **Unnecessary re-renders** — new object/array/function identities in props or hook deps on every render; server data copied into local state instead of staying in the query cache.
- **Serial awaits** — independent awaits run one after another instead of together.
