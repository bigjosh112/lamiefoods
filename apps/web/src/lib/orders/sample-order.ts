import "server-only";

import type { Money, Order, OrderItem } from "@lamiefoods/types";
import { getProductBySlug } from "@/server/products/repository";

/**
 * A SAMPLE order, for reviewing the confirmation page via `?preview=1`.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS NOT A REAL ORDER AND NOTHING HAS BEEN PAID.
 *
 * Real orders exist now (`/order-success?token=…`), but this sample stays for
 * design review — reviewing the layout shouldn't require a real order in the
 * database. Rather than fabricate a receipt — a page that says "Total Paid"
 * and "Paid via Paystack" when nothing was actually paid is the single most
 * dangerous thing to fake on this site — this renders behind a permanent,
 * non-dismissible preview banner, and stays `unpaid` even though Paystack is
 * genuinely connected now.
 *
 * As of the real product catalogue (2026-09-07), building this needs a
 * database read (`getProductBySlug`, same source of truth the storefront
 * uses) rather than a synchronous static-content lookup — hence this is now
 * an async function, not a constant, and its one caller (`order-success/
 * page.tsx`) only calls it when `?preview=1` AND a database is configured.
 *
 * Typed as `Order` from `@lamiefoods/types`, the same type the backend
 * returns, so nothing here needs rework as the type evolves.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const ngn = (amount: number): Money => ({ amount, currency: "NGN" });

async function sampleItem(
  slug: string,
  packName: string,
  quantity: number,
): Promise<OrderItem | null> {
  const product = await getProductBySlug(slug);
  const pack = product?.packs.find((candidate) => candidate.name === packName);
  if (!product || !pack) return null;

  return {
    productId: product.slug,
    name: product.name,
    slug: product.slug,
    pack: pack.name,
    sku: pack.sku,
    unitPrice: ngn(pack.price.amount),
    quantity,
    lineTotal: ngn(pack.price.amount * quantity),
  };
}

/** Falls back gracefully to an empty item list if the sample products (or
 *  the database itself) aren't there — the preview banner already says this
 *  is not real, so an empty sample is a degraded preview, not a broken page.
 *
 *  The pack names below must exist in the catalogue or `sampleItem` returns
 *  null and the preview silently renders an empty, zero-total order. They are
 *  the owner's confirmed pouches, not the retired "250g Pouch" /
 *  "500g Gourmet Jar" this file used to name. */
export async function buildSampleOrder(): Promise<Order> {
  const candidates = await Promise.all([
    sampleItem("milky-velvet-chinchin", "300g Pouch", 2),
    sampleItem("coco-velvet-chinchin", "500g Pouch", 1),
  ]);
  const items = candidates.filter((item): item is OrderItem => item !== null);
  const subtotal = items.reduce((total, item) => total + item.lineTotal.amount, 0);

  return {
    id: "sample",
    reference: "LF-SAMPLE",
    items,
    customer: {
      fullName: "Sample Customer",
      email: "sample@example.com",
      phone: "+2348000000000",
      deliveryAddress: {
        addressLine: "1 Sample Street",
        landmark: "Sample landmark",
        city: "Lekki",
        state: "Lagos",
      },
    },
    deliveryAreaId: null,
    deliveryAreaName: null,
    subtotal: ngn(subtotal),
    // Preview still shows "not yet quoted" — real checkouts always set a fee.
    deliveryFee: null,
    total: null,
    // Mirrors what a freshly captured order actually looks like: recorded,
    // unpaid. Payment happens on a real order via Paystack,
    // and a sample claiming "paid" would misrepresent the one thing on this
    // page that must never be faked.
    status: "pending",
    paymentStatus: "unpaid",
    paymentMethod: "paystack",
    createdAt: "2026-09-06T09:00:00.000Z",
    updatedAt: "2026-09-06T09:00:00.000Z",
  };
}
