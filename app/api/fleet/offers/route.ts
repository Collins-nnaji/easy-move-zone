import { neonAuth } from "@neondatabase/auth/next/server";
import { createDriverOffer, saveContactEmail } from "@/lib/booking/offers";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const { user } = await neonAuth();
    if (!user) return Response.json({ error: "Sign in required." }, { status: 401 });

    if (user.email) await saveContactEmail("fleet", String(user.id), String(user.email));

    const body = (await request.json()) as {
      driverUserId?: string;
      shiftId?: string;
      message?: string;
    };

    if (!body.driverUserId || !body.shiftId) {
      return Response.json({ error: "driverUserId and shiftId are required." }, { status: 400 });
    }

    const offer = await createDriverOffer({
      fleetUserId: String(user.id),
      driverUserId: body.driverUserId,
      shiftId: body.shiftId,
      message: body.message,
    });

    return Response.json({ offer });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to book driver.";
    return Response.json({ error: message }, { status: 400 });
  }
}
