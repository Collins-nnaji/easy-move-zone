export class InputError extends Error {
  constructor(
    message: string,
    public status = 400,
  ) {
    super(message);
  }
}
export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (origin && origin !== new URL(request.url).origin)
    throw new InputError("Invalid origin.", 403);
}
export async function body(request: Request) {
  sameOrigin(request);
  const raw = await request.text();
  if (raw.length > 9000000) throw new InputError("Upload too large.", 413);
  try {
    const value = JSON.parse(raw);
    if (!value || typeof value !== "object" || Array.isArray(value))
      throw new Error("Invalid body");
    return value;
  } catch {
    throw new InputError("Invalid JSON.");
  }
}
export function text(v: unknown, max = 2000, min = 1): v is string {
  return typeof v === "string" && v.trim().length >= min && v.length <= max;
}
export function reference(v: unknown): v is string {
  return typeof v === "string" && /^EMZ-[A-F0-9]{32}$/.test(v);
}
