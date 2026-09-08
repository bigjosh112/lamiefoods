import "server-only";

import postgres from "postgres";
import { serverEnv } from "@/config/server-env";

/**
 * The Postgres connection, as a lazily-created singleton.
 *
 * Lazy because the site must build and render without a database: the
 * storefront is public and largely static, and a missing DATABASE_URL should
 * disable ordering rather than break every page.
 *
 * Cached on `globalThis` because `next dev` re-evaluates modules on every hot
 * reload; without this, each edit would open another pool and leak connections
 * until the database refused new ones.
 */
declare global {
  var __lamieSql: ReturnType<typeof postgres> | undefined;
}

export class DatabaseNotConfiguredError extends Error {
  constructor() {
    super("DATABASE_URL is not set.");
    this.name = "DatabaseNotConfiguredError";
  }
}

export function db() {
  const { DATABASE_URL } = serverEnv();
  if (!DATABASE_URL) throw new DatabaseNotConfiguredError();

  globalThis.__lamieSql ??= postgres(DATABASE_URL, {
    // Supabase's transaction pooler (and pgBouncer generally) cannot hold
    // server-side prepared statements across pooled connections. Leaving this
    // on produces intermittent "prepared statement already exists" errors that
    // only appear under concurrency — so it is off, not tuned.
    prepare: false,
    // Serverless invocations are short-lived; a large idle pool is wasted.
    max: 5,
    idle_timeout: 20,
    connect_timeout: 10,
  });

  return globalThis.__lamieSql;
}

/**
 * The type of both `db()`'s return value and a transaction handle from
 * `sql.begin(async (tx) => ...)`. postgres.js types these as two distinct
 * (structurally incompatible) interfaces — `Sql` and `TransactionSql` — even
 * though both are callable tagged-template functions with the same query
 * surface; `TransactionSql` just omits pool-management methods (`.end()`
 * etc.) that make no sense mid-transaction. This union is what functions
 * that might run either standalone or inside someone else's transaction
 * (e.g. `decrementStockInTx`, called from `server/orders/repository.ts`'s
 * payment transaction) should accept — the caller decides which to pass.
 */
export type Db = ReturnType<typeof db> | postgres.TransactionSql;
