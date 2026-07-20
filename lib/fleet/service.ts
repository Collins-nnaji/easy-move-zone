import { driverSql } from "@/lib/driver/db";
import { COMMISSION_BPS, commissionCents, netPayoutCents } from "@/lib/marketplace/taxonomy";
import { mapShiftRow, SHIFT_SELECT, type ShiftRow } from "@/lib/driver/mappers";
import { getNotifications, getOffersForFleet } from "@/lib/booking/offers";
import type {
  BookingOfferSummary,
  FleetProfile,
  FleetStats,
  FleetWorkspace,
  MarketplaceDriver,
  PostShiftInput,
  RateInput,
} from "@/lib/driver/types";

function toOfferSummary(offers: Awaited<ReturnType<typeof getOffersForFleet>>): BookingOfferSummary[] {
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

export async function ensureFleetProfile(authUserId: string): Promise<FleetProfile> {
  if (!driverSql) throw new Error("Database not configured.");

  await driverSql.query(
    `insert into fleet_operator_profiles (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
    [authUserId],
  );

  const rows = (await driverSql.query(
    `select company_name, contact_name, zone, rating_avg, rating_count, commission_bps, onboarding_completed
     from fleet_operator_profiles where auth_user_id = $1`,
    [authUserId],
  )) as Array<{
    company_name: string;
    contact_name: string | null;
    zone: string;
    rating_avg: string | number;
    rating_count: number;
    commission_bps: number;
    onboarding_completed: boolean;
  }>;

  const row = rows[0];
  return {
    companyName: row?.company_name ?? "My Fleet",
    contactName: row?.contact_name ?? null,
    zone: row?.zone ?? "DFW North",
    ratingAvg: Number(row?.rating_avg ?? 0),
    ratingCount: row?.rating_count ?? 0,
    commissionBps: row?.commission_bps ?? COMMISSION_BPS,
    onboardingCompleted: row?.onboarding_completed ?? false,
  };
}

export async function updateFleetProfile(
  authUserId: string,
  patch: Partial<FleetProfile>,
): Promise<FleetProfile> {
  if (!driverSql) throw new Error("Database not configured.");
  const current = await ensureFleetProfile(authUserId);

  await driverSql.query(
    `update fleet_operator_profiles
     set company_name = $2, contact_name = $3, zone = $4, onboarding_completed = $5, updated_at = now()
     where auth_user_id = $1`,
    [
      authUserId,
      patch.companyName ?? current.companyName,
      patch.contactName ?? current.contactName,
      patch.zone ?? current.zone,
      patch.onboardingCompleted ?? current.onboardingCompleted,
    ],
  );

  return ensureFleetProfile(authUserId);
}

async function getFleetStats(authUserId: string): Promise<FleetStats> {
  if (!driverSql) {
    return { openLoads: 0, activeLoads: 0, completedLoads: 0, commissionEarned: 0, totalPosted: 0 };
  }

  const shiftRows = (await driverSql.query(
    `select status, count(*)::int as cnt
     from driver_shifts where posted_by = $1 group by status`,
    [authUserId],
  )) as Array<{ status: string; cnt: number }>;

  const commissionRows = (await driverSql.query(
    `select coalesce(sum(commission_cents), 0) as total
     from marketplace_commissions where fleet_user_id = $1`,
    [authUserId],
  )) as Array<{ total: number }>;

  const counts = Object.fromEntries(shiftRows.map((r) => [r.status, r.cnt]));
  return {
    openLoads: counts.open ?? 0,
    activeLoads: (counts.claimed ?? 0) + (counts.active ?? 0),
    completedLoads: counts.completed ?? 0,
    totalPosted: shiftRows.reduce((sum, r) => sum + r.cnt, 0),
    commissionEarned: (commissionRows[0]?.total ?? 0) / 100,
  };
}

export async function getPostedShifts(authUserId: string) {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select ${SHIFT_SELECT} where sh.posted_by = $1 order by sh.created_at desc`,
    [authUserId],
  )) as ShiftRow[];
  return rows.map(mapShiftRow);
}

