import type { ReactNode } from "react";
import { CrmDashboardNav } from "@/components/crm/CrmDashboardNav";

export default function CrmLayout({ children }: { children: ReactNode }) {
  return (
    <div className="emz-surface min-h-screen px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="emz-gloss-card rounded-2xl p-6">
          <p className="text-xs uppercase tracking-[0.2em] text-[#155eef]">CRM Workspace</p>
          <h1 className="mt-2 font-[var(--font-playfair)] text-5xl font-black text-[#0f172a]">Prospects, clients, and communication</h1>
          <p className="mt-2 text-sm text-[#64748b]">Manage the full relationship lifecycle from qualification to client retention.</p>
          <div className="mt-5">
            <CrmDashboardNav />
          </div>
        </section>
        {children}
      </div>
    </div>
  );
}
