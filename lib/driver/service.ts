import {
  CASHOUT_FEE_CENTS,
  COMPLIANCE_TEMPLATE,
  DEFAULT_WAYPOINTS,
  driverSql,
} from "./db";
import { mapComplianceRow, mapShiftRow, mapTxnRow, parseWaypoints, type ShiftRow } from "./mappers";
import type { DriverProfile, DriverWorkspace, ShiftSession, VehicleType } from "./types";

const SHIFT_COLUMNS = `id, payout_cents, payout_type, vehicle_type, vehicle_label,
  pickup, dropoff, start_time, end_time, hours, zone, distance_mi, stops,
  demand, shift_date, status`;

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
    `select zone, vehicle_type, onboarding_completed from driver_profiles where auth_user_id = $1`,
    [authUserId],
  )) as Array<{ zone: string; vehicle_type: VehicleType; onboarding_completed: boolean }>;

  const row = rows[0];
  return {
    zone: row?.zone ?? "DFW North",
    vehicleType: row?.vehicle_type ?? "sprinter",
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
  const onboardingCompleted = patch.onboardingCompleted ?? current.onboardingCompleted;

  await driverSql.query(
    `update driver_profiles
     set zone = $2, vehicle_type = $3, onboarding_completed = $4, updated_at = now()
     where auth_user_id = $1`,
    [authUserId, zone, vehicleType, onboardingCompleted],
  );

  return { zone, vehicleType, onboardingCompleted };
}

export async function getOpenShifts(zone?: string | null) {
  if (!driverSql) return [];
  const params: string[] = [];
  let where = `status = 'open'`;
  if (zone && zone !== "All zones") {
    params.push(zone);
    where += ` and zone = $${params.length}`;
  }
  const rows = (await driverSql.query(
    `select ${SHIFT_COLUMNS} from driver_shifts where ${where} order by created_at desc`,
    params,
  )) as ShiftRow[];
  return rows.map(mapShiftRow);
}

export async function getMyShifts(authUserId: string) {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select ${SHIFT_COLUMNS} from driver_shifts
     where claimed_by = $1 and status in ('claimed', 'active', 'completed')
     order by claimed_at desc nulls last`,
    [authUserId],
  )) as ShiftRow[];
  return rows.map(mapShiftRow);
}

export async function getActiveSession(authUserId: string): Promise<ShiftSession | null> {
  if (!driverSql) return null;
  const rows = (await driverSql.query(
    `select s.id, s.shift_id, s.status, s.clocked_in_at, s.waypoints,
            sh.id as sid, sh.payout_cents, sh.payout_type, sh.vehicle_type, sh.vehicle_label,
            sh.pickup, sh.dropoff, sh.start_time, sh.end_time, sh.hours, sh.zone,
            sh.distance_mi, sh.stops, sh.demand, sh.shift_date, sh.status as shift_status
     from driver_shift_sessions s
     join driver_shifts sh on sh.id = s.shift_id
     where s.auth_user_id = $1 and s.status in ('scheduled', 'active')
     order by s.created_at desc
     limit 1`,
    [authUserId],
  )) as Array<{
    id: string;
    shift_id: string;
    status: "scheduled" | "active" | "completed";
    clocked_in_at: string | null;
    waypoints: unknown;
    sid: string;
    payout_cents: number;
    payout_type: "day" | "hour";
    vehicle_type: VehicleType;
    vehicle_label: string;
    pickup: string;
    dropoff: string;
    start_time: string;
    end_time: string;
    hours: string | number;
    zone: string;
    distance_mi: number;
    stops: number;
    demand: "high" | "normal";
    shift_date: string;
    shift_status: string;
  }>;

  const row = rows[0];
  if (!row) return null;

  const shift = mapShiftRow({
    id: row.sid,
    payout_cents: row.payout_cents,
    payout_type: row.payout_type,
    vehicle_type: row.vehicle_type,
    vehicle_label: row.vehicle_label,
    pickup: row.pickup,
    dropoff: row.dropoff,
    start_time: row.start_time,
    end_time: row.end_time,
    hours: row.hours,
    zone: row.zone,
    distance_mi: row.distance_mi,
    stops: row.stops,
    demand: row.demand,
    shift_date: row.shift_date,
    status: row.shift_status,
  });

  return {
    id: row.id,
    shiftId: row.shift_id,
    status: row.status,
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

export async function buildWorkspace(authUserId: string | null, zoneFilter?: string | null): Promise<DriverWorkspace> {
  const defaultProfile: DriverProfile = {
    zone: zoneFilter ?? "DFW North",
    vehicleType: "sprinter",
    onboardingCompleted: false,
  };

  if (!authUserId || !driverSql) {
    const openShifts = await getOpenShifts(zoneFilter);
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
    };
  }

  const profile = await ensureDriverProfile(authUserId);
  const filterZone = zoneFilter ?? profile.zone;

  const [openShifts, myShifts, activeSession, wallet, ledger, compliance] = await Promise.all([
    getOpenShifts(filterZone),
    getMyShifts(authUserId),
    getActiveSession(authUserId),
    getWallet(authUserId),
    getLedger(authUserId),
    getCompliance(authUserId),
  ]);

  return { profile, openShifts, myShifts, activeSession, wallet, ledger, compliance };
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
