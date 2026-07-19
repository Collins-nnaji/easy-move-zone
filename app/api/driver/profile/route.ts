import { neonAuth } from "@neondatabase/auth/next/server";
import { updateDriverProfile } from "@/lib/driver/service";
import type { DriverProfile, VehicleType } from "@/lib/driver/types";

export const runtime = "nodejs";

const VEHICLES = new Set<VehicleType>(["sprinter", "box-truck", "client-fleet", "flatbed"]);

export async function PATCH(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in to save your profile." }, { status: 401 });

    const body = (await request.json()) as Partial<DriverProfile>;
    const patch: Partial<DriverProfile> = {};

    if (typeof body.zone === "string" && body.zone.trim()) patch.zone = body.zone.trim();
    if (body.vehicleType && VEHICLES.has(body.vehicleType)) patch.vehicleType = body.vehicleType;
    if (typeof body.onboardingCompleted === "boolean") patch.onboardingCompleted = body.onboardingCompleted;

    const profile = await updateDriverProfile(String(user.id), patch);
    return Response.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to update profile.";
    return Response.json({ error: message }, { status: 500 });
  }
}
