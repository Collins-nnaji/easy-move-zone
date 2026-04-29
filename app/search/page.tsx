import { redirect } from "next/navigation"

export default function SearchPage({ searchParams }: { searchParams: Record<string, string> }) {
  const q = searchParams.q ? `?q=${searchParams.q}` : ""
  redirect(`/purchase${q}`)
}
