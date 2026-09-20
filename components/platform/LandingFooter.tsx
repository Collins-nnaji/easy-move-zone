import Link from "next/link";
import { Mail } from "lucide-react";
import { PUBLIC_CONTACT_EMAIL } from "@/lib/contact/constants";
import { SiteLogo } from "@/components/brand/SiteLogo";

/**
 * Audience-scoped footer. Mirrors the navbar's separation: a driver footer only
 * links to driver destinations, a company footer only to company ones, with a
 * single link across to the other side.
 */
export function LandingFooter({ audience }: { audience: "driver" | "company" }) {
  const isDriver = audience === "driver";

  const primary = isDriver
    ? [
        { href: "/move/shifts", label: "Find work" },
        { href: "/move/wallet", label: "Driver pay" },
        { href: "/move/vault", label: "Documents" },
        { href: "/move", label: "Driver profile" },
      ]
    : [
        { href: "/fleet/jobs?post=1", label: "Post a job" },
        { href: "/fleet/drivers", label: "Hire drivers" },
        { href: "/fleet/dashboard", label: "Operations" },
        { href: "/fleet", label: "Company profile" },
      ];

  const otherHref = isDriver ? "/company" : "/driver";
  const otherLabel = isDriver ? "For companies" : "For drivers";
  const blurb = isDriver
    ? "Find funded delivery jobs across Nigeria. Every job is funded upfront before you drive — get paid in naira at every step."
    : "Post funded delivery jobs and hire rated drivers across Nigeria. Pay in naira, track every run, pay only on completion.";

  return (
    <footer id="contact" className="relative z-[45] border-t border-white/10 bg-[#0b1220] text-white">
      <div className="absolute inset-x-0 top-0 h-0.5 bg-gradient-to-r from-[#e0511f] via-[#bf6a3c] to-amber-500/80 opacity-90" />
      <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-[1.6fr_1fr_1fr]">
          <div>
            <SiteLogo href={isDriver ? "/driver" : "/company"} height={36} invert />
            <p className="mt-3 max-w-xs text-[13px] leading-relaxed text-slate-400">{blurb}</p>
            <a
              href={`mailto:${PUBLIC_CONTACT_EMAIL}`}
              className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-orange-200/90 transition hover:text-white"
            >
              <Mail className="h-4 w-4 text-orange-400/80" aria-hidden />
              {PUBLIC_CONTACT_EMAIL}
            </a>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">
              {isDriver ? "For drivers" : "For companies"}
            </div>
            <ul className="mt-4 space-y-2.5">
              {primary.map((l) => (
                <li key={l.label}>
                  <Link href={l.href} className="text-[13px] text-slate-300 transition hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-slate-500">Company</div>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href={otherHref} className="text-[13px] text-orange-200/90 transition hover:text-white">
                  {otherLabel} →
                </Link>
              </li>
              <li><Link href="/contact" className="text-[13px] text-slate-300 transition hover:text-white">Contact us</Link></li>
              <li><Link href="/legal/terms" className="text-[13px] text-slate-300 transition hover:text-white">Terms</Link></li>
              <li><Link href="/legal/privacy" className="text-[13px] text-slate-300 transition hover:text-white">Privacy</Link></li>
              <li><Link href="/legal/independent-contractor" className="text-[13px] text-slate-300 transition hover:text-white">Contractor notice</Link></li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-white/10 pt-6 text-[12px] text-slate-500">
          © {new Date().getFullYear()} EasyMoveZone. Nigeria logistics marketplace.
        </div>
      </div>
    </footer>
  );
}
