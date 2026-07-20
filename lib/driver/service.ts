import {
  CASHOUT_FEE_CENTS,
  COMPLIANCE_TEMPLATE,
  DEFAULT_WAYPOINTS,
  driverSql,
} from "./db";
import { mapComplianceRow, mapShiftRow, mapTxnRow, parseWaypoints, SHIFT_SELECT, type ShiftRow } from "./mappers";
import { completeShift as completeShiftCore, submitRating } from "@/lib/fleet/service";
import { getOffersForDriver } from "@/lib/booking/offers";
import type { BookingOfferSummary, DriverProfile, DriverWorkspace, ShiftSession, VehicleType } from "./types";

function toOfferSummary(offers: Awaited<ReturnType<typeof getOffersForDriver>>): BookingOfferSummary[] {
  return offers.map((o) => ({
    id: o.id,
    shiftId: o.shiftId,
    status: o.status,
    message: o.message,
    companyName: o.companyName,
    driverName: o.driverName,
    shift: o.shift,
  }));
}

export async function ensureDriverProfile(authUserId: string): Promise<DriverProfile> {
  if (!driverSql) throw new Error("Database not configured.");

  await driverSql.query(
    `insert into driver_profiles (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
    [authUserId],
  );
  await driverSql.query(
    `insert into driver_wallets (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
    [authUserId],
  );

  for (const doc of COMPLIANCE_TEMPLATE) {
    await driverSql.query(
      `insert into driver_compliance_docs (auth_user_id, doc_key, name, detail, status)
       values ($1, $2, $3, $4, 'missing')
       on conflict (auth_user_id, doc_key) do nothing`,
      [authUserId, doc.docKey, doc.name, doc.detail],
    );
  }

  const rows = (await driverSql.query(
    `select zone, vehicle_type, owner_type, display_name, rating_avg, rating_count, onboarding_completed
     from driver_profiles where auth_user_id = $1`,
    [authUserId],
  )) as Array<{
    zone: string;
    vehicle_type: VehicleType;
    owner_type: "driver" | "owner";
    display_name: string | null;
    rating_avg: string | number;
    rating_count: number;
    onboarding_completed: boolean;
  }>;

  const row = rows[0];
  return {
    zone: row?.zone ?? "DFW North",
    vehicleType: row?.vehicle_type ?? "sprinter",
    ownerType: row?.owner_type ?? "driver",
    displayName: row?.display_name ?? null,
    ratingAvg: Number(row?.rating_avg ?? 0),
    ratingCount: row?.rating_count ?? 0,
    onboardingCompleted: row?.onboarding_completed ?? false,
  };
}

export async function updateDriverProfile(
  authUserId: string,
  patch: Partial<DriverProfile>,
): Promise<DriverProfile> {
  if (!driverSql) throw new Error("Database not configured.");
  await ensureDriverProfile(authUserId);

  const current = await ensureDriverProfile(authUserId);
  const zone = patch.zone ?? current.zone;
  const vehicleType = patch.vehicleType ?? current.vehicleType;
  const ownerType = patch.ownerType ?? current.ownerType;
  const displayName = patch.displayName ?? current.displayName;
  const onboardingCompleted = patch.onboardingCompleted ?? current.onboardingCompleted;

  await driverSql.query(
    `update driver_profiles
     set zone = $2, vehicle_type = $3, owner_type = $4, display_name = $5,
         onboarding_completed = $6, updated_at = now()
     where auth_user_id = $1`,
    [authUserId, zone, vehicleType, ownerType, displayName, onboardingCompleted],
  );

  return { ...current, zone, vehicleType, ownerType, displayName, onboardingCompleted };
}

export async function getOpenShifts(zone?: string | null, cargo?: string | null, vehicle?: string | null) {
  if (!driverSql) return [];
  const params: string[] = [];
  const clauses = [`sh.status = 'open'`];

  if (zone && zone !== "All zones") {
    params.push(zone);
    clauses.push(`sh.zone = $${params.length}`);
  }
  if (cargo && cargo !== "all") {
    params.push(cargo);
    clauses.push(`sh.cargo_category = $${params.length}`);
  }
  if (vehicle && vehicle !== "all") {
    params.push(vehicle);
    clauses.push(`sh.vehicle_type = $${params.length}`);
  }

  const rows = (await driverSql.query(
    `select ${SHIFT_SELECT} where ${clauses.join(" and ")} order by sh.created_at desc`,
    params,
  )) as ShiftRow[];
  return rows.map(mapShiftRow);
}

export async function getMyShifts(authUserId: string) {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select ${SHIFT_SELECT}
     where sh.claimed_by = $1 and sh.status in ('claimed', 'active', 'completed')
     order by sh.claimed_at desc nulls last`,
    [authUserId],
  )) as ShiftRow[];
  return rows.map(mapShiftRow);
}

export async function getActiveSession(authUserId: string): Promise<ShiftSession | null> {
  if (!driverSql) return null;
  const rows = (await driverSql.query(
    `select s.id as session_id, s.shift_id, s.status as session_status, s.clocked_in_at, s.waypoints,
            ${SHIFT_SELECT}
     join driver_shift_sessions s on s.shift_id = sh.id
     where s.auth_user_id = $1 and s.status in ('scheduled', 'active')
     order by s.created_at desc
     limit 1`,
    [authUserId],
  )) as Array<
    ShiftRow & {
      session_id: string;
      shift_id: string;
      session_status: "scheduled" | "active" | "completed";
      clocked_in_at: string | null;
      waypoints: unknown;
    }
  >;

  const row = rows[0];
  if (!row) return null;

  const shift = mapShiftRow(row);

  return {
    id: row.session_id,
    shiftId: row.shift_id,
    status: row.session_status,
    clockedInAt: row.clocked_in_at,
    waypoints: parseWaypoints(row.waypoints).length ? parseWaypoints(row.waypoints) : DEFAULT_WAYPOINTS,
    shift,
  };
}

export async function getWallet(authUserId: string) {
  if (!driverSql) {
    return { available: 0, pending: 0, lifetime: 0, cashoutFee: CASHOUT_FEE_CENTS / 100, weekEarnings: 0 };
  }
  await ensureDriverProfile(authUserId);

  const walletRows = (await driverSql.query(
    `select available_cents, pending_cents, lifetime_cents from driver_wallets where auth_user_id = $1`,
    [authUserId],
  )) as Array<{ available_cents: number; pending_cents: number; lifetime_cents: number }>;

  const weekRows = (await driverSql.query(
    `select coalesce(sum(amount_cents), 0) as total
     from driver_wallet_transactions
     where auth_user_id = $1
       and txn_type = 'credit'
       and created_at >= date_trunc('week', now())`,
    [authUserId],
  )) as Array<{ total: number }>;

  const w = walletRows[0];
  return {
    available: (w?.available_cents ?? 0) / 100,
    pending: (w?.pending_cents ?? 0) / 100,
    lifetime: (w?.lifetime_cents ?? 0) / 100,
    cashoutFee: CASHOUT_FEE_CENTS / 100,
    weekEarnings: (weekRows[0]?.total ?? 0) / 100,
  };
}

export async function getLedger(authUserId: string) {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select id, label, amount_cents, txn_type, created_at
     from driver_wallet_transactions
     where auth_user_id = $1
     order by created_at desc
     limit 50`,
    [authUserId],
  )) as Array<{
    id: string;
    label: string;
    amount_cents: number;
    txn_type: "credit" | "deduction" | "cashout";
    created_at: string;
  }>;
  return rows.map(mapTxnRow);
}

