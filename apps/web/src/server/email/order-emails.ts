import "server-only";

import { BRAND, DELIVERY } from "@lamiefoods/config";
import type {
  CustomerDetails,
  Money,
  Order,
  OrderItem,
  PaymentMethod,
} from "@lamiefoods/types";
import { siteUrl } from "@/config/env";
import { formatKobo } from "@/lib/money";
import { escapeHtml, type Mail } from "./send";

/**
 * Order emails.
 *
 * The hard rule here: nothing in these messages may imply that money changed
 * hands before it actually has. The two emails sent at order-creation time
 * (`customerEmail`/`ownerEmail`) still say nothing was charged — that's true
 * regardless of payment method, since choosing Paystack doesn't mean the
 * popup was completed. The three emails below (`paymentConfirmedEmail`,
 * `orderShippedEmail`, `orderDeliveredEmail`) are the ones that report
 * something as having actually happened, and each is fired exactly once, at
 * the moment its own idempotency guard (`paid_at`/`shipped_at`/`delivered_at`
 * newly set — see `server/orders/repository.ts`) says it first became true.
 */
export interface OrderEmailInput {
  reference: string;
  token: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: Money;
  paymentMethod: PaymentMethod;
}

function paymentMethodNote(paymentMethod: PaymentMethod): { text: string; html: string } {
  if (paymentMethod === "paystack") {
    return {
      text: 'Pay online: open your order page and tap "Pay now" to pay securely with Paystack (card, bank transfer or USSD).',
      html: "Open your order page and tap <strong>“Pay now”</strong> to pay securely with Paystack — card, bank transfer or USSD.",
    };
  }
  return {
    text: "Pay by bank transfer: your order page has our account details and a WhatsApp button to send your payment screenshot.",
    html: "Your order page has our bank account details and a WhatsApp button to send your payment screenshot once you've transferred.",
  };
}

const deliveryWindow = `${DELIVERY.minDays}–${DELIVERY.maxDays} working days`;

function itemLines(items: OrderItem[]): string {
  return items
    .map(
      (item) =>
        `${item.quantity} × ${item.name} (${item.pack}) — ${formatKobo(item.lineTotal.amount)}`,
    )
    .join("\n");
}

function itemRows(items: OrderItem[]): string {
  return items
    .map(
      (item) => `<tr>
        <td style="padding:8px 0;border-bottom:1px solid #d8c3b0;">
          ${escapeHtml(item.name)}<br />
          <span style="color:#7a5e54;font-size:13px;">${escapeHtml(item.pack)} × ${item.quantity}</span>
        </td>
        <td style="padding:8px 0;border-bottom:1px solid #d8c3b0;text-align:right;white-space:nowrap;">
          ${formatKobo(item.lineTotal.amount)}
        </td>
      </tr>`,
    )
    .join("");
}

function shell(heading: string, body: string): string {
  return `<div style="font-family:Helvetica,Arial,sans-serif;color:#1e1b15;background:#fff8f1;padding:24px;">
    <div style="max-width:560px;margin:0 auto;background:#ffffff;padding:28px;border:1px solid #d8c3b0;">
      <p style="letter-spacing:0.14em;font-size:11px;color:#a84c2c;margin:0 0 12px;">
        ${escapeHtml(BRAND.name)}
      </p>
      <h1 style="font-size:22px;margin:0 0 16px;">${heading}</h1>
      ${body}
    </div>
  </div>`;
}

