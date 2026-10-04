import { NextResponse } from "next/server";
import {
  AdminForbiddenError,
  assertAdminApi,
} from "@/lib/auth/assert-admin-api";
import {
  getWorkerByEmail,
  listWorkers,
  saveWorker,
} from "@/lib/moving/worker-store";
import { validateWorkerDraft, type Worker } from "@/lib/moving/workers";

export async function GET() {
  try {
    await assertAdminApi();
    return NextResponse.json(
      { workers: await listWorkers() },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof AdminForbiddenError
            ? "Forbidden"
            : "Could not load crew.",
      },
      { status: error instanceof AdminForbiddenError ? 403 : 503 },
    );
  }
}

export async function POST(request: Request) {
  try {
    await assertAdminApi();
    if (
      request.headers.get("origin") &&
      request.headers.get("origin") !== new URL(request.url).origin
    )
      return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
    const body = await request.json();
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !validateWorkerDraft(body))
      return NextResponse.json(
        { error: "Check the email, phone, area and crew or vehicle details." },
        { status: 400 },
      );
    if (await getWorkerByEmail(email))
      return NextResponse.json(
        { error: "A crew profile with this email already exists." },
        { status: 409 },
      );
    const worker: Worker = {
      ...body,
      name: body.name.trim(),
      phone: body.phone.trim(),
      notes: body.notes.trim(),
      plate: body.plate.trim().toUpperCase(),
      capacity: body.capacity.trim(),
      email,
      id: crypto.randomUUID(),
      userId: null,
      createdAt: new Date().toISOString(),
    };
    return NextResponse.json({ worker: await saveWorker(worker) }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        error:
          error instanceof AdminForbiddenError
            ? "Forbidden"
            : "Could not add this crew member.",
      },
      { status: error instanceof AdminForbiddenError ? 403 : 503 },
    );
  }
}
