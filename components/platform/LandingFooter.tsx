import Link from "next/link";
import { BRAND } from "@/lib/brand";

const LINKS = [
  { href: "/cars", label: "Cars" },
  { href: "/parts", label: "Parts" },
  { href: "/garages", label: "Garages" },
  { href: "/account", label: "Dashboard" },
  { href: "/contact", label: "Contact" },
  { href: "/legal/terms", label: "Terms" },
  { href: "/legal/privacy", label: "Privacy" },
] as const;

/** Compact marketplace footer — Auto Trader-style utility bar, not a marketing block. */
export function LandingFooter() {
  return (
    <footer id="site-footer" className="relative z-[45] border-t border-[#e4dfd5] bg-[#1b231e] text-white">
      <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
        <p className="text-[11px] text-white/55">
          © {new Date().getFullYear()} {BRAND.name}
        </p>
        <nav className="flex flex-wrap gap-x-4 gap-y-1" aria-label="Footer">
          {LINKS.map((l) => (
            <Link key={l.href} href={l.href} className="text-[11px] font-semibold text-white/70 hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
