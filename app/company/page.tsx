import { redirect } from "next/navigation"

/** Legacy company marketing URL — quote CTA lives at /quote. */
export default function CompanyLandingRedirect() {
  redirect("/quote")
}
