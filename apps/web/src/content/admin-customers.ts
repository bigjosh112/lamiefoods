import type { Kobo } from "@lamiefoods/types";
import { formatKobo, naira } from "@/lib/money";
import { ORDERS_ROWS } from "./admin-orders";
import { PRODUCTS } from "./products";

/**
 * SAMPLE data for the customer directory.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NONE OF THESE PEOPLE EXIST. Every patron, phone number, email, address and
 * spend figure below is invented for layout review. This is NOT a customer
 * export and must never be treated as one.
 *
 * Phone numbers stay in the 0800 000 series so they cannot dial a real person,
 * and emails use example.com, which is reserved for exactly this purpose.
 *
 * Two deliberate choices:
 *
 * 1. **Identity and contact details are derived from `ORDERS_ROWS`.** The same
 *    fictional people appear on the orders ledger, so a patron's name, phone,
 *    area and landmark cannot say one thing here and another there. When the
 *    API lands, the same derivation becomes a join on a customer id.
 *
 * 2. **Every aggregate on the page is computed from the rows below** — patron
 *    count, repeat rate, average lifetime value, dominant hub, regional spread
 *    and flavour affinity. The mock quoted round figures (312 patrons, 68%
 *    repeat rate, a 42% "industry benchmark", "100% verified KYC") that no data
 *    supports and that would have contradicted the six visible rows. Deriving
 *    them means nothing on the screen can disagree with anything else, and the
 *    same maths runs unchanged against real customers.
 *
 * The route is gated to development (see the page). When the API arrives,
 * replace this module with real fetches and remove the gate in the same change
 * — never before. This screen is nothing but customer PII.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/**
 * What one sample order is worth.
 *
 * Matches the line items in `admin-order-detail.ts` (₦7,600 + ₦8,500), so a
 * patron's spend adds up to what the order dossier shows. Kept here rather than
 * imported to avoid a circular import — order detail reads patrons from this
 * module.
 */
const LEDGER_ORDER_TOTAL: Kobo = naira(16_100);

export interface PatronOrder {
  id: string;
  /** On the current orders ledger, so the row links to a real dossier. */
  onLedger: boolean;
  when: string;
  summary: string;
  total: Kobo;
  status: "Delivered" | "Dispatched";
}

export interface Patron {
  id: string;
  name: string;
  initials: string;
  tier: string;
  email: string;
  phone: string;
  area: string;
  landmark: string;
  city: string;
  since: string;
  /** Slug from the shared catalogue — never a product that does not exist. */
  favourite: string;
  history: PatronOrder[];
  orders: number;
  spend: Kobo;
  repeat: boolean;
}

/**
 * Per-patron facts the orders ledger does not carry.
 *
 * Keyed by the name used in `ORDERS_ROWS`. Earlier orders use an `LF-83…` range
 * so they read as history rather than colliding with the live ledger page.
 */
interface PatronFacts {
  tier: string;
  city: string;
  since: string;
  favourite: string;
  past: Omit<PatronOrder, "onLedger">[];
}

