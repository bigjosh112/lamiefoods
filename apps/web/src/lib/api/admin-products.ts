import type { Product } from "@lamiefoods/types";
import { apiFetch } from "./client";

/** POST /api/admin/products — create. */
export async function createProduct(input: unknown): Promise<Product> {
  const { product } = await apiFetch<{ product: Product }>("/api/admin/products", {
    method: "POST",
    body: input,
  });
  return product;
}

/** PATCH /api/admin/products/:slug — full replace of one product's fields,
 *  packs and images. `currentSlug` is the product's slug BEFORE this save —
 *  the payload's own `slug` may differ, if the admin changed it. */
export async function updateProduct(
  currentSlug: string,
  input: unknown,
): Promise<Product> {
  const { product } = await apiFetch<{ product: Product }>(
    `/api/admin/products/${encodeURIComponent(currentSlug)}`,
    { method: "PATCH", body: input },
  );
  return product;
}

/** DELETE /api/admin/products/:slug — permanent remove. */
export async function deleteProduct(slug: string): Promise<void> {
  await apiFetch<null>(`/api/admin/products/${encodeURIComponent(slug)}`, {
    method: "DELETE",
  });
}

/** POST /api/admin/products/bulk — soft-hide many products. */
export async function bulkUnpublishProducts(slugs: string[]): Promise<number> {
  const { affected } = await apiFetch<{ affected: number }>(
    "/api/admin/products/bulk",
    { method: "POST", body: { action: "unpublish", slugs } },
  );
  return affected;
}

/** POST /api/admin/products/bulk — permanent remove many products. */
export async function bulkDeleteProducts(slugs: string[]): Promise<number> {
  const { affected } = await apiFetch<{ affected: number }>(
    "/api/admin/products/bulk",
    { method: "POST", body: { action: "delete", slugs } },
  );
  return affected;
}
