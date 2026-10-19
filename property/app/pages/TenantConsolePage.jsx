import React, { useCallback, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import {
  Routes, Route, Navigate, Link, useLocation, useNavigate, useSearchParams,
} from 'react-router-dom';
import {
  FaHome, FaMoneyBillWave, FaTools, FaFileAlt, FaCheckCircle, FaExclamationTriangle,
  FaRegClock, FaArrowRight, FaKey, FaCamera, FaTimes, FaUserTie, FaWhatsapp, FaClipboardList, FaLock,
} from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import SignInGate from '../components/SignInGate';
import ConsoleShell from '../components/ConsoleShell';
import {
  Card, CardHead, CardTitle, CardNote, Kpis, Kpi, Row, Pill, Table, Actions, Btn, Field, Label,
  Input, Select, TwoCol, Empty, Notice, ErrorMsg, PropertySelect,
} from './manage-sections';
import {
  TENANT_NAV, TENANT_URL, TENANT_RENT_URL, TENANT_PAID_URL, TENANT_REQUESTS_URL,
  TENANT_NEW_REQUEST_URL, MANAGE_URL, RENT_URL,
  CONTACT_URL, whatsappLink, rememberPortalRole,
} from '../config/platform';
import {
  TENANT_REQUEST_CATEGORIES, TENANT_CATEGORY_LABEL, TENANT_URGENCIES, TENANT_URGENCY_LABEL,
  TENANT_REQUEST_STATUS_LABEL, TENANT_REQUEST_STATUS_TONE, OPEN_TENANT_STATUSES,
  APPLICATION_STATUS_LABEL, APPLICATION_STATUS_TONE,
} from '../config/tenant';
import {
  RENT_STATUS_LABEL, RENT_STATUS_TONE, TENANCY_STATUS_LABEL, TENANCY_STATUS_TONE, RENT_FREQUENCY_LABEL,
} from '../config/management';
import { formatMoneyFull } from '../utils/format';
import { LOCALE } from '../config/markets';

/**
 * The tenant portal — the same shell as the owner console, for someone who
 * rents a home EasyMoveZone manages.
 *
 * Four sections: Overview (the home at a glance, and any rental
 * applications), Rent (the schedule, and "tell us you paid"), Requests
 * (repairs, questions, notice to leave) and My home (the tenancy and the
 * documents shared with the tenant). Everything comes from one call to
 * `/api/tenant/portal`, keyed on the signed-in email. A tenant never sees the
 * owner, the owner's money or other units.
 */

const PAGE_META = {
  overview: { title: 'Overview', sub: 'Your home, your rent and anything waiting on you.' },
  applications: { title: 'Applications', sub: 'Homes you asked to rent through EasyMoveZone, and where each one stands.' },
  rent: { title: 'Rent schedule', sub: 'Every rent and charge on your tenancy, and what has been received.' },
  paid: { title: 'Tell us you paid', sub: 'Paid by transfer? Send us the details so we can match it and update your schedule.' },
  requests: { title: 'My requests', sub: 'Everything you have raised with your manager, and the latest on each.' },
  new: { title: 'Report a repair', sub: 'Tell us what is wrong. Your manager arranges the visit; repairs that need the owner’s approval go to them for you.' },
  home: { title: 'Tenancy', sub: 'Your tenancy at a glance: rent, dates, deposit and who manages the home.' },
  documents: { title: 'Documents', sub: 'Your tenancy agreement, inventory and certificates, as your manager shares them.' },
};

const money = (v, currency = 'NGN') => formatMoneyFull(v, currency || 'NGN');

function shortDate(value) {
  if (!value) return '—';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleDateString(LOCALE, { day: 'numeric', month: 'short', year: 'numeric' });
}

function todayIso() {
  const d = new Date();
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const outstanding = (c) => Math.max(0, (Number(c.amount) || 0) - (Number(c.amount_received) || 0));

/* ── Bits of layout only this portal uses ─────────────────────────── */

const HomeHero = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 1.25rem;
  align-items: center;
  padding: 1.35rem 1.45rem;
  border-radius: var(--radius-lg);
  background: linear-gradient(135deg, var(--color-green-wash), #fff 70%);
  border: 1px solid var(--color-line);

  .eyebrow { font-size: 0.68rem; font-weight: 700; letter-spacing: 0.09em; text-transform: uppercase; color: var(--color-green-deep); }
  h2 { margin: 0.3rem 0 0.25rem; font-size: 1.3rem; font-weight: 650; letter-spacing: -0.02em; }
  .where { color: var(--color-ink-muted); font-size: 0.92rem; }
  .meta { display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.8rem; }

  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); padding: 1.1rem; h2 { font-size: 1.12rem; } }
`;

const LeaseBar = styled.div`
  margin-top: 1rem;
  .track { height: 8px; border-radius: 999px; background: var(--color-bg-sunken); overflow: hidden; }
  .fill { height: 100%; border-radius: 999px; background: var(--color-green); }
  .ends { display: flex; justify-content: space-between; font-size: 0.76rem; color: var(--color-ink-faint); margin-top: 0.35rem; }
`;

const QuickGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); }
`;

const Quick = styled(Link)`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  padding: 0.95rem 1.05rem;
  border-radius: 14px;
  background: #fff;
  border: 1px solid var(--color-line);
  color: var(--color-ink);
  transition: border-color 0.15s ease, transform 0.15s ease;

  .ic { flex: 0 0 auto; width: 38px; height: 38px; border-radius: 11px; display: grid; place-items: center; background: var(--color-green-soft); color: var(--color-green-deep); }
  .t { font-weight: 600; font-size: 0.93rem; }
  .s { font-size: 0.8rem; color: var(--color-ink-muted); }
  .go { margin-left: auto; color: var(--color-ink-faint); font-size: 0.75rem; }
  &:hover { border-color: var(--color-green); color: var(--color-ink); transform: translateY(-1px); }
`;

const Choices = styled.div`
  display: grid;
  grid-template-columns: repeat(${(p) => p.$cols || 2}, minmax(0, 1fr));
  gap: 0.6rem;
  @media (max-width: 620px) { grid-template-columns: minmax(0, 1fr); }
`;

const Choice = styled.button`
  text-align: left;
  cursor: pointer;
  padding: 0.8rem 0.95rem;
  border-radius: 12px;
  font-family: var(--font-sans);
  background: ${(p) => (p.$on ? 'var(--color-green-wash)' : '#fff')};
  border: 1.5px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  color: var(--color-ink);
  .t { font-weight: 600; font-size: 0.9rem; }
  .s { font-size: 0.78rem; color: var(--color-ink-muted); margin-top: 0.15rem; }
  &:hover { border-color: var(--color-green); }
`;

const Textarea = styled.textarea`
  width: 100%; min-height: 110px; resize: vertical; background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong); border-radius: 11px;
  padding: 0.8rem 0.95rem; font-family: var(--font-sans); font-size: 0.95rem;
  color: var(--color-ink); outline: none;
  &:focus { border-color: var(--color-green); background: #fff; }
`;

const Thumbs = styled.div`
  display: flex; flex-wrap: wrap; gap: 0.5rem; margin-top: 0.6rem;
  span { display: inline-flex; align-items: center; gap: 0.4rem; font-size: 0.8rem; padding: 0.3rem 0.6rem; border-radius: 999px; background: var(--color-bg-sunken); border: 1px solid var(--color-line); }
  button { border: 0; background: none; cursor: pointer; color: var(--color-ink-faint); padding: 0; display: inline-flex; }
`;

const Reply = styled.div`
  margin-top: 0.55rem;
  padding: 0.6rem 0.8rem;
  border-radius: 10px;
  background: var(--color-green-wash);
  border: 1px solid var(--color-line);
  font-size: 0.86rem;
  color: var(--color-ink);
  b { color: var(--color-green-deep); font-weight: 600; }
`;

const FactGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 1rem 1.5rem;
  margin: 0;
  dt { font-size: 0.68rem; font-weight: 600; letter-spacing: 0.07em; text-transform: uppercase; color: var(--color-ink-faint); }
  dd { margin: 0.25rem 0 0; font-size: 0.95rem; font-weight: 600; color: var(--color-ink); }
`;

/* ── Sections ─────────────────────────────────────────────────────── */

function NoTenancy({ email, applications }) {
  return (
    <Card>
      <CardHead><CardTitle><FaKey /> No tenancy on this account yet</CardTitle></CardHead>
      <p style={{ margin: 0, color: 'var(--color-ink-muted)', lineHeight: 1.6, fontSize: '0.94rem' }}>
        Your tenant portal fills in once EasyMoveZone sets up your tenancy with <b>{email}</b>. If you rent a home
        we manage and nothing shows here, ask your manager for your tenant portal link — it connects your home to whichever email you sign in with.
        {applications > 0 && ' Meanwhile, your rental applications are under Applications.'}
      </p>
      <Actions>
        <Btn as={Link} to={RENT_URL}>Find a home to rent <FaArrowRight size={11} /></Btn>
        <Btn $ghost as={Link} to={CONTACT_URL}>Contact us</Btn>
        <Btn $ghost as={Link} to={MANAGE_URL} onClick={() => rememberPortalRole('owner')}>I own property — go to the owner portal</Btn>
      </Actions>
    </Card>
  );
}

function Overview({ data, tenancy, email }) {
  if (!tenancy) return <NoTenancy email={email} applications={(data.applications || []).length} />;
  const s = data.summary || {};
  const cur = tenancy.currency;
  const charges = data.rentCharges.filter((c) => c.tenancy_id === tenancy.id);
  const arrears = charges
    .filter((c) => ['due', 'part', 'overdue'].includes(c.status) && new Date(c.due_date) <= new Date())
    .reduce((sum, c) => sum + outstanding(c), 0);
  const nextDue = charges
    .filter((c) => ['due', 'part', 'overdue'].includes(c.status) && new Date(c.due_date) > new Date())
    .sort((a, b) => new Date(a.due_date) - new Date(b.due_date))[0];
  const requests = data.requests.filter((r) => r.tenancy_id === tenancy.id);
  const open = requests.filter((r) => OPEN_TENANT_STATUSES.includes(r.status));

  let lease = null;
  if (tenancy.start_date && tenancy.end_date) {
    const start = new Date(tenancy.start_date).getTime();
    const end = new Date(tenancy.end_date).getTime();
    const pct = Math.min(100, Math.max(0, ((Date.now() - start) / (end - start)) * 100));
    const daysLeft = Math.ceil((end - Date.now()) / 86400000);
    lease = { pct, daysLeft };
  }
  const where = [tenancy.area, tenancy.city, tenancy.state].filter(Boolean).join(', ');

  return (
    <>
      {arrears > 0 && (
        <Notice $warn>
          <FaExclamationTriangle />
          <div>
            <b>{money(arrears, cur)} is overdue.</b> If you have already paid, <Link to={TENANT_PAID_URL}>tell us</Link> so
            we can match it.
          </div>
        </Notice>
      )}

      <HomeHero>
        <div>
          <div className="eyebrow">Your home{tenancy.unit_label ? ` · ${tenancy.unit_label}` : ''}</div>
          <h2>{tenancy.property_title}</h2>
          <div className="where">{tenancy.address || where}{tenancy.address && where ? ` · ${where}` : ''}</div>
          <div className="meta">
            <Pill $tone={TENANCY_STATUS_TONE[tenancy.status]}>{TENANCY_STATUS_LABEL[tenancy.status]}</Pill>
            <Pill>{money(tenancy.rent_amount, cur)} {RENT_FREQUENCY_LABEL[tenancy.rent_frequency] || ''}</Pill>
            {tenancy.manager_name && <Pill $tone="info"><FaUserTie /> {tenancy.manager_name}</Pill>}
          </div>
          {lease && (
            <LeaseBar>
              <div className="track"><div className="fill" style={{ width: `${lease.pct}%` }} /></div>
              <div className="ends">
                <span>{shortDate(tenancy.start_date)}</span>
                <span>{lease.daysLeft > 0 ? `${lease.daysLeft} days left` : 'Tenancy end date passed'}</span>
                <span>{shortDate(tenancy.end_date)}</span>
              </div>
            </LeaseBar>
          )}
        </div>
      </HomeHero>

      <Kpis>
        <Kpi>
          <div className="k">Next payment</div>
          <div className="v">{nextDue ? money(outstanding(nextDue), cur) : '—'}</div>
          <div className="m">{nextDue ? `due ${shortDate(nextDue.due_date)}` : 'nothing scheduled'}</div>
        </Kpi>
        <Kpi $tone={arrears > 0 ? '#b45309' : undefined}>
          <div className="k">Overdue</div>
          <div className="v">{money(arrears, cur)}</div>
          <div className="m">{arrears > 0 ? 'past its due date' : 'you are up to date'}</div>
        </Kpi>
        <Kpi>
          <div className="k">Paid, last 12 months</div>
          <div className="v">{money(s.paid12m || 0, cur)}</div>
          <div className="m">as received by us</div>
        </Kpi>
        <Kpi>
          <div className="k">Open requests</div>
          <div className="v">{open.length}</div>
          <div className="m">{open.length ? 'your manager is on it' : 'nothing outstanding'}</div>
        </Kpi>
      </Kpis>

      <QuickGrid>
        <Quick to={TENANT_NEW_REQUEST_URL}>
          <span className="ic"><FaTools /></span>
          <span><div className="t">Report a repair</div><div className="s">Something broken or leaking</div></span>
          <FaArrowRight className="go" />
        </Quick>
        <Quick to={TENANT_PAID_URL}>
          <span className="ic"><FaMoneyBillWave /></span>
          <span><div className="t">Tell us you paid</div><div className="s">Match a transfer to your rent</div></span>
          <FaArrowRight className="go" />
        </Quick>
        <Quick to={`${TENANT_NEW_REQUEST_URL}?type=question`}>
          <span className="ic"><FaUserTie /></span>
          <span><div className="t">Ask your manager</div><div className="s">Anything about your home</div></span>
          <FaArrowRight className="go" />
        </Quick>
      </QuickGrid>

      <Card>
        <CardHead>
          <CardTitle><FaClipboardList /> Latest requests</CardTitle>
          <CardNote><Link to={TENANT_REQUESTS_URL}>SEE ALL</Link></CardNote>
        </CardHead>
        {requests.length ? requests.slice(0, 3).map((r) => <RequestRow key={r.id} r={r} />) : (
          <Empty>Nothing raised yet. Report a repair or ask a question and it is tracked here.</Empty>
        )}
      </Card>
    </>
  );
}

function RequestRow({ r, onClose, busy, onReply }) {
  const [open, setOpen] = useState(false);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const messages = r.messages || [];

  const send = async () => {
    if (!text.trim()) return;
    setSending(true); setError('');
    try {
      await onReply(r.id, text.trim());
      setText('');
    } catch (err) {
      setError(err?.message || 'Could not send that.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ borderBottom: '1px solid var(--color-line)', padding: '0.9rem 0' }}>
      <Row style={{ alignItems: 'flex-start', border: 'none', padding: 0 }}>
        <div style={{ minWidth: 0 }}>
          <div className="t">{r.title}</div>
          <div className="s">
            {TENANT_CATEGORY_LABEL[r.category]}
            {r.category === 'repair' ? ` · ${TENANT_URGENCY_LABEL[r.urgency]}` : ''}
            {r.location ? ` · ${r.location}` : ''}
            {r.category === 'payment' && r.amount ? ` · ${money(r.amount)}` : ''}
            {' · '}{r.ref} · {shortDate(r.created_at)}
          </div>
          {r.details && <p style={{ margin: '0.45rem 0 0', fontSize: '0.88rem', color: 'var(--color-ink-muted)', lineHeight: 1.5 }}>{r.details}</p>}
          {!open && r.response && <Reply><b>Your manager:</b> {r.response}</Reply>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.5rem' }}>
          <Pill $tone={TENANT_REQUEST_STATUS_TONE[r.status]}>{TENANT_REQUEST_STATUS_LABEL[r.status]}</Pill>
          {onReply && (
            <Btn $ghost onClick={() => setOpen((o) => !o)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
              {open ? 'Hide' : messages.length ? `Conversation (${messages.length})` : 'Message'}
            </Btn>
          )}
          {onClose && OPEN_TENANT_STATUSES.includes(r.status) && (
            <Btn $ghost disabled={busy} onClick={() => onClose(r.id)} style={{ padding: '0.4rem 0.8rem', fontSize: '0.78rem' }}>
              {r.status === 'new' ? 'Withdraw' : 'Mark as sorted'}
            </Btn>
          )}
        </div>
      </Row>
      {open && (
        <div style={{ marginTop: '0.7rem', display: 'grid', gap: '0.45rem' }}>
          {messages.map((m) => (
            <Reply key={m.id} style={{ marginTop: 0, background: m.sender === 'tenant' ? 'var(--color-bg-sunken)' : undefined }}>
              <b>{m.sender === 'tenant' ? 'You' : 'Your manager'}:</b> {m.body}
              <div style={{ fontSize: '0.72rem', color: 'var(--color-ink-faint)', marginTop: '0.2rem' }}>{shortDate(m.created_at)}</div>
            </Reply>
          ))}
          <Textarea style={{ minHeight: 70 }} value={text} onChange={(e) => setText(e.target.value)} placeholder="Write to your manager" aria-label="Message to your manager" />
          <Actions style={{ marginTop: 0 }}>
            <Btn disabled={sending || !text.trim()} onClick={send}>{sending ? 'Sending…' : 'Send'}</Btn>
          </Actions>
          {error && <ErrorMsg>{error}</ErrorMsg>}
        </div>
      )}
    </div>
  );
}

function Applications({ data }) {
  const apps = data.applications || [];
  return (
    <Card>
      <CardHead>
        <CardTitle><FaKey /> Rental applications</CardTitle>
        <CardNote>{apps.length} APPLICATION{apps.length === 1 ? '' : 'S'}</CardNote>
      </CardHead>
      {apps.length ? apps.map((a) => (
        <Row key={a.id}>
          <div>
            <div className="t">
              {a.listing_status === 'live'
                ? <Link to={`/listings/${a.listing_slug || a.listing_id}`}>{a.listing_title}</Link>
                : a.listing_title}
            </div>
            <div className="s">
              {[a.city, a.state].filter(Boolean).join(', ')}
              {a.rent ? ` · ${money(a.rent, a.currency)} ${RENT_FREQUENCY_LABEL[a.rent_frequency] || ''}` : ''}
              {' · '}applied {shortDate(a.created_at)}
              {a.viewing_date ? ` · viewing ${shortDate(a.viewing_date)}${a.viewing_window ? ` (${a.viewing_window})` : ''}` : ''}
            </div>
          </div>
          <Pill $tone={APPLICATION_STATUS_TONE[a.status]}>{APPLICATION_STATUS_LABEL[a.status] || a.status}</Pill>
        </Row>
      )) : (
        <Empty>
          No applications on this email. <Link to={RENT_URL}>Browse homes to rent</Link> — every one is let and managed by EasyMoveZone.
        </Empty>
      )}
    </Card>
  );
}

function RentSchedule({ data, tenancy, onRefresh }) {
  const [params, setParams] = useSearchParams();
  const [payOn, setPayOn] = useState(false);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const returned = params.get('paid');

  useEffect(() => { api.tenant.payConfig().then((c) => setPayOn(Boolean(c?.enabled))); }, []);

  // Back from Paystack: confirm with the server, which credits the charge.
  useEffect(() => {
    if (!returned) return;
    let live = true;
    api.tenant.verifyPayment(returned)
      .then((r) => { if (live) { setResult(r); onRefresh?.(); } })
      .catch((err) => { if (live) setResult({ state: 'error', error: err?.message }); })
      .finally(() => {
        if (live) setParams((p) => { const n = new URLSearchParams(p); n.delete('paid'); n.delete('reference'); n.delete('trxref'); return n; }, { replace: true });
      });
    return () => { live = false; };
  }, [returned]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tenancy) return <Empty>Your rent schedule appears once your tenancy is set up.</Empty>;
  const charges = data.rentCharges.filter((c) => c.tenancy_id === tenancy.id);
  const live = ['active', 'notice'].includes(tenancy.status);

  const pay = async (id) => {
    setBusyId(id); setError('');
    try {
      const { url } = await api.tenant.pay(id);
      window.location.assign(url);
    } catch (err) {
      setError(err?.message || 'Could not start the payment.');
      setBusyId(null);
    }
  };

  return (
    <>
      {result?.state === 'success' && <Notice><FaCheckCircle /><div><b>Payment received — thank you.</b> {result.amount ? `${money(result.amount)} has` : 'It has'} been added to your rent schedule, and a receipt is in your notifications.</div></Notice>}
      {result && result.state !== 'success' && (
        <Notice $warn><FaExclamationTriangle /><div>{result.error || (result.state === 'pending' ? 'Your payment is still being confirmed. It will show here once it clears.' : 'That payment did not go through. Nothing was taken; you can try again.')}</div></Notice>
      )}
      <Notice>
        <FaRegClock />
        <div>
          {payOn
            ? <>Pay online with a card, bank transfer or USSD — it is credited at once. Paid by transfer to the account on your tenancy agreement? <Link to={TENANT_PAID_URL}>Tell us you paid</Link>.</>
            : <>Pay into the account named on your tenancy agreement, then <Link to={TENANT_PAID_URL}>tell us you paid</Link>. A payment shows as received here once it clears with us.</>}
        </div>
      </Notice>
      <Card>
        <CardHead>
          <CardTitle><FaMoneyBillWave /> Rent and charges</CardTitle>
          <CardNote>{charges.length} ITEM{charges.length === 1 ? '' : 'S'}</CardNote>
        </CardHead>
        {charges.length ? (
          <Table>
            <table>
              <thead>
                <tr><th>Period</th><th>Due</th><th>Status</th><th className="num">Amount</th><th className="num">Left to pay</th>{payOn && live && <th className="num" aria-label="Pay" />}</tr>
              </thead>
              <tbody>
                {charges.map((c) => (
                  <tr key={c.id}>
                    <td>{c.period_label || 'Rent'}</td>
                    <td>{shortDate(c.due_date)}</td>
                    <td><Pill $tone={RENT_STATUS_TONE[c.status]}>{RENT_STATUS_LABEL[c.status]}</Pill></td>
                    <td className="num">{money(c.amount, c.currency)}</td>
                    <td className="num">{outstanding(c) ? money(outstanding(c), c.currency) : '—'}</td>
                    {payOn && live && (
                      <td className="num">
                        {outstanding(c) > 0 && (
                          <Btn disabled={busyId != null} onClick={() => pay(c.id)} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>
                            <FaLock size={10} /> {busyId === c.id ? 'Opening…' : 'Pay now'}
                          </Btn>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </Table>
        ) : <Empty>No rent has been scheduled on your tenancy yet.</Empty>}
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Card>
    </>
  );
}

function PaidForm({ data, tenancy, email, onDone }) {
  const owing = useMemo(
    () => (tenancy ? data.rentCharges.filter((c) => c.tenancy_id === tenancy.id && outstanding(c) > 0) : []),
    [data, tenancy],
  );
  const [chargeId, setChargeId] = useState('');
  const [form, setForm] = useState({ amount: '', paidOn: todayIso(), paymentRef: '', details: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [sent, setSent] = useState(null);

  if (!tenancy) return <Empty>You can tell us about payments once your tenancy is set up.</Empty>;

  const pickCharge = (id) => {
    setChargeId(id);
    const c = owing.find((x) => String(x.id) === id);
    if (c) setForm((f) => ({ ...f, amount: String(Math.round(outstanding(c))) }));
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    const c = owing.find((x) => String(x.id) === chargeId);
    try {
      const row = await api.tenant.raise(email, {
        tenancyId: tenancy.id,
        category: 'payment',
        title: c ? `Paid: ${c.period_label || 'rent'}` : 'Payment made',
        amount: form.amount,
        paidOn: form.paidOn,
        paymentRef: form.paymentRef,
        details: form.details,
      });
      setSent(row);
      onDone();
    } catch (err) {
      setError(err?.message || 'Could not send that. Try again.');
    } finally {
      setBusy(false);
    }
  };

  if (sent) {
    return (
      <Card>
        <Notice><FaCheckCircle /><div><b>Thanks — we have it ({sent.ref}).</b> We will match your transfer and mark it received on your rent schedule.</div></Notice>
        <Actions>
          <Btn as={Link} to={TENANT_RENT_URL}>See my rent schedule</Btn>
          <Btn $ghost onClick={() => { setSent(null); setForm({ amount: '', paidOn: todayIso(), paymentRef: '', details: '' }); setChargeId(''); }}>Tell us about another payment</Btn>
        </Actions>
      </Card>
    );
  }

  return (
    <Card as="form" onSubmit={submit}>
      {owing.length > 0 && (
        <Field>
          <Label htmlFor="charge">What did you pay for?</Label>
          <Select id="charge" value={chargeId} onChange={(e) => pickCharge(e.target.value)}>
            <option value="">Something else</option>
            {owing.map((c) => (
              <option key={c.id} value={c.id}>{c.period_label || 'Rent'} — {money(outstanding(c), c.currency)} due {shortDate(c.due_date)}</option>
            ))}
          </Select>
        </Field>
      )}
      <TwoCol>
        <Field>
          <Label htmlFor="amount">Amount paid (₦)</Label>
          <Input id="amount" inputMode="decimal" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value.replace(/[^\d.]/g, '') })} placeholder="e.g. 350000" />
        </Field>
        <Field>
          <Label htmlFor="paidOn">Date paid</Label>
          <Input id="paidOn" type="date" required max={todayIso()} value={form.paidOn} onChange={(e) => setForm({ ...form, paidOn: e.target.value })} />
        </Field>
      </TwoCol>
      <Field>
        <Label htmlFor="ref">Transfer reference (optional)</Label>
        <Input id="ref" value={form.paymentRef} onChange={(e) => setForm({ ...form, paymentRef: e.target.value })} placeholder="As shown on your bank receipt" />
      </Field>
      <Field>
        <Label htmlFor="note">Anything else (optional)</Label>
        <Textarea id="note" style={{ minHeight: 80 }} value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="e.g. paid from my spouse's account" />
      </Field>
      {error && <ErrorMsg>{error}</ErrorMsg>}
      <Actions><Btn type="submit" disabled={busy}>{busy ? 'Sending…' : 'Send to my manager'}</Btn></Actions>
    </Card>
  );
}

const ROOMS = ['Kitchen', 'Bathroom', 'Bedroom', 'Living room', 'Outside / compound', 'Whole home'];

function NewRequest({ tenancy, email, onDone }) {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const initialType = TENANT_REQUEST_CATEGORIES.some((c) => c.id === params.get('type')) ? params.get('type') : 'repair';
  const [category, setCategory] = useState(initialType === 'payment' ? 'repair' : initialType);
  const [form, setForm] = useState({ title: '', details: '', urgency: 'normal', location: '', accessNotes: '' });
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [mediaOn, setMediaOn] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { api.getMediaConfig().then((c) => setMediaOn(Boolean(c?.enabled))); }, []);

  if (!tenancy) return <Empty>You can raise requests once your tenancy is set up.</Empty>;

  const onPick = async (e) => {
    const picked = Array.from(e.target.files || []);
    e.target.value = '';
    if (!picked.length) return;
    setUploading(true); setError('');
    try {
      const done = [];
      for (const f of picked.slice(0, 8 - files.length)) {
        // eslint-disable-next-line no-await-in-loop
        const { blobUrl } = await api.uploadMedia(f, { prefix: 'tenant' });
        done.push({ url: blobUrl, name: f.name, kind: f.type.startsWith('video') ? 'video' : 'image' });
      }
      setFiles((prev) => [...prev, ...done]);
    } catch (err) {
      setError(err?.message || 'Could not upload that photo.');
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true); setError('');
    try {
      await api.tenant.raise(email, { tenancyId: tenancy.id, category, ...form, media: files });
      onDone();
      navigate(TENANT_REQUESTS_URL, { state: { sent: true } });
    } catch (err) {
      setError(err?.message || 'Could not send your request.');
    } finally {
      setBusy(false);
    }
  };

  const titleHint = {
    repair: 'e.g. Kitchen tap is leaking',
    question: 'e.g. Can I paint the bedroom?',
    notice: 'e.g. Moving out at the end of my tenancy',
  }[category];

  return (
    <Card as="form" onSubmit={submit}>
      <Field>
        <Label as="div">What is this about?</Label>
        <Choices $cols={3}>
          {TENANT_REQUEST_CATEGORIES.filter((c) => c.id !== 'payment').map((c) => (
            <Choice type="button" key={c.id} $on={category === c.id} aria-pressed={category === c.id} onClick={() => setCategory(c.id)}>
              <div className="t">{c.short}</div>
              <div className="s">{c.label}</div>
            </Choice>
          ))}
        </Choices>
      </Field>

      <Field>
        <Label htmlFor="title">Short title</Label>
        <Input id="title" required maxLength={255} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder={titleHint} />
      </Field>

      {category === 'repair' && (
        <>
          <Field>
            <Label as="div">How urgent is it?</Label>
            <Choices $cols={3}>
              {TENANT_URGENCIES.map((u) => (
                <Choice type="button" key={u.id} $on={form.urgency === u.id} aria-pressed={form.urgency === u.id} onClick={() => setForm({ ...form, urgency: u.id })}>
                  <div className="t">{u.label}</div>
                  <div className="s">{u.hint}</div>
                </Choice>
              ))}
            </Choices>
          </Field>
          <TwoCol>
            <Field>
              <Label htmlFor="loc">Where in the home?</Label>
              <Select id="loc" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })}>
                <option value="">Choose a room</option>
                {ROOMS.map((r) => <option key={r} value={r}>{r}</option>)}
              </Select>
            </Field>
            <Field>
              <Label htmlFor="access">Access for the repairer (optional)</Label>
              <Input id="access" value={form.accessNotes} onChange={(e) => setForm({ ...form, accessNotes: e.target.value })} placeholder="e.g. weekdays after 4pm" />
            </Field>
          </TwoCol>
        </>
      )}

      <Field>
        <Label htmlFor="details">{category === 'notice' ? 'When do you plan to leave, and anything we should know?' : 'Tell us more'}</Label>
        <Textarea id="details" value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} />
      </Field>

      {category === 'repair' && (
        <Field>
          <Label as="div">Photos (optional)</Label>
          {mediaOn ? (
            <>
              <Btn $ghost as="label" style={{ cursor: uploading ? 'wait' : 'pointer' }}>
                <FaCamera /> {uploading ? 'Uploading…' : 'Add photos'}
                <input type="file" accept="image/*,video/*" multiple hidden disabled={uploading} onChange={onPick} />
              </Btn>
              {files.length > 0 && (
                <Thumbs>
                  {files.map((f, i) => (
                    <span key={f.url}>
                      {f.name}
                      <button type="button" aria-label={`Remove ${f.name}`} onClick={() => setFiles(files.filter((_, j) => j !== i))}><FaTimes size={10} /></button>
                    </span>
                  ))}
                </Thumbs>
              )}
            </>
          ) : (
            <div style={{ fontSize: '0.86rem', color: 'var(--color-ink-muted)' }}>Photo uploads are not switched on yet — your manager will ask for photos if they need them.</div>
          )}
        </Field>
      )}

      {category === 'repair' && form.urgency === 'urgent' && (
        <Notice $warn>
          <FaExclamationTriangle />
          <div>For a gas smell, fire or flooding, leave the home and call the emergency services first.{whatsappLink() ? <> Then message us on <a href={whatsappLink(`Urgent repair: ${form.title}`)} target="_blank" rel="noreferrer">WhatsApp</a>.</> : ''}</div>
        </Notice>
      )}

      {error && <ErrorMsg>{error}</ErrorMsg>}
      <Actions><Btn type="submit" disabled={busy || uploading}>{busy ? 'Sending…' : 'Send to my manager'}</Btn></Actions>
    </Card>
  );
}

function Requests({ data, email, onRefresh, sent }) {
  const [filter, setFilter] = useState('open');
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const all = data.requests || [];
  const list = filter === 'open' ? all.filter((r) => OPEN_TENANT_STATUSES.includes(r.status)) : all;

  const reply = async (id, body) => {
    await api.tenant.reply(id, body);
    await onRefresh();
  };

  const close = async (id) => {
    setBusyId(id); setError('');
    try {
      await api.tenant.close(id);
      await onRefresh();
    } catch (err) {
      setError(err?.message || 'Could not update that request.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <>
      {sent && <Notice><FaCheckCircle /><div><b>Sent.</b> Your manager has it and will reply here.</div></Notice>}
      <Card>
        <CardHead>
          <CardTitle><FaTools /> Requests</CardTitle>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <Btn $ghost={filter !== 'open'} onClick={() => setFilter('open')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>Open</Btn>
            <Btn $ghost={filter !== 'all'} onClick={() => setFilter('all')} style={{ padding: '0.4rem 0.85rem', fontSize: '0.8rem' }}>All ({all.length})</Btn>
          </div>
        </CardHead>
        {list.length ? list.map((r) => <RequestRow key={r.id} r={r} onClose={close} busy={busyId === r.id} onReply={reply} />) : (
          <Empty>{filter === 'open' ? 'Nothing open.' : 'Nothing raised yet.'} <Link to={TENANT_NEW_REQUEST_URL}>Report a repair</Link></Empty>
        )}
        {error && <ErrorMsg>{error}</ErrorMsg>}
      </Card>
    </>
  );
}

function MyHome({ tenancy }) {
  if (!tenancy) return <Empty>Your tenancy details appear once your tenancy is set up.</Empty>;
  const cur = tenancy.currency;
  return (
    <>
      <Card>
        <CardHead>
          <CardTitle><FaHome /> {tenancy.property_title}</CardTitle>
          <Pill $tone={TENANCY_STATUS_TONE[tenancy.status]}>{TENANCY_STATUS_LABEL[tenancy.status]}</Pill>
        </CardHead>
        <FactGrid>
          <div><dt>Address</dt><dd>{tenancy.address || [tenancy.area, tenancy.city, tenancy.state].filter(Boolean).join(', ') || '—'}</dd></div>
          {tenancy.unit_label && <div><dt>Unit</dt><dd>{tenancy.unit_label}</dd></div>}
          <div><dt>Rent</dt><dd>{money(tenancy.rent_amount, cur)} {RENT_FREQUENCY_LABEL[tenancy.rent_frequency] || ''}</dd></div>
          <div><dt>Deposit held</dt><dd>{tenancy.deposit != null ? money(tenancy.deposit, cur) : '—'}</dd></div>
          <div><dt>Started</dt><dd>{shortDate(tenancy.start_date)}</dd></div>
          <div><dt>Ends</dt><dd>{shortDate(tenancy.end_date)}</dd></div>
          {tenancy.property_type && <div><dt>Type</dt><dd style={{ textTransform: 'capitalize' }}>{String(tenancy.property_type).replace(/_/g, ' ')}</dd></div>}
          {tenancy.bedrooms && <div><dt>Bedrooms</dt><dd>{tenancy.bedrooms}</dd></div>}
        </FactGrid>
      </Card>
      <Card>
        <CardHead><CardTitle><FaUserTie /> Who manages your home</CardTitle></CardHead>
        <Row>
          <div>
            <div className="t">{tenancy.manager_name || 'The EasyMoveZone property desk'}</div>
            <div className="s">EasyMoveZone manages this home for its owner. Talk to us, not the owner.</div>
          </div>
        </Row>
        <Actions>
          <Btn as={Link} to={`${TENANT_NEW_REQUEST_URL}?type=question`}>Ask a question</Btn>
          {whatsappLink() && <Btn $ghost as="a" href={whatsappLink(`Hello, I rent ${tenancy.property_title}`)} target="_blank" rel="noreferrer"><FaWhatsapp /> WhatsApp</Btn>}
          <Btn $ghost as={Link} to={`${TENANT_NEW_REQUEST_URL}?type=notice`}>Give notice</Btn>
        </Actions>
      </Card>
    </>
  );
}

function Documents({ data, tenancy, email }) {
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState('');
  const docs = (data.documents || []).filter((d) => !tenancy || !d.tenancy_id || d.tenancy_id === tenancy.id);

  const open = async (id) => {
    setBusyId(id); setError('');
    // Open the tab first (inside the click), then point it at the signed link.
    const win = window.open('', '_blank');
    try {
      const url = await api.tenant.documentUrl(id);
      if (win) win.location.href = url; else window.location.href = url;
    } catch (err) {
      if (win) win.close();
      setError(err?.message || 'Could not open that document.');
    } finally {
      setBusyId(null);
    }
  };

  return (
    <Card>
      <CardHead>
        <CardTitle><FaFileAlt /> Documents</CardTitle>
        <CardNote>{docs.length} FILE{docs.length === 1 ? '' : 'S'}</CardNote>
      </CardHead>
      {docs.length ? docs.map((d) => (
        <Row key={d.id}>
          <div>
            <div className="t">{d.name}</div>
            <div className="s">{d.kind} · shared {shortDate(d.created_at)}</div>
          </div>
          <Btn $ghost disabled={busyId === d.id} onClick={() => open(d.id)}>{busyId === d.id ? 'Opening…' : 'Open'}</Btn>
        </Row>
      )) : (
        <Empty>Nothing shared yet. Your tenancy agreement and inventory appear here once your manager shares them.</Empty>
      )}
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Card>
  );
}

/* ── The portal ───────────────────────────────────────────────────── */

const EMPTY = { tenancies: [], rentCharges: [], requests: [], documents: [], applications: [], summary: {} };

function Portal({ email }) {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setData(await api.tenant.portal());
      setError('');
    } catch (err) {
      setError(err?.message || 'Could not load your tenant portal.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const d = data || EMPTY;
  const tenancies = d.tenancies;
  const chosen = Number.parseInt(params.get('tenancyId'), 10);
  const tenancy = tenancies.find((t) => t.id === chosen) || tenancies[0] || null;

  const switcher = tenancies.length > 1 ? (
    <PropertySelect
      value={tenancy?.id || ''}
      onChange={(e) => setParams({ tenancyId: e.target.value }, { replace: true })}
      aria-label="Choose a tenancy"
    >
      {tenancies.map((t) => (
        <option key={t.id} value={t.id}>{t.property_title}{t.unit_label ? ` · ${t.unit_label}` : ''}{t.status === 'ended' ? ' (ended)' : ''}</option>
      ))}
    </PropertySelect>
  ) : null;

  const arrears = d.summary?.arrears || 0;
  const page = (key, node) => {
    const meta = PAGE_META[key];
    let body = node;
    if (loading && !data) body = <Card><Empty>Loading your tenant portal…</Empty></Card>;
    else if (error && !data) body = <Card><Empty>{error}</Empty></Card>;
    return (
      <ConsoleShell
        workspace="tenant"
        nav={TENANT_NAV}
        title={meta.title}
        sub={meta.sub}
        actions={switcher}
        primary={tenancy ? { to: TENANT_NEW_REQUEST_URL, label: 'Report a repair' } : null}
        badges={{ arrears: arrears > 0 ? 1 : 0, requests: d.summary?.openRequests || 0 }}
      >
        {body}
      </ConsoleShell>
    );
  };

  return (
    <Routes>
      <Route index element={page('overview', <Overview data={d} tenancy={tenancy} email={email} />)} />
      <Route path="applications" element={page('applications', <Applications data={d} />)} />
      <Route path="rent" element={page('rent', <RentSchedule data={d} tenancy={tenancy} onRefresh={load} />)} />
      <Route path="rent/paid" element={page('paid', <PaidForm data={d} tenancy={tenancy} email={email} onDone={load} />)} />
      <Route path="requests" element={page('requests', <RequestsRoute data={d} email={email} onRefresh={load} />)} />
      <Route path="requests/new" element={page('new', <NewRequest tenancy={tenancy} email={email} onDone={load} />)} />
      <Route path="home" element={page('home', <MyHome tenancy={tenancy} />)} />
      <Route path="home/documents" element={page('documents', <Documents data={d} tenancy={tenancy} email={email} />)} />
      <Route path="*" element={<Navigate to={TENANT_URL} replace />} />
    </Routes>
  );
}

/** Reads the one-off "sent" flag the new-request form leaves in history state. */
function RequestsRoute(props) {
  const { state } = useLocation();
  return <Requests {...props} sent={Boolean(state?.sent)} />;
}

const GateWrap = styled.div`
  min-height: calc(100vh - var(--nav-h));
  background: var(--color-bg-panel);
  display: flex;
  justify-content: center;
  padding: 3rem 1.25rem 5rem;
`;

export default function TenantConsolePage() {
  const { user } = useAuth();
  if (!user?.email) {
    return (
      <GateWrap>
        <div style={{ width: '100%', maxWidth: 720 }}>
          <SignInGate title="Sign in to your tenant portal" action="see your rent, report repairs and read your tenancy">
            <Card><Empty>Your rent schedule, repairs and tenancy documents live here. Sign in with the email on your tenancy.</Empty></Card>
          </SignInGate>
        </div>
      </GateWrap>
    );
  }
  // Keyed on the account, so signing in as someone else starts afresh.
  return <Portal key={user.email} email={user.email} />;
}

