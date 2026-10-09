import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import {
  assertAdminApi,
  AdminForbiddenError,
} from "@/lib/auth/assert-admin-api";
import { getMove, listMoves } from "@/lib/moving/store";
import { resolveWorkerForUser, listWorkers } from "@/lib/moving/worker-store";
import { customerMoves, changeMove } from "@/lib/marketplace/moves";
import {
  account,
  pricing,
  getRecord,
  putRecord,
  listRecords,
  workerExtras,
  marketplaceDb,
} from "@/lib/marketplace/store";
import { body, InputError, text, reference } from "@/lib/marketplace/http";
import {
  validPricing,
  validPhotos,
  canChangeMove,
  workerEarning,
  type Review,
  type Checklist,
  type EvidenceItem,
  type Claim,
  type Payout,
  type Payment,
  type FleetVehicle,
} from "@/lib/marketplace/model";
import { today } from "@/lib/moving/model";
import {
  queueUpdate,
  deliverUpdates,
  type Notification,
} from "@/lib/marketplace/notifications";
const noStore = { "Cache-Control": "no-store" };
function failure(e: unknown) {
  return NextResponse.json(
    {
      error:
        e instanceof InputError
          ? e.message
          : e instanceof AdminForbiddenError
            ? "Forbidden."
            : "Service temporarily unavailable. Please try again.",
    },
    {
      status:
        e instanceof InputError
          ? e.status
          : e instanceof AdminForbiddenError
            ? 403
            : 503,
      headers: noStore,
    },
  );
}
export async function GET(request: Request) {
  try {
    const scope = new URL(request.url).searchParams.get("scope");
    if (scope === "public")
      return NextResponse.json(
        {
          pricing: await pricing(),
          reviews: (await listRecords<Review>("review"))
            .filter((r) => r.published)
            .map((r) => ({
              name: r.name,
              city: r.city,
              rating: r.rating,
              text: r.text,
              createdAt: r.createdAt,
            })),
        },
        { headers: noStore },
      );
    if (scope === "checkout") {
      const ref = new URL(request.url).searchParams.get("reference");
      if (!reference(ref))
        throw new InputError("Enter a valid move reference.");
      const move = await getMove(ref);
      if (!move) throw new InputError("Move not found.", 404);
      const payments = (await listRecords<Payment>("payment", ref)).map(
        ({ id, amount, purpose, status, paidAt }) => ({
          id,
          amount,
          purpose,
          status,
          paidAt,
        }),
      );
      return NextResponse.json(
        {
          reference: ref,
          quote: move.quote,
          paidAmount: move.paidAmount ?? 0,
          status: move.status,
          depositPercent: move.depositPercent ?? 30,
          payments,
        },
        { headers: noStore },
      );
    }
    if (scope === "job") {
      const user = await requireSessionUser();
      if (!user) throw new InputError("Sign in required.", 401);
      const ref = new URL(request.url).searchParams.get("reference");
      if (!reference(ref)) throw new InputError("Invalid reference.");
      const worker = await resolveWorkerForUser(user);
      const move = await getMove(ref);
      if (
        !worker ||
        !move ||
        ![move.moverId, move.vehicleId].includes(worker.id)
      )
        throw new InputError("Job not assigned to you.", 403);
      return NextResponse.json(
        { checklists: await listRecords<Checklist>("checklist", ref) },
        { headers: noStore },
      );
    }
    if (scope === "admin") {
      await assertAdminApi();
      const [
        moves,
        workers,
        rules,
        reviews,
        claims,
        payouts,
        payments,
        notifications,
        verifications,
      ] = await Promise.all([
        listMoves(),
        listWorkers(),
        pricing(),
        listRecords<Review>("review"),
        listRecords<Claim>("claim"),
        listRecords<Payout>("payout"),
        listRecords<Payment>("payment"),
        listRecords<Notification>("notification"),
        listRecords("worker"),
      ]);
      return NextResponse.json(
        {
          moves,
          workers,
          pricing: rules,
          reviews,
          claims,
          payouts,
          payments,
          notifications,
          verifications,
        },
        { headers: noStore },
      );
    }
    const user = await requireSessionUser();
    if (!user) throw new InputError("Sign in required.", 401);
    if (scope === "worker") {
      const worker = await resolveWorkerForUser(user);
      if (!worker) throw new InputError("Create your crew profile first.", 404);
      return NextResponse.json(
        {
          extras: await workerExtras(worker.id),
          payouts: await listRecords<Payout>("payout", worker.id),
        },
        { headers: noStore },
      );
    }
    const moves = await customerMoves(user.userId);
    const [profile, payments, claims, reviews, checklists] = await Promise.all([
      account(user.userId),
      listRecords<Payment>("payment"),
      listRecords<Claim>("claim", user.userId),
      listRecords<Review>("review", user.userId),
      listRecords<Checklist>("checklist"),
    ]);
    const refs = new Set(moves.map((m) => m.reference));
    return NextResponse.json(
      {
        moves,
        profile,
        claims,
        reviews,
        payments: payments.filter((p) => refs.has(p.reference)),
        checklists: checklists.filter((c) => refs.has(c.reference)),
      },
      { headers: noStore },
    );
  } catch (e) {
    return failure(e);
  }
}
export async function POST(request: Request) {
  try {
    const b = await body(request);
    if (typeof b.action !== "string") throw new InputError("Choose an action.");
    if (b.action.startsWith("admin:")) {
      await assertAdminApi();
      if (b.action === "admin:pricing") {
        if (!validPricing(b.pricing))
          throw new InputError(
            "Check pricing rules: commission 10–20%, deposit 10–100%, nonnegative fees.",
          );
        await putRecord("settings", "pricing", b.pricing);
      } else if (b.action === "admin:review") {
        const r = await getRecord<Review>("review", b.reference);
        if (!r || typeof b.published !== "boolean")
          throw new InputError("Review not found.");
        const sql = await marketplaceDb();
        await sql`UPDATE emz_marketplace SET data=data || ${JSON.stringify({ published: b.published })}::jsonb WHERE kind='review' AND id=${b.reference}`;
      } else if (b.action === "admin:claim") {
        const c = await getRecord<Claim>("claim", b.id);
        if (
          !c ||
          !["open", "reviewing", "resolved"].includes(b.status) ||
          !text(b.notes, 2000, 0)
        )
          throw new InputError("Check claim status and notes.");
        await putRecord(
          "claim",
          c.id,
          { ...c, status: b.status, notes: b.notes },
          c.userId,
        );
      } else if (b.action === "admin:verify") {
        const x = await workerExtras(b.workerId);
        if (
          !["pending", "verified", "rejected"].includes(b.status) ||
          !text(b.notes, 1000, 0)
        )
          throw new InputError("Check verification details.");
        const workers = await listWorkers();
        const worker = workers.find((w) => w.id === b.workerId);
        if (!worker) throw new InputError("Worker not found.", 404);
        if (
          b.status === "verified" &&
          (!x.verification.idPhoto ||
            !x.verification.guarantorName ||
            !x.verification.guarantorPhone ||
            (worker.kind === "vehicle" &&
              (!x.verification.licencePhoto || !x.verification.vehiclePhoto)))
        )
          throw new InputError(
            "ID, guarantor and applicable vehicle documents must be submitted before approval.",
          );
        await putRecord(
          "worker",
          b.workerId,
          {
            ...x,
            verification: {
              ...x.verification,
              status: b.status,
              notes: b.notes,
            },
          },
          b.workerId,
        );
      } else if (b.action === "admin:payout") {
        if (
          !reference(b.reference) ||
          !text(b.workerId, 100) ||
          !Number.isInteger(b.amount) ||
          b.amount <= 0 ||
          !text(b.bankReference, 120)
        )
          throw new InputError(
            "Check payout amount and bank transaction reference.",
          );
        const m = await getMove(b.reference);
        if (
          !m ||
          m.status !== "completed" ||
          (m.paidAmount ?? 0) < (m.quote ?? Infinity) ||
          ![m.moverId, m.vehicleId].includes(b.workerId)
        )
          throw new InputError(
            "Payouts require a fully paid, completed job assigned to this worker.",
          );
        const payout: Payout = {
          id: crypto.randomUUID(),
          workerId: b.workerId,
          reference: b.reference,
          amount: b.amount,
          bankReference: b.bankReference.trim(),
          createdAt: new Date().toISOString(),
        };
        const sql = await marketplaceDb();
        const result = await sql.transaction([
          sql`SELECT pg_advisory_xact_lock(719260101)`,
          sql`INSERT INTO emz_marketplace(kind,id,owner_id,data) SELECT 'payout',${payout.id},${payout.workerId},${JSON.stringify(payout)}::jsonb WHERE
          COALESCE((SELECT SUM((data->>'amount')::numeric) FROM emz_marketplace WHERE kind='payout' AND data->>'reference'=${m.reference}),0)+${b.amount}<=${workerEarning(m)}
          AND EXISTS(SELECT 1 FROM emz_moves WHERE reference=${m.reference} AND data=${JSON.stringify(m)}::jsonb)
          AND NOT EXISTS(SELECT 1 FROM emz_marketplace WHERE kind='payout' AND data->>'bankReference'=${payout.bankReference}) RETURNING data`,
        ]);
        if (!result[1].length)
          throw new InputError(
            "Payout exceeds the job's net earnings or bank reference is already recorded.",
            409,
          );
      } else if (b.action === "admin:reconcile") {
        if (typeof b.id !== "string" || !/^EMZPAY-[a-f0-9-]{36}$/.test(b.id))
          throw new InputError("Invalid payment.");
        const { settlePayment, paystack } =
          await import("@/lib/marketplace/paystack");
        const p = await getRecord<Payment>("payment", b.id);
        if (!p) throw new InputError("Payment not found.", 404);
        const verified = await paystack(
          `transaction/verify/${encodeURIComponent(b.id)}`,
        );
        if (verified.status === "success") await settlePayment(b.id);
        else if (
          ["failed", "abandoned", "reversed"].includes(verified.status)
        ) {
          const sql = await marketplaceDb();
          await sql`UPDATE emz_marketplace SET data=data || '{"status":"failed"}'::jsonb WHERE kind='payment' AND id=${b.id} AND data->>'status'='pending'`;
        } else
          throw new InputError(
            "Provider still reports this payment as pending. Keep the checkout open.",
            409,
          );
      } else if (b.action === "admin:notifications")
        return NextResponse.json(await deliverUpdates());
      else throw new InputError("Unknown action.");
      return NextResponse.json({ ok: true });
    }
    const user = await requireSessionUser();
    if (!user) throw new InputError("Sign in required.", 401);
    if (b.action === "account") {
      if (
        !Array.isArray(b.addresses) ||
        b.addresses.length > 10 ||
        !b.addresses.every(
          (a: { label: unknown; address: unknown }) =>
            a && text(a.label, 80) && text(a.address, 500),
        )
      )
        throw new InputError("Save up to 10 labelled addresses.");
      if (
        b.business !== null &&
        (!b.business ||
          !text(b.business.name, 120) ||
          !["Office", "Furniture store", "Estate agency", "Other"].includes(
            b.business.kind,
          ) ||
          !text(b.business.cac, 80, 0))
      )
        throw new InputError("Check your business details.");
      await putRecord(
        "account",
        user.userId,
        { addresses: b.addresses, business: b.business },
        user.userId,
      );
      return NextResponse.json({ ok: true });
    }
    if (b.action === "worker") {
      const worker = await resolveWorkerForUser(user);
      if (!worker) throw new InputError("Create your crew profile first.", 404);
      const old = await workerExtras(worker.id);
      const v = b.verification;
      if (
        !v ||
        !validPhotos(
          [v.idPhoto, v.licencePhoto, v.vehiclePhoto].filter(Boolean),
        ) ||
        !text(v.guarantorName, 120, 0) ||
        !text(v.guarantorPhone, 40, 0) ||
        (v.guarantorPhone && !/^[+\d ()-]{7,40}$/.test(v.guarantorPhone)) ||
        typeof b.available !== "boolean" ||
        !Array.isArray(b.fleet) ||
        b.fleet.length > 20 ||
        !b.fleet.every(
          (f: FleetVehicle) =>
            f &&
            text(f.id, 80) &&
            ["Van", "Pickup", "Truck", "Flatbed", "10-tonne truck"].includes(
              f.type,
            ) &&
            text(f.plate, 20) &&
            text(f.capacity, 80) &&
            text(f.areas, 300) &&
            typeof f.available === "boolean",
        )
      )
        throw new InputError(
          "Check documents, guarantor, availability and fleet details.",
        );
      const documentsChanged = [
        "idPhoto",
        "licencePhoto",
        "vehiclePhoto",
        "guarantorName",
        "guarantorPhone",
      ].some(
        (k) => v[k] !== old.verification[k as keyof typeof old.verification],
      );
      await putRecord(
        "worker",
        worker.id,
        {
          workerId: worker.id,
          available: b.available,
          fleet: b.fleet,
          verification: {
            idPhoto: v.idPhoto,
            licencePhoto: v.licencePhoto,
            vehiclePhoto: v.vehiclePhoto,
            guarantorName: v.guarantorName,
            guarantorPhone: v.guarantorPhone,
            status: documentsChanged ? "pending" : old.verification.status,
            notes: old.verification.notes,
          },
        },
        worker.id,
      );
      return NextResponse.json({ ok: true });
    }
    if (!reference(b.reference))
      throw new InputError("Invalid move reference.");
    const move = await getMove(b.reference);
    if (!move) throw new InputError("Move not found.", 404);
    const owned = move.userId === user.userId;
    const worker =
      b.action === "checklist" ? await resolveWorkerForUser(user) : null;
    const assigned =
      worker && [move.moverId, move.vehicleId].includes(worker.id);
    if (!owned && !assigned)
      throw new InputError(
        "This move is not in your account. Book while signed in to save your move history.",
        403,
      );
    if (b.action === "cancel" || b.action === "reschedule") {
      if (!owned || !canChangeMove(move))
        throw new InputError(
          "Online changes close 48 hours before moving day. Contact support for later changes.",
          409,
        );
      if (
        b.action === "reschedule" &&
        (typeof b.date !== "string" ||
          !/^\d{4}-\d{2}-\d{2}$/.test(b.date) ||
          !Number.isFinite(Date.parse(b.date)) ||
          new Date(b.date).toISOString().slice(0, 10) !== b.date ||
          b.date < today() ||
          new Date(`${b.date}T00:00:00+01:00`).getTime() - Date.now() <
            48 * 3600000)
      )
        throw new InputError("Choose a valid date at least 48 hours away.");
      const updated = await changeMove(
        move,
        b.action === "cancel" ? { status: "cancelled" } : { date: b.date },
      );
      await queueUpdate(updated);
      return NextResponse.json({
        ok: true,
        move: updated,
        refundReview: b.action === "cancel" && (move.paidAmount ?? 0) > 0,
      });
    }
    if (b.action === "review") {
      if (
        !owned ||
        move.status !== "completed" ||
        !Number.isInteger(b.rating) ||
        b.rating < 1 ||
        b.rating > 5 ||
        !text(b.text, 1500, 5)
      )
        throw new InputError(
          "Reviews are available for completed moves. Add a rating and at least 5 characters.",
        );
      const r: Review = {
        reference: move.reference,
        name: move.name.split(" ")[0],
        city: move.city ?? "Lagos",
        rating: b.rating,
        text: b.text.trim(),
        createdAt: new Date().toISOString(),
        published: false,
      };
      await putRecord("review", move.reference, r, user.userId);
    } else if (b.action === "claim") {
      if (!owned || !text(b.description, 2000, 10) || !validPhotos(b.photos))
        throw new InputError("Describe the issue and attach up to 3 photos.");
      const c: Claim = {
        id: crypto.randomUUID(),
        reference: move.reference,
        userId: user.userId,
        description: b.description,
        photos: b.photos,
        status: "open",
        notes: "",
        createdAt: new Date().toISOString(),
      };
      await putRecord("claim", c.id, c, user.userId);
    } else if (b.action === "checklist") {
      if (!["pickup", "delivery"].includes(b.phase))
        throw new InputError("Choose pickup or delivery.");
      const id = `${move.reference}:${b.phase}`;
      const current = await getRecord<Checklist>("checklist", id);
      if (current?.signedAt)
        throw new InputError("Signed checklists cannot be edited.", 409);
      if (b.sign) {
        if (!owned || !current?.items.length)
          throw new InputError(
            "Only the customer can sign a recorded checklist.",
          );
        const sql = await marketplaceDb();
        const rows =
          await sql`UPDATE emz_marketplace SET data=data || ${JSON.stringify({ signedBy: user.name || move.name, signedAt: new Date().toISOString() })}::jsonb WHERE kind='checklist' AND id=${id} AND data=${JSON.stringify(current)}::jsonb RETURNING data`;
        if (!rows.length)
          throw new InputError(
            "Checklist changed. Refresh before signing.",
            409,
          );
      } else {
        if (
          !Array.isArray(b.items) ||
          b.items.length < 1 ||
          b.items.length > 100 ||
          !b.items.every(
            (i: EvidenceItem) =>
              i &&
              text(i.id, 80) &&
              text(i.name, 200) &&
              text(i.condition, 500) &&
              (i.photo === "" || validPhotos([i.photo])),
          )
        )
          throw new InputError(
            "Add item names, condition and JPG/PNG/WebP photos.",
          );
        const c: Checklist = {
          reference: move.reference,
          phase: b.phase,
          items: b.items,
          signedBy: "",
          signedAt: null,
          recordedBy: user.userId,
        };
        const sql = await marketplaceDb();
        const rows =
          await sql`INSERT INTO emz_marketplace(kind,id,owner_id,data) VALUES('checklist',${id},${move.reference},${JSON.stringify(c)}::jsonb) ON CONFLICT(kind,id) DO UPDATE SET data=excluded.data, updated_at=now() WHERE emz_marketplace.data->>'signedAt' IS NULL RETURNING data`;
        if (!rows.length)
          throw new InputError(
            "Checklist was signed while editing. Refresh.",
            409,
          );
      }
    } else throw new InputError("Unknown action.");
    return NextResponse.json({ ok: true });
  } catch (e) {
    return failure(e);
  }
}
