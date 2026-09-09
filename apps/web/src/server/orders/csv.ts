import "server-only";

import type { AdminOrderExportRow } from "./repository";

const HEADERS = [
  "order_reference",
  "ordered_at",
  "customer_name",
  "customer_email",
  "customer_phone",
  "address_line",
  "landmark",
  "city",
  "state",
  "items",
  "subtotal_ngn",
  "currency",
  "payment_method",
  "payment_status",
  "fulfilment_status",
] as const;

/**
 * Customer and product text is untrusted. A leading apostrophe prevents
 * spreadsheet applications from evaluating cells as formulas; CSV quoting
 * alone does not.
 */
export function escapeCsvCell(value: string | number): string {
  let text = String(value);
  if (/^[\t\r\n ]*[=+\-@]/.test(text) || /^[\t\r\n]/.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replaceAll('"', '""')}"`;
}

export function ordersToCsv(rows: AdminOrderExportRow[]): string {
  const lines = [
    HEADERS.map(escapeCsvCell).join(","),
    ...rows.map((row) =>
      [
        row.reference,
        row.orderedAt,
        row.customerName,
        row.customerEmail,
        row.customerPhone,
        row.addressLine,
        row.landmark,
        row.city,
        row.state,
        row.itemSummary,
        (row.subtotalKobo / 100).toFixed(2),
        "NGN",
        row.paymentMethod,
        row.paymentStatus,
        row.status,
      ]
        .map(escapeCsvCell)
        .join(","),
    ),
  ];

  // The BOM makes UTF-8 customer names and the naira context open correctly
  // in Excel without changing the CSV's actual encoding.
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
