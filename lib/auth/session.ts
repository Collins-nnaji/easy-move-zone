import { neonAuth } from "@neondatabase/auth/next/server";

export async function requireSessionUser() {
  const { session, user } = await neonAuth();
  const email = user?.email?.trim().toLowerCase();
  if (!session || !user?.id || !email) return null;
  return {
    userId: String(user.id),
    email,
    name: user.name?.trim() || "",
  };
}
