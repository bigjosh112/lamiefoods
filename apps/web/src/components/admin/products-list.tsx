"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ADMIN_ROUTES } from "@lamiefoods/config";
import { cn } from "@lamiefoods/ui";
import type { Product } from "@lamiefoods/types";
import { Button } from "@/components/ui/button";
import {
  bulkDeleteProducts,
  bulkUnpublishProducts,
} from "@/lib/api/admin-products";
import { ApiError } from "@/lib/api";
import { applyDiscount, formatKobo } from "@/lib/money";
import { stockStatus } from "@/lib/admin/stock-status";

/**
 * Real product table with client-side search and multi-select bulk actions
 * (unpublish / permanent delete). Rows arrive as PROPS from the server page.
 */
export function ProductsList({ products }: { products: Product[] }) {
  const router = useRouter();
  const selectAllId = useId();
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const filtered = useMemo(
    () =>
      products.filter((product) =>
        `${product.name} ${product.slug}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
      ),
    [products, query],
  );

  const filteredSlugs = filtered.map((product) => product.slug);
  const allVisibleSelected =
    filteredSlugs.length > 0 && filteredSlugs.every((slug) => selected.has(slug));
  const someVisibleSelected = filteredSlugs.some((slug) => selected.has(slug));

  const selectedProducts = products.filter((product) => selected.has(product.slug));
  const selectedPublishedCount = selectedProducts.filter(
    (product) => product.storefrontActive,
  ).length;

  const toggleSlug = (slug: string) => {
    setSelected((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const toggleAllVisible = () => {
    setSelected((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        for (const slug of filteredSlugs) next.delete(slug);
      } else {
        for (const slug of filteredSlugs) next.add(slug);
      }
      return next;
    });
  };

  const runBulk = async (action: "unpublish" | "delete") => {
    const slugs = [...selected];
    if (slugs.length === 0) return;

    setBusy(true);
    setError(null);
    try {
      if (action === "unpublish") {
        await bulkUnpublishProducts(slugs);
      } else {
        await bulkDeleteProducts(slugs);
      }
      setSelected(new Set());
      setConfirmDelete(false);
      router.refresh();
    } catch (err) {
      const message =
        err instanceof ApiError &&
        err.body &&
        typeof err.body === "object" &&
        "error" in err.body &&
        typeof (err.body as { error: unknown }).error === "string"
          ? (err.body as { error: string }).error
          : err instanceof Error
            ? err.message
            : "Something went wrong.";
      setError(message);
    } finally {
      setBusy(false);
    }
  };

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search by product title or slug"
        className="mb-gutter-sm min-h-11 w-full max-w-sm rounded border border-rule bg-[#f8f3ec] px-3 text-body-md text-cacao placeholder:text-nutmeg/70 focus:border-terracotta focus:outline-none"
      />

      {selected.size > 0 && (
        <div className="mb-gutter-sm flex flex-wrap items-center gap-gutter-sm rounded border border-rule/70 bg-surface-container-low p-gutter-sm">
          <p className="text-body-sm text-cacao">
            {selected.size} selected
            {selectedPublishedCount > 0
              ? ` · ${selectedPublishedCount} published`
              : ""}
          </p>
          <div className="flex flex-wrap gap-gutter-xs">
            <Button
              type="button"
              variant="secondary"
              disabled={busy || selectedPublishedCount === 0}
              onClick={() => void runBulk("unpublish")}
              className="normal-case"
            >
              Unpublish
            </Button>
            <Button
              type="button"
              disabled={busy}
              onClick={() => setConfirmDelete(true)}
              className="normal-case bg-error hover:bg-error/90"
            >
              Delete permanently
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => {
                setSelected(new Set());
                setConfirmDelete(false);
                setError(null);
              }}
              className="normal-case"
            >
              Clear
            </Button>
          </div>
        </div>
      )}

      {error && (
        <p className="mb-gutter-sm text-body-sm text-error" role="alert">
          {error}
        </p>
      )}

      {confirmDelete && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-products-title"
          className="mb-gutter-sm rounded border border-error/40 bg-error-container/40 p-gutter-md"
        >
          <h2
            id="delete-products-title"
            className="text-headline-sm text-cacao"
          >
            Delete {selected.size} product{selected.size === 1 ? "" : "s"}?
          </h2>
          <p className="mt-gutter-xs text-body-sm text-on-surface-variant">
            This removes them from the catalogue for good. Past orders keep their
            line items. Pack photos in Blob storage are not cleaned up.
          </p>
          <ul className="mt-gutter-sm list-disc space-y-1 pl-5 text-body-sm text-cacao">
            {selectedProducts.slice(0, 5).map((product) => (
              <li key={product.id}>{product.name}</li>
            ))}
            {selectedProducts.length > 5 && (
              <li>and {selectedProducts.length - 5} more</li>
            )}
          </ul>
          <div className="mt-gutter-sm flex flex-wrap gap-gutter-xs">
            <Button
              type="button"
              disabled={busy}
              onClick={() => void runBulk("delete")}
              className="normal-case bg-error hover:bg-error/90"
            >
              {busy ? "Deleting…" : "Confirm delete"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              disabled={busy}
              onClick={() => setConfirmDelete(false)}
              className="normal-case"
            >
              Cancel
            </Button>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="rounded border border-rule/70 bg-surface-container-low p-gutter-xl text-center">
          <p className="text-body-md text-on-surface-variant">
            {products.length === 0
              ? "No products yet."
              : "No products match that search."}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto rounded border border-rule/70">
          <table className="w-full min-w-[720px] text-left text-body-sm">
            <thead className="bg-surface-container-low text-label-sm text-nutmeg">
              <tr>
                <th className="w-11 px-gutter-sm py-2 font-label">
                  <input
                    id={selectAllId}
                    type="checkbox"
                    checked={allVisibleSelected}
                    ref={(element) => {
                      if (element) {
                        element.indeterminate =
                          someVisibleSelected && !allVisibleSelected;
                      }
                    }}
                    onChange={toggleAllVisible}
                    aria-label="Select all visible products"
                    className="h-4 w-4 accent-terracotta"
                  />
                </th>
                <th className="px-gutter-sm py-2 font-label">Product</th>
                <th className="px-gutter-sm py-2 font-label">Category</th>
                <th className="px-gutter-sm py-2 font-label">Price</th>
                <th className="px-gutter-sm py-2 font-label">Stock</th>
                <th className="px-gutter-sm py-2 font-label">Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((product) => {
                const lowest = product.packs.reduce(
                  (min, pack) => Math.min(min, pack.price.amount),
                  Infinity,
                );
                const lowStock = product.packs.some(
                  (pack) => stockStatus(pack) !== "in-stock",
                );
                const totalStock = product.packs.reduce(
                  (sum, pack) => sum + pack.stockQuantity,
                  0,
                );
                const isChecked = selected.has(product.slug);

                return (
                  <tr
                    key={product.id}
                    className={cn(
                      "border-t border-rule/50 hover:bg-surface-container-low",
                      isChecked && "bg-secondary-container/30",
                    )}
                  >
                    <td className="px-gutter-sm py-2">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSlug(product.slug)}
                        aria-label={`Select ${product.name}`}
                        className="h-4 w-4 accent-terracotta"
                      />
                    </td>
                    <td className="px-gutter-sm py-2">
                      <Link
                        href={ADMIN_ROUTES.editProduct(product.slug)}
                        className="font-label text-label-md text-terracotta hover:underline"
                      >
                        {product.name}
                      </Link>
                      <p className="text-body-sm text-nutmeg">{product.slug}</p>
                    </td>
                    <td className="px-gutter-sm py-2 text-on-surface-variant capitalize">
                      {product.category.replace("-", " ")}
                    </td>
                    <td className="px-gutter-sm py-2 font-numeral text-label-md text-cacao">
                      {Number.isFinite(lowest) ? (
                        product.discountPercent ? (
                          <span>
                            <span className="mr-1 text-nutmeg line-through">
                              {formatKobo(lowest)}
                            </span>
                            {formatKobo(applyDiscount(lowest, product.discountPercent))}
                          </span>
                        ) : (
                          formatKobo(lowest)
                        )
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-gutter-sm py-2">
                      <span className={cn(lowStock && "font-semibold text-error")}>
                        {totalStock}
                      </span>
                      <span className="ml-1 text-body-sm text-nutmeg">
                        ({product.packs.length} size
                        {product.packs.length === 1 ? "" : "s"})
                      </span>
                    </td>
                    <td className="px-gutter-sm py-2">
                      <Badge
                        tone={product.storefrontActive ? "positive" : "neutral"}
                        label={product.storefrontActive ? "Published" : "Draft"}
                      />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function Badge({ label, tone }: { label: string; tone: "positive" | "neutral" }) {
  return (
    <span
      className={cn(
        "inline-block rounded-sm px-2 py-0.5 font-label text-label-sm",
        tone === "positive" && "bg-cacao text-tertiary-fixed-dim",
        tone === "neutral" && "bg-secondary-container text-on-secondary-fixed",
      )}
    >
      {label}
    </span>
  );
}
