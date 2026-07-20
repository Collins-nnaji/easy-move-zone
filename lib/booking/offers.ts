import { mapShiftRow, SHIFT_COLUMNS, type ShiftRow } from "@/lib/driver/mappers";
import { ensureFleetProfile } from "@/lib/fleet/service";
import { sendMarketplaceEmail } from "@/lib/notify/email";
import { appBaseUrl } from "@/lib/payments/stripe";
import type { Shift } from "@/lib/driver/types";
import { DEFAULT_WAYPOINTS, driverSql } from "@/lib/driver/db";

export interface BookingOffer {
  id: string;
  shiftId: string;
  fleetUserId: string;
  driverUserId: string;
  status: "pending" | "accepted" | "declined" | "cancelled" | "expired";
  message: string | null;
  createdAt: string;
  companyName: string | null;
  driverName: string | null;
  shift: Shift;
}

export interface AppNotification {
  id: string;
  kind: string;
  title: string;
  body: string;
  link: string | null;
  readAt: string | null;
  createdAt: string;
}

async function createNotification(input: {
  userId: string;
  kind: string;
  title: string;
  body: string;
  link?: string;
  meta?: Record<string, unknown>;
}) {
  if (!driverSql) return;
  await driverSql.query(
    `insert into marketplace_notifications (user_id, kind, title, body, link, meta)
     values ($1, $2, $3, $4, $5, $6::jsonb)`,
    [
      input.userId,
      input.kind,
      input.title,
      input.body,
      input.link ?? null,
      JSON.stringify(input.meta ?? {}),
    ],
  );
}

function mapOfferRow(row: ShiftRow & {
  offer_id: string;
  fleet_user_id: string;
  driver_user_id: string;
  offer_status: BookingOffer["status"];
  offer_message: string | null;
  offer_created_at: string;
  company_name: string | null;
  driver_name: string | null;
}): BookingOffer {
  return {
    id: row.offer_id,
    shiftId: row.id,
    fleetUserId: row.fleet_user_id,
    driverUserId: row.driver_user_id,
    status: row.offer_status,
    message: row.offer_message,
    createdAt: row.offer_created_at,
    companyName: row.company_name,
    driverName: row.driver_name,
    shift: mapShiftRow(row),
  };
}

export async function createDriverOffer(input: {
  fleetUserId: string;
  driverUserId: string;
  shiftId: string;
  message?: string;
}): Promise<BookingOffer> {
  if (!driverSql) throw new Error("Database not configured.");
  await ensureFleetProfile(input.fleetUserId);

  const shifts = (await driverSql.query(
    `select id, posted_by, status from driver_shifts where id = $1`,
    [input.shiftId],
  )) as Array<{ id: string; posted_by: string | null; status: string }>;

  const shift = shifts[0];
  if (!shift) throw new Error("Load not found.");
  if (shift.posted_by !== input.fleetUserId) throw new Error("You can only book drivers on your own loads.");
  if (shift.status !== "open") throw new Error("Load is no longer open.");

  const drivers = (await driverSql.query(
    `select auth_user_id, display_name, contact_email from driver_profiles where auth_user_id = $1`,
    [input.driverUserId],
  )) as Array<{ auth_user_id: string; display_name: string | null; contact_email: string | null }>;

  if (!drivers[0]) throw new Error("Driver not found.");

  const inserted = (await driverSql.query(
    `insert into marketplace_offers (shift_id, fleet_user_id, driver_user_id, message, status)
     values ($1, $2, $3, $4, 'pending')
     on conflict (shift_id, driver_user_id) where (status = 'pending') do nothing
     returning id`,
    [input.shiftId, input.fleetUserId, input.driverUserId, input.message ?? null],
  )) as Array<{ id: string }>;

  let offerId = inserted[0]?.id;
  if (!offerId) {
    const existing = (await driverSql.query(
      `select id from marketplace_offers
       where shift_id = $1 and driver_user_id = $2 and status = 'pending'`,
      [input.shiftId, input.driverUserId],
    )) as Array<{ id: string }>;
    offerId = existing[0]?.id;
    if (!offerId) throw new Error("Unable to create booking offer.");
  }

  const fleet = await ensureFleetProfile(input.fleetUserId);
  const title = `${fleet.companyName} booked you for a load`;
  const body = input.message?.trim()
    || `You have a direct booking offer. Open the app to accept and lock it in.`;

  await createNotification({
    userId: input.driverUserId,
    kind: "offer",
    title,
    body,
    link: "/move/shifts",
    meta: { offerId, shiftId: input.shiftId },
  });

  if (drivers[0].contact_email) {
    await sendMarketplaceEmail({
      to: drivers[0].contact_email,
      subject: title,
      text: `${body}\n\nAccept here: ${appBaseUrl()}/move/shifts\n\n— EasyMoveZone`,
    });
  }

  const offers = await getOffersForDriver(input.driverUserId);
  const created = offers.find((o) => o.id === offerId);
  if (!created) throw new Error("Offer created but could not be loaded.");
  return created;
}

