# API layer

All backend communication goes through `apiFetch`. Components never call `fetch`
directly, so base URL, credentials and error handling stay in one place.

**No endpoint functions exist yet.** The backend developer has not supplied a
contract, and inventing request/response shapes would mean building UI against an
API that does not exist.

When the contract arrives, add one module per resource next to this file
(`products.ts`, `orders.ts`, …), each returning types from `@lamiefoods/types`,
and reconcile that package against the real contract first.