export async function getCompliance(authUserId: string) {
  if (!driverSql) return [];
  await ensureDriverProfile(authUserId);
  const rows = (await driverSql.query(
    `select id, doc_key, name, status, detail, expires_at
     from driver_compliance_docs
     where auth_user_id = $1
     order by name`,
    [authUserId],
  )) as Array<{
    id: string;
    doc_key: string;
    name: string;
    status: "verified" | "pending" | "expiring" | "missing";
    detail: string | null;
    expires_at: string | null;
  }>;
  return rows.map(mapComplianceRow);
}

export async function buildWorkspace(
  authUserId: string | null,
  filters?: { zone?: string | null; cargo?: string | null; vehicle?: string | null },
): Promise<DriverWorkspace> {
  const defaultProfile: DriverProfile = {
    zone: filters?.zone ?? "DFW North",
    vehicleType: "sprinter",
    ownerType: "driver",
    displayName: null,
    ratingAvg: 0,
    ratingCount: 0,
    onboardingCompleted: false,
  };

  if (!authUserId || !driverSql) {
    const openShifts = await getOpenShifts(filters?.zone, filters?.cargo, filters?.vehicle);
    return {
      profile: defaultProfile,
      openShifts,
      myShifts: [],
      activeSession: null,
      wallet: { available: 0, pending: 0, lifetime: 0, cashoutFee: CASHOUT_FEE_CENTS / 100, weekEarnings: 0 },
      ledger: [],
      compliance: COMPLIANCE_TEMPLATE.map((d, i) => ({
        id: `template-${i}`,
        docKey: d.docKey,
        name: d.name,
        status: d.docKey === "cdl" || d.docKey === "background" ? "verified" : d.docKey === "medical" ? "expiring" : d.docKey === "hazmat" ? "missing" : "verified",
        detail: d.detail,
        expiresAt: d.docKey === "medical" ? "Aug 19, 2026" : undefined,
      })),
      offers: [],
    };
  }

  const profile = await ensureDriverProfile(authUserId);
  const filterZone = filters?.zone ?? profile.zone;

  const [openShifts, myShifts, activeSession, wallet, ledger, compliance, offers] = await Promise.all([
    getOpenShifts(filterZone, filters?.cargo, filters?.vehicle),
    getMyShifts(authUserId),
    getActiveSession(authUserId),
    getWallet(authUserId),
    getLedger(authUserId),
    getCompliance(authUserId),
    getOffersForDriver(authUserId),
  ]);

  return {
    profile,
    openShifts,
    myShifts,
    activeSession,
    wallet,
    ledger,
    compliance,
    offers: toOfferSummary(offers),
  };
}

