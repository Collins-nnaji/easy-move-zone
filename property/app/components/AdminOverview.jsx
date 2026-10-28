import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaSyncAlt } from 'react-icons/fa';
import { api } from '../api';
import { WHATSAPP_NUMBER } from '../config/platform';

/**
 * Admin Overview — what is waiting on the team across the whole platform, one
 * tile per queue (tap to open that section), and whether the services the
 * platform depends on are configured.
 */

const QUEUES = [
  { section: 'passports', title: 'Rental checks', rows: [['passports_new', 'new to scope'], ['passports_unpaid', 'awaiting payment'], ['passports_active', 'in progress']] },
  { section: 'listings', title: 'Listings', rows: [['listings_review', 'submissions to review'], ['enquiries_new', 'new enquiries'], ['listings_live', 'live listings']] },
  { section: 'rentals', title: 'Rentals', rows: [['rental_applications_new', 'new rental applications'], ['rental_enquiries_new', 'new renter enquiries'], ['rentals_ready', 'consented, not yet listed'], ['rentals_live', 'homes on the Rent page']] },
  { section: 'management', title: 'Management', rows: [['management_new', 'new properties'], ['management_messages', 'unread owner messages'], ['expenses_pending', 'expenses awaiting owner']] },
  { section: 'tenants', title: 'Tenants', rows: [['tenant_requests_new', 'new tenant requests'], ['tenant_requests_urgent', 'urgent repairs open'], ['rent_overdue', 'rent charges overdue'], ['rent_paid_online_week', 'paid online this week']] },
  { section: 'renovations', title: 'Renovations', rows: [['renovations_new', 'new requests'], ['renovation_messages', 'unread customer messages']] },
  { section: 'bookings', title: 'Consultations', rows: [['consultations_new', 'requested'], ['plan_matches_week', 'plan matches this week']] },
  { section: 'messages', title: 'Messages', rows: [['messages_new', 'new contact messages'], ['alerts_new', 'new listing alerts']] },
  { section: 'moves', title: 'Moving', rows: [['moves_new', 'new move requests'], ['moves_active', 'moves quoted or under way'], ['moving_enquiries_new', 'new moving enquiries']] },
];

const SERVICES = [
  ['database', 'Database', 'Neon Postgres (DATABASE_URL)'],
  ['storage', 'File storage', 'EasyMoveZone object storage — AWS_ENDPOINT_URL_S3 and access keys. Without it, landlords, agents and renters cannot upload photos or documents.'],
  ['auth', 'Sign-in', 'EasyMoveZone sign-in — NEON_AUTH_BASE_URL and NEON_AUTH_COOKIE_SECRET'],
  ['payments', 'Online payments', 'Stripe — STRIPE_SECRET_KEY. Without it, advisers send payment links by hand.'],
  ['rent_payments', 'Rent paid online', 'Paystack — PAYSTACK_SECRET_KEY (shared with moving). The Paystack webhook stays /api/payments/webhook; rent payments are passed on from there. Without it, tenants pay by transfer and tell you.'],
  ['email', 'Email notices', 'Resend — RESEND_API_KEY and NOTIFY_FROM. Without it, notices only show in the portals’ bell.'],
  ['sms', 'SMS notices', 'Termii — TERMII_API_KEY and TERMII_SENDER_ID. Used for rent reminders, approvals and urgent repairs.'],
  ['staff_signin', 'Staff sign-in', 'The admin_users allowlist — staff open the admin with their own EasyMoveZone sign-in, and every change is logged under their name.'],
  ['ai', 'AI photo scan and adviser', 'AZURE_OPENAI_ENDPOINT + key, or OPENAI_API_KEY'],
  ['whatsapp', 'WhatsApp link', 'NEXT_PUBLIC_WHATSAPP_NUMBER (set at build time)'],
];

const Top = styled.div`display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 1rem;`;
const Intro = styled.p`margin: 0; color: var(--color-ink-muted); font-size: 0.9rem;`;
const Refresh = styled.button`display: inline-flex; align-items: center; gap: 0.4rem; padding: 0.55rem 0.8rem; border: 1px solid var(--color-line-strong); border-radius: 9px; background: #fff; cursor: pointer; font-weight: 600; color: var(--color-ink-muted);`;
const Grid = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 0.85rem; margin-bottom: 1.75rem;`;
const Tile = styled.button`
  text-align: left; cursor: pointer; background: #fff; border: 1px solid ${(p) => (p.$hot ? 'rgba(184, 90, 48,0.45)' : 'var(--color-line)')};
  border-radius: 16px; padding: 1rem 1.1rem; box-shadow: var(--shadow-soft); transition: border-color 0.15s, transform 0.15s;
  &:hover { border-color: var(--color-green); transform: translateY(-2px); }
  h3 { margin: 0 0 0.6rem; font-size: 0.98rem; display: flex; justify-content: space-between; align-items: center; }
  h3 span { font-size: 0.75rem; font-weight: 600; color: var(--color-green-deep); }
  .row { display: flex; align-items: baseline; gap: 0.5rem; padding: 0.2rem 0; font-size: 0.86rem; color: var(--color-ink-muted); }
  .row b { min-width: 2.2rem; font-family: var(--font-display); font-size: 1.15rem; color: var(--color-ink); }
  .row.hot b { color: var(--color-green-deep); }
