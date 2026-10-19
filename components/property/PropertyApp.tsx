"use client"

import dynamic from "next/dynamic"
import { ThemeProvider } from "styled-components"
import theme from "@/property/app/theme"

// The property site is a client-routed app (react-router); it renders in the
// browser only, exactly as it did as a standalone single-page app.
const App = dynamic(() => import("@/property/app/App"), {
  ssr: false,
  loading: () => <div className="min-h-[60vh]" aria-busy="true" />,
})

export function PropertyApp() {
  return (
    <ThemeProvider theme={theme}>
      <App />
    </ThemeProvider>
  )
}