export async function getActiveWorkload(authUserId: string) {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select ${SHIFT_SELECT}
     where sh.posted_by = $1 and sh.status in ('claimed', 'active')
     order by sh.claimed_at desc nulls last`,
    [authUserId],
  )) as ShiftRow[];
  return rows.map(mapShiftRow);
}

export async function searchDrivers(zone?: string | null, vehicleType?: string | null): Promise<MarketplaceDriver[]> {
  if (!driverSql) return [];

  const params: string[] = [];
  const clauses = [`onboarding_completed = true`];

  if (zone && zone !== "All zones") {
    params.push(zone);
    clauses.push(`zone = $${params.length}`);
  }
  if (vehicleType && vehicleType !== "all") {
    params.push(vehicleType);
    clauses.push(`vehicle_type = $${params.length}`);
  }

  const rows = (await driverSql.query(
    `select auth_user_id, display_name, owner_type, vehicle_type, zone,
            rating_avg, rating_count, rate_hint_cents, bio
     from driver_profiles
     where ${clauses.join(" and ")}
     order by rating_avg desc, rating_count desc
     limit 50`,
    params,
  )) as Array<{
    auth_user_id: string;
    display_name: string | null;
    owner_type: "driver" | "owner";
    vehicle_type: string;
    zone: string;
    rating_avg: string | number;
    rating_count: number;
    rate_hint_cents: number | null;
    bio: string | null;
  }>;

  return rows.map((r) => ({
    id: r.auth_user_id,
    displayName: r.display_name ?? "Independent driver",
    ownerType: r.owner_type,
    vehicleType: r.vehicle_type as MarketplaceDriver["vehicleType"],
    zone: r.zone,
    ratingAvg: Number(r.rating_avg),
    ratingCount: r.rating_count,
    rateHint: r.rate_hint_cents ? r.rate_hint_cents / 100 : null,
    bio: r.bio,
  }));
}

export async function buildFleetWorkspace(
  authUserId: string | null,
  filters?: { zone?: string | null; vehicleType?: string | null },
): Promise<FleetWorkspace> {
  const defaultProfile: FleetProfile = {
    companyName: "My Fleet",
    contactName: null,
    zone: filters?.zone ?? "DFW North",
    ratingAvg: 0,
    ratingCount: 0,
    commissionBps: COMMISSION_BPS,
    onboardingCompleted: false,
  };

  const drivers = await searchDrivers(filters?.zone, filters?.vehicleType);

  if (!authUserId || !driverSql) {
    return {
      profile: defaultProfile,
      stats: { openLoads: 0, activeLoads: 0, completedLoads: 0, commissionEarned: 0, totalPosted: 0 },
      postedShifts: [],
      activeWorkload: [],
      drivers,
      pendingOffers: [],
      notifications: [],
    };
  }

  const profile = await ensureFleetProfile(authUserId);
  const [stats, postedShifts, activeWorkload, pendingOffers, notifications] = await Promise.all([
    getFleetStats(authUserId),
    getPostedShifts(authUserId),
    getActiveWorkload(authUserId),
    getOffersForFleet(authUserId),
    getNotifications(authUserId),
  ]);

  return {
    profile,
    stats,
    postedShifts,
    activeWorkload,
    drivers,
    pendingOffers: toOfferSummary(pendingOffers),
    notifications,
  };
}

export async function postShift(authUserId: string, input: PostShiftInput) {
  if (!driverSql) throw new Error("Database not configured.");
  await ensureFleetProfile(authUserId);

  const profile = await ensureFleetProfile(authUserId);
  const rows = (await driverSql.query(
    `insert into driver_shifts (
      posted_by, title, payout_cents, payout_type, vehicle_type, vehicle_label,
      cargo_category, pickup, dropoff, start_time, end_time, hours, zone,
      distance_mi, stops, demand, shift_date, commission_bps
    ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18)
    returning id`,
    [
      authUserId,
      input.title,
      input.payoutCents,
      input.payoutType,
      input.vehicleType,
      input.vehicleLabel,
      input.cargoCategory,
      input.pickup,
      input.dropoff,
      input.startTime,
      input.endTime,
      input.hours,
      input.zone,
      input.distanceMi,
      input.stops,
      input.demand,
      input.shiftDate,
      profile.commissionBps,
    ],
  )) as Array<{ id: string }>;

  return rows[0]?.id;
}

export async function completeShift(authUserId: string, shiftId: string, role: "fleet" | "driver") {
  if (!driverSql) throw new Error("Database not configured.");

  const shiftRows = (await driverSql.query(
    `select id, posted_by, claimed_by, payout_cents, payout_type, commission_bps, status, vehicle_label, funded
     from driver_shifts where id = $1`,
    [shiftId],
  )) as Array<{
    id: string;
    posted_by: string | null;
    claimed_by: string | null;
    payout_cents: number;
    payout_type: string;
    commission_bps: number;
    status: string;
    vehicle_label: string;
    funded: boolean;
  }>;

  const shift = shiftRows[0];
  if (!shift) throw new Error("Shift not found.");
  if (!shift.claimed_by) throw new Error("Shift has not been claimed.");
  if (shift.status === "completed") throw new Error("Shift already completed.");
  if (!shift.funded) throw new Error("Cannot pay out an unfunded load. Fund escrow first.");

  if (role === "fleet" && shift.posted_by !== authUserId) {
    throw new Error("You can only complete shifts you posted.");
  }
  if (role === "driver" && shift.claimed_by !== authUserId) {
    throw new Error("You can only complete shifts you claimed.");
  }

  const gross = shift.payout_cents;
  const fee = commissionCents(gross, shift.commission_bps);
  const net = netPayoutCents(gross, shift.commission_bps);

  await driverSql.query(
    `update driver_shifts set status = 'completed', updated_at = now() where id = $1`,
    [shiftId],
  );

  await driverSql.query(
    `update driver_shift_sessions set status = 'completed', clocked_out_at = now(), updated_at = now()
     where shift_id = $1 and auth_user_id = $2`,
    [shiftId, shift.claimed_by],
  );

  await driverSql.query(
    `insert into driver_wallets (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
    [shift.claimed_by],
  );

  await driverSql.query(
    `update driver_wallets
     set available_cents = available_cents + $2,
         lifetime_cents = lifetime_cents + $2,
         updated_at = now()
     where auth_user_id = $1`,
    [shift.claimed_by, net],
  );

  const label = `${shift.vehicle_label} shift`;
  await driverSql.query(
    `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type, shift_id)
     values ($1, $2, $3, 'credit', $4)`,
    [shift.claimed_by, label, net, shiftId],
  );

  await driverSql.query(
    `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type, shift_id)
     values ($1, 'Platform commission (8%)', $2, 'deduction', $3)`,
    [shift.claimed_by, -fee, shiftId],
  );

  if (shift.posted_by) {
    await driverSql.query(
      `insert into marketplace_commissions (shift_id, fleet_user_id, driver_user_id, gross_cents, commission_cents, driver_net_cents)
       values ($1, $2, $3, $4, $5, $6)
       on conflict (shift_id) do nothing`,
      [shiftId, shift.posted_by, shift.claimed_by, gross, fee, net],
    );
  }
}

