export const isStripeConfigured = Boolean(process.env.STRIPE_SECRET_KEY?.trim())
