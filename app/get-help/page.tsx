import { redirect } from "next/navigation"

export default function GetHelpPage() {
  redirect("/dashboard/client#help-center")
}
