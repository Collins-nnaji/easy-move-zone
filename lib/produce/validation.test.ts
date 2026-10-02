import { describe, expect, it } from "vitest";
import { DEFAULT_CATALOG, visibleCatalog } from "./model";
import {
  assertCanDelete,
  imageUrl,
  validateEntry,
  validateSettings,
} from "./validation";

describe("managed produce content", () => {
  it("rejects route references to missing locations and produce", () => {
    expect(() =>
      validateEntry(
        "corridors",
        { ...DEFAULT_CATALOG.corridors[0], from: "missing" },
        DEFAULT_CATALOG,
      ),
    ).toThrow();
    expect(() =>
      validateEntry(
        "corridors",
        { ...DEFAULT_CATALOG.corridors[0], crops: ["missing"] },
        DEFAULT_CATALOG,
      ),
    ).toThrow();
    expect(() =>
      validateEntry(
        "exportLanes",
        { ...DEFAULT_CATALOG.exportLanes[0], portId: "makurdi" },
        DEFAULT_CATALOG,
      ),
    ).toThrow("port");
  });
  it("rejects negative weights, impossible dates and unsafe pictures", () => {
    expect(() =>
      validateEntry(
        "lots",
        { ...DEFAULT_CATALOG.lots[0], tonnes: -1 },
        DEFAULT_CATALOG,
      ),
    ).toThrow();
    for (const ready of ["2026-02-30", "2026-99-10"])
      expect(() =>
        validateEntry(
          "lots",
          { ...DEFAULT_CATALOG.lots[0], ready },
          DEFAULT_CATALOG,
        ),
      ).toThrow();
    for (const url of [
      "javascript:alert(1)",
      "data:image/svg+xml,bad",
      "http://example.com/image.png",
      "https://user:password@example.com/a.png",
      "//example.com/a.png",
    ])
      expect(() => imageUrl(url)).toThrow();
    expect(
      imageUrl("/api/produce/media/12345678-1234-1234-1234-123456789abc"),
    ).toContain("/api/produce/media/");
  });
  it("prevents deletion of records used by listings or routes", () => {
    expect(() => assertCanDelete("places", "makurdi", DEFAULT_CATALOG)).toThrow(
      "used",
    );
    expect(() =>
      assertCanDelete("commodities", "cocoa", DEFAULT_CATALOG),
    ).toThrow("used");
    expect(() =>
      assertCanDelete("lots", DEFAULT_CATALOG.lots[0].id, DEFAULT_CATALOG),
    ).not.toThrow();
  });
  it("hides dependent public content when a location or produce type is hidden", () => {
    const catalog = structuredClone(DEFAULT_CATALOG);
    catalog.places.find((p) => p.id === "apapa")!.active = false;
    catalog.commodities.find((p) => p.id === "rice")!.active = false;
    const visible = visibleCatalog(catalog);
    expect(visible.exportLanes.every((l) => l.portId !== "apapa")).toBe(true);
    expect(
      visible.corridors.every((l) => l.from !== "apapa" && l.to !== "apapa"),
    ).toBe(true);
    expect(
      visible.lots.every(
        (l) => l.destinationId !== "apapa" && l.commodityId !== "rice",
      ),
    ).toBe(true);
    expect(
      DEFAULT_CATALOG.places.find((p) => p.id === "apapa")!.active,
    ).toBeUndefined();
  });
  it("keeps all required page content when editing a single page", () => {
    const settings = validateSettings({
      ...DEFAULT_CATALOG.settings,
      buyTitle: "Our produce",
      buyImage: "https://example.com/photo.webp",
    });
    expect(settings.buyTitle).toBe("Our produce");
    expect(settings.homeTitle).toBe(DEFAULT_CATALOG.settings.homeTitle);
    expect(() => validateSettings({ ...settings, trackTitle: "" })).toThrow();
  });
});