export async function getOffersForDriver(driverUserId: string): Promise<BookingOffer[]> {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select o.id as offer_id, o.fleet_user_id, o.driver_user_id, o.status as offer_status,
            o.message as offer_message, o.created_at as offer_created_at,
            fo.company_name, dp.display_name as driver_name,
            ${SHIFT_COLUMNS}
     from marketplace_offers o
     join driver_shifts sh on sh.id = o.shift_id
     left join fleet_operator_profiles fo on fo.auth_user_id = o.fleet_user_id
     left join driver_profiles dp on dp.auth_user_id = o.driver_user_id
     where o.driver_user_id = $1 and o.status = 'pending' and sh.status = 'open'
     order by o.created_at desc`,
    [driverUserId],
  )) as Array<ShiftRow & {
    offer_id: string;
    fleet_user_id: string;
    driver_user_id: string;
    offer_status: BookingOffer["status"];
    offer_message: string | null;
    offer_created_at: string;
    company_name: string | null;
    driver_name: string | null;
  }>;

  return rows.map(mapOfferRow);
}

export async function getOffersForFleet(fleetUserId: string): Promise<BookingOffer[]> {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select o.id as offer_id, o.fleet_user_id, o.driver_user_id, o.status as offer_status,
            o.message as offer_message, o.created_at as offer_created_at,
            fo.company_name, dp.display_name as driver_name,
            ${SHIFT_COLUMNS}
     from marketplace_offers o
     join driver_shifts sh on sh.id = o.shift_id
     left join fleet_operator_profiles fo on fo.auth_user_id = o.fleet_user_id
     left join driver_profiles dp on dp.auth_user_id = o.driver_user_id
     where o.fleet_user_id = $1 and o.status = 'pending'
     order by o.created_at desc
     limit 50`,
    [fleetUserId],
  )) as Array<ShiftRow & {
    offer_id: string;
    fleet_user_id: string;
    driver_user_id: string;
    offer_status: BookingOffer["status"];
    offer_message: string | null;
    offer_created_at: string;
    company_name: string | null;
    driver_name: string | null;
  }>;

  return rows.map(mapOfferRow);
}

