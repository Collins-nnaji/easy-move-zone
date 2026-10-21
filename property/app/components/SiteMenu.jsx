import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Home, Tag, HardHat, Paintbrush, ShieldCheck, ScanSearch, KeyRound, PlusCircle,
  MessagesSquare, ArrowRight, LayoutDashboard, LogIn, UserRound, MapPinned,
} from 'lucide-react';
import { SITE_MENU, MANAGE_URL, OFFER_VERIFY_URL } from '../config/platform';
import { useAuth } from '../AuthContext';
import { useAccountIdentity } from './AccountMenu';
import { Button } from './shadcn/button';
import { cn } from '../lib/utils';

const ICONS = {
  buy: Home,
  sell: Tag,
  build: HardHat,
  renovate: Paintbrush,
  verify: ShieldCheck,
  analyze: ScanSearch,
  manage: KeyRound,
  add: PlusCircle,
  consult: MessagesSquare,
  area: MapPinned,
};

const list = { hidden: {}, show: { transition: { staggerChildren: 0.035, delayChildren: 0.05 } } };
const row = { hidden: { opacity: 0, x: 10 }, show: { opacity: 1, x: 0, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] } } };

/**
 * The site map as a tappable list. Rendered inside the navbar Sheet and the
 * tab-bar Drawer, so one component decides what "everything" means.
 * `onNavigate` closes whichever container is showing it.
 */
export default function SiteMenu({ onNavigate, compact = false }) {
  const { pathname } = useLocation();
  const { user, signOut } = useAuth();
  const { displayName, initials } = useAccountIdentity();

  const isActive = (to) => pathname === to || pathname.startsWith(`${to}/`);

  return (
    <motion.div variants={list} initial="hidden" animate="show" className="flex flex-col gap-5">
      <motion.div variants={row}>
        <Button asChild size="lg" block>
          <Link to={OFFER_VERIFY_URL} onClick={onNavigate}>
            <ShieldCheck className="h-4 w-4" /> Verify a property <ArrowRight className="h-4 w-4" />
          </Link>
        </Button>
      </motion.div>

      {SITE_MENU.map((group) => (
        <section key={group.id} aria-label={group.label}>
          <motion.div variants={row} className="mb-1.5 flex items-baseline justify-between px-1">
            <span className="text-[0.68rem] font-bold uppercase tracking-[0.1em] text-brand-deep">{group.label}</span>
            {!compact && <span className="text-[0.72rem] text-muted-foreground">{group.blurb}</span>}
          </motion.div>
          <div className={cn('grid gap-1', compact ? 'grid-cols-1' : 'grid-cols-1')}>
            {group.items.map((item) => {
              const Icon = ICONS[item.icon] || Home;
              const active = isActive(item.to);
              return (
                <motion.div key={item.to} variants={row}>
                  <Link
                    to={item.to}
                    onClick={onNavigate}
                    className={cn(
                      'group flex min-h-[52px] items-center gap-3 rounded-lg border px-3 py-2 transition-colors',
                      active
                        ? 'border-[rgba(47, 93, 80,0.25)] bg-brand-soft text-brand-deep'
                        : 'border-transparent text-brand-ink hover:bg-[var(--color-bg-panel)] hover:text-brand-ink',
                    )}
                  >
                    <span className={cn(
                      'grid h-9 w-9 shrink-0 place-items-center rounded-[10px] transition-colors',
                      active ? 'bg-white text-brand-deep' : 'bg-brand-soft text-brand-deep group-hover:bg-white',
                    )}>
                      <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block text-[0.95rem] font-semibold leading-tight">{item.label}</span>
                      <span className="block truncate text-[0.78rem] text-muted-foreground">{item.desc}</span>
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] opacity-0 transition-all group-hover:translate-x-0.5 group-hover:opacity-100" />
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </section>
      ))}

      <motion.div variants={row} className="rounded-lg border border-[var(--color-line)] bg-[var(--color-bg-panel)] p-3">
        {user ? (
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand-black font-display text-sm font-bold text-brand-deep">{initials}</span>
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[0.9rem] font-semibold text-brand-ink">{displayName}</span>
              <span className="block truncate text-[0.75rem] text-muted-foreground">{user.email}</span>
            </span>
            <Button asChild size="sm" variant="soft">
              <Link to={MANAGE_URL} onClick={onNavigate}><LayoutDashboard className="h-4 w-4" /> Console</Link>
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-brand-deep"><UserRound className="h-5 w-5" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-[0.9rem] font-semibold text-brand-ink">Your account</span>
              <span className="block text-[0.75rem] text-muted-foreground">Sign in to open your console</span>
            </span>
            <Button asChild size="sm" variant="dark">
              <Link to="/auth" onClick={onNavigate}><LogIn className="h-4 w-4" /> Sign in</Link>
            </Button>
          </div>
        )}
        {user && (
          <div className="mt-2 flex gap-2">
            <Button asChild size="sm" variant="ghost" className="flex-1">
              <Link to="/manage/dashboard" onClick={onNavigate}>Open Manage</Link>
            </Button>
            <Button size="sm" variant="ghost" className="flex-1" onClick={() => { signOut(); onNavigate?.(); }}>Sign out</Button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
