# API Integration — contract catalog + client pattern

> The single source of truth for every backend endpoint this app consumes, plus the
> canonical pattern for consuming them. Populated by the `consume-endpoint` skill.
>
> **The iron rule: contracts are recorded, never invented.** Every entry cites its
> evidence — backend source code, a screenshot from the backend platform, an API doc,
> or a real captured response. If a field's type or optionality is unknown, it stays
> marked `UNKNOWN — ask backend` until confirmed. No guessed shapes, ever.

## Base configuration

- **Base URL:** `<https://api.example.com — and where the env var lives, e.g. VITE_API_URL>`
- **Auth scheme:** `<e.g. Bearer JWT in Authorization header; where the token comes from and where it is stored>`
- **Common headers:** `<e.g. Content-Type: application/json>`
- **Common error envelope:** `<the shape ALL errors share, if the backend has one — record it once here>`

## Canonical consumption pattern

Every endpoint is consumed in three layers, in this order. Follow the shapes of the
first implemented endpoint in this repo; if none exists yet, establish them from this
template.

1. **Typed client function** — `<src/api/<resource>.(ts|js)>`
   One function per endpoint. Owns: URL building, method, headers, serialization,
   throwing a typed error on non-2xx. Owns nothing about React.
2. **Hook** — `<src/hooks/use<Resource>.(ts|js)>`
   Wraps the client function. Owns: loading/error/data state, cancellation/stale
   guards, cache or refetch policy. Returns `{ data, error, isLoading, <actions> }`.
3. **UI states** — every consuming component renders **all four**:
   loading (skeleton/spinner), error (message + retry), empty (real empty-state, not
   a blank screen), success. A PR that adds an endpoint without all four is incomplete.

## Endpoint catalog

<!-- One entry per endpoint. Copy the template. Newest at the bottom, grouped by resource. -->

---

### <METHOD> `/path/:param` <!-- template entry — copy, fill, delete this comment -->

- **Purpose:** <one line — what the UI uses this for>
- **Auth:** <required? which role?>
- **Evidence:** <backend file / screenshot / doc + date recorded, e.g. "routes/orders.js shared 2026-07-07">
- **Request:**
  - Path params: `<name: type>`
  - Query: `<name: type — optional?>`
  - Body:
    ```jsonc
    { "field": "type — required/optional, constraints" }
    ```
- **Response 2xx:**
  ```jsonc
  { "field": "type — nullable? shape of nested objects spelled out" }
  ```
- **Errors:** `<status → meaning + body shape, e.g. 401 → token expired, envelope above>`
- **Quirks:** <pagination style, rate limits, date formats, anything surprising>
- **Consumed by:** client `<fn name>` · hook `<hook name>` · UI `<components>`