`;
const H2 = styled.h2`font-size: 1rem; margin: 0 0 0.7rem;`;
const Services = styled.div`display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 0.6rem;`;
const Service = styled.div`
  display: flex; gap: 0.7rem; align-items: flex-start; background: #fff; border: 1px solid var(--color-line); border-radius: 12px; padding: 0.8rem 0.9rem;
  .dot { width: 10px; height: 10px; border-radius: 50%; margin-top: 0.35rem; flex: none; background: ${(p) => (p.$ok ? 'var(--color-green)' : '#d97706')}; }
  strong { display: block; font-size: 0.9rem; }
  small { display: block; color: var(--color-ink-muted); font-size: 0.78rem; line-height: 1.4; margin-top: 0.15rem; }
`;
const Err = styled.p`color: #b91c1c;`;
const Audit = styled.div`
  margin-top: 1.75rem; background: #fff; border: 1px solid var(--color-line); border-radius: 14px; padding: 0.4rem 1rem;
  .e { display: grid; grid-template-columns: 9.5rem minmax(0, 12rem) minmax(0, 1fr) 3rem; gap: 0.75rem; padding: 0.5rem 0; border-bottom: 1px solid var(--color-line); font-size: 0.8rem; color: var(--color-ink-muted); }
  .e:last-child { border-bottom: none; }
  .e b { color: var(--color-ink); font-weight: 600; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  .e code { font-size: 0.76rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
  @media (max-width: 720px) { .e { grid-template-columns: minmax(0, 1fr); gap: 0.1rem; } }
`;

export default function AdminOverview({ adminKey, onOpen }) {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  const [audit, setAudit] = useState([]);
  const load = useCallback(async () => {
    try { setData(await api.admin.summary(adminKey)); setError(''); } catch (e) { setError(e.message || 'Could not load the overview.'); }
    try { setAudit(await api.admin.audit(adminKey, 25)); } catch { setAudit([]); }
  }, [adminKey]);
  useEffect(() => { load(); }, [load]);

  const counts = data?.counts || {};
  const services = { ...(data?.services || {}), whatsapp: Boolean(WHATSAPP_NUMBER) };

  return (
    <>
      <Top>
        <Intro>Everything waiting on the team, across the platform. Open a tile to work the queue.</Intro>
        <Refresh type="button" onClick={load}><FaSyncAlt /> Refresh</Refresh>
      </Top>
      {error && <Err>{error}</Err>}
      <Grid>
        {QUEUES.map((q) => {
          const waiting = q.rows.slice(0, 2).reduce((n, [k]) => n + (counts[k] || 0), 0);
          return (
            <Tile key={q.section} type="button" $hot={waiting > 0} onClick={() => onOpen(q.section)}>
              <h3>{q.title} <span>Open →</span></h3>
              {q.rows.map(([k, label], i) => (
                <div key={k} className={`row${i < 2 && counts[k] > 0 ? ' hot' : ''}`}><b>{data ? (counts[k] ?? '—') : '…'}</b> {label}</div>
              ))}
            </Tile>
          );
        })}
      </Grid>
      <H2>Services</H2>
      <Services>
        {SERVICES.map(([k, name, hint]) => (
          <Service key={k} $ok={Boolean(services[k])}>
            <span className="dot" />
            <span><strong>{name} · {data ? (services[k] ? 'configured' : 'not configured') : '…'}</strong><small>{hint}</small></span>
          </Service>
        ))}
      </Services>
      <H2 style={{ marginTop: '1.75rem' }}>Staff activity</H2>
      <Audit>
        {audit.length ? audit.map((e) => (
          <div className="e" key={e.id}>
            <span>{new Date(e.created_at).toLocaleString()}</span>
            <b>{e.actor === 'admin-key' ? 'Admin key' : e.actor}</b>
            <code>{e.method} {e.path.replace(/^\/api/, '')}</code>
            <span>{e.status}</span>
          </div>
        )) : <div className="e"><span>No staff changes recorded yet.</span></div>}
      </Audit>
    </>
  );
}
