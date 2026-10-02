import { NextResponse } from "next/server";
import { getMove } from "@/lib/moving/store";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  const { reference } = await params;
  if (!/^EMZ-[A-F0-9]{32}$/.test(reference))
    return NextResponse.json(
      { error: "Check your move reference." },
      { status: 400 },
    );
  try {
    const move = await getMove(reference);
    if (!move)
      return NextResponse.json(
        { error: "Move not found. Check your reference or contact our team." },
        { status: 404 },
      );
    const { service, status, quote, crew, arrival, date } = move;
    return NextResponse.json(
      { move: { reference, service, status, quote, crew, arrival, date } },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return NextResponse.json(
      { error: "Tracking is temporarily unavailable. Please try again." },
      { status: 503 },
    );
  }
}
