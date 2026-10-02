import { describe, expect, it } from "vitest";
import { POST } from "./route";
describe("retired produce endpoint", () => {
  it("returns Gone instead of recreating old tables", () => {
    expect(POST().status).toBe(410);
  });
});
