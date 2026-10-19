import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { ArrowRight, Paintbrush, KeyRound } from 'lucide-react';
import { api } from '../api';
import { STATUS_LABEL as RENO_STATUS } from '../config/renovations';
import { STATUS_LABEL as MGMT_STATUS } from '../config/management';
import {
  OFFER_RENOVATE_URL, MANAGE_ADD_URL, MANAGE_PROPERTIES_URL, MANAGE_VERIFICATIONS_URL,
} from '../config/platform';
import { Button } from '../components/shadcn/button';
import { Badge } from '../components/shadcn/badge';
import { Skeleton } from '../components/shadcn/skeleton';
import { Stagger, StaggerItem } from '../components/motion';
import { cn } from '../lib/utils';
import { LOCALE } from '../config/markets';

/**
 * What Manage does for an owner — renovation and letting — as one screen
 * inside the console. Each journey pulls the owner's own requests from the
 * flow that already captures them (renovation and management requests).
 * Purchases live under Verifications; Manage does not run builds.
 */

const PASSPORT_STATUS = {
  submitted: 'Submitted', scope_review: 'Scope review', payment_due: 'Ready for payment',
  in_progress: 'Checks in progress', action_required: 'Action needed', complete: 'Passport ready', cancelled: 'Cancelled',
};

const DONE = new Set(['complete', 'completed', 'live', 'active', 'managed']);
const ATTENTION = new Set(['action_required', 'payment_due', 'quote_ready', 'awaiting_signature', 'awaiting_approval']);

function tone(status) {
  if (DONE.has(status)) return 'soft';
  if (ATTENTION.has(status)) return 'default';
  return 'outline';
}

function when(value) {
  if (!value) return '';
  try { return new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short' }).format(new Date(value)); } catch { return ''; }
}

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }
`;

const JOURNEYS = [
  {
    id: 'renovate',
    title: 'Renovate my property',
    blurb: 'Scope the work, approve each stage, keep the evidence together.',
    icon: Paintbrush,
    start: { to: OFFER_RENOVATE_URL, label: 'Request renovation' },
    empty: 'No renovation requests yet.',
  },
  {
    id: 'rent',
    title: 'Rent it out',
    blurb: 'Tenants, rent collection, repairs and owner reporting.',
    icon: KeyRound,
    start: { to: MANAGE_ADD_URL, label: 'Add a property' },
    secondary: { to: MANAGE_PROPERTIES_URL, label: 'See properties' },
    empty: 'Nothing under management yet.',
  },
];

export default function JourneysSection({ email }) {
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState({ purchase: [], build: [], renovate: [], rent: [] });

  useEffect(() => {
    let active = true;
    if (!email) { setLoading(false); return undefined; }
    Promise.allSettled([
      api.passport.mine(),
      api.renovations.mine(email),
      api.management.mine(email),
    ]).then(([passports, renovations, management]) => {
      if (!active) return;
      const p = passports.status === 'fulfilled' ? passports.value : [];
      setRows({
        purchase: (p || []).map((r) => ({
          id: r.id || r.reference, ref: r.reference, title: r.property_label || r.address || 'Property',
          status: r.status || 'submitted', label: PASSPORT_STATUS[r.status] || 'Submitted', at: r.created_at,
          to: MANAGE_VERIFICATIONS_URL,
        })),
        build: [],
        renovate: (renovations.status === 'fulfilled' ? renovations.value : []).map((r) => ({
          id: r.id, ref: r.ref, title: r.title || r.address || 'Renovation', status: r.status,
          label: RENO_STATUS[r.status] || r.status, at: r.created_at, to: `${OFFER_RENOVATE_URL}?ref=${r.ref}`,
        })),
        rent: (management.status === 'fulfilled' ? management.value : []).map((r) => ({
          id: r.id, ref: r.ref, title: r.title || r.address || 'Property', status: r.status,
          label: MGMT_STATUS[r.status] || r.status, at: r.created_at, to: `${MANAGE_PROPERTIES_URL}?ref=${r.ref}`,
        })),
      });
      setLoading(false);
    });
    return () => { active = false; };
  }, [email]);

  const counts = useMemo(() => Object.fromEntries(Object.entries(rows).map(([k, v]) => [k, v.length])), [rows]);

  return (
    <Stagger>
      <Grid>
        {JOURNEYS.map((j) => {
          const items = rows[j.id] || [];
          const Icon = j.icon;
          return (
            <StaggerItem key={j.id}>
              <section className="flex h-full flex-col rounded-lg border border-[var(--color-line)] bg-white p-5" aria-label={j.title}>
                <div className="mb-3 flex items-start justify-between gap-3">
                  <span className="grid h-11 w-11 shrink-0 place-items-center rounded-[12px] bg-brand-soft text-brand-deep"><Icon className="h-5 w-5" /></span>
                  {counts[j.id] > 0 && <Badge variant="chip">{counts[j.id]} active</Badge>}
                </div>
                <h3 className="font-display text-[1.12rem] font-bold tracking-tight">{j.title}</h3>
                <p className="mt-1 text-[0.88rem] leading-relaxed text-muted-foreground">{j.blurb}</p>

                <div className="mt-4 flex-1">
                  {loading ? (
                    <div className="flex flex-col gap-2">
                      <Skeleton className="h-11 w-full" />
                      <Skeleton className="h-11 w-4/5" />
                    </div>
                  ) : items.length === 0 ? (
                    <div className="rounded-md border border-dashed border-[var(--color-line-strong)] px-3 py-3 text-[0.84rem] text-muted-foreground">{j.empty}</div>
                  ) : (
                    <ul className="m-0 list-none divide-y divide-[var(--color-line)] p-0">
                      {items.slice(0, 3).map((it) => (
                        <li key={it.id}>
                          <Link to={it.to} className={cn('group flex items-center gap-3 py-2.5 text-brand-ink hover:text-brand-deep')}>
                            <span className="min-w-0 flex-1">
                              <span className="block truncate text-[0.92rem] font-semibold">{it.title}</span>
                              <span className="block text-[0.74rem] text-muted-foreground">{it.ref}{it.at ? ` · ${when(it.at)}` : ''}</span>
                            </span>
                            <Badge variant={tone(it.status)}>{it.label}</Badge>
                            <ArrowRight className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5" />
                          </Link>
                        </li>
                      ))}
                      {items.length > 3 && <li className="pt-2 text-[0.78rem] text-muted-foreground">+{items.length - 3} more</li>}
                    </ul>
                  )}
                </div>

                <div className="mt-4 flex flex-wrap gap-2">
                  <Button asChild size="sm" variant={items.length ? 'soft' : 'default'}>
                    <Link to={j.start.to}>{j.start.label} <ArrowRight className="h-3.5 w-3.5" /></Link>
                  </Button>
                  {j.secondary && (
                    <Button asChild size="sm" variant="ghost">
                      <Link to={j.secondary.to}>{j.secondary.icon ? <j.secondary.icon className="h-3.5 w-3.5" /> : null}{j.secondary.label}</Link>
                    </Button>
                  )}
                </div>
              </section>
            </StaggerItem>
          );
        })}
      </Grid>
    </Stagger>
  );
}
