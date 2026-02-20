"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function ProductsRedirect() {
  const router = useRouter()
  useEffect(() => {
    router.replace("/destinations")
  }, [router])
  return (
    <div className="min-h-screen pt-28 pb-24 flex items-center justify-center">
      <p className="text-muted-foreground">Redirecting to Destinations…</p>
    </div>
  )
}
