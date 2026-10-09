import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { listJobsForWorker } from "@/lib/moving/store";
import {
  getWorkerByEmail,
  replaceWorker,
  resolveWorkerForUser,
  saveWorker,
} from "@/lib/moving/worker-store";
import { validateWorkerDraft, type Worker } from "@/lib/moving/workers";

import { workerExtras, putRecord } from "@/lib/marketplace/store";

function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

export async function GET() {
  const user = await requireSessionUser();
  if (!user)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  try {
    const worker = await resolveWorkerForUser(user);
    const jobs = worker ? await listJobsForWorker(worker.id) : [];
    return NextResponse.json(
      { worker, jobs },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not load your hub." },
      { status: 503 },
    );
  }
}

export async function POST(request: Request) {
  const user = await requireSessionUser();
  if (!user)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  try {
    const body = await request.json();
    if (!validateWorkerDraft(body))
      return NextResponse.json(
        { error: "Check your name, phone, area and vehicle or crew details." },
        { status: 400 },
      );
    const existing = await resolveWorkerForUser(user);
    if (existing)
      return NextResponse.json(
        { error: "You already have a crew profile.", worker: existing },
        { status: 409 },
      );
    const emailOwner = await getWorkerByEmail(user.email);
    if (emailOwner)
      return NextResponse.json(
        { error: "This email is already registered as crew." },
        { status: 409 },
      );
    const worker: Worker = {
      ...body,
      name: body.name.trim(),
      phone: body.phone.trim(),
      notes: body.notes.trim(),
      plate: body.plate.trim().toUpperCase(),
      capacity: body.capacity.trim(),
      id: crypto.randomUUID(),
      userId: user.userId,
      email: user.email,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json(
      { worker: await saveWorker(worker) },
      { status: 201 },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not save your profile. Please try again." },
      { status: 503 },
    );
  }
}

export async function PATCH(request: Request) {
  const user = await requireSessionUser();
  if (!user)
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (!sameOrigin(request))
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  try {
    const body = await request.json();
    if (!validateWorkerDraft(body))
      return NextResponse.json(
        { error: "Check your name, phone, area and vehicle or crew details." },
        { status: 400 },
      );
    const current = await resolveWorkerForUser(user);
    if (!current)
      return NextResponse.json(
        { error: "Create your profile first." },
        { status: 404 },
      );
    if (
      (["kind", "name", "vehicleType", "plate", "capacity"] as const).some(
        (k) => body[k] !== current[k as keyof typeof current],
      )
    ) {
      const x = await workerExtras(current.id);
      await putRecord(
        "worker",
        current.id,
        {
          ...x,
          verification: {
            ...x.verification,
            status: "pending",
            notes:
              "Profile changed. Operations must review the updated partner details.",
          },
        },
        current.id,
      );
    }
    const worker = await replaceWorker({
      ...current,
      ...body,
      name: body.name.trim(),
      phone: body.phone.trim(),
      notes: body.notes.trim(),
      plate: body.plate.trim().toUpperCase(),
      capacity: body.capacity.trim(),
      id: current.id,
      userId: current.userId,
      email: current.email,
      createdAt: current.createdAt,
    });
    return NextResponse.json({ worker });
  } catch {
    return NextResponse.json(
      { error: "Could not update your profile." },
      { status: 503 },
    );
  }
}