const PATRON_FACTS: Record<string, PatronFacts> = {
  "Chinedu Okafor": {
    tier: "Tasting club member",
    city: "Lagos",
    since: "October 2023",
    favourite: "milky-velvet-chinchin",
    past: [
      {
        id: "LF-83912",
        when: "Last month",
        summary: "2× Milky Velvet 250g",
        total: naira(11_400),
        status: "Delivered",
      },
      {
        id: "LF-83455",
        when: "March",
        summary: "1× Coco Velvet 500g · gift wrap",
        total: naira(14_800),
        status: "Delivered",
      },
    ],
  },
  "Aisha Bello": {
    tier: "Tasting club member",
    city: "Lagos",
    since: "January 2024",
    favourite: "milky-velvet-chinchin",
    past: [
      {
        id: "LF-83778",
        when: "Six weeks ago",
        summary: "3× Milky Velvet 250g",
        total: naira(11_400),
        status: "Delivered",
      },
    ],
  },
  "Oluwaseun Davies": {
    tier: "First order",
    city: "Lagos",
    since: "This month",
    favourite: "cinnamon-chinchin",
    past: [],
  },
  "Femi Adebayo": {
    tier: "Interstate patron",
    city: "Abuja",
    since: "August 2023",
    favourite: "cinnamon-chinchin",
    past: [
      {
        id: "LF-83640",
        when: "Two months ago",
        summary: "2× Cinnamon Chinchin 500g",
        total: naira(13_200),
        status: "Delivered",
      },
      {
        id: "LF-83201",
        when: "February",
        summary: "1× Milky Velvet 250g",
        total: naira(5_700),
        status: "Delivered",
      },
    ],
  },
  "Ngozi Eze": {
    tier: "Tasting club member",
    city: "Lagos",
    since: "November 2023",
    favourite: "coco-velvet-chinchin",
    past: [
      {
        id: "LF-83504",
        when: "Last month",
        summary: "2× Coco Velvet 500g",
        total: naira(17_000),
        status: "Delivered",
      },
    ],
  },
};

/** Two-letter monogram, matching the orders table. */
const monogram = (name: string) =>
  name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0] ?? "")
    .join("")
    .toUpperCase();

const email = (name: string) => `${name.split(" ").join(".").toLowerCase()}@example.com`;

function build(
  name: string,
  facts: PatronFacts,
  contact: { phone: string; area: string; landmark: string },
  ledger: { id: string; summary: string } | null,
): Patron {
  const history: PatronOrder[] = [
    ...(ledger
      ? [
          {
            id: ledger.id,
            onLedger: true,
            when: "On the current ledger",
            summary: ledger.summary,
            total: LEDGER_ORDER_TOTAL,
            status: "Dispatched" as const,
          },
        ]
      : []),
    ...facts.past.map((order) => ({ ...order, onLedger: false })),
  ];

  return {
    id: name.split(" ").join("-").toLowerCase(),
    name,
    initials: monogram(name),
    tier: facts.tier,
    email: email(name),
    phone: contact.phone,
    area: contact.area,
    landmark: contact.landmark,
    city: facts.city,
    since: facts.since,
    favourite: facts.favourite,
    history,
    orders: history.length,
    spend: history.reduce((sum, order) => sum + order.total, 0),
    repeat: history.length >= 2,
  };
}

/** Patrons who appear on the current orders ledger. */
const fromLedger: Patron[] = ORDERS_ROWS.flatMap((row) => {
  const facts = PATRON_FACTS[row.customer];
  if (!facts) return [];

  return [
    build(
      row.customer,
      facts,
      { phone: row.phone, area: row.area, landmark: row.landmark },
      { id: row.id, summary: row.batches },
    ),
  ];
});

/**
 * A patron with no order on the current ledger page — the directory has to show
 * these too, or the empty-history case never gets designed for.
 */
const offLedger: Patron[] = [
  build(
    "Tunde Bakare",
    {
      tier: "Nationwide patron",
      city: "Port Harcourt",
      since: "May 2024",
      favourite: "coco-velvet-chinchin",
      past: [
        {
          id: "LF-83118",
          when: "Two months ago",
          summary: "1× Coco Velvet 500g",
          total: naira(8_500),
          status: "Delivered",
        },
      ],
    },
    {
      phone: "+234 800 000 5570",
      area: "Old GRA",
      landmark: "Aba Road, near the roundabout",
    },
    null,
  ),
];

export const PATRONS: Patron[] = [...fromLedger, ...offLedger];

export const findPatron = (name: string) =>
  PATRONS.find((patron) => patron.name === name);

/* ── Aggregates, all derived from the rows above ─────────────────────────── */