export async function claimShift(authUserId: string, shiftId: string) {
  if (!driverSql) throw new Error("Database not configured.");
  await ensureDriverProfile(authUserId);

  const rows = (await driverSql.query(
    `update driver_shifts
     set status = 'claimed', claimed_by = $2, claimed_at = now(), updated_at = now()
     where id = $1 and status = 'open'
     returning id`,
    [shiftId, authUserId],
  )) as Array<{ id: string }>;

  if (!rows[0]) throw new Error("Shift is no longer available.");

  await driverSql.query(
    `insert into driver_shift_sessions (shift_id, auth_user_id, waypoints, status)
     values ($1, $2, $3::jsonb, 'scheduled')
     on conflict (shift_id, auth_user_id) do nothing`,
    [shiftId, authUserId, JSON.stringify(DEFAULT_WAYPOINTS)],
  );
}

export async function clockInSession(authUserId: string, sessionId: string) {
  if (!driverSql) throw new Error("Database not configured.");

  const rows = (await driverSql.query(
    `update driver_shift_sessions
     set status = 'active', clocked_in_at = now(), updated_at = now()
     where id = $1 and auth_user_id = $2 and status = 'scheduled'
     returning shift_id`,
    [sessionId, authUserId],
  )) as Array<{ shift_id: string }>;

  if (!rows[0]) throw new Error("Session not found or already started.");

  await driverSql.query(
    `update driver_shifts set status = 'active', updated_at = now() where id = $1`,
    [rows[0].shift_id],
  );
}

export async function completeDriverShift(authUserId: string, shiftId: string) {
  return completeShiftCore(authUserId, shiftId, "driver");
}

export async function rateOperator(authUserId: string, shiftId: string, stars: number, comment?: string) {
  return submitRating(authUserId, { shiftId, stars, comment }, "driver");
}

export async function cashOut(authUserId: string) {
  if (!driverSql) throw new Error("Database not configured.");
  await ensureDriverProfile(authUserId);

  const walletRows = (await driverSql.query(
    `select available_cents from driver_wallets where auth_user_id = $1 for update`,
    [authUserId],
  )) as Array<{ available_cents: number }>;

  const available = walletRows[0]?.available_cents ?? 0;
  if (available <= CASHOUT_FEE_CENTS) throw new Error("Insufficient balance for cashout.");

  const payout = available - CASHOUT_FEE_CENTS;

  await driverSql.query(
    `update driver_wallets
     set available_cents = 0, updated_at = now()
     where auth_user_id = $1`,
    [authUserId],
  );

  await driverSql.query(
    `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type)
     values ($1, 'Instant cashout', $2, 'cashout')`,
    [authUserId, -available],
  );

  await driverSql.query(
    `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type)
     values ($1, 'Cashout fee', $2, 'deduction')`,
    [authUserId, -CASHOUT_FEE_CENTS],
  );

  return payout / 100;
}

export async function submitComplianceDoc(authUserId: string, docKey: string) {
  if (!driverSql) throw new Error("Database not configured.");
  await ensureDriverProfile(authUserId);

  const rows = (await driverSql.query(
    `update driver_compliance_docs
     set status = 'pending', updated_at = now()
     where auth_user_id = $1 and doc_key = $2
     returning id`,
    [authUserId, docKey],
  )) as Array<{ id: string }>;

  if (!rows[0]) throw new Error("Document type not found.");
}