/** Sent to the customer. Confirms a record, not a payment. */
export function customerEmail(input: OrderEmailInput): Mail {
  const { reference, customer, items, subtotal, token, paymentMethod } = input;
  const link = `${siteUrl}/order-success?token=${encodeURIComponent(token)}`;
  const name = escapeHtml(customer.fullName);
  const payment = paymentMethodNote(paymentMethod);

  const text = `Hello ${customer.fullName},

We have received your order ${reference}.

${itemLines(items)}

Subtotal: ${formatKobo(subtotal.amount)}
Delivery: not yet quoted — we will confirm the cost with you by email before any payment is taken.

NOTHING HAS BEEN CHARGED YET. ${payment.text}

Delivery usually takes ${deliveryWindow} once payment and address are confirmed.

View your order: ${link}

${BRAND.displayName}
${BRAND.instagramUrl}`;

  const html = shell(
    "We have your order",
    `<p style="margin:0 0 16px;">Hello ${name}, thank you — your order
      <strong>${escapeHtml(reference)}</strong> has been recorded.</p>

     <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemRows(items)}</table>

     <table style="width:100%;border-collapse:collapse;font-size:14px;margin-top:12px;">
       <tr>
         <td style="padding:6px 0;">Subtotal</td>
         <td style="padding:6px 0;text-align:right;">${formatKobo(subtotal.amount)}</td>
       </tr>
       <tr>
         <td style="padding:6px 0;color:#7a5e54;">Delivery</td>
         <td style="padding:6px 0;text-align:right;color:#7a5e54;">Not yet quoted</td>
       </tr>
     </table>

     <p style="margin:20px 0 0;padding:14px;background:#fcd8ca;font-size:14px;">
       <strong>Nothing has been charged yet.</strong> ${payment.html}
     </p>

     <p style="margin:16px 0 0;font-size:14px;">
       Delivery usually takes ${deliveryWindow} once payment and address are confirmed.
     </p>

     <p style="margin:16px 0 0;font-size:14px;">
       <a href="${link}" style="color:#a84c2c;">View your order</a>
     </p>`,
  );

  return {
    to: customer.email,
    subject: `Your ${BRAND.displayName} order ${reference}`,
    html,
    text,
  };
}

/** Sent to the shop. Carries what is needed to actually pack and deliver. */
export function ownerEmail(input: OrderEmailInput & { to: string }): Mail {
  const { reference, customer, items, subtotal, to, paymentMethod } = input;
  const address = customer.deliveryAddress;
  const methodLine =
    paymentMethod === "paystack"
      ? "Payment method: Paystack (online). You'll get a payment-confirmed email the moment it clears — no action needed from you until then."
      : "Payment method: bank transfer via WhatsApp. Watch for their screenshot, then mark this order “Paid” from the admin once you've confirmed the transfer landed.";

  const text = `New order ${reference}

${itemLines(items)}

Subtotal: ${formatKobo(subtotal.amount)}

${customer.fullName}
${customer.phone}
${customer.email}
${address.addressLine}
Landmark: ${address.landmark}
${address.city}, ${address.state}

Unpaid so far. ${methodLine}`;

  const html = shell(
    `New order ${escapeHtml(reference)}`,
    `<table style="width:100%;border-collapse:collapse;font-size:14px;">${itemRows(items)}</table>

     <p style="margin:12px 0 0;font-size:14px;"><strong>Subtotal ${formatKobo(subtotal.amount)}</strong></p>

     <h2 style="font-size:16px;margin:24px 0 8px;">Deliver to</h2>
     <p style="margin:0;font-size:14px;line-height:1.6;">
       ${escapeHtml(customer.fullName)}<br />
       ${escapeHtml(customer.phone)}<br />
       ${escapeHtml(customer.email)}<br />
       ${escapeHtml(address.addressLine)}<br />
       Landmark: ${escapeHtml(address.landmark)}<br />
       ${escapeHtml(address.city)}, ${escapeHtml(address.state)}
     </p>

     <p style="margin:20px 0 0;padding:14px;background:#fcd8ca;font-size:14px;">
       <strong>Unpaid so far.</strong> ${escapeHtml(methodLine)}
     </p>`,
  );

  return { to, subject: `New order ${reference} — ${customer.fullName}`, html, text };
}

/**
 * Sent once, the moment `payment_status` first becomes `'paid'` — whether
 * that's Paystack's own verification or the owner manually confirming a
 * bank transfer. This is the one email in this file allowed to say money
 * has actually moved, because by the time it's called that's true.
 */
