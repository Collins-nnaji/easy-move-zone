import { NextResponse } from "next/server";
import {
  AdminForbiddenError,
  assertAdminApi,
} from "@/lib/auth/assert-admin-api";
import { ValidationError } from "./validation";
export async function guardAdmin(request?: Request) {
  await assertAdminApi();
  if (request && request.method !== "GET") {
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin)
      throw new AdminForbiddenError();
  }
}
export function adminError(error: unknown) {
  if (error instanceof AdminForbiddenError)
    return NextResponse.json(
      { error: "You need an authorised admin account." },
      { status: 403 },
    );
  if (error instanceof ValidationError)
    return NextResponse.json({ error: error.message }, { status: 400 });
  console.error(
    "[produce admin]",
    error instanceof Error ? error.name : "Request failed",
  );
  return NextResponse.json(
    {
      error:
        "The platform could not save or load data. Check the database connection and try again.",
    },
    { status: 503 },
  );
}
