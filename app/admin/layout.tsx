import type { Metadata } from "next"

/** Not linked in the public site; discourage crawlers from indexing admin URLs. */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return children
}
