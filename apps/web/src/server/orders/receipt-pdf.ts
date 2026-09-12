import "server-only";

import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { BRAND } from "@lamiefoods/config";
import type { Money, Order, PaymentMethod, PaymentStatus } from "@lamiefoods/types";

/**
 * Builds a single-page (or multi-page if needed) order receipt PDF.
 *
 * Uses Helvetica only — no custom fonts — so the bytes stay self-contained and
 * safe on Vercel. Currency is written as "NGN …" because WinAnsi cannot encode ₦.
 */

function formatNgn(amount: Money | number): string {
  const kobo = typeof amount === "number" ? amount : amount.amount;
  const naira = Math.round(kobo) / 100;
  return `NGN ${naira.toLocaleString("en-NG", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
}

function paymentMethodLabel(method: PaymentMethod): string {
  return method === "paystack" ? "Paystack (online)" : "Bank transfer";
}

function paymentStatusLabel(status: PaymentStatus): string {
  switch (status) {
    case "paid":
      return "Paid";
    case "unpaid":
      return "Unpaid";
    case "failed":
      return "Payment failed";
    case "refunded":
      return "Refunded";
    default:
      return status;
  }
}

function formatOrderDate(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-NG", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Africa/Lagos",
  });
}

export async function buildOrderReceiptPdf(order: Order): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);

  const margin = 48;
  const pageWidth = 595.28; // A4
  const pageHeight = 841.89;
  let page = doc.addPage([pageWidth, pageHeight]);
  let y = pageHeight - margin;

  const ink = rgb(0.17, 0.09, 0.06); // cacao-ish
  const muted = rgb(0.48, 0.37, 0.33);
  const rule = rgb(0.85, 0.76, 0.69);

  const drawText = (
    text: string,
    x: number,
    size: number,
    options?: { bold?: boolean; color?: ReturnType<typeof rgb>; maxWidth?: number },
  ) => {
    const useFont = options?.bold ? fontBold : font;
    const color = options?.color ?? ink;
    const maxWidth = options?.maxWidth ?? pageWidth - margin * 2;
    // Simple wrap for long lines
    const words = text.split(/\s+/);
    let line = "";
    for (const word of words) {
      const next = line ? `${line} ${word}` : word;
      if (useFont.widthOfTextAtSize(next, size) <= maxWidth) {
        line = next;
        continue;
      }
      if (line) {
        ensureSpace(size + 4);
        page.drawText(line, { x, y, size, font: useFont, color });
        y -= size + 4;
      }
      line = word;
    }
    if (line) {
      ensureSpace(size + 4);
      page.drawText(line, { x, y, size, font: useFont, color });
      y -= size + 4;
    }
  };

  const ensureSpace = (needed: number) => {
    if (y - needed < margin) {
      page = doc.addPage([pageWidth, pageHeight]);
      y = pageHeight - margin;
    }
  };

  const drawRule = () => {
    ensureSpace(12);
    page.drawLine({
      start: { x: margin, y },
      end: { x: pageWidth - margin, y },
      thickness: 0.75,
      color: rule,
    });
    y -= 14;
  };

  const drawRow = (label: string, value: string) => {
    ensureSpace(16);
    page.drawText(label, { x: margin, y, size: 10, font, color: muted });
    const valueWidth = fontBold.widthOfTextAtSize(value, 10);
    page.drawText(value, {
      x: pageWidth - margin - valueWidth,
      y,
      size: 10,
      font: fontBold,
      color: ink,
    });
    y -= 16;
  };

  // Header
  drawText(BRAND.displayName, margin, 18, { bold: true });
  drawText("Order receipt", margin, 12, { color: muted });
  y -= 6;
  drawRule();

  drawRow("Reference", order.reference);
  drawRow("Date", formatOrderDate(order.createdAt));
  drawRow("Payment method", paymentMethodLabel(order.paymentMethod));
  drawRow("Payment status", paymentStatusLabel(order.paymentStatus));
  y -= 4;
  drawRule();

  // Items
  drawText("Items", margin, 12, { bold: true });
  y -= 4;

  for (const item of order.items) {
    const left = `${item.quantity} x ${item.name} (${item.pack})`;
    drawRow(left, formatNgn(item.lineTotal));
  }

  y -= 4;
  drawRule();
  drawRow("Subtotal", formatNgn(order.subtotal));

  if (order.deliveryFee !== null) {
    const area =
      order.deliveryAreaName != null && order.deliveryAreaName.length > 0
        ? `Delivery (${order.deliveryAreaName})`
        : "Delivery";
    drawRow(area, formatNgn(order.deliveryFee));
  } else {
    drawRow("Delivery", "Not yet quoted");
  }

  if (order.total !== null) {
    drawRow("Total", formatNgn(order.total));
  } else {
    drawRow("Total", `${formatNgn(order.subtotal)} + delivery`);
  }

  y -= 8;
  drawRule();

  // Customer
  drawText("Deliver to", margin, 12, { bold: true });
  y -= 2;
  const address = order.customer.deliveryAddress;
  drawText(order.customer.fullName, margin, 10, { bold: true });
  drawText(order.customer.phone, margin, 10, { color: muted });
  drawText(order.customer.email, margin, 10, { color: muted });
  drawText(address.addressLine, margin, 10);
  drawText(`Landmark: ${address.landmark}`, margin, 10, { color: muted });
  drawText(`${address.city}, ${address.state}`, margin, 10);

  y -= 16;
  drawText(
    `Thank you for ordering from ${BRAND.displayName}.`,
    margin,
    9,
    { color: muted },
  );
  if (order.paymentStatus !== "paid") {
    drawText(
      "Payment has not been confirmed yet — this document is an order confirmation, not proof of payment.",
      margin,
      9,
      { color: muted },
    );
  }

  return doc.save();
}
