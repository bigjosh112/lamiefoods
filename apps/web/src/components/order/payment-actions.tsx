"use client";

import Script from "next/script";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { BRAND } from "@lamiefoods/config";
import type { BankTransferDetails } from "@lamiefoods/config";
import type { PaymentMethod } from "@lamiefoods/types";
import { env } from "@/config/env";
import { formatKobo } from "@/lib/money";
import { preparePayment, verifyPayment } from "@/lib/api/orders";
import { Button, ButtonLink } from "@/components/ui/button";
import { ICONS } from "@/components/ui/icons";

declare global {
  interface Window {
    PaystackPop?: {
      setup(options: {
        key: string;
        email: string;
        amount: number;
        ref: string;
        currency: "NGN";
        onClose: () => void;
        callback: (transaction: { reference: string }) => void;
      }): { openIframe: () => void };
    };
  }
}

type Status = "idle" | "opening" | "verifying" | "cancelled" | "failed";

/**
 * `/order-success`'s payment hub — the ONE place either payment method is
 * actually initiated, whether this is the first visit right after checkout
 * or someone returning later via their emailed link to finish paying. See
 * the design decision in the plan this shipped from for why it isn't on
 * `/checkout` instead.
 *
 * Receives only what it needs as props — never imports order data directly.
 * That's the exact rule that closed the two client-bundle PII leaks recorded
 * in GAP-009: a Client Component's imports ship in full to every visitor's
 * browser; its props do not. As of 2026-09-08 that rule extends to
 * `whatsappNumber`/`bankTransfer` too — both are admin-editable
 * (`server/settings/repository.ts`) now, not static build-time constants, so
 * this component can no longer import them from `@lamiefoods/config` and
 * expect to see a value set after the component last built.
 */
export function PaymentActions({
  token,
  reference,
  amountKobo,
  initialMethod,
  whatsappNumber,
  bankTransfer,
}: {
  token: string;
  reference: string;
  amountKobo: number;
  initialMethod: PaymentMethod;
  whatsappNumber: string | null;
  bankTransfer: BankTransferDetails | null;
}) {
  const [method, setMethod] = useState<PaymentMethod>(initialMethod);
  const [status, setStatus] = useState<Status>("idle");
  const [scriptReady, setScriptReady] = useState(false);
  const router = useRouter();

  const paystackAvailable = Boolean(env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY);

  const openPaystack = async () => {
    if (!paystackAvailable) return;
    setStatus("opening");

    try {
      const prepared = await preparePayment(token);

      if (!scriptReady || !window.PaystackPop) {
        // The script tag is already in the document (rendered below); wait
        // briefly for a slow connection, then fail honestly instead of hanging.
        await new Promise<void>((resolve, reject) => {
          const started = Date.now();
          const check = setInterval(() => {
            if (window.PaystackPop) {
              clearInterval(check);
              resolve();
              return;
            }
            if (Date.now() - started > 10_000) {
              clearInterval(check);
              reject(new Error("Paystack script did not load in time."));
            }
          }, 100);
        });
      }

      const publicKey = env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY;
      if (!publicKey || !window.PaystackPop) {
        setStatus("failed");
        return;
      }

      window.PaystackPop.setup({
        key: publicKey,
        email: prepared.email,
        amount: prepared.amountKobo,
        ref: prepared.reference,
        currency: "NGN",
        onClose: () => setStatus("cancelled"),
        callback: (transaction) => {
          void (async () => {
            setStatus("verifying");
            try {
              await verifyPayment(token, transaction.reference);
              router.refresh();
            } catch {
              setStatus("failed");
            }
          })();
        },
      }).openIframe();
    } catch {
      setStatus("failed");
    }
  };

  return (
    <div className="rounded border border-rule/70 bg-surface-container-low p-inset-card">
      {paystackAvailable && (
        <Script
          src="https://js.paystack.co/v1/inline.js"
          strategy="lazyOnload"
          onReady={() => setScriptReady(true)}
        />
      )}

      <h2 className="text-headline-sm text-cacao">Complete your payment</h2>
      <p className="mt-1 text-body-sm text-on-surface-variant">
        Order {reference} — {formatKobo(amountKobo)} for products (delivery not included).
      </p>

      {!paystackAvailable && (
        <p className="mt-gutter-sm rounded border border-rule/70 bg-surface p-gutter-sm text-body-sm text-on-surface-variant">
          Online payment is unavailable right now. Use bank transfer below, or try again
          later.
        </p>
      )}

      {paystackAvailable && (
        <div className="mt-gutter-sm grid gap-gutter-xs sm:grid-cols-2" role="radiogroup">
          <MethodTab
            selected={method === "paystack"}
            onSelect={() => setMethod("paystack")}
            label="Pay online"
          />
          <MethodTab
            selected={method === "whatsapp_transfer"}
            onSelect={() => setMethod("whatsapp_transfer")}
            label="Bank transfer"
          />
        </div>
      )}

      {method === "paystack" && paystackAvailable ? (
        <div className="mt-gutter-md">
          <Button
            onClick={() => void openPaystack()}
            disabled={status === "opening" || status === "verifying"}
          >
            {status === "opening" && "Opening Paystack…"}
            {status === "verifying" && "Confirming your payment…"}
            {status !== "opening" &&
              status !== "verifying" &&
              `Pay ${formatKobo(amountKobo)} now`}
          </Button>

          <div
            aria-live="polite"
            className="mt-gutter-xs text-body-sm text-on-surface-variant"
          >
            {status === "cancelled" && (
              <p>
                Payment wasn&apos;t completed — you can try again, or pay by bank transfer
                instead.
              </p>
            )}
            {status === "failed" && (
              <p className="text-error">
                We couldn&apos;t confirm that payment. If you were charged, contact us
                with your order reference — nothing has been marked paid on our side.
              </p>
            )}
          </div>
        </div>
      ) : (
        <BankTransferPanel
          reference={reference}
          amountKobo={amountKobo}
          whatsappNumber={whatsappNumber}
          bankTransfer={bankTransfer}
        />
      )}
    </div>
  );
}

