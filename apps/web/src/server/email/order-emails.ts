import "server-only";

import { ADMIN_ROUTES, BRAND, DELIVERY } from "@lamiefoods/config";
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
 * popup was completed. The payment / processing / shipped / delivered /
 * cancelled emails below (`paymentConfirmedEmail`,
 * `ownerPaymentConfirmedEmail`, `orderProcessingEmail` /
 * `ownerProcessingEmail`, `orderShippedEmail` / `ownerShippedEmail`,
 * `orderDeliveredEmail` / `ownerDeliveredEmail`, `orderCancelledEmail` /
 * `ownerCancelledEmail`) are the ones that report something as having
 * actually happened, and each is fired exactly once — payment/shipped/
 * delivered via their timestamp guards, processing via the forward-only
 * `paid` → `processing` transition, and cancelled via the first move to
 * `'cancelled'` (see `server/orders/repository.ts`). Cancel copy never
 * invents a refund. Shop copies only send when `ORDER_EMAIL_TO` is set.
 *
 * HTML is table + inline styles only (email-client safe). Colors match
 * frontend-conventions brand tokens, hardcoded as hex for the mail client.
 */
export interface OrderEmailInput {
  reference: string;
  token: string;
  customer: CustomerDetails;
  items: OrderItem[];
  subtotal: Money;
  deliveryFee: Money;
  deliveryAreaName: string;
  total: Money;
  paymentMethod: PaymentMethod;
}

const C = {
  canvas: "#fff8f1",
  card: "#ffffff",
  cacao: "#2b1810",
  terracotta: "#a84c2c",
  rule: "#d8c3b0",
  nutmeg: "#7a5e54",
  chip: "#fcd8ca",
  linen: "#f4ece1",
  ink: "#1e1b15",
} as const;

