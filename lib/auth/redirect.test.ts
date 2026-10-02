import { describe, expect, it } from "vitest";
import { safeAuthRedirect } from "./redirect";

describe("authentication return URLs", () => {
  it("preserves a local destination, query, and fragment", () => {
    expect(safeAuthRedirect("/profile?tab=account#details")).toBe("/profile?tab=account#details");
  });
  it.each([null, "https://other.example", "//other.example", "/\\other.example", "/auth", "/auth/callback", "/api/auth/sign-out", "/profile\n", "/foo/../auth"])("rejects unsafe destinations and sign-in loops: %s", (value) => {
    expect(safeAuthRedirect(value)).toBe("/book");
  });
});
