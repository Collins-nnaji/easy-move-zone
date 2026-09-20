import { redirect } from "next/navigation"

/** Legacy driver marketing URL — unified company site lives at /. */
export default function DriverLandingRedirect() {
  redirect("/")
}
