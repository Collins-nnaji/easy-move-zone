import { PublicShell } from "@/components/platform/PublicShell"
import { RegisterTransporterClient } from "@/components/agro/RegisterTransporterClient"

export const metadata = {
  title: "Register as Transporter — EasyMoveZone",
  description: "Join EasyMoveZone's verified transporter network. Get matched with farm pickups across Africa.",
}

export default function RegisterTransporterPage() {
  return (
    <PublicShell>
      <RegisterTransporterClient />
    </PublicShell>
  )
}
