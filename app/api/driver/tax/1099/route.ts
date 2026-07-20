import { neonAuth } from "@neondatabase/auth/next/server";
import { getDriverTaxYearSummary, taxSummaryToCsv } from "@/lib/tax/1099";

export const runtime = "nodejs";

export async function GET(request: Request) {
  try {
    const { session, user } = await neonAuth();
    if (!session || !user) return Response.json({ error: "Sign in required." }, { status: 401 });

    const { searchParams } = new URL(request.url);
    const year = Number(searchParams.get("year") || new Date().getFullYear());
    if (!Number.isFinite(year) || year < 2020 || year > 2100) {
      return Response.json({ error: "Invalid year." }, { status: 400 });
    }

    const summary = await getDriverTaxYearSummary(String(user.id), year);
    if (searchParams.get("format") === "csv") {
      return new Response(taxSummaryToCsv(summary), {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="easymovezone-1099-${year}.csv"`,
        },
      });
    }

    return Response.json({ summary });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unable to load tax summary.";
    return Response.json({ error: message }, { status: 400 });
  }
}
