"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/dashboard/crm", label: "Overview" },
  { href: "/dashboard/crm/prospects", label: "Prospects" },
  { href: "/dashboard/crm/clients", label: "Clients" },
  { href: "/dashboard/crm/inbox", label: "Inbox" },
];

export function CrmDashboardNav() {
  const pathname = usePathname();

  return (
    <nav className="emz-gloss-card rounded-2xl p-2">
      <ul className="flex flex-wrap gap-2">
        {links.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`inline-flex rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-[#e0511f] text-white" : "bg-white/70 text-[#334155] hover:bg-[#eef4ff]"
                }`}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
