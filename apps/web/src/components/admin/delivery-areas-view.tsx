"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import type { DeliveryArea, DeliveryRegion } from "@lamiefoods/types";
import { formatKobo } from "@/lib/money";
import {
  createAdminDeliveryArea,
  deleteAdminDeliveryArea,
  updateAdminDeliveryArea,
} from "@/lib/api/admin-delivery-areas";
import { ApiError } from "@/lib/api";
import { Button } from "@/components/ui/button";

const REGION_LABEL: Record<DeliveryRegion, string> = {
  lagos: "Lagos",
  interstate: "Interstate",
};

/**
 * Admin CRUD for delivery zones and fees. Fees are entered in naira and stored
 * as kobo server-side.
 */
export function DeliveryAreasView({ areas: initial }: { areas: DeliveryArea[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [feeNaira, setFeeNaira] = useState("");
  const [region, setRegion] = useState<DeliveryRegion>("lagos");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState("");
  const [editFee, setEditFee] = useState("");
  const [editRegion, setEditRegion] = useState<DeliveryRegion>("lagos");

  const sorted = useMemo(() => initial, [initial]);

  function refresh() {
    startTransition(() => router.refresh());
  }

  async function onCreate(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const fee = Number.parseInt(feeNaira, 10);
    if (!name.trim() || Number.isNaN(fee) || fee < 0) {
      setError("Enter a name and a non-negative fee in naira.");
      return;
    }
    try {
      await createAdminDeliveryArea({ name: name.trim(), feeNaira: fee, region });
      setName("");
      setFeeNaira("");
      refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.body as { error?: string })?.error ?? err.message
          : "Could not create area.",
      );
    }
  }

  function beginEdit(area: DeliveryArea) {
    setEditingId(area.id);
    setEditName(area.name);
    setEditFee(String(Math.round(area.fee.amount / 100)));
    setEditRegion(area.region);
    setError(null);
  }

  async function saveEdit(id: string) {
    setError(null);
    const fee = Number.parseInt(editFee, 10);
    if (!editName.trim() || Number.isNaN(fee) || fee < 0) {
      setError("Enter a name and a non-negative fee in naira.");
      return;
    }
    try {
      await updateAdminDeliveryArea(id, {
        name: editName.trim(),
        feeNaira: fee,
        region: editRegion,
      });
      setEditingId(null);
      refresh();
    } catch (err) {
      setError(
        err instanceof ApiError
          ? (err.body as { error?: string })?.error ?? err.message
          : "Could not update area.",
      );
    }
  }

  async function toggleActive(area: DeliveryArea) {
    setError(null);
    try {
      await updateAdminDeliveryArea(area.id, { active: !area.active });
      refresh();
    } catch {
      setError("Could not update status.");
    }
  }

  async function onDelete(area: DeliveryArea) {
    if (
      !window.confirm(
        `Delete “${area.name}”? Existing orders keep the fee snapshot; new checkouts will not offer this area.`,
      )
    ) {
      return;
    }
    setError(null);
    try {
      await deleteAdminDeliveryArea(area.id);
      refresh();
    } catch {
      setError("Could not delete area.");
    }
  }

  return (
    <div className="space-y-gutter-md">
      <header>
        <p className="font-label text-label-sm uppercase tracking-[0.14em] text-terracotta">
          Configuration
        </p>
        <h1 className="mt-gutter-xs font-display text-display-sm text-cacao">
          Delivery areas
        </h1>
        <p className="mt-gutter-xs max-w-2xl text-body-md text-on-surface-variant">
          Zones customers pick at checkout. The fee is added to the product
          total and charged with Paystack or bank transfer.
        </p>
      </header>

      {error && (
        <p className="rounded border border-error/40 bg-error/5 p-gutter-sm text-body-sm text-error">
          {error}
        </p>
      )}

      <form
        onSubmit={(event) => void onCreate(event)}
        className="grid gap-gutter-sm rounded border border-rule/70 bg-surface p-gutter-md sm:grid-cols-[1fr_8rem_10rem_auto]"
      >
        <label className="grid gap-1 text-body-sm">
          <span className="font-label text-label-sm text-nutmeg">Name</span>
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded border border-rule bg-surface-container-lowest px-3 py-2"
            placeholder="e.g. Lekki / Oniru / Ikate"
            required
          />
        </label>
        <label className="grid gap-1 text-body-sm">
          <span className="font-label text-label-sm text-nutmeg">Fee (₦)</span>
          <input
            type="number"
            min={0}
            step={1}
            value={feeNaira}
            onChange={(event) => setFeeNaira(event.target.value)}
            className="rounded border border-rule bg-surface-container-lowest px-3 py-2"
            required
          />
        </label>
        <label className="grid gap-1 text-body-sm">
          <span className="font-label text-label-sm text-nutmeg">Region</span>
          <select
            value={region}
            onChange={(event) => setRegion(event.target.value as DeliveryRegion)}
            className="rounded border border-rule bg-surface-container-lowest px-3 py-2"
          >
            <option value="lagos">Lagos</option>
            <option value="interstate">Interstate</option>
          </select>
        </label>
        <div className="flex items-end">
          <Button type="submit" disabled={pending}>
            Add area
          </Button>
        </div>
      </form>

      <div className="overflow-x-auto rounded border border-rule/70">
        <table className="w-full min-w-[40rem] text-left text-body-sm">
          <thead className="bg-surface-container-low font-label text-label-sm uppercase tracking-wide text-nutmeg">
            <tr>
              <th className="px-gutter-sm py-3">Area</th>
              <th className="px-gutter-sm py-3">Region</th>
              <th className="px-gutter-sm py-3">Fee</th>
              <th className="px-gutter-sm py-3">Status</th>
              <th className="px-gutter-sm py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-gutter-sm py-8 text-on-surface-variant">
                  No delivery areas yet. Add the first zone above.
                </td>
              </tr>
            ) : (
              sorted.map((area) => (
                <tr key={area.id} className="border-t border-rule/50">
                  <td className="px-gutter-sm py-3 align-top">
                    {editingId === area.id ? (
                      <input
                        value={editName}
                        onChange={(event) => setEditName(event.target.value)}
                        className="w-full rounded border border-rule px-2 py-1"
                      />
                    ) : (
                      <span className="font-medium text-cacao">{area.name}</span>
                    )}
                  </td>
                  <td className="px-gutter-sm py-3 align-top">
                    {editingId === area.id ? (
                      <select
                        value={editRegion}
                        onChange={(event) =>
                          setEditRegion(event.target.value as DeliveryRegion)
                        }
                        className="rounded border border-rule px-2 py-1"
                      >
                        <option value="lagos">Lagos</option>
                        <option value="interstate">Interstate</option>
                      </select>
                    ) : (
                      REGION_LABEL[area.region]
                    )}
                  </td>
                  <td className="px-gutter-sm py-3 align-top whitespace-nowrap">
                    {editingId === area.id ? (
                      <input
                        type="number"
                        min={0}
                        value={editFee}
                        onChange={(event) => setEditFee(event.target.value)}
                        className="w-24 rounded border border-rule px-2 py-1"
                      />
                    ) : (
                      formatKobo(area.fee.amount)
                    )}
                  </td>
                  <td className="px-gutter-sm py-3 align-top">
                    <span
                      className={
                        area.active ? "text-cacao" : "text-on-surface-variant"
                      }
                    >
                      {area.active ? "Active" : "Hidden"}
                    </span>
                  </td>
                  <td className="px-gutter-sm py-3 align-top">
                    <div className="flex flex-wrap gap-2">
                      {editingId === area.id ? (
                        <>
                          <button
                            type="button"
                            className="text-terracotta underline"
                            onClick={() => void saveEdit(area.id)}
                          >
                            Save
                          </button>
                          <button
                            type="button"
                            className="text-nutmeg underline"
                            onClick={() => setEditingId(null)}
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            className="text-terracotta underline"
                            onClick={() => beginEdit(area)}
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            className="text-nutmeg underline"
                            onClick={() => void toggleActive(area)}
                          >
                            {area.active ? "Hide" : "Show"}
                          </button>
                          <button
                            type="button"
                            className="text-error underline"
                            onClick={() => void onDelete(area)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
