import "server-only";

import type {
  Product,
  ProductCategory,
  ProductImage,
  ProductPack,
} from "@lamiefoods/types";
import { db, type Db } from "@/server/db/client";

const ngn = (amount: number) => ({ amount, currency: "NGN" as const });

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  category: string;
  teaser: string;
  narrative: string | null;
  pairings: string | null;
  crunch_score: number;
  ingredients: string;
  allergens: string[];
  allergens_confirmed: boolean;
  shelf_life: string | null;
  storage_note: string | null;
  stock_quantity: number;
  restock_threshold: number | null;
  storefront_active: boolean;
  feature_on_homepage: boolean;
  seasonal_edition: boolean;
  discount_percent: number | null;
  created_at: Date;
  updated_at: Date;
}

interface PackRow {
  id: string;
  product_id: string;
  name: string;
  price_kobo: number;
  sku: string | null;
  sort_order: number;
}

interface ImageRow {
  id: string;
  product_id: string;
  url: string;
  alt: string;
  role: string;
  sort_order: number;
}

function rowToProduct(row: ProductRow, packs: PackRow[], images: ImageRow[]): Product {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: row.category as ProductCategory,
    teaser: row.teaser,
    narrative: row.narrative,
    pairings: row.pairings,
    crunchScore: row.crunch_score,
    ingredients: row.ingredients,
    allergens: row.allergens,
    allergensConfirmed: row.allergens_confirmed,
    shelfLife: row.shelf_life,
    storageNote: row.storage_note,
    stockQuantity: row.stock_quantity,
    restockThreshold: row.restock_threshold,
    storefrontActive: row.storefront_active,
    featureOnHomepage: row.feature_on_homepage,
    seasonalEdition: row.seasonal_edition,
    discountPercent: row.discount_percent,
    packs: packs
      .filter((p) => p.product_id === row.id)
      .map((p): ProductPack => ({
        id: p.id,
        name: p.name,
        price: ngn(p.price_kobo),
        sku: p.sku,
      })),
    images: images
      .filter((i) => i.product_id === row.id)
      .map((i): ProductImage => ({
        id: i.id,
        url: i.url,
        alt: i.alt,
        role: i.role as "hero" | "gallery",
      })),
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

const PRODUCT_COLUMNS = `
  id, slug, name, category, teaser, narrative, pairings, crunch_score,
  ingredients, allergens, allergens_confirmed, shelf_life, storage_note,
  stock_quantity, restock_threshold, storefront_active, feature_on_homepage,
  seasonal_edition, discount_percent, created_at, updated_at
`;

async function packsAndImagesFor(
  sql: Db,
  productIds: string[],
): Promise<{ packs: PackRow[]; images: ImageRow[] }> {
  if (productIds.length === 0) return { packs: [], images: [] };

  const [packs, images] = await Promise.all([
    sql`select id, product_id, name, price_kobo, sku, sort_order
        from product_packs where product_id in ${sql(productIds)}
        order by sort_order asc, name asc`,
    sql`select id, product_id, url, alt, role, sort_order
        from product_images where product_id in ${sql(productIds)}
        order by sort_order asc`,
  ]);

  return {
    packs: packs as unknown as PackRow[],
    images: images as unknown as ImageRow[],
  };
}

/** Published products only — what the storefront may ever show. */
export async function listPublishedProducts(): Promise<Product[]> {
  const sql = db();
  const rows = (await sql`
    select ${sql.unsafe(PRODUCT_COLUMNS)} from products
    where storefront_active = true
    order by created_at asc
  `) as unknown as ProductRow[];

  const { packs, images } = await packsAndImagesFor(
    sql,
    rows.map((r) => r.id),
  );
  return rows.map((row) => rowToProduct(row, packs, images));
}

/** Published-only lookup, for the storefront. `null` if unpublished or missing —
 *  the customer-facing 404 must not distinguish "doesn't exist" from "draft". */
export async function getProductBySlug(slug: string): Promise<Product | null> {
  const sql = db();
  const rows = (await sql`
    select ${sql.unsafe(PRODUCT_COLUMNS)} from products
    where slug = ${slug} and storefront_active = true
  `) as unknown as ProductRow[];

  const row = rows[0];
  if (!row) return null;

  const { packs, images } = await packsAndImagesFor(sql, [row.id]);
  return rowToProduct(row, packs, images);
}

/** Every product regardless of status — admin only. */
export async function listProductsForAdmin(): Promise<Product[]> {
  const sql = db();
  const rows = (await sql`
    select ${sql.unsafe(PRODUCT_COLUMNS)} from products
    order by created_at desc
  `) as unknown as ProductRow[];

  const { packs, images } = await packsAndImagesFor(
    sql,
    rows.map((r) => r.id),
  );
  return rows.map((row) => rowToProduct(row, packs, images));
}

/** Any status, by slug — admin only (drafts included, for editing). */
export async function getProductForAdmin(slug: string): Promise<Product | null> {
  const sql = db();
  const rows = (await sql`
    select ${sql.unsafe(PRODUCT_COLUMNS)} from products where slug = ${slug}
  `) as unknown as ProductRow[];

  const row = rows[0];
  if (!row) return null;

  const { packs, images } = await packsAndImagesFor(sql, [row.id]);
  return rowToProduct(row, packs, images);
}

export interface ProductInput {
  slug: string;
  name: string;
  category: ProductCategory;
  teaser: string;
  narrative: string | null;
  pairings: string | null;
  crunchScore: number;
  ingredients: string;
  allergens: string[];
  allergensConfirmed: boolean;
  shelfLife: string | null;
  storageNote: string | null;
  stockQuantity: number;
  restockThreshold: number | null;
  storefrontActive: boolean;
  featureOnHomepage: boolean;
  seasonalEdition: boolean;
  discountPercent: number | null;
  packs: { name: string; priceKobo: number; sku: string | null }[];
  images: { url: string; alt: string; role: "hero" | "gallery" }[];
}

export class DuplicateSlugError extends Error {
  constructor(slug: string) {
    super(`A product with slug "${slug}" already exists.`);
    this.name = "DuplicateSlugError";
  }
}

/** Writes the product, its packs and its images in one transaction — same
 *  reasoning as orders/order_items: a product with no packaging is unsellable,
 *  and packs with no product are orphans. */
export async function createProduct(input: ProductInput): Promise<Product> {
  const sql = db();

  try {
    return await sql.begin(async (tx) => {
      const [row] = (await tx`
        insert into products (
          slug, name, category, teaser, narrative, pairings, crunch_score,
          ingredients, allergens, allergens_confirmed, shelf_life, storage_note,
          stock_quantity, restock_threshold, storefront_active,
          feature_on_homepage, seasonal_edition, discount_percent
        ) values (
          ${input.slug}, ${input.name}, ${input.category}, ${input.teaser},
          ${input.narrative}, ${input.pairings}, ${input.crunchScore},
          ${input.ingredients}, ${input.allergens}, ${input.allergensConfirmed},
          ${input.shelfLife}, ${input.storageNote}, ${input.stockQuantity},
          ${input.restockThreshold}, ${input.storefrontActive},
          ${input.featureOnHomepage}, ${input.seasonalEdition}, ${input.discountPercent}
        )
        returning ${tx.unsafe(PRODUCT_COLUMNS)}
      `) as unknown as ProductRow[];

      if (!row) throw new Error("Product insert returned no row.");

      if (input.packs.length > 0) {
        await tx`
          insert into product_packs ${tx(
            input.packs.map((pack, index) => ({
              product_id: row.id,
              name: pack.name,
              price_kobo: pack.priceKobo,
              sku: pack.sku,
              sort_order: index,
            })),
          )}
        `;
      }

      if (input.images.length > 0) {
        await tx`
          insert into product_images ${tx(
            input.images.map((image, index) => ({
              product_id: row.id,
              url: image.url,
              alt: image.alt,
              role: image.role,
              sort_order: index,
            })),
          )}
        `;
      }

      const { packs, images } = await packsAndImagesFor(tx, [row.id]);
      return rowToProduct(row, packs, images);
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      throw new DuplicateSlugError(input.slug);
    }
    throw error;
  }
}

/** Full replace of a product's fields, packs and images — same transaction shape
 *  as create. Packs/images are deleted and reinserted rather than diffed: at
 *  this catalogue's size, a diff would be more code than it saves. */
export async function updateProduct(
  currentSlug: string,
  input: ProductInput,
): Promise<Product | null> {
  const sql = db();

  try {
    return await sql.begin(async (tx) => {
      const [row] = (await tx`
        update products set
          slug = ${input.slug}, name = ${input.name}, category = ${input.category},
          teaser = ${input.teaser}, narrative = ${input.narrative},
          pairings = ${input.pairings}, crunch_score = ${input.crunchScore},
          ingredients = ${input.ingredients}, allergens = ${input.allergens},
          allergens_confirmed = ${input.allergensConfirmed},
          shelf_life = ${input.shelfLife}, storage_note = ${input.storageNote},
          stock_quantity = ${input.stockQuantity},
          restock_threshold = ${input.restockThreshold},
          storefront_active = ${input.storefrontActive},
          feature_on_homepage = ${input.featureOnHomepage},
          seasonal_edition = ${input.seasonalEdition},
          discount_percent = ${input.discountPercent},
          updated_at = now()
        where slug = ${currentSlug}
        returning ${tx.unsafe(PRODUCT_COLUMNS)}
      `) as unknown as ProductRow[];

      if (!row) return null;

      await tx`delete from product_packs where product_id = ${row.id}`;
      if (input.packs.length > 0) {
        await tx`
          insert into product_packs ${tx(
            input.packs.map((pack, index) => ({
              product_id: row.id,
              name: pack.name,
              price_kobo: pack.priceKobo,
              sku: pack.sku,
              sort_order: index,
            })),
          )}
        `;
      }

      await tx`delete from product_images where product_id = ${row.id}`;
      if (input.images.length > 0) {
        await tx`
          insert into product_images ${tx(
            input.images.map((image, index) => ({
              product_id: row.id,
              url: image.url,
              alt: image.alt,
              role: image.role,
              sort_order: index,
            })),
          )}
        `;
      }

      const { packs, images } = await packsAndImagesFor(tx, [row.id]);
      return rowToProduct(row, packs, images);
    });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "23505") {
      throw new DuplicateSlugError(input.slug);
    }
    throw error;
  }
}

/**
 * Decrements stock for each ordered line, clamped at zero — no backorder
 * logic. Takes a `Db` (either the pool or a transaction handle) so it can run
 * inside `server/orders/repository.ts`'s payment-confirmation transaction:
 * stock only ever moves once payment is real, never at order-creation time,
 * which would decrement stock for orders that never get paid.
 */
export async function decrementStockInTx(
  tx: Db,
  lines: { slug: string; quantity: number }[],
): Promise<void> {
  for (const line of lines) {
    await tx`
      update products
      set stock_quantity = greatest(0, stock_quantity - ${line.quantity}), updated_at = now()
      where slug = ${line.slug}
    `;
  }
}