function MethodTab({
  selected,
  onSelect,
  label,
}: {
  selected: boolean;
  onSelect: () => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      onClick={onSelect}
      className={
        selected
          ? "rounded border border-terracotta bg-secondary-container/40 p-gutter-sm text-left font-label text-label-md text-cacao"
          : "rounded border border-rule bg-surface p-gutter-sm text-left font-label text-label-md text-cacao hover:border-cacao"
      }
    >
      {label}
    </button>
  );
}

function BankTransferPanel({
  reference,
  amountKobo,
  whatsappNumber,
  bankTransfer,
}: {
  reference: string;
  amountKobo: number;
  whatsappNumber: string | null;
  bankTransfer: BankTransferDetails | null;
}) {
  // The "send payment proof" flow only makes sense once there's a real
  // account to transfer to — whatsappNumber and bankTransfer are set
  // independently by the owner (via /admin/settings), and can genuinely be
  // set out of order.
  const proofMessage = `Hi! I'd like to complete payment for order ${reference} (${formatKobo(amountKobo)}). I'll send my payment screenshot here.`;
  const proofLink =
    whatsappNumber && bankTransfer
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(proofMessage)}`
      : null;

  // While only the WhatsApp number is set, it's still useful as a general
  // contact — just not for "here's my payment proof" when there's no
  // account number to have transferred to yet.
  const contactMessage = `Hi! I have a question about order ${reference}.`;
  const contactLink =
    whatsappNumber && !bankTransfer
      ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(contactMessage)}`
      : null;

  return (
    <div className="mt-gutter-md rounded border border-rule/70 bg-surface p-gutter-sm">
      {bankTransfer ? (
        <dl className="grid gap-1 text-body-sm">
          <Row label="Bank" value={bankTransfer.bankName} />
          <Row label="Account number" value={bankTransfer.accountNumber} />
          <Row label="Account name" value={bankTransfer.accountName} />
        </dl>
      ) : (
        <p className="flex items-start gap-gutter-xs text-body-sm text-on-surface-variant">
          <ICONS.shield className="mt-0.5 h-4 w-4 shrink-0 text-terracotta" />
          Bank transfer details are being confirmed — check back shortly, or use Paystack
          above if available.
        </p>
      )}

      {bankTransfer && (
        <p className="mt-gutter-sm text-body-sm text-nutmeg">
          Transfer {formatKobo(amountKobo)}, then send your screenshot so we can confirm
          it.
        </p>
      )}

      {proofLink ? (
        <ButtonLink
          href={proofLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-gutter-sm"
        >
          <ICONS.mail className="h-4 w-4" />
          Send payment proof on WhatsApp
        </ButtonLink>
      ) : contactLink ? (
        <ButtonLink
          href={contactLink}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-gutter-sm"
        >
          <ICONS.mail className="h-4 w-4" />
          Message us on WhatsApp
        </ButtonLink>
      ) : (
        <p className="mt-gutter-sm text-body-sm text-nutmeg">
          A WhatsApp number for payment confirmation has not been set up yet. Reach us on
          Instagram at{" "}
          <a
            href={BRAND.instagramUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="underline underline-offset-4"
          >
            {BRAND.instagramHandle}
          </a>{" "}
          once you&apos;ve transferred, or use Paystack above if available.
        </p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-gutter-sm">
      <dt className="text-nutmeg">{label}</dt>
      <dd className="font-label text-label-md text-cacao">{value}</dd>
    </div>
  );
}
