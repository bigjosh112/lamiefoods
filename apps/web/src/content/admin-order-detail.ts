import { formatKobo, naira } from "@/lib/money";
import { ORDERS_ROWS, type OrderRow } from "./admin-orders";
import { findPatron } from "./admin-customers";

/**
 * SAMPLE detail for one order.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NONE OF THIS IS REAL. Built from the sample rows so any order in the table
 * opens, but the customer, courier, addresses, payment references and timeline
 * are all invented.
 *
 * Two things the mock had that are deliberately changed:
 *   - It printed a transaction id as `pstk_live_8912903`. Committing something
 *     shaped like a LIVE Paystack reference invites someone to treat it as one;
 *     the sample uses an obviously fake `pstk_sample_` prefix.
 *   - It named a specific bank as the settlement ledger. Which bank the business
 *     settles into is real operational detail nobody has told us, so the sample
 *     does not name one.
 *
 * Phone numbers stay in the 0800 000 series so they cannot dial a real person,
 * and emails use example.com, which is reserved for exactly this.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export interface OrderLineDetail {
  name: string;
  batch: string;
  format: string;
  note: string;
  qty: number;
  unit: number;
  total: number;
  slug: string;
}

export interface OrderTimelineEntry {
  title: string;
  time: string;
  body: string;
  meta: string;
  chip?: string;
}

/** Build a detail view for one of the sample rows. */
export function buildOrderDetail(row: OrderRow) {
  const patron = findPatron(row.customer);

  const lines: OrderLineDetail[] = [
    {
      name: "Milky Velvet Chinchin",
      slug: "milky-velvet-chinchin",
      batch: "Batch MV-04",
      format: "250g artisanal wax pouch · nitrogen flush preserved",
      note: "Sweetness 4/10 · crunch density high",
      qty: 2,
      unit: naira(3_800),
      total: naira(7_600),
    },
    {
      name: "Coco Velvet Chinchin",
      slug: "coco-velvet-chinchin",
      batch: "Batch CV-11",
      format: "500g gourmet keeper glass jar · toasted flake infusion",
      note: "Cold-pressed coconut cream and vanilla",
      qty: 1,
      unit: naira(8_500),
      total: naira(8_500),
    },
  ];

  const subtotal = lines.reduce((sum, line) => sum + line.total, 0);

  return {
    row,
    breadcrumb: ["Orders ledger", "Fulfilment dossier", `#${row.id}`],

    header: {
      title: `Order #${row.id}`,
      paymentChip: "Paid via Paystack",
      /** Obviously-fake reference — see the file header. */
      reference: "AUTH_TX_SAMPLE_0294",
      placed: `Placed ${row.ago.toLowerCase()}, ${row.time}`,
      route: "Lekki corridor express",
      batchRun: "Batch run 04-CV11",
      statusLabel: "Status",
      status: "Out for delivery",
      statusOptions: [
        "Pending confirmation",
        "Paid",
        "Processing in kitchen",
        "Out for delivery",
        "Delivered",
      ],
      actions: [
        { label: "Kitchen slip", icon: "board" as const, primary: false },
        { label: "PDF invoice", icon: "box" as const, primary: false },
        { label: "Message client", icon: "chat" as const, primary: true },
      ],
    },

    items: {
      title: "Curated Line Items",
      body: "Small-batch kettle pastries.",
      chip: `${lines.length} distinct SKUs`,
      lines,
    },

    totals: {
      subtotal,
      subtotalLabel: `Pastry subtotal (${lines.reduce((n, l) => n + l.qty, 0)} units)`,
      packaging: { label: "Packaging & freshness seal", value: "Complimentary" },
      dispatch: {
        label: `Priority dispatch (${row.area})`,
        value: "Free — promo tier",
      },
      totalLabel: "Total remitted",
      total: subtotal,
      settlement: "Settled into the operational ledger",
      currencyNote: "NGN · fully cleared",
      refs: [
        { label: "Paystack reference", value: "AUTH_TX_SAMPLE_0294" },
        { label: "Transaction ID", value: "pstk_sample_8912903" },
      ],
    },

    /**
     * Read from the customer directory rather than restated here, so the two
     * screens cannot disagree about the same person. The chip, email and
     * lifetime figure used to be hardcoded and identical for every order.
     */
    patron: {
      title: "Patron Dossier",
      chip: patron?.tier ?? "Patron",
      name: row.customer,
      email: patron?.email ?? "",
      lifetime: patron
        ? `Lifetime spend ${formatKobo(patron.spend)} · ${patron.orders} orders`
        : "No order history recorded",
      phoneLabel: "Mobile",
      phone: row.phone,
      phoneNote: "Primary contact",
      /**
       * The mock said "Active & verified · opted in for order updates". Nothing
       * records messaging consent, so claiming someone opted in would be an
       * invented permission — and acting on it is exactly how a business ends up
       * messaging people who never agreed.
       */
      whatsappLabel: "WhatsApp status",
      whatsapp: "Not recorded",
      whatsappNote: "No messaging consent is captured anywhere yet",
      cta: "View patron profile",
    },

    timeline: {
      title: "Kitchen & Dispatch Timeline",
      body: "Ledger of kettle processing and courier handover.",
      chip: "In transit",
      entries: [
        {
          title: "Order received & funds verified",
          time: "14:28 WAT",
          body: "Payment verified via Paystack. Production ticket raised into kettle bay 02.",
          meta: "Webhook ID whk_sample_confirmed · operator: system",
        },
        {
          title: "Packaging & sealing",
          time: "14:45 WAT",
          body: "Batches MV-04 and CV-11 drawn from rest racks. Double wax wrap applied with inspection tag.",
          meta: "Quality lead: N. A. · seal integrity passed",
        },
        {
          title: "Handed over to courier",
          time: "15:30 WAT",
          body: "Dispatched via express fleet. Carrier assigned aboard thermal pannier bike #4.",
          meta: "Courier: Babatunde · +234 800 000 2731",
          chip: "Active dispatch",
        },
      ] satisfies OrderTimelineEntry[],
      courier: {
        name: "Babatunde (express courier)",
        note: `En route to ${row.area}`,
        cta: "Call courier",
      },
    },

    delivery: {
      title: "Delivery & Geolocation",
      chip: "Lekki node",
      /** No mapping provider and no GPS feed — placeholder, not a fake map. */
      mapPlaceholder: "Delivery location map",
      area: row.area,
      zone: "Lagos island delivery zone A",
      addressLabel: "Destination address",
      address: `Flat 4B, Admiralty Towers, ${row.landmark.replace(/…$/, "")}, ${row.area}, Lagos`,
      instructionsLabel: "Gate & landmark instructions",
      instructions:
        "Opposite the supermarket, beside the bank entrance. Security at the gate is cleared for Lamie Foods dispatch.",
    },

    notes: {
      title: "Internal Atelier Notes",
      body: "Confidential preparation and handling remarks. Visible to staff only.",
      existing: "Customer requested extra wax wrapping for gifting.",
      saved: "Last saved today at 14:32",
      cta: "Save note",
    },
  };
}

/** Look up a sample order by id. */
export const findOrderRow = (id: string) =>
  ORDERS_ROWS.find((row) => row.id.toLowerCase() === id.toLowerCase());