function paymentMethodNote(paymentMethod: PaymentMethod): { text: string; html: string } {
  if (paymentMethod === "paystack") {
    return {
      text: 'Pay online: open your order page and tap "Pay now" to pay securely with Paystack (card, bank transfer or USSD).',
      html: "Open your order page and tap <strong>“Pay now”</strong> to pay securely with Paystack — card, bank transfer or USSD.",
    };
  }
  return {
    text: "Pay by bank transfer: open your order page for account details (when available) and a WhatsApp button to send your payment screenshot.",
    html: "Open your order page for our bank account details (when available) and a WhatsApp button to send your payment screenshot once you've transferred.",
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
        <td style="padding:12px 0;border-bottom:1px solid ${C.rule};vertical-align:top;">
          <span style="font-size:15px;color:${C.ink};font-weight:600;">${escapeHtml(item.name)}</span><br />
          <span style="color:${C.nutmeg};font-size:13px;line-height:1.5;">${escapeHtml(item.pack)} × ${item.quantity}</span>
        </td>
        <td style="padding:12px 0;border-bottom:1px solid ${C.rule};text-align:right;white-space:nowrap;vertical-align:top;font-size:15px;color:${C.ink};">
          ${formatKobo(item.lineTotal.amount)}
        </td>
      </tr>`,
    )
    .join("");
}

function statusPill(label: string): string {
  return `<span style="display:inline-block;margin:0 0 16px;padding:6px 12px;background:${C.chip};color:${C.terracotta};font-size:12px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;border-radius:999px;">${escapeHtml(label)}</span>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0 0;">
    <tr>
      <td style="background:${C.terracotta};border-radius:4px;">
        <a href="${href}" style="display:inline-block;padding:14px 22px;font-size:14px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;color:${C.linen};text-decoration:none;">
          ${escapeHtml(label)}
        </a>
      </td>
    </tr>
  </table>`;
}

function amountCallout(
  label: string,
  amountKobo: number,
  note = "Products + delivery for your selected area",
): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 20px;background:${C.canvas};border:1px solid ${C.rule};border-radius:4px;">
    <tr>
      <td style="padding:18px 20px;">
        <p style="margin:0 0 6px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${C.nutmeg};">${escapeHtml(label)}</p>
        <p style="margin:0;font-size:28px;line-height:1.2;font-weight:700;color:${C.cacao};">${formatKobo(amountKobo)}</p>
        <p style="margin:8px 0 0;font-size:13px;color:${C.nutmeg};">${escapeHtml(note)}</p>
      </td>
    </tr>
  </table>`;
}

function owedAmount(order: Pick<Order, "subtotal" | "total">): number {
  return order.total?.amount ?? order.subtotal.amount;
}

function customerCard(customer: CustomerDetails): string {
  const address = customer.deliveryAddress;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:8px 0 0;background:${C.canvas};border:1px solid ${C.rule};border-radius:4px;">
    <tr>
      <td style="padding:18px 20px;">
        <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${C.nutmeg};">Customer</p>
        <p style="margin:0;font-size:16px;font-weight:700;color:${C.cacao};">${escapeHtml(customer.fullName)}</p>
        <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:${C.ink};">
          ${escapeHtml(customer.phone)}<br />
          ${escapeHtml(customer.email)}<br />
          ${escapeHtml(address.addressLine)}<br />
          Landmark: ${escapeHtml(address.landmark)}<br />
          ${escapeHtml(address.city)}, ${escapeHtml(address.state)}
        </p>
      </td>
    </tr>
  </table>`;
}

function addressBlock(customer: CustomerDetails): string {
  const address = customer.deliveryAddress;
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0;background:${C.canvas};border:1px solid ${C.rule};border-radius:4px;">
    <tr>
      <td style="padding:16px 18px;">
        <p style="margin:0;font-size:14px;line-height:1.6;color:${C.ink};">
          ${escapeHtml(address.addressLine)}, ${escapeHtml(address.city)}
        </p>
      </td>
    </tr>
  </table>`;
}

function notice(html: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:20px 0 0;background:${C.chip};border-radius:4px;">
    <tr>
      <td style="padding:14px 16px;font-size:14px;line-height:1.55;color:${C.cacao};">${html}</td>
    </tr>
  </table>`;
}

type ProgressStep = "placed" | "paid" | "preparing" | "shipped" | "delivered";

const PROGRESS_STEPS: { id: ProgressStep; label: string }[] = [
  { id: "placed", label: "Placed" },
  { id: "paid", label: "Paid" },
  { id: "preparing", label: "Preparing" },
  { id: "shipped", label: "On the way" },
  { id: "delivered", label: "Delivered" },
];

function progressSteps(active: ProgressStep): string {
  const activeIndex = PROGRESS_STEPS.findIndex((step) => step.id === active);
  const cells = PROGRESS_STEPS.map((step, index) => {
    const isActive = index === activeIndex;
    const isPast = index < activeIndex;
    const color = isActive ? C.terracotta : isPast ? C.cacao : C.nutmeg;
    const weight = isActive || isPast ? "700" : "500";
    const dotBg = isActive ? C.terracotta : isPast ? C.cacao : C.rule;
    const connector =
      index < PROGRESS_STEPS.length - 1
        ? `<td style="width:8px;padding:0;vertical-align:top;padding-top:5px;">
             <div style="height:2px;background:${index < activeIndex ? C.cacao : C.rule};font-size:0;line-height:0;">&nbsp;</div>
           </td>`
        : "";
    return `<td style="padding:0;text-align:center;vertical-align:top;">
      <div style="width:12px;height:12px;margin:0 auto 6px;border-radius:50%;background:${dotBg};font-size:0;line-height:0;">&nbsp;</div>
      <span style="font-size:10px;line-height:1.2;font-weight:${weight};color:${color};letter-spacing:0.02em;">${escapeHtml(step.label)}</span>
    </td>${connector}`;
  }).join("");

  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 22px;">
    <tr>${cells}</tr>
  </table>`;
}

function sectionLabel(title: string): string {
  return `<p style="margin:20px 0 8px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${C.nutmeg};font-weight:700;">${escapeHtml(title)}</p>`;
}

function orderRefBanner(reference: string): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 18px;background:${C.canvas};border:1px solid ${C.rule};border-radius:4px;">
    <tr>
      <td style="padding:14px 16px;">
        <p style="margin:0 0 4px;font-size:11px;letter-spacing:0.1em;text-transform:uppercase;color:${C.nutmeg};">Order reference</p>
        <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.04em;color:${C.cacao};">${escapeHtml(reference)}</p>
      </td>
    </tr>
  </table>`;
}

function itemsSection(items: OrderItem[], title = "Your items"): string {
  return `${sectionLabel(title)}
     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">${itemRows(items)}</table>`;
}

