import { driverSql } from "@/lib/driver/db";
import { ensureDriverProfile } from "@/lib/driver/service";
import { ensureFleetProfile } from "@/lib/fleet/service";
import { CASHOUT_FEE_CENTS } from "@/lib/driver/db";
import { appBaseUrl, isStripeConfigured, requireStripe } from "./stripe";

export type PaymentStatus = {
  configured: boolean;
  payoutsEnabled: boolean;
  stripeAccountId: string | null;
};

export async function getDriverPaymentStatus(authUserId: string): Promise<PaymentStatus> {
  if (!driverSql) {
    return { configured: isStripeConfigured, payoutsEnabled: false, stripeAccountId: null };
  }
  await ensureDriverProfile(authUserId);
  const rows = (await driverSql.query(
    `select stripe_account_id, payouts_enabled from driver_profiles where auth_user_id = $1`,
    [authUserId],
  )) as Array<{ stripe_account_id: string | null; payouts_enabled: boolean }>;

  return {
    configured: isStripeConfigured,
    payoutsEnabled: rows[0]?.payouts_enabled ?? false,
    stripeAccountId: rows[0]?.stripe_account_id ?? null,
  };
}

export async function createConnectOnboardingLink(authUserId: string, email?: string | null) {
  const stripe = requireStripe();
  if (!driverSql) throw new Error("Database not configured.");
  await ensureDriverProfile(authUserId);

  const status = await getDriverPaymentStatus(authUserId);
  let accountId = status.stripeAccountId;

  if (!accountId) {
    const account = await stripe.accounts.create({
      type: "express",
      email: email ?? undefined,
      capabilities: {
        transfers: { requested: true },
      },
      business_type: "individual",
      metadata: { auth_user_id: authUserId },
    });
    accountId = account.id;
    await driverSql.query(
      `update driver_profiles set stripe_account_id = $2, updated_at = now() where auth_user_id = $1`,
      [authUserId, accountId],
    );
  }

  const link = await stripe.accountLinks.create({
    account: accountId,
    refresh_url: `${appBaseUrl()}/move/wallet?connect=refresh`,
    return_url: `${appBaseUrl()}/move/wallet?connect=return`,
    type: "account_onboarding",
  });

  return { url: link.url, accountId };
}

export async function refreshConnectStatus(authUserId: string) {
  const stripe = requireStripe();
  if (!driverSql) throw new Error("Database not configured.");

  const status = await getDriverPaymentStatus(authUserId);
  if (!status.stripeAccountId) {
    return { payoutsEnabled: false };
  }

  const account = await stripe.accounts.retrieve(status.stripeAccountId);
  const enabled = Boolean(account.payouts_enabled && account.charges_enabled);

  await driverSql.query(
    `update driver_profiles set payouts_enabled = $2, updated_at = now() where auth_user_id = $1`,
    [authUserId, enabled],
  );

  return { payoutsEnabled: enabled };
}

