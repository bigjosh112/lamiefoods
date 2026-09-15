import "server-only";

import { isDatabaseConfigured } from "@/config/server-env";
import { getProductBySlug, listPublishedProducts } from "@/server/products/repository";
import { listActiveDeliveryAreas } from "@/server/delivery/repository";
import type { DeliveryArea, Product } from "@lamiefoods/types";

/**
 * ISR / sitemap / generateStaticParams must not crash `next build` when
 * DATABASE_URL is set but Postgres is unreachable (Railway image build
 * cannot see postgres.railway.internal) or migrations have not been applied.
 *
 * Route Handlers still call the raw repository functions and 503 as before.
 */
async function prerenderRead<T>(
  label: string,
  fallback: T,
  read: () => Promise<T>,
): Promise<T> {
  if (!isDatabaseConfigured()) return fallback;
  try {
    return await read();
  } catch (error) {
    console.error(
      `[prerender] ${label} failed; serving empty until Postgres is reachable.`,
      error,
    );
    return fallback;
  }
}

export function listPublishedProductsForPage(): Promise<Product[]> {
  return prerenderRead("listPublishedProducts", [], listPublishedProducts);
}

export function listActiveDeliveryAreasForPage(): Promise<DeliveryArea[]> {
  return prerenderRead("listActiveDeliveryAreas", [], listActiveDeliveryAreas);
}

export function getProductBySlugForPage(slug: string): Promise<Product | null> {
  return prerenderRead("getProductBySlug", null, () => getProductBySlug(slug));
}