export async function submitRating(authUserId: string, input: RateInput, role: "driver" | "fleet") {
  if (!driverSql) throw new Error("Database not configured.");

  const shiftRows = (await driverSql.query(
    `select posted_by, claimed_by, status from driver_shifts where id = $1`,
    [input.shiftId],
  )) as Array<{ posted_by: string | null; claimed_by: string | null; status: string }>;

  const shift = shiftRows[0];
  if (!shift || shift.status !== "completed") throw new Error("Can only rate completed shifts.");

  let toUserId: string | null = null;
  if (role === "driver") {
    if (shift.claimed_by !== authUserId) throw new Error("Not your shift.");
    toUserId = shift.posted_by;
  } else {
    if (shift.posted_by !== authUserId) throw new Error("Not your shift.");
    toUserId = shift.claimed_by;
  }
  if (!toUserId) throw new Error("No one to rate.");

  await driverSql.query(
    `insert into marketplace_ratings (shift_id, from_user_id, to_user_id, from_role, stars, comment)
     values ($1, $2, $3, $4, $5, $6)
     on conflict (shift_id, from_user_id) do update set stars = $5, comment = $6`,
    [input.shiftId, authUserId, toUserId, role, input.stars, input.comment ?? null],
  );

  const avgRows = (await driverSql.query(
    `select round(avg(stars)::numeric, 2) as avg, count(*)::int as cnt
     from marketplace_ratings where to_user_id = $1`,
    [toUserId],
  )) as Array<{ avg: string; cnt: number }>;

  const { avg, cnt } = avgRows[0] ?? { avg: "0", cnt: 0 };

  if (role === "driver") {
    await driverSql.query(
      `update fleet_operator_profiles set rating_avg = $2, rating_count = $3, updated_at = now()
       where auth_user_id = $1`,
      [toUserId, avg, cnt],
    );
  } else {
    await driverSql.query(
      `update driver_profiles set rating_avg = $2, rating_count = $3, updated_at = now()
       where auth_user_id = $1`,
      [toUserId, avg, cnt],
    );
  }
}

export async function cancelShift(authUserId: string, shiftId: string) {
  if (!driverSql) throw new Error("Database not configured.");

  const rows = (await driverSql.query(
    `update driver_shifts
     set status = 'cancelled', updated_at = now()
     where id = $1 and posted_by = $2 and status = 'open'
     returning id`,
    [shiftId, authUserId],
  )) as Array<{ id: string }>;

  if (!rows[0]) throw new Error("Shift not found or cannot be cancelled.");
}
