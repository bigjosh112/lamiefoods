import { ADMIN_ROUTES } from "@lamiefoods/config";
import { naira } from "@/lib/money";

/**
 * SAMPLE data for the admin dashboard.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NONE OF THIS IS REAL. Every figure, order and person below is invented.
 *
 * There is no backend, no orders table and no customers — so the dashboard has
 * nothing real to show. The people named here are fictional and the addresses
 * are illustrative; they are NOT customers and must never be mistaken for a
 * data export.
 *
 * The route is gated to development only (see `app/admin/(portal)/layout.tsx`).
 * When the API arrives, replace this module with real fetches and delete the
 * gate in the same change — never before, because the moment this page renders
 * live data it is rendering customer PII and revenue on an unauthenticated URL.
 * ─────────────────────────────────────────────────────────────────────────────
 */

/** Sidebar sections, matching the design's grouping. */
export const ADMIN_NAV_SECTIONS = [
  {
    title: "Enterprise ledger",
    items: [
      { label: "Dashboard", href: ADMIN_ROUTES.dashboard, icon: "award" as const },
      { label: "Orders & Payouts", href: ADMIN_ROUTES.orders, icon: "box" as const },
      { label: "Products & SKUs", href: ADMIN_ROUTES.products, icon: "gift" as const },
      { label: "Customers", href: ADMIN_ROUTES.customers, icon: "people" as const },
      {
        label: "Inventory & Kettles",
        href: ADMIN_ROUTES.inventory,
        icon: "timer" as const,
      },
    ],
  },
  {
    title: "Configuration",
    items: [{ label: "Settings", href: "/admin/settings", icon: "gear" as const }],
  },
];

/**
 * The operator shown in the sidebar and top bar.
 *
 * SAMPLE, like everything else here — nobody is signed in, because there is no
 * authentication. Sign-out is disabled for the same reason: there is no session
 * to end. Replace with the real session user when auth lands.
 */
export const ADMIN_USER = { name: "Operations Lead", location: "Lagos HQ" };

export const ADMIN_RANGES = [
  { label: "Today", icon: null },
  { label: "7 days", icon: null },
  { label: "30 days", icon: null },
  { label: "Custom", icon: "calendar" as const },
];

export const ADMIN_STATS = [
  {
    label: "Settled revenue",
    value: naira(1_842_500),
    isMoney: true,
    delta: "+13.4%",
    note: "Paystack-settled, this period",
  },
  {
    label: "Batches & orders",
    value: 148,
    isMoney: false,
    delta: "12 pending",
    note: "Average ₦12,400 per order",
  },
  {
    label: "Customers",
    value: 312,
    isMoney: false,
    delta: "68% repeat",
    note: "Lagos and Abuja concentrated",
  },
  {
    label: "Active flavours",
    value: 3,
    isMoney: false,
    delta: "2 in development",
    note: "Milky Velvet, Coco Velvet, Cinnamon",
  },
];

/** Daily revenue in naira, per flavour, for the trend chart. */
export const ADMIN_REVENUE_SERIES = {
  days: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
  series: [
    { name: "Milky Velvet", values: [98, 112, 104, 138, 152, 176, 152] },
    { name: "Coco Velvet", values: [54, 61, 58, 66, 72, 81, 68] },
    { name: "Cinnamon Spice", values: [31, 36, 34, 39, 44, 51, 43] },
  ],
  /** Values above are in thousands of naira, to keep the axis readable. */
  unit: "₦'000",
  totals: [
    { name: "Milky Velvet", value: naira(152_400), delta: "+22%" },
    { name: "Coco Velvet", value: naira(68_200), delta: "+8.4%" },
    { name: "Cinnamon Spice", value: naira(42_800), delta: "-3.1%" },
  ],
};

export const ADMIN_BEST_SELLERS = [
  { name: "Milky Velvet Chinchin", jars: 142, share: 58, note: "Repeat-purchase leader" },
  { name: "Coco Velvet Chinchin", jars: 84, share: 26, note: "Strongest coastal demand" },
  { name: "Cinnamon Chinchin", jars: 39, share: 16, note: "Seasonal spike expected" },
];

export const ADMIN_STOCK = [
  {
    name: "250g stand-up pouches",
    detail: "420 in stock — comfortable",
    level: "ok" as const,
    action: null,
  },
  {
    name: "500g gourmet glass jars",
    detail: "18 remaining — risks stalling a kettle run",
    level: "low" as const,
    action: "Reorder",
  },
  {
    name: "Whole nutmeg",
    detail: "Below the 2.5kg reorder threshold",
    level: "ordered" as const,
    action: "PO sent",
  },
];

/**
 * Fictional dispatch rows. Names and addresses are invented for layout review.
 */
export const ADMIN_DISPATCHES = [
  {
    id: "LF-84291",
    customer: "A. Bello",
    area: "Ikoyi, Lagos",
    items: "3× Milky Velvet (500g) · 1× Coco Velvet (250g)",
    value: naira(24_500),
    payment: "Paid" as const,
    fulfilment: "Kettle prep" as const,
  },
  {
    id: "LF-84290",
    customer: "F. Adeleke",
    area: "Lekki Phase 1, Lagos",
    items: "2× Cinnamon (250g) · 1× Milky Velvet (250g)",
    value: naira(11_200),
    payment: "Paid" as const,
    fulfilment: "In transit" as const,
  },
  {
    id: "LF-84289",
    customer: "K. Alade",
    area: "Maitama, Abuja",
    items: "6× Assorted reserve box",
    value: naira(48_000),
    payment: "Pending" as const,
    fulfilment: "Courier pack" as const,
  },
  {
    id: "LF-84288",
    customer: "Z. Kyari",
    area: "Victoria Island, Lagos",
    items: "4× Coco Velvet (500g)",
    value: naira(22_000),
    payment: "Paid" as const,
    fulfilment: "Delivered" as const,
  },
];

export const ADMIN_FLEET_CARD = {
  eyebrow: "Last-mile dispatch",
  title: "Rider Fleet Active",
  trackingBoard: "Open dispatch fleet tracking board",
};

export const ADMIN_FLEET = [
  {
    zone: "Lekki Phase 1 & Chevron",
    detail: "4 active drops",
    status: "active" as const,
  },
  {
    zone: "Ikoyi & Victoria Island",
    detail: "6 active drops",
    status: "active" as const,
  },
  {
    zone: "Abuja (flight express)",
    detail: "2 bags manifested",
    status: "active" as const,
  },
  {
    zone: "Nationwide waybills (GIG)",
    detail: "Ready 16:00",
    status: "pending" as const,
  },
];
