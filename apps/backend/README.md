# @lamiefoods/backend

Reserved workspace for the Lamie Foods API. **Owned by the backend developer** —
the frontend work in this repo does not implement it.

Nothing here is implemented on purpose. The scripts are no-op stubs so
`turbo run build|lint|typecheck` succeeds across the whole monorepo today and
starts exercising this workspace the moment real sources land.

## Scope (backend developer)

Database, server-side business logic, API implementation, authentication,
order processing, Paystack payment verification, inventory persistence,
customer data persistence, admin authorization.

## What the frontend needs from you

The frontend cannot be wired to real data until the API contract exists. When
you are ready, please supply:

1. Base URL(s) per environment.
2. Endpoint list with method, path, request shape and response shape.
3. Error shape and status-code conventions.
4. Auth scheme for the admin routes (the frontend prefers httpOnly cookies over
   tokens in `localStorage`).
5. The Paystack flow: which side initialises the transaction, what the frontend
   receives, and how verification is confirmed.
6. Pagination and filtering conventions for list endpoints.

`packages/types` holds the frontend's **provisional** understanding of the
domain. It is a starting point for discussion, not a contract — where your
implementation differs, your implementation wins and we update the package.

## Freedom of choice

The stack here is deliberately unchosen. Any runtime works as long as the
contract is documented. Replace this README and the stub scripts when you start.