export async function cashOutWithStripe(authUserId: string) {
  if (!driverSql) throw new Error("Database not configured.");
  await ensureDriverProfile(authUserId);

  const walletRows = (await driverSql.query(
    `select available_cents from driver_wallets where auth_user_id = $1`,
    [authUserId],
  )) as Array<{ available_cents: number }>;

  const available = walletRows[0]?.available_cents ?? 0;
  if (available <= CASHOUT_FEE_CENTS) throw new Error("Insufficient balance for cashout.");

  const payoutCents = available - CASHOUT_FEE_CENTS;
  const status = await getDriverPaymentStatus(authUserId);

  if (!isStripeConfigured) {
    // Ledger-only fallback when Stripe keys are not set
    await driverSql.query(
      `update driver_wallets set available_cents = 0, updated_at = now() where auth_user_id = $1`,
      [authUserId],
    );
    await driverSql.query(
      `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type)
       values ($1, 'Instant cashout (ledger)', $2, 'cashout')`,
      [authUserId, -available],
    );
    await driverSql.query(
      `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type)
       values ($1, 'Cashout fee', $2, 'deduction')`,
      [authUserId, -CASHOUT_FEE_CENTS],
    );
    return {
      amount: payoutCents / 100,
      mode: "ledger" as const,
      message: "Cashout recorded. Add Stripe keys to send real bank transfers.",
    };
  }

  if (!status.stripeAccountId || !status.payoutsEnabled) {
    throw new Error("Connect your payout account before cashing out.");
  }

  const stripe = requireStripe();
  const transfer = await stripe.transfers.create({
    amount: payoutCents,
    currency: "usd",
    destination: status.stripeAccountId,
    metadata: { auth_user_id: authUserId, kind: "cashout" },
  });

  await driverSql.query(
    `update driver_wallets set available_cents = 0, updated_at = now() where auth_user_id = $1`,
    [authUserId],
  );
  await driverSql.query(
    `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type)
     values ($1, 'Instant cashout', $2, 'cashout')`,
    [authUserId, -available],
  );
  await driverSql.query(
    `insert into driver_wallet_transactions (auth_user_id, label, amount_cents, txn_type)
     values ($1, 'Cashout fee', $2, 'deduction')`,
    [authUserId, -CASHOUT_FEE_CENTS],
  );
  await driverSql.query(
    `insert into marketplace_payments (kind, payee_user_id, amount_cents, stripe_transfer_id, status)
     values ('cashout', $1, $2, $3, 'succeeded')`,
    [authUserId, payoutCents, transfer.id],
  );

  return {
    amount: payoutCents / 100,
    mode: "stripe" as const,
    message: "Transfer sent to your connected bank account.",
    transferId: transfer.id,
  };
}

export async function createLoadFundingCheckout(authUserId: string, shiftId: string) {
  const stripe = requireStripe();
  if (!driverSql) throw new Error("Database not configured.");
  await ensureFleetProfile(authUserId);

  const shifts = (await driverSql.query(
    `select id, title, payout_cents, commission_bps, posted_by, funded, status, vehicle_label
     from driver_shifts where id = $1`,
    [shiftId],
  )) as Array<{
    id: string;
    title: string | null;
    payout_cents: number;
    commission_bps: number;
    posted_by: string | null;
    funded: boolean;
    status: string;
    vehicle_label: string;
  }>;

  const shift = shifts[0];
  if (!shift) throw new Error("Load not found.");
  if (shift.posted_by !== authUserId) throw new Error("You can only fund loads you posted.");
  if (shift.funded) throw new Error("This load is already funded.");
  if (shift.status === "cancelled") throw new Error("Cannot fund a cancelled load.");

  const totalCents = shift.payout_cents; // gross driver payout escrowed; commission taken on complete

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "usd",
          unit_amount: totalCents,
          product_data: {
            name: `Fund load: ${shift.title ?? shift.vehicle_label}`,
            description: `Escrow driver payout ($${ (totalCents / 100).toFixed(2) }). Platform commission is deducted when the load completes.`,
          },
        },
      },
    ],
    metadata: {
      kind: "load_fund",
      shift_id: shiftId,
      fleet_user_id: authUserId,
    },
    success_url: `${appBaseUrl()}/fleet/loads?funded=1`,
    cancel_url: `${appBaseUrl()}/fleet/loads?funded=0`,
  });

  await driverSql.query(
    `insert into marketplace_payments (kind, shift_id, payer_user_id, amount_cents, stripe_session_id, status)
     values ('load_fund', $1, $2, $3, $4, 'pending')`,
    [shiftId, authUserId, totalCents, session.id],
  );

  return { url: session.url!, sessionId: session.id };
}

export async function markLoadFundedFromSession(sessionId: string, paymentIntentId?: string | null) {
  if (!driverSql) return;
  const rows = (await driverSql.query(
    `update marketplace_payments
     set status = 'succeeded',
         stripe_payment_intent_id = coalesce($2, stripe_payment_intent_id),
         updated_at = now()
     where stripe_session_id = $1
     returning shift_id`,
    [sessionId, paymentIntentId ?? null],
  )) as Array<{ shift_id: string | null }>;

  const shiftId = rows[0]?.shift_id;
  if (!shiftId) return;

  await driverSql.query(
    `update driver_shifts set funded = true, funded_at = now(), updated_at = now() where id = $1`,
    [shiftId],
  );
}
