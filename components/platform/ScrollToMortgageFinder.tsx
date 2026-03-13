"use client"

import { useEffect, useRef } from "react"

export function ScrollToMortgageFinder() {
  const done = useRef(false)

  useEffect(() => {
    if (done.current) return
    const el = document.getElementById("mortgage-finder")
    if (el) {
      done.current = true
      el.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [])

  return null
}
