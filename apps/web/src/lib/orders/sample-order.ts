import type { Money, Order } from "@lamiefoods/types";
import { findPack, findProduct } from "@/content/products";

/**
 * A SAMPLE order, for reviewing the confirmation page.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * THIS IS NOT A REAL ORDER AND NOTHING HAS BEEN PAID.
 *
 * No order can exist yet: checkout does not submit, there is no ordering API and
 * Paystack is not integrated. The confirmation page therefore has nothing real
 * to display. Rather than fabricate a receipt — a page that says "Total Paid"
 * and "Paid via Paystack" is the single most dangerous thing to fake on this
 * site — the page renders this sample behind a permanent, non-dismissible
 * preview banner, purely so the layout can be reviewed.
 *
 * It is typed as `Order` from `@lamiefoods/types`, the same type the backend
 * will return, so the page needs no rework when real orders arrive: fetch by
 * reference, drop the sample, remove the banner.
 * ─────────────────────────────────────────────────────────────────────────────
 */
const ngn = (amount: number): Money => ({ amount, currency: "NGN" });

/** Prices come from the catalogue, so the sample cannot contradict the shop. */
function sampleItem(slug: string, packName: string, quantity: number) {
  const product = findProduct(slug);
  const pack = product && findPack(product, packName);
  if (!product || !pack) return null;

  return {
    productId: product.slug,
    name: product.name,
    slug: product.slug,
    unitPrice: ngn(pack.price),
    quantity,
    lineTotal: ngn(pack.price * quantity),
  };
}

const items = [
  sampleItem("milky-velvet-chinchin", "300g Pouch", 2),
  sampleItem("coco-velvet-chinchin", "500g Pouch", 1),
].filter((item) => item !== null);

const subtotal = items.reduce((total, item) => total + item.lineTotal.amount, 0);

export const SAMPLE_ORDER: Order = {
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
  subtotal: ngn(subtotal),
  // Delivery pricing is genuinely unset, so the sample carries zero rather than
  // inventing a fee. The page shows "confirmed at dispatch" for it.
  deliveryFee: ngn(0),
  total: ngn(subtotal),
  status: "processing",
  paymentStatus: "paid",
  createdAt: "2026-09-06T09:00:00.000Z",
  updatedAt: "2026-09-06T09:00:00.000Z",
};
