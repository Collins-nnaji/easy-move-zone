type Severity = "fatal" | "error" | "warning" | "info";

export function isSentryConfigured() {
  return Boolean(process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim());
}

function getDsn() {
  return process.env.SENTRY_DSN?.trim() || process.env.NEXT_PUBLIC_SENTRY_DSN?.trim() || null;
}

function parseDsn(dsn: string) {
  try {
    const url = new URL(dsn);
    const publicKey = url.username;
    const projectId = url.pathname.replace(/^\//, "");
    const ingestHost = url.host;
    if (!publicKey || !projectId) return null;
    return {
      storeUrl: `https://${ingestHost}/api/${projectId}/store/?sentry_key=${publicKey}&sentry_version=7`,
    };
  } catch {
    return null;
  }
}

export async function captureException(
  err: unknown,
  context?: { tags?: Record<string, string>; extra?: Record<string, unknown> },
) {
  const dsn = getDsn();
  if (!dsn) {
    if (process.env.NODE_ENV !== "production") {
      console.error("[monitoring]", err);
    }
    return;
  }

  const parsed = parseDsn(dsn);
  if (!parsed) return;

  const error = err instanceof Error ? err : new Error(String(err));
  const payload = {
    event_id: crypto.randomUUID().replace(/-/g, ""),
    timestamp: new Date().toISOString(),
    platform: "node",
    level: "error" as Severity,
    server_name: process.env.NEXT_PUBLIC_APP_URL ?? "easymovezone",
    exception: {
      values: [
        {
          type: error.name,
          value: error.message,
          stacktrace: error.stack
            ? {
                frames: error.stack
                  .split("\n")
                  .slice(1)
                  .reverse()
                  .map((line) => ({ filename: line.trim(), function: "?" })),
              }
            : undefined,
        },
      ],
    },
    tags: context?.tags,
    extra: context?.extra,
  };

  try {
    await fetch(parsed.storeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
  } catch (sendErr) {
    console.error("[monitoring:sentry:failed]", sendErr);
  }
}

export async function captureMessage(
  message: string,
  level: Severity = "info",
  extra?: Record<string, unknown>,
) {
  const dsn = getDsn();
  if (!dsn) return;
  const parsed = parseDsn(dsn);
  if (!parsed) return;

  try {
    await fetch(parsed.storeUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        event_id: crypto.randomUUID().replace(/-/g, ""),
        timestamp: new Date().toISOString(),
        platform: "node",
        level,
        message,
        extra,
      }),
    });
  } catch {
    /* ignore */
  }
}
