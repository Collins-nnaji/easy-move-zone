"use client";

import { useEffect } from "react";
import { authClient } from "@/lib/auth/client";

const VERIFIER_PARAM = "neon_auth_session_verifier";

/**
 * After an OAuth/session sign-in, Neon Auth appends a one-time
 * `neon_auth_session_verifier` to the callback URL. The library only strips it
 * when the session is fetched from the network — if the session is served from
 * its in-memory cache (which is the case right after sign-in, on the page we
 * land on), the param is left behind in the address bar.
 *
 * This waits until the session has resolved (so the verifier has already done
 * its job) and then removes the param with replaceState, without a navigation.
 */
export function AuthSessionCleanup() {
  const { data, isPending } = authClient.useSession();

  useEffect(() => {
    if (!data?.user || isPending || typeof window === "undefined") return;
    const url = new URL(window.location.href);
    if (!url.searchParams.has(VERIFIER_PARAM)) return;
    url.searchParams.delete(VERIFIER_PARAM);
    window.history.replaceState(window.history.state, "", `${url.pathname}${url.search}${url.hash}`);
  }, [data?.user, isPending]);

  return null;
}
