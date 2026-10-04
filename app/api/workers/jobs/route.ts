import { NextResponse } from "next/server";
import { requireSessionUser } from "@/lib/auth/session";
import { updateAssignedJob } from "@/lib/moving/store";
import { resolveWorkerForUser } from "@/lib/moving/worker-store";
import { WORKER_PROGRESS } from "@/lib/moving/workers";

export async function PATCH(request: Request) {
  const user = await requireSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  if (
    request.headers.get("origin") &&
    request.headers.get("origin") !== new URL(request.url).origin
  )
    return NextResponse.json({ error: "Invalid origin." }, { status: 403 });
  try {
    const body = await request.json();
    if (
      !WORKER_PROGRESS.includes(body.status) ||
      typeof body.arrival !== "string" ||
      body.arrival.length > 200 ||
      typeof body.reference !== "string"
    )
      return NextResponse.json(
        { error: "Check the job status and arrival note." },
        { status: 400 },
      );
    const worker = await resolveWorkerForUser(user);
    if (!worker)
      return NextResponse.json({ error: "Create your profile first." }, { status: 404 });
    const move = await updateAssignedJob(worker.id, body.reference, {
      status: body.status,
      arrival: body.arrival,
    });
    return NextResponse.json(
      move ? { move } : { error: "This job is not assigned to you." },
      { status: move ? 200 : 404 },
    );
  } catch {
    return NextResponse.json(
      { error: "Could not update this job." },
      { status: 503 },
    );
  }
}
