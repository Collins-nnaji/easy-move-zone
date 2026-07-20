import { getVapidPublicKey, isWebPushConfigured } from "@/lib/notify/push";

export const runtime = "nodejs";

export async function GET() {
  return Response.json({
    configured: isWebPushConfigured(),
    publicKey: getVapidPublicKey(),
  });
}
