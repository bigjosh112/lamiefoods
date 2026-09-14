import "server-only";

import type { DeliveryArea, DeliveryRegion, Money, NigerianState } from "@lamiefoods/types";
import { resolveDeliveryAreaState } from "@lamiefoods/types";
import { db } from "@/server/db/client";

const ngn = (amount: number): Money => ({ amount, currency: "NGN" });

export class DeliveryAreaNotFoundError extends Error {
  constructor(message = "Delivery area not found.") {
    super(message);
    this.name = "DeliveryAreaNotFoundError";
  }
}

export class DeliveryAreaInactiveError extends Error {
  constructor(message = "That delivery area is no longer available.") {
    super(message);
    this.name = "DeliveryAreaInactiveError";
  }
}

export class DeliveryAreaStateError extends Error {
  constructor(message = "Interstate delivery areas need a Nigerian state.") {
    super(message);
    this.name = "DeliveryAreaStateError";
  }
}

interface DeliveryAreaRow {
  id: string;
  name: string;
  fee_kobo: number;
  region: string;
  state: string;
  sort_order: number;
  active: boolean;
  created_at: Date;
  updated_at: Date;
}

function rowToArea(row: DeliveryAreaRow): DeliveryArea {
  return {
    id: row.id,
    name: row.name,
    fee: ngn(row.fee_kobo),
    region: row.region as DeliveryRegion,
    state: row.state as NigerianState,
    sortOrder: row.sort_order,
    active: row.active,
    createdAt: row.created_at.toISOString(),
    updatedAt: row.updated_at.toISOString(),
  };
}

function stateFor(region: DeliveryRegion, state: string | undefined): NigerianState {
  try {
    return resolveDeliveryAreaState(region, state);
  } catch (error) {
    throw error instanceof Error
      ? new DeliveryAreaStateError(error.message)
      : new DeliveryAreaStateError();
  }
}

/** Active areas for checkout, Lagos then interstate, by sort_order. */
export async function listActiveDeliveryAreas(): Promise<DeliveryArea[]> {
  const sql = db();
  const rows = await sql`
    select id, name, fee_kobo, region, state, sort_order, active, created_at, updated_at
    from delivery_areas
    where active = true
    order by
      case region when 'lagos' then 0 else 1 end,
      sort_order asc,
      name asc
  `;
  return (rows as unknown as DeliveryAreaRow[]).map(rowToArea);
}

/** Full admin list including inactive. */
export async function listAllDeliveryAreas(): Promise<DeliveryArea[]> {
  const sql = db();
  const rows = await sql`
    select id, name, fee_kobo, region, state, sort_order, active, created_at, updated_at
    from delivery_areas
    order by
      case region when 'lagos' then 0 else 1 end,
      sort_order asc,
      name asc
  `;
  return (rows as unknown as DeliveryAreaRow[]).map(rowToArea);
}

export async function getActiveDeliveryAreaById(
  id: string,
): Promise<DeliveryArea> {
  const sql = db();
  const [row] = await sql`
    select id, name, fee_kobo, region, state, sort_order, active, created_at, updated_at
    from delivery_areas
    where id = ${id}
  `;
  if (!row) throw new DeliveryAreaNotFoundError();
  const area = rowToArea(row as unknown as DeliveryAreaRow);
  if (!area.active) throw new DeliveryAreaInactiveError();
  return area;
}

export async function createDeliveryArea(input: {
  name: string;
  feeKobo: number;
  region: DeliveryRegion;
  state: string;
  sortOrder?: number;
}): Promise<DeliveryArea> {
  const sql = db();
  const state = stateFor(input.region, input.state);
  const [row] = await sql`
    insert into delivery_areas (name, fee_kobo, region, state, sort_order)
    values (
      ${input.name},
      ${input.feeKobo},
      ${input.region},
      ${state},
      ${input.sortOrder ?? 500}
    )
    returning id, name, fee_kobo, region, state, sort_order, active, created_at, updated_at
  `;
  if (!row) throw new Error("Delivery area insert returned no row.");
  return rowToArea(row as unknown as DeliveryAreaRow);
}

export async function updateDeliveryArea(
  id: string,
  input: {
    name?: string;
    feeKobo?: number;
    region?: DeliveryRegion;
    state?: string;
    sortOrder?: number;
    active?: boolean;
  },
): Promise<DeliveryArea | null> {
  const sql = db();
  const [existing] = await sql`
    select id, name, fee_kobo, region, state, sort_order, active
    from delivery_areas where id = ${id}
  `;
  if (!existing) return null;

  const name = input.name ?? (existing.name as string);
  const feeKobo = input.feeKobo ?? (existing.fee_kobo as number);
  const region = input.region ?? (existing.region as DeliveryRegion);
  const state = stateFor(region, input.state ?? (existing.state as string));
  const sortOrder = input.sortOrder ?? (existing.sort_order as number);
  const active = input.active ?? (existing.active as boolean);

  const [row] = await sql`
    update delivery_areas set
      name = ${name},
      fee_kobo = ${feeKobo},
      region = ${region},
      state = ${state},
      sort_order = ${sortOrder},
      active = ${active},
      updated_at = now()
    where id = ${id}
    returning id, name, fee_kobo, region, state, sort_order, active, created_at, updated_at
  `;
  return row ? rowToArea(row as unknown as DeliveryAreaRow) : null;
}

export async function deleteDeliveryArea(id: string): Promise<boolean> {
  const sql = db();
  const result = await sql`
    delete from delivery_areas where id = ${id}
  `;
  return result.count > 0;
}
