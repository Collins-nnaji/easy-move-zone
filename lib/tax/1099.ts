import { driverSql } from "@/lib/driver/db";

export type TaxYearSummary = {
  year: number;
  driverUserId: string;
  displayName: string | null;
  grossCreditsCents: number;
  platformFeesCents: number;
  cashoutsCents: number;
  netEarningsCents: number;
  loadCount: number;
  form1099NecEstimateCents: number;
  transactions: Array<{
    id: string;
    label: string;
    amountCents: number;
    type: string;
    date: string;
    shiftId: string | null;
  }>;
};

export async function getDriverTaxYearSummary(
  authUserId: string,
  year: number,
): Promise<TaxYearSummary> {
  if (!driverSql) throw new Error("Database not configured.");

  const profile = (await driverSql.query(
    `select display_name from driver_profiles where auth_user_id = $1`,
    [authUserId],
  )) as Array<{ display_name: string | null }>;

  const start = `${year}-01-01T00:00:00.000Z`;
  const end = `${year + 1}-01-01T00:00:00.000Z`;

  const rows = (await driverSql.query(
    `select id, label, amount_cents, txn_type, shift_id, created_at
     from driver_wallet_transactions
     where auth_user_id = $1
       and created_at >= $2::timestamptz
       and created_at < $3::timestamptz
     order by created_at asc`,
    [authUserId, start, end],
  )) as Array<{
    id: string;
    label: string;
    amount_cents: number;
    txn_type: string;
    shift_id: string | null;
    created_at: string;
  }>;

  let grossCreditsCents = 0;
  let platformFeesCents = 0;
  let cashoutsCents = 0;
  const loadIds = new Set<string>();

  for (const row of rows) {
    if (row.txn_type === "credit" && row.amount_cents > 0) {
      grossCreditsCents += row.amount_cents;
      if (row.shift_id) loadIds.add(row.shift_id);
    }
    if (row.txn_type === "deduction" && row.amount_cents < 0) {
      platformFeesCents += Math.abs(row.amount_cents);
    }
    if (row.txn_type === "cashout" && row.amount_cents < 0) {
      cashoutsCents += Math.abs(row.amount_cents);
    }
  }

  const netEarningsCents = grossCreditsCents;
  // 1099-NEC estimate = net paid to driver for completed loads (credits), which is already after platform fee.
  const form1099NecEstimateCents = netEarningsCents;

  return {
    year,
    driverUserId: authUserId,
    displayName: profile[0]?.display_name ?? null,
    grossCreditsCents,
    platformFeesCents,
    cashoutsCents,
    netEarningsCents,
    loadCount: loadIds.size,
    form1099NecEstimateCents,
    transactions: rows.map((r) => ({
      id: r.id,
      label: r.label,
      amountCents: r.amount_cents,
      type: r.txn_type,
      date: r.created_at,
      shiftId: r.shift_id,
    })),
  };
}

export function taxSummaryToCsv(summary: TaxYearSummary): string {
  const lines = [
    "section,field,value",
    `summary,year,${summary.year}`,
    `summary,driver_user_id,${summary.driverUserId}`,
    `summary,display_name,"${(summary.displayName ?? "").replace(/"/g, '""')}"`,
    `summary,gross_credits_usd,${(summary.grossCreditsCents / 100).toFixed(2)}`,
    `summary,platform_fees_usd,${(summary.platformFeesCents / 100).toFixed(2)}`,
    `summary,cashouts_usd,${(summary.cashoutsCents / 100).toFixed(2)}`,
    `summary,1099_nec_estimate_usd,${(summary.form1099NecEstimateCents / 100).toFixed(2)}`,
    `summary,load_count,${summary.loadCount}`,
    "",
    "transaction_id,date,type,label,amount_usd,shift_id",
    ...summary.transactions.map(
      (t) =>
        `${t.id},${t.date},${t.type},"${t.label.replace(/"/g, '""')}",${(t.amountCents / 100).toFixed(2)},${t.shiftId ?? ""}`,
    ),
  ];
  return lines.join("\n");
}
