"use client";

import { authClient } from "./client";

export async function signOutAndRedirect() {
  const result = await authClient.signOut();
  if (result.error) throw new Error("We couldn’t sign you out. Please try again.");
  // A full navigation discards cached authenticated pages and session state.
  window.location.replace("/");
}
