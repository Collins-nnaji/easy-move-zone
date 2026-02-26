"use client"

// Polyfill crypto.randomUUID for non-secure contexts (http://localhost)
if (typeof globalThis.crypto !== "undefined" && typeof globalThis.crypto.randomUUID !== "function") {
    globalThis.crypto.randomUUID = () => {
        return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c: string) =>
            (+c ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (+c / 4)))).toString(16)
        ) as `${string}-${string}-${string}-${string}-${string}`
    }
}

import { createAuthClient } from "@neondatabase/auth/next"

export const authClient = createAuthClient()
