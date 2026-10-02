import { NextResponse } from "next/server";
export function retiredRoute() {
  return NextResponse.json(
    {
      error:
        "This service has been retired. Use /api/moves for moving requests.",
    },
    { status: 410 },
  );
}
