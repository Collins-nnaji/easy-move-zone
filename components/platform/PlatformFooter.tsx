import Link from "next/link";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants";
import { SiteLogo } from "@/components/brand/SiteLogo";
import { LEGAL_LINKS } from "@/lib/legal-links";
import { LANDING_PAGES } from "@/lib/seo/landing-pages";

const SUPPORT_LINKS = [{ href: "/contact", label: "Contact" }] as const;

export function PlatformFooter() {
  return (
    <footer className="relative z-10 shrink-0 border-t border-[#e4dfd5] bg-[#eeefe5]">
      <div className="mx-auto grid w-full max-w-7xl gap-6 px-4 py-12 sm:grid-cols-2 sm:gap-10 sm:px-6 lg:grid-cols-[1fr_auto_auto_auto] lg:gap-12 lg:px-8">
        <div className="min-w-0 sm:col-span-2 lg:col-span-1">
          <SiteLogo href="/" height={24} />
          <p className="mt-2 max-w-sm text-xs leading-relaxed text-[#5f655c] sm:text-sm">
            Your move, made easy. Book trusted movers for your home, office and heavy items. Starting in Lagos.
          </p>
        </div>
        <nav
          aria-label="Product"
          className="text-sm font-semibold text-[#4a5047]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a9087]">
            Move
          </p>
          <div className="mt-2 grid grid-cols-2 gap-x-6 gap-y-2">
            {LANDING_PAGES.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="hover:text-[#1b231e]"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </nav>
        <nav
          aria-label="Support"
          className="flex flex-col gap-2 text-sm font-semibold text-[#4a5047]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a9087]">
            Support
          </p>
          {SUPPORT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#1b231e]"
            >
              {link.label}
            </Link>
          ))}
          <a
            href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
            className="break-all text-[#e0511f] hover:underline"
          >
            {PUBLIC_CONTACT_EMAIL}
          </a>
        </nav>
        <nav
          aria-label="Legal"
          className="flex flex-col gap-2 text-sm font-semibold text-[#4a5047]"
        >
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#8a9087]">
            Legal
          </p>
          {LEGAL_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-[#1b231e]"
            >
              {link.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="border-t border-[#e4dfd5]">
        <p className="mx-auto w-full max-w-7xl px-4 py-4 text-xs text-[#7c827a] sm:px-6 lg:px-8">
          © {new Date().getFullYear()} EasyMoveZone. Book a move in Lagos and track it with your reference.
        </p>
      </div>
    </footer>
  );
}