function shell(
  heading: string,
  body: string,
  options?: { status?: string; footerNote?: string },
): string {
  const status = options?.status ? statusPill(options.status) : "";
  const footerNote =
    options?.footerNote ??
    `You're receiving this because of an order with ${BRAND.displayName}.`;

  return `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:0;background:${C.canvas};">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:${C.canvas};">
    <tr>
      <td style="padding:28px 16px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;margin:0 auto;background:${C.card};border:1px solid ${C.rule};border-radius:6px;overflow:hidden;font-family:Helvetica,Arial,sans-serif;color:${C.ink};">
          <tr>
            <td style="background:${C.cacao};padding:22px 28px;">
              <p style="margin:0;font-size:18px;font-weight:700;letter-spacing:0.02em;color:${C.linen};">${escapeHtml(BRAND.displayName)}</p>
              <p style="margin:6px 0 0;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:${C.chip};">Order update</p>
            </td>
          </tr>
          <tr>
            <td style="padding:28px;">
              ${status}
              <h1 style="margin:0 0 16px;font-size:24px;line-height:1.25;font-weight:700;color:${C.cacao};">${heading}</h1>
              ${body}
            </td>
          </tr>
          <tr>
            <td style="padding:18px 28px 24px;border-top:1px solid ${C.rule};background:${C.canvas};">
              <p style="margin:0;font-size:13px;line-height:1.6;color:${C.nutmeg};">
                ${escapeHtml(BRAND.displayName)} ·
                <a href="${BRAND.instagramUrl}" style="color:${C.terracotta};text-decoration:none;">${escapeHtml(BRAND.instagramHandle)}</a>
              </p>
              <p style="margin:8px 0 0;font-size:12px;line-height:1.5;color:${C.nutmeg};">${escapeHtml(footerNote)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/** Sent to the customer. Confirms a record, not a payment. */
export function customerEmail(input: OrderEmailInput): Mail {
  const {
    reference,
    customer,
    items,
    subtotal,
    deliveryFee,
    deliveryAreaName,
    total,
    token,
    paymentMethod,
  } = input;
  const link = `${siteUrl}/order-success?token=${encodeURIComponent(token)}`;
  const name = escapeHtml(customer.fullName);
  const payment = paymentMethodNote(paymentMethod);

  const text = `Hello ${customer.fullName},

We have received your order ${reference}.

${itemLines(items)}

Subtotal: ${formatKobo(subtotal.amount)}
Delivery (${deliveryAreaName}): ${formatKobo(deliveryFee.amount)}
Total due: ${formatKobo(total.amount)}

NOTHING HAS BEEN CHARGED YET. ${payment.text}

Delivery usually takes ${deliveryWindow} once payment and address are confirmed.

View your order: ${link}

${BRAND.displayName}
${BRAND.instagramUrl}`;

  const html = shell(
    "We have your order",
    `<p style="margin:0 0 4px;font-size:12px;letter-spacing:0.08em;text-transform:uppercase;color:${C.nutmeg};">Order ${escapeHtml(reference)}</p>
     <p style="margin:0 0 18px;font-size:15px;line-height:1.55;">Hello ${name}, thank you — your order has been recorded.</p>

     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">${itemRows(items)}</table>

     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;font-size:14px;">
       <tr>
         <td style="padding:10px 0;">Subtotal</td>
         <td style="padding:10px 0;text-align:right;">${formatKobo(subtotal.amount)}</td>
       </tr>
       <tr>
         <td style="padding:0 0 4px;color:${C.nutmeg};">Delivery (${escapeHtml(deliveryAreaName)})</td>
         <td style="padding:0 0 4px;text-align:right;color:${C.nutmeg};">${formatKobo(deliveryFee.amount)}</td>
       </tr>
       <tr>
         <td style="padding:10px 0;font-weight:600;">Total due</td>
         <td style="padding:10px 0;text-align:right;font-weight:600;">${formatKobo(total.amount)}</td>
       </tr>
     </table>

     ${notice(`<strong>Nothing has been charged yet.</strong> ${payment.html}`)}

     <p style="margin:16px 0 0;font-size:14px;line-height:1.55;color:${C.nutmeg};">
       Delivery usually takes ${deliveryWindow} once payment and address are confirmed.
     </p>

     ${ctaButton(link, "View your order")}`,
    { status: "Order received" },
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
  const {
    reference,
    customer,
    items,
    subtotal,
    deliveryFee,
    deliveryAreaName,
    total,
    to,
    paymentMethod,
  } = input;
  const address = customer.deliveryAddress;
  const methodLine =
    paymentMethod === "paystack"
      ? "Payment method: Paystack (online). You'll get a payment-confirmed email the moment it clears — no action needed from you until then."
      : "Payment method: bank transfer via WhatsApp. Watch for their screenshot, then mark this order “Paid” from the admin once you've confirmed the transfer landed.";
  const adminLink = `${siteUrl}${ADMIN_ROUTES.order(reference)}`;

  const text = `New order ${reference}

${itemLines(items)}

Subtotal: ${formatKobo(subtotal.amount)}
Delivery (${deliveryAreaName}): ${formatKobo(deliveryFee.amount)}
Total due: ${formatKobo(total.amount)}

${customer.fullName}
${customer.phone}
${customer.email}
${address.addressLine}
Landmark: ${address.landmark}
${address.city}, ${address.state}

Unpaid so far. ${methodLine}

Open in admin: ${adminLink}`;

  const html = shell(
    `New order ${escapeHtml(reference)}`,
    `${amountCallout("Total due", total.amount)}

     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="font-size:14px;">${itemRows(items)}</table>

     <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-top:8px;font-size:14px;">
       <tr>
         <td style="padding:10px 0;">Subtotal</td>
         <td style="padding:10px 0;text-align:right;">${formatKobo(subtotal.amount)}</td>
       </tr>
       <tr>
         <td style="padding:0 0 4px;color:${C.nutmeg};">Delivery (${escapeHtml(deliveryAreaName)})</td>
         <td style="padding:0 0 4px;text-align:right;color:${C.nutmeg};">${formatKobo(deliveryFee.amount)}</td>
       </tr>
     </table>

     ${customerCard(customer)}

     ${notice(`<strong>Unpaid so far.</strong> ${escapeHtml(methodLine)}`)}

     ${ctaButton(adminLink, "Open in admin")}`,
    {
      status: "Awaiting payment",
      footerNote: "Shop notification for a new Lamie Foods order.",
    },
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
  const paid = owedAmount(order);
  const areaNote = order.deliveryAreaName
    ? ` (including delivery to ${order.deliveryAreaName})`
    : "";

  const text = `Hello ${customer.fullName},

We've received your payment for order ${reference} — ${formatKobo(paid)}${areaNote}.

We'll email you again once your order is on its way. Delivery usually takes ${deliveryWindow} after dispatch.

View your order: ${link}

${BRAND.displayName}`;

  const html = shell(
    "Payment received",
    `${orderRefBanner(reference)}
     ${progressSteps("paid")}
     <p style="margin:0 0 18px;font-size:15px;line-height:1.55;">Hello ${name}, thank you — we've received your payment.</p>

     ${amountCallout("Amount paid", paid)}

     <p style="margin:0;font-size:14px;line-height:1.55;color:${C.nutmeg};">
       We'll email you again once your order is on its way — delivery usually
       takes ${deliveryWindow} after dispatch.
     </p>

     ${ctaButton(link, "View your order")}`,
    { status: "Payment received" },
  );

  return {
    to: customer.email,
    subject: `Payment received — order ${reference}`,
    html,
    text,
  };
}

/**
 * Sent to the shop once, the same moment the customer payment-confirmed
 * email fires. Fulfils the promise in `ownerEmail`'s Paystack copy. Only
 * called when `ORDER_EMAIL_TO` is set.
 */
export function ownerPaymentConfirmedEmail(order: Order, to: string): Mail {
  const { reference, customer } = order;
  const adminLink = `${siteUrl}${ADMIN_ROUTES.order(reference)}`;
  const method =
    order.paymentMethod === "paystack" ? "Paystack" : "bank transfer (manual)";
  const paid = owedAmount(order);
  const areaLine = order.deliveryAreaName
    ? `Delivery area: ${order.deliveryAreaName}`
    : "Delivery area: (legacy order — none recorded)";

  const text = `Payment received for order ${reference}

${formatKobo(paid)} total (products + delivery).
Paid via ${method}.
${areaLine}

${customer.fullName}
${customer.phone}
${customer.email}
${customer.deliveryAddress.addressLine}
Landmark: ${customer.deliveryAddress.landmark}
${customer.deliveryAddress.city}, ${customer.deliveryAddress.state}

Open in admin: ${adminLink}

${BRAND.displayName}`;

  const html = shell(
    `Paid — ${escapeHtml(reference)}`,
    `<p style="margin:0 0 18px;font-size:15px;line-height:1.55;">
       Payment cleared via <strong>${escapeHtml(method)}</strong>.
     </p>

     ${amountCallout("Amount received", paid)}

     <p style="margin:0 0 16px;font-size:14px;color:${C.nutmeg};">${escapeHtml(areaLine)}</p>

     ${customerCard(customer)}

     ${ctaButton(adminLink, "Open in admin")}`,
    {
      status: "Paid",
      footerNote: "Shop notification — payment cleared on a Lamie Foods order.",
    },
  );

  return {
    to,
    subject: `Payment received — ${reference} — ${customer.fullName}`,
    html,
    text,
  };
}

/** Sent once, the moment `status` first becomes `'processing'`. */
export function orderProcessingEmail(order: Order, accessToken: string): Mail {
  const { reference, customer } = order;
  const link = `${siteUrl}/order-success?token=${encodeURIComponent(accessToken)}`;
  const name = escapeHtml(customer.fullName);

  const text = `Hello ${customer.fullName},

We're preparing your order ${reference}.

${itemLines(order.items)}

Delivering to: ${customer.deliveryAddress.addressLine}, ${customer.deliveryAddress.city}

We'll email you again once it's on its way. Delivery usually takes ${deliveryWindow} after dispatch.

View your order: ${link}

${BRAND.displayName}`;

  const html = shell(
    "We're preparing your order",
    `${orderRefBanner(reference)}
     ${progressSteps("preparing")}
     <p style="margin:0 0 8px;font-size:15px;line-height:1.55;">Hello ${name}, we've started preparing your order in the kitchen.</p>

     ${itemsSection(order.items)}

     ${sectionLabel("Delivery")}
     ${addressBlock(customer)}

     ${notice(`We'll email you again once it's on its way — delivery usually takes <strong>${deliveryWindow}</strong> after dispatch.`)}

     ${ctaButton(link, "View your order")}`,
    { status: "Preparing" },
  );

  return {
    to: customer.email,
    subject: `Preparing your order ${reference}`,
    html,
    text,
  };
}

/**
 * Shop copy of the processing milestone. Only sent when `ORDER_EMAIL_TO` is set.
 */
export function ownerProcessingEmail(order: Order, to: string): Mail {
  const { reference, customer } = order;
  const adminLink = `${siteUrl}${ADMIN_ROUTES.order(reference)}`;

  const text = `Kitchen started — order ${reference}

${itemLines(order.items)}

${customer.fullName}
${customer.phone}
${customer.email}
${customer.deliveryAddress.addressLine}
Landmark: ${customer.deliveryAddress.landmark}
${customer.deliveryAddress.city}, ${customer.deliveryAddress.state}

Open in admin: ${adminLink}

${BRAND.displayName}`;

  const html = shell(
    `Kitchen started — ${escapeHtml(reference)}`,
    `${orderRefBanner(reference)}
     <p style="margin:0 0 8px;font-size:15px;line-height:1.55;">
       This order is now marked <strong>processing</strong>. Pack and prepare for dispatch.
     </p>

     ${itemsSection(order.items, "Order items")}

     ${customerCard(customer)}

     ${ctaButton(adminLink, "Open in admin")}`,
    {
      status: "Preparing",
      footerNote: "Shop notification — kitchen started a Lamie Foods order.",
    },
  );

  return {
    to,
    subject: `Kitchen started — ${reference} — ${customer.fullName}`,
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
    `${orderRefBanner(reference)}
     ${progressSteps("shipped")}
     <p style="margin:0 0 8px;font-size:15px;line-height:1.55;">Hello ${name}, good news — your order is on its way to you.</p>

     ${itemsSection(order.items)}

     ${sectionLabel("Delivery")}
     ${addressBlock(customer)}

     ${ctaButton(link, "View your order")}`,
    { status: "On its way" },
  );

  return { to: customer.email, subject: `On its way — order ${reference}`, html, text };
}

/**
 * Shop copy when an order first becomes `'shipped'`. Only when `ORDER_EMAIL_TO` is set.
 */
export function ownerShippedEmail(order: Order, to: string): Mail {
  const { reference, customer } = order;
  const adminLink = `${siteUrl}${ADMIN_ROUTES.order(reference)}`;

  const text = `Out for delivery — order ${reference}

${itemLines(order.items)}

${customer.fullName}
${customer.phone}
${customer.email}
${customer.deliveryAddress.addressLine}
Landmark: ${customer.deliveryAddress.landmark}
${customer.deliveryAddress.city}, ${customer.deliveryAddress.state}

Open in admin: ${adminLink}

${BRAND.displayName}`;

  const html = shell(
    `Out for delivery — ${escapeHtml(reference)}`,
    `${orderRefBanner(reference)}
     <p style="margin:0 0 8px;font-size:15px;line-height:1.55;">
       This order is marked <strong>out for delivery</strong>.
     </p>

     ${itemsSection(order.items, "Order items")}

     ${customerCard(customer)}

     ${ctaButton(adminLink, "Open in admin")}`,
    {
      status: "On its way",
      footerNote: "Shop notification — order left for delivery.",
    },
  );

  return {
    to,
    subject: `Out for delivery — ${reference} — ${customer.fullName}`,
    html,
    text,
  };
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
    `${orderRefBanner(reference)}
     ${progressSteps("delivered")}
     <p style="margin:0 0 18px;font-size:15px;line-height:1.55;">Hello ${name}, your order has been delivered. We hope you enjoy it!</p>

     ${notice(`Reach us on Instagram at <a href="${BRAND.instagramUrl}" style="color:${C.terracotta};text-decoration:none;font-weight:700;">${escapeHtml(BRAND.instagramHandle)}</a> — we'd love to see where it ends up.`)}

     ${ctaButton(link, "View your order")}`,
    { status: "Delivered" },
  );

  return { to: customer.email, subject: `Delivered — order ${reference}`, html, text };
}

/**
 * Shop copy when an order first becomes `'delivered'`. Only when `ORDER_EMAIL_TO` is set.
 */
export function ownerDeliveredEmail(order: Order, to: string): Mail {
  const { reference, customer } = order;
  const adminLink = `${siteUrl}${ADMIN_ROUTES.order(reference)}`;

  const text = `Delivered — order ${reference}

${customer.fullName}
${customer.phone}
${customer.email}
${customer.deliveryAddress.addressLine}, ${customer.deliveryAddress.city}

Open in admin: ${adminLink}

${BRAND.displayName}`;

  const html = shell(
    `Delivered — ${escapeHtml(reference)}`,
    `${orderRefBanner(reference)}
     <p style="margin:0 0 8px;font-size:15px;line-height:1.55;">
       This order is marked <strong>delivered</strong>.
     </p>

     ${customerCard(customer)}

     ${ctaButton(adminLink, "Open in admin")}`,
    {
      status: "Delivered",
      footerNote: "Shop notification — order marked delivered.",
    },
  );

  return {
    to,
    subject: `Delivered — ${reference} — ${customer.fullName}`,
    html,
    text,
  };
}

/**
 * Sent once, the moment `status` first becomes `'cancelled'`. Does not
 * invent a refund — paid orders are told the shop will follow up.
 */
export function orderCancelledEmail(order: Order, accessToken: string): Mail {
  const { reference, customer } = order;
  const link = `${siteUrl}/order-success?token=${encodeURIComponent(accessToken)}`;
  const name = escapeHtml(customer.fullName);
  const paid = order.paymentStatus === "paid";
  const moneyNote = paid
    ? "If you already paid, we will follow up about next steps."
    : "You were not charged.";

  const text = `Hello ${customer.fullName},

We've cancelled your order ${reference}. ${moneyNote}

${itemLines(order.items)}

View your order: ${link}

${BRAND.displayName}`;

  const html = shell(
    "This order has been cancelled",
    `${orderRefBanner(reference)}
     <p style="margin:0 0 8px;font-size:15px;line-height:1.55;">Hello ${name}, we've cancelled your order.</p>

     ${itemsSection(order.items)}

     ${notice(escapeHtml(moneyNote))}

     ${ctaButton(link, "View your order")}`,
    { status: "Cancelled" },
  );

  return {
    to: customer.email,
    subject: `Cancelled — order ${reference}`,
    html,
    text,
  };
}

/**
 * Shop copy when an order first becomes `'cancelled'`. Only when `ORDER_EMAIL_TO` is set.
 */
export function ownerCancelledEmail(order: Order, to: string): Mail {
  const { reference, customer } = order;
  const adminLink = `${siteUrl}${ADMIN_ROUTES.order(reference)}`;
  const paid = order.paymentStatus === "paid";
  const moneyNote = paid
    ? "This order was marked paid. Follow up with the customer about next steps — this email does not process a refund."
    : "This order was unpaid. Nothing was charged.";

  const text = `Cancelled — order ${reference}

${moneyNote}

${itemLines(order.items)}

${customer.fullName}
${customer.phone}
${customer.email}
${customer.deliveryAddress.addressLine}
Landmark: ${customer.deliveryAddress.landmark}
${customer.deliveryAddress.city}, ${customer.deliveryAddress.state}

Open in admin: ${adminLink}

${BRAND.displayName}`;

  const html = shell(
    `Cancelled — ${escapeHtml(reference)}`,
    `${orderRefBanner(reference)}
     <p style="margin:0 0 8px;font-size:15px;line-height:1.55;">
       This order is marked <strong>cancelled</strong>.
     </p>

     ${itemsSection(order.items, "Order items")}

     ${notice(escapeHtml(moneyNote))}

     ${customerCard(customer)}

     ${ctaButton(adminLink, "Open in admin")}`,
    {
      status: "Cancelled",
      footerNote: "Shop notification — a Lamie Foods order was cancelled.",
    },
  );

  return {
    to,
    subject: `Cancelled — ${reference} — ${customer.fullName}`,
    html,
    text,
  };
}