export function paymentConfirmedEmail(order: Order, accessToken: string): Mail {
  const { reference, customer } = order;
  const link = `${siteUrl}/order-success?token=${encodeURIComponent(accessToken)}`;
  const name = escapeHtml(customer.fullName);

  const text = `Hello ${customer.fullName},

We've received your payment for order ${reference} — ${formatKobo(order.subtotal.amount)}.

Your order is now being prepared. We'll email you again once it's on its way,
and delivery usually takes ${deliveryWindow} from here.

View your order: ${link}

${BRAND.displayName}`;

  const html = shell(
    "Payment received",
    `<p style="margin:0 0 16px;">Hello ${name}, we've received your payment for order
      <strong>${escapeHtml(reference)}</strong> — <strong>${formatKobo(order.subtotal.amount)}</strong>.</p>

     <p style="margin:0 0 16px;font-size:14px;">
       Your order is now being prepared. We'll email you again once it's on its
       way — delivery usually takes ${deliveryWindow} from here.
     </p>

     <p style="margin:16px 0 0;font-size:14px;">
       <a href="${link}" style="color:#a84c2c;">View your order</a>
     </p>`,
  );

  return {
    to: customer.email,
    subject: `Payment received — order ${reference}`,
    html,
    text,
  };
}

/** Sent once, the moment `status` first becomes `'shipped'`. */
export function orderShippedEmail(order: Order, accessToken: string): Mail {
  const { reference, customer } = order;
  const link = `${siteUrl}/order-success?token=${encodeURIComponent(accessToken)}`;
  const name = escapeHtml(customer.fullName);

  const text = `Hello ${customer.fullName},

Your order ${reference} is on its way!

${itemLines(order.items)}

Delivering to: ${customer.deliveryAddress.addressLine}, ${customer.deliveryAddress.city}

View your order: ${link}

${BRAND.displayName}`;

  const html = shell(
    "Your order is on its way",
    `<p style="margin:0 0 16px;">Hello ${name}, good news — order
      <strong>${escapeHtml(reference)}</strong> is on its way to you.</p>

     <table style="width:100%;border-collapse:collapse;font-size:14px;">${itemRows(order.items)}</table>

     <p style="margin:16px 0 0;font-size:14px;">
       Delivering to ${escapeHtml(customer.deliveryAddress.addressLine)},
       ${escapeHtml(customer.deliveryAddress.city)}.
     </p>

     <p style="margin:16px 0 0;font-size:14px;">
       <a href="${link}" style="color:#a84c2c;">View your order</a>
     </p>`,
  );

  return { to: customer.email, subject: `On its way — order ${reference}`, html, text };
}

/** Sent once, the moment `status` first becomes `'delivered'`. */
export function orderDeliveredEmail(order: Order, accessToken: string): Mail {
  const { reference, customer } = order;
  const link = `${siteUrl}/order-success?token=${encodeURIComponent(accessToken)}`;
  const name = escapeHtml(customer.fullName);

  const text = `Hello ${customer.fullName},

Your order ${reference} has been delivered. We hope you enjoy it!

Reach us on Instagram at ${BRAND.instagramHandle} — we'd love to see where it ends up.

View your order: ${link}

${BRAND.displayName}`;

  const html = shell(
    "Delivered",
    `<p style="margin:0 0 16px;">Hello ${name}, your order
      <strong>${escapeHtml(reference)}</strong> has been delivered. We hope you
      enjoy it!</p>

     <p style="margin:0 0 16px;font-size:14px;">
       Reach us on Instagram at
       <a href="${BRAND.instagramUrl}" style="color:#a84c2c;">${escapeHtml(BRAND.instagramHandle)}</a>
       — we'd love to see where it ends up.
     </p>

     <p style="margin:16px 0 0;font-size:14px;">
       <a href="${link}" style="color:#a84c2c;">View your order</a>
     </p>`,
  );

  return { to: customer.email, subject: `Delivered — order ${reference}`, html, text };
}
