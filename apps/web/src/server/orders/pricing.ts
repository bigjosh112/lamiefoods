import "server-only";

import type { Money, OrderItem } from "@lamiefoods/types";
import { applyDiscount } from "@/lib/money";
import { db } from "@/server/db/client";

/**
 * Turns the cart lines a browser sent into priced order items.
 *
 * THIS IS THE TRUST BOUNDARY. The request body carries only what the customer
 * chose — slug, pack, quantity — and never a price. Every amount below is read
 * from the database on the server, so a tampered request cannot change what an
 * order costs. If a price ever arrives in the payload, it is ignored; the schema
 * does not even have a field for it.
 *
 * As of the real product catalogue (2026-09-07), this queries `products`/
 * `product_packs` instead of the old static `content/products.ts` import, and
 * applies whatever `discount_percent` is live *at order time* via
 * `applyDiscount` — the exact same function the storefront uses to display
 * the discounted price, so the two can never compute it two different ways.
 *
 * Only PUBLISHED products (`storefront_active = true`) price successfully —
 * a crafted request naming a draft product's slug is rejected exactly like
 * one naming a slug that doesn't exist at all, so a draft's existence can't
 * be probed for via checkout.
 */
export interface RequestedLine {
  slug: string;
  pack: string;
  quantity: number;
}

export class UnknownLineError extends Error {
  readonly slug: string;
  readonly pack: string;

  constructor(slug: string, pack: string) {
    super(`No catalogue entry for "${slug}" in pack "${pack}".`);
    this.name = "UnknownLineError";
    this.slug = slug;
    this.pack = pack;
  }
}

const ngn = (amount: number): Money => ({ amount, currency: "NGN" });

interface CatalogRow {
  slug: string;
  name: string;
  discount_percent: number | null;
  pack_name: string;
  price_kobo: number;
  sku: string | null;
}

/**
 * @throws {UnknownLineError} if a line names a product/pack that doesn't
 * exist OR isn't published. Rejecting is deliberate: silently dropping an
 * unrecognised line would charge someone for less than they thought they
 * ordered.
 */
export async function priceLines(lines: RequestedLine[]): Promise<OrderItem[]> {
  const sql = db();
  const slugs = [...new Set(lines.map((line) => line.slug))];

  const rows =
    slugs.length === 0
      ? []
      : ((await sql`
          select p.slug, p.name, p.discount_percent,
                 pk.name as pack_name, pk.price_kobo, pk.sku
          from products p
          join product_packs pk on pk.product_id = p.id
          where p.slug in ${sql(slugs)} and p.storefront_active = true
        `) as unknown as CatalogRow[]);

  return lines.map((line) => {
    const catalogRow = rows.find(
      (row) => row.slug === line.slug && row.pack_name === line.pack,
    );
    if (!catalogRow) throw new UnknownLineError(line.slug, line.pack);

    const unitPriceKobo = applyDiscount(
      catalogRow.price_kobo,
      catalogRow.discount_percent,
    );

    return {
      productId: line.slug,
      name: catalogRow.name,
      slug: line.slug,
      pack: catalogRow.pack_name,
      sku: catalogRow.sku,
      unitPrice: ngn(unitPriceKobo),
      quantity: line.quantity,
      lineTotal: ngn(unitPriceKobo * line.quantity),
    };
  });
}

/** Integer kobo throughout, so this cannot drift the way float naira would. */
export function subtotalOf(items: OrderItem[]): Money {
  return ngn(items.reduce((total, item) => total + item.lineTotal.amount, 0));
}
