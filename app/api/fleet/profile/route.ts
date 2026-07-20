import { neonAuth } from "@neondatabase/auth/next/server";
import { saveContactEmail } from "@/lib/booking/offers";
import { updateFleetProfile } from "@/lib/fleet/service";

export const runtime = "nodejs";

export async function PATCH(request: Request) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const body = (await request.json()) as {
      companyName?: string;
      contactName?: string;
      zone?: string;
      onboardingCompleted?: boolean;
    };

    if (user.email) await saveContactEmail("fleet", String(user.id), String(user.email));

    const profile = await updateFleetProfile(String(user.id), body);
    return Response.json({ profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to update profile.";
    return Response.json({ error: message }, { status: 400 });
  }
}
