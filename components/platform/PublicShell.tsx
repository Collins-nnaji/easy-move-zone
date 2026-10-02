import type { ReactNode } from "react";
import { unstable_noStore as noStore } from "next/cache";
import { publicCatalog } from "@/lib/produce/store";
import { CatalogProvider } from "@/components/produce/CatalogProvider";

export async function PublicShell({ children }: { children: ReactNode }) {
  noStore();
  const catalog = await publicCatalog();
  return (
    <div className="relative min-w-0 overflow-x-hidden text-[#0f172a]">
      <div className="emz-page-bg" aria-hidden />
      <div className="relative z-10 min-w-0">
        <CatalogProvider catalog={catalog}>{children}</CatalogProvider>
      </div>
    </div>
  );
}
