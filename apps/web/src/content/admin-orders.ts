import { naira } from "@/lib/money";

/**
 * SAMPLE data for the admin orders screen.
 *
 * ─────────────────────────────────────────────────────────────────────────────
 * NONE OF THIS IS REAL. The people, phone numbers, addresses and order values
 * below are invented for layout review. They are NOT customers and must never
 * be treated as a data export.
 *
 * Phone numbers use the 0800 000 series precisely so they cannot dial a real
 * person — the mock used plausible live numbers, which is a bad thing to commit
 * to a repository.
 *
 * The route is gated to development (see the page). When the API arrives,
 * replace this module with real fetches and remove the gate in the same change
 * — never before, since this screen is customer PII and revenue.
 * ─────────────────────────────────────────────────────────────────────────────
 */
export const ORDERS_PAGE = {
  eyebrow: "Culinary logistics & routing",
  batchCycle: "Batch cycle #088",
  title: "Customer Orders & Batch Fulfilment",
  totalChip: "148 total active orders",
  body: "Monitor Paystack reconciliations, kettle batch allocation, and courier dispatch across Lagos and interstate hubs.",
  actions: [
    { label: "Export CSV ledger", icon: "box" as const, primary: false },
    { label: "Print dispatch slips", icon: "board" as const, primary: false },
    { label: "Assign dispatch courier", icon: "truck" as const, primary: true },
  ],
};

export const ORDERS_STATS = [
  {
    label: "Today's revenue",
    value: naira(482_500),
    isMoney: true,
    note: "+14.2% vs yesterday",
    icon: "seal" as const,
  },
  {
    label: "Kitchen backlog",
    value: "24 batches",
    isMoney: false,
    note: "Average fry time 18 mins",
    icon: "timer" as const,
  },
  {
    label: "Riders in transit",
    value: "12 couriers",
    isMoney: false,
    note: "8 island, 4 mainland",
    icon: "truck" as const,
  },
  {
    label: "Fulfilment velocity",
    value: "94.8%",
    isMoney: false,
    note: "Target met (>90%)",
    icon: "award" as const,
  },
];

export const ORDERS_TABS: OrdersTab[] = [
  { label: "All", count: 148 },
  { label: "Pending confirmation", count: 4 },
  { label: "Paid via Paystack", count: 18 },
  { label: "Processing in kitchen", count: 24 },
  { label: "Out for delivery", count: 12 },
  { label: "Delivered", count: null },
];

export const ORDERS_FILTERS = {
  searchPlaceholder: "Search by order ID, customer name or phone number",
  range: "Last 30 days",
  hub: "All shipping hubs",
};

export interface OrderRow {
  id: string;
  kind: string;
  ago: string;
  time: string;
  customer: string;
  phone: string;
  area: string;
  landmark: string;
  batches: string;
  batchNote: string;
}

export interface OrdersTab {
  label: string;
  count: number | null;
}

export interface OrdersPagination {
  showing: string;
  total: number;
  page: number;
  pages: number;
}

/** Fictional orders. See the file header — nothing here is real. */
export const ORDERS_ROWS: OrderRow[] = [
  {
    id: "LF-84291",
    kind: "Box pack #22",
    ago: "10 mins ago",
    time: "14:42 WAT",
    customer: "Chinedu Okafor",
    phone: "+234 800 000 0041",
    area: "Lekki Phase 1",
    landmark: "Near Admiralty Way / Circa Mall gate",
    batches: "2× Milky Velvet 250g",
    batchNote: "1× Coco Velvet 500g glass decanter",
  },
  {
    id: "LF-84290",
    kind: "Fresh fry kettle 02",
    ago: "45 mins ago",
    time: "14:07 WAT",
    customer: "Aisha Bello",
    phone: "+234 800 000 2910",
    area: "Victoria Island",
    landmark: "Ahmadu Bello Way (Zenith Bank…)",
    batches: "3× Milky Velvet 250g stand-up pouch",
    batchNote: "Terroir batch #12",
  },
  {
    id: "LF-84289",
    kind: "Pre-order gift bag",
    ago: "2 hrs ago",
    time: "12:50 WAT",
    customer: "Oluwaseun Davies",
    phone: "+234 800 000 6620",
    area: "Ikeja GRA",
    landmark: "Isaac John St (opposite Radisson)",
    batches: "1× Heritage trio collection",
    batchNote: "Cinnamon, nutmeg, saffron reserve",
  },
  {
    id: "LF-84288",
    kind: "Air waybill manifest",
    ago: "3 hrs ago",
    time: "11:32 WAT",
    customer: "Femi Adebayo",
    phone: "+234 800 000 3901",
    area: "Abuja express dispatch",
    landmark: "Maitama (Mississippi St, consular…)",
    batches: "2× Cinnamon Chinchin 500g",
    batchNote: "Interstate vacuum seal pack",
  },
  {
    id: "LF-84287",
    kind: "POD confirmation signed",
    ago: "Yesterday",
    time: "18:14 WAT",
    customer: "Ngozi Eze",
    phone: "+234 800 000 9912",
    area: "Ikoyi",
    landmark: "Banana Island Rd (Ocean Parade…)",
    batches: "4× Milky Velvet 250g",
    batchNote: "2× Coco Velvet 500g glass decanter",
  },
];

export const ORDERS_PAGINATION: OrdersPagination = {
  showing: "1 – 5",
  total: 148,
  page: 1,
  pages: 30,
};

export const ORDERS_BATCH_ACTIONS = [
  { label: "Mark selected as dispatched", icon: "truck" as const },
  { label: "Generate courier labels", icon: "board" as const },
];

/**
 * Delivery clusters.
 *
 * The mock badged this "Live GPS feed" over a map screenshot. There is no GPS
 * feed and no mapping provider, so no live badge is shown and the map area is a
 * labelled placeholder. The cluster counts below are the actual information the
 * card carries; the map was decoration.
 */
export const ORDERS_CLUSTERS = {
  eyebrow: "Regional logistics routing",
  title: "Active Delivery Clusters (Lagos)",
  placeholder: "Delivery cluster map",
  zones: [
    { name: "Lekki–Epe axis", orders: 34 },
    { name: "Ikoyi & Victoria Island", orders: 52 },
    { name: "Ikeja hub", orders: 28 },
  ],
  transit: "Average transit 42 mins",
  footer: [
    { label: "Courier SLA compliance", value: "97.4%" },
    { label: "Standard cut-off", value: "16:30 WAT" },
  ],
};

export const ORDERS_RESERVES = {
  eyebrow: "Production floor",
  status: "Kettle 01 & 04 hot",
  title: "Fulfilment Reserves",
  body: "Status of chin-chin dough cooling and sealed pouching.",
  items: [
    { name: "Milky Velvet (250g jar)", pct: 82, state: "Prepared" },
    { name: "Coco Velvet (dark cacao 500g)", pct: 45, state: "In kettle" },
    { name: "Heritage saffron reserve (gift box)", pct: 95, state: "Packaging sealed" },
  ],
  signOff: "Direct QA sign-off by lead frymaster",
};