export async function acceptOffer(driverUserId: string, offerId: string) {
  if (!driverSql) throw new Error("Database not configured.");

  const rows = (await driverSql.query(
    `select id, shift_id, fleet_user_id, status
     from marketplace_offers
     where id = $1 and driver_user_id = $2`,
    [offerId, driverUserId],
  )) as Array<{ id: string; shift_id: string; fleet_user_id: string; status: string }>;

  const offer = rows[0];
  if (!offer) throw new Error("Offer not found.");
  if (offer.status !== "pending") throw new Error("Offer is no longer pending.");

  await driverSql.query(
    `insert into driver_profiles (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
    [driverUserId],
  );
  await driverSql.query(
    `insert into driver_wallets (auth_user_id) values ($1) on conflict (auth_user_id) do nothing`,
    [driverUserId],
  );

  const claimed = (await driverSql.query(
    `update driver_shifts
     set status = 'claimed', claimed_by = $2, claimed_at = now(), updated_at = now()
     where id = $1 and status = 'open'
     returning id`,
    [offer.shift_id, driverUserId],
  )) as Array<{ id: string }>;

  if (!claimed[0]) throw new Error("Load is no longer available.");

  await driverSql.query(
    `insert into driver_shift_sessions (shift_id, auth_user_id, waypoints, status)
     values ($1, $2, $3::jsonb, 'scheduled')
     on conflict (shift_id, auth_user_id) do nothing`,
    [offer.shift_id, driverUserId, JSON.stringify(DEFAULT_WAYPOINTS)],
  );

  await driverSql.query(
    `update marketplace_offers set status = 'accepted', updated_at = now() where id = $1`,
    [offerId],
  );

  await driverSql.query(
    `update marketplace_offers
     set status = 'cancelled', updated_at = now()
     where shift_id = $1 and status = 'pending' and id <> $2`,
    [offer.shift_id, offerId],
  );

  return { shiftId: offer.shift_id };
}

export async function declineOffer(driverUserId: string, offerId: string) {
  if (!driverSql) throw new Error("Database not configured.");

  const rows = (await driverSql.query(
    `update marketplace_offers
     set status = 'declined', updated_at = now()
     where id = $1 and driver_user_id = $2 and status = 'pending'
     returning id`,
    [offerId, driverUserId],
  )) as Array<{ id: string }>;

  if (!rows[0]) throw new Error("Offer not found or already handled.");
}

export async function notifyFleetOfClaim(input: {
  shiftId: string;
  driverUserId: string;
  driverName?: string | null;
}) {
  if (!driverSql) return;

  const shifts = (await driverSql.query(
    `select sh.id, sh.title, sh.vehicle_label, sh.posted_by, fo.company_name, fo.contact_email
     from driver_shifts sh
     left join fleet_operator_profiles fo on fo.auth_user_id = sh.posted_by
     where sh.id = $1`,
    [input.shiftId],
  )) as Array<{
    id: string;
    title: string | null;
    vehicle_label: string;
    posted_by: string | null;
    company_name: string | null;
    contact_email: string | null;
  }>;

  const shift = shifts[0];
  if (!shift?.posted_by) return;

  const driverLabel = input.driverName?.trim() || "A driver";
  const loadLabel = shift.title ?? shift.vehicle_label;
  const title = `${driverLabel} claimed your load`;
  const body = `${loadLabel} is now booked. Open the fleet console to track it.`;

  await createNotification({
    userId: shift.posted_by,
    kind: "claim",
    title,
    body,
    link: "/fleet/loads",
    meta: { shiftId: input.shiftId, driverUserId: input.driverUserId },
  });

  if (shift.contact_email) {
    await sendMarketplaceEmail({
      to: shift.contact_email,
      subject: title,
      text: `${body}\n\nView load: ${appBaseUrl()}/fleet/loads\n\n— EasyMoveZone`,
    });
  }
}

export async function getNotifications(userId: string, limit = 20): Promise<AppNotification[]> {
  if (!driverSql) return [];
  const rows = (await driverSql.query(
    `select id, kind, title, body, link, read_at, created_at
     from marketplace_notifications
     where user_id = $1
     order by created_at desc
     limit $2`,
    [userId, limit],
  )) as Array<{
    id: string;
    kind: string;
    title: string;
    body: string;
    link: string | null;
    read_at: string | null;
    created_at: string;
  }>;

  return rows.map((r) => ({
    id: r.id,
    kind: r.kind,
    title: r.title,
    body: r.body,
    link: r.link,
    readAt: r.read_at,
    createdAt: r.created_at,
  }));
}

export async function saveContactEmail(role: "driver" | "fleet", authUserId: string, email: string) {
  if (!driverSql || !email) return;
  if (role === "fleet") {
    await ensureFleetProfile(authUserId);
    await driverSql.query(
      `update fleet_operator_profiles set contact_email = $2, updated_at = now() where auth_user_id = $1`,
      [authUserId, email.toLowerCase()],
    );
  } else {
    await driverSql.query(
      `update driver_profiles set contact_email = $2, updated_at = now() where auth_user_id = $1`,
      [authUserId, email.toLowerCase()],
    );
  }
}
