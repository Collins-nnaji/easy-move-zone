import Stripe from "stripe";

const secret = process.env.STRIPE_SECRET_KEY;

export const stripe = secret
  ? new Stripe(secret, { apiVersion: "2025-02-24.acacia" })
  : null;

export const isStripeConfigured = Boolean(stripe);

export const STRIPE_PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

export function appBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.NEON_AUTH_BASE_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

export function requireStripe(): Stripe {
  if (!stripe) {
    throw new Error(
      "Payments are not configured. Add STRIPE_SECRET_KEY and NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY.",
    );
  }
  return stripe;
}