const totalPatrons = PATRONS.length;
const repeatPatrons = PATRONS.filter((patron) => patron.repeat);
const totalSpend = PATRONS.reduce((sum, patron) => sum + patron.spend, 0);
const totalOrders = PATRONS.reduce((sum, patron) => sum + patron.orders, 0);

const pct = (count: number) => Math.round((count / totalPatrons) * 100);

const byCity = [...new Set(PATRONS.map((patron) => patron.city))]
  .map((city) => {
    const patrons = PATRONS.filter((patron) => patron.city === city);
    return { city, count: patrons.length, share: pct(patrons.length) };
  })
  .sort((a, b) => b.count - a.count);

export const CUSTOMERS_PAGE = {
  eyebrow: "Client ledger",
  title: "Customer Directory",
  body: "Every patron who has ordered, with their contact details, delivery landmark and order history.",
  actions: [
    { label: "Export patron list (CSV)", icon: "box" as const },
    { label: "Add a patron", icon: "people" as const },
  ],
  searchPlaceholder: "Search by name, phone number or delivery area",
  /** No further pages exist, so the mock's 1 · 2 · 3 · … · 52 pager is not shown. */
  showing: `Showing all ${totalPatrons} sample patrons`,
};

export const CUSTOMERS_STATS = [
  {
    label: "Patrons",
    value: `${totalPatrons}`,
    note: "In the sample directory",
    icon: "people" as const,
  },
  {
    label: "Repeat patrons",
    value: `${repeatPatrons.length} of ${totalPatrons}`,
    note: `${pct(repeatPatrons.length)}% have ordered more than once`,
    icon: "award" as const,
  },
  {
    label: "Average lifetime spend",
    value: formatKobo(Math.round(totalSpend / totalPatrons)),
    note: `${(totalOrders / totalPatrons).toFixed(1)} orders per patron`,
    icon: "seal" as const,
  },
  {
    label: "Busiest hub",
    value: byCity[0]?.city ?? "—",
    note: `${byCity[0]?.count ?? 0} of ${totalPatrons} patrons`,
    icon: "truck" as const,
  },
];

export type PatronSegment = "all" | "repeat" | "lagos" | "nationwide";

/**
 * Segments the sample data can actually answer. The mock also had "new
 * customers this month", which needs a signup date nobody records yet.
 */
export const CUSTOMERS_SEGMENTS: {
  label: string;
  segment: PatronSegment;
  count: number;
}[] = [
  { label: "All patrons", segment: "all", count: totalPatrons },
  { label: "Repeat patrons", segment: "repeat", count: repeatPatrons.length },
  {
    label: "Lagos",
    segment: "lagos",
    count: PATRONS.filter((patron) => patron.city === "Lagos").length,
  },
  {
    label: "Outside Lagos",
    segment: "nationwide",
    count: PATRONS.filter((patron) => patron.city !== "Lagos").length,
  },
];

export const CUSTOMERS_REGIONS = {
  title: "Where patrons are",
  note: "Derived from the directory",
  rows: byCity,
};

/**
 * Flavour affinity.
 *
 * Built from the shared catalogue, so the chart can only ever show products that
 * exist. The mock's slices included a "Heritage Trio" and a "Cinnamon Spice"
 * that are not products the brand sells.
 */
export const CUSTOMERS_FLAVOURS = {
  title: "Preferred flavour",
  note: "One favourite per patron",
  slices: PRODUCTS.map((product) => {
    const count = PATRONS.filter((patron) => patron.favourite === product.slug).length;
    return {
      slug: product.slug,
      name: product.name,
      count,
      share: pct(count),
    };
  }).filter((slice) => slice.count > 0),
};

export const CUSTOMERS_OUTREACH = {
  title: "Direct outreach",
  body: "Messaging patrons about a new batch needs a messaging provider and a record of who agreed to be contacted. Neither exists, so nothing here can send.",
  note: "Consent is not recorded anywhere yet — see the gaps ledger before wiring this up.",
  cta: "Send a batch announcement",
};
