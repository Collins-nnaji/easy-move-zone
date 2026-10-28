import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  FaSyncAlt, FaPaperPlane, FaCheckCircle, FaRegCalendarAlt, FaFileInvoiceDollar,
  FaTrashAlt, FaMoneyBillWave,
} from 'react-icons/fa';
import { api } from '../api';
import AdminMedia from './AdminMedia';
import { SERVICE_BY_ID, INSPECTION_WINDOWS, STATUS_LABEL } from '../config/renovations';
import { LOCALE } from '../config/markets';

/**
 * In-house admin console for EasyMoveZone Upgrade requests.
 * Review the queue, book inspections, issue quotes with a milestone plan,
 * advance status, record payments, and message the homeowner.
 */

const TABS = ['new', 'inspection_booked', 'quoted', 'in_progress', 'completed', 'all'];

const Wrap = styled.div``;
const StatsRow = styled.div` display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1.25rem; `;
const StatChip = styled.button`
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$active ? 'var(--color-green-soft)' : '#fff')};
  border-radius: 12px; padding: 0.6rem 0.9rem; cursor: pointer; text-align: left; min-width: 92px;
  .n { display: block; font-family: var(--font-display); font-size: 1.3rem; font-weight: 700; color: var(--color-ink); }
  .l { font-family: var(--font-mono); font-size: 0.64rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-ink-muted); }
`;
const List = styled.div` display: flex; flex-direction: column; gap: 1rem; `;
const Card = styled.div` border: 1px solid var(--color-line-strong); border-radius: 16px; background: #fff; overflow: hidden; `;
const CardHead = styled.button`
  width: 100%; text-align: left; border: none; background: none; cursor: pointer;
  padding: 1.1rem 1.25rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  &:hover { background: var(--color-bg-sunken); }
  .t { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; color: var(--color-ink); }
  .s { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); margin-top: 0.2rem; }
`;
const Pill = styled.span`
  font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.04em; white-space: nowrap;
  color: var(--color-green-deep); background: var(--color-green-soft); border: 1px solid rgba(184, 90, 48,0.2);
  padding: 0.3rem 0.65rem; border-radius: 999px;
`;
const Unread = styled.span` margin-left: 0.5rem; background: var(--color-green); color: #fff; border-radius: 999px; font-family: var(--font-mono); font-size: 0.62rem; padding: 0.14rem 0.45rem; `;
const Detail = styled.div` border-top: 1px solid var(--color-line); padding: 1.25rem; display: grid; grid-template-columns: 1fr 1fr; gap: 1.25rem; @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); } `;
const Panel = styled.div` display: flex; flex-direction: column; gap: 0.85rem; `;
const PanelTitle = styled.div` font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-soft); `;
const Row = styled.div` display: grid; grid-template-columns: 1fr 1fr; gap: 0.6rem; @media (max-width: 520px) { grid-template-columns: minmax(0, 1fr); } `;
const inputCss = `
  width: 100%; background: var(--color-bg-sunken); border: 1px solid var(--color-line-strong);
  border-radius: 10px; padding: 0.7rem 0.85rem; font-family: var(--font-sans); font-size: 0.92rem; color: var(--color-ink); outline: none;
  &:focus { border-color: var(--color-green); background: #fff; }
`;
const Input = styled.input`${inputCss}`;
const Select = styled.select`${inputCss} cursor: pointer;`;
const Textarea = styled.textarea`${inputCss} min-height: 60px; resize: vertical;`;
const Btn = styled.button`
  background: ${(p) => (p.$ghost ? '#fff' : 'var(--color-green)')};
  color: ${(p) => (p.$ghost ? 'var(--color-ink)' : '#fff')};
  border: 1px solid ${(p) => (p.$ghost ? 'var(--color-line-strong)' : 'var(--color-green)')};
  border-radius: 10px; padding: 0.6rem 1rem; font-weight: 700; font-size: 0.85rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.45rem;
  &:hover:not(:disabled) { opacity: 0.9; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const MRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 0.6rem;
  border: 1px solid var(--color-line-strong); border-radius: 10px; padding: 0.55rem 0.75rem;
  .l { font-size: 0.85rem; font-weight: 600; } .a { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-muted); }
`;
/* Thread */
const Stream = styled.div` max-height: 240px; overflow-y: auto; padding: 0.85rem; display: flex; flex-direction: column; gap: 0.5rem; background: var(--color-bg-sunken); border: 1px solid var(--color-line-strong); border-radius: 10px; `;
const Bubble = styled.div`
  align-self: ${(p) => (p.$mine ? 'flex-end' : 'flex-start')}; max-width: 85%;
  padding: 0.5rem 0.75rem; border-radius: 12px; font-size: 0.85rem; line-height: 1.4; white-space: pre-wrap; word-break: break-word;
  background: ${(p) => (p.$mine ? 'var(--color-green)' : '#fff')}; color: ${(p) => (p.$mine ? '#fff' : 'var(--color-ink)')};
  border: 1px solid ${(p) => (p.$mine ? 'var(--color-green)' : 'var(--color-line-strong)')};
  .meta { display: block; margin-top: 0.25rem; font-family: var(--font-mono); font-size: 0.58rem; opacity: 0.7; }
`;
const Composer = styled.form` display: flex; gap: 0.4rem; margin-top: 0.5rem; `;
const Err = styled.div` color: #b91c1c; font-size: 0.8rem; `;
const Empty = styled.div` color: var(--color-ink-faint); font-family: var(--font-mono); font-size: 0.85rem; padding: 2rem 0; `;
const Label = styled.div` font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.05em; text-transform: uppercase; color: var(--color-ink-faint); margin-bottom: 0.3rem; `;

const money = (v, ccy = 'NGN') => {
  const n = Number(v) || 0;
  try { return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: ccy, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(n); }
  catch { return `${ccy} ${n.toLocaleString()}`; }
};
const fmt = (iso) => { try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

export default function RenovationAdmin({ adminKey }) {
  const [tab, setTab] = useState('new');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openId, setOpenId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true); setError('');
    try { setItems(await api.renovations.admin.list(adminKey)); }
    catch (e) { setError(e.message || 'Could not load requests.'); }
    finally { setLoading(false); }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);

  const counts = TABS.reduce((acc, t) => {
    acc[t] = t === 'all' ? items.length : items.filter((r) => r.status === t).length;
    return acc;
  }, {});
  const filtered = items.filter((r) => tab === 'all' || r.status === tab);

  return (
    <Wrap>
      <StatsRow>
        {TABS.map((t) => (
          <StatChip key={t} $active={tab === t} onClick={() => setTab(t)}>
            <span className="n">{counts[t] || 0}</span>
            <span className="l">{t === 'all' ? 'Total' : STATUS_LABEL[t] || t}</span>
          </StatChip>
        ))}
        <StatChip as="button" onClick={load}><span className="n"><FaSyncAlt size={14} /></span><span className="l">Refresh</span></StatChip>
      </StatsRow>

      {error && <Err style={{ marginBottom: '1rem' }}>{error}</Err>}

      {loading && items.length === 0 ? (
        <Empty>Loading requests…</Empty>
      ) : filtered.length === 0 ? (
        <Empty>No {tab === 'all' ? '' : (STATUS_LABEL[tab] || tab)} requests.</Empty>
      ) : (
        <List>
          {filtered.map((r) => (
            <Card key={r.id}>
              <CardHead onClick={() => setOpenId(openId === r.id ? null : r.id)}>
                <div>
                  <div className="t">
                    {SERVICE_BY_ID[r.service]?.emoji} {r.title}
                    {Number(r.unread) > 0 && <Unread>{r.unread} new</Unread>}
                  </div>
                  <div className="s">{r.ref} · {r.contact_name} · {r.city ? `${r.city}, ` : ''}{r.state}{r.country ? `, ${r.country}` : ''} · {r.contact_phone || r.contact_email}</div>
                </div>
                <Pill>{STATUS_LABEL[r.status] || r.status}</Pill>
              </CardHead>
              {openId === r.id && <RequestDetail requestId={r.id} adminKey={adminKey} onChanged={load} />}
            </Card>
          ))}
        </List>
      )}
    </Wrap>
  );
}

function RequestDetail({ requestId, adminKey, onChanged }) {
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const streamRef = useRef(null);

  // Schedule form
  const [sched, setSched] = useState({ date: '', window: '', inspector: '', notes: '' });
  // Quote form
  const [quote, setQuote] = useState({ amount: '', note: '' });

  const load = useCallback(async () => {
    setError('');
    try {
      const [detail, msgs] = await Promise.all([
        api.renovations.admin.get(requestId, adminKey),
        api.renovations.admin.messages(requestId, adminKey),
      ]);
      setData(detail);
      setMessages(msgs);
      const r = detail.request;
      setSched({
        date: r.inspection_date ? String(r.inspection_date).slice(0, 10) : '',
        window: r.inspection_window || '',
        inspector: r.inspector_name || '',
        notes: r.inspection_notes || '',
      });
      setQuote({ amount: r.quote_amount ? String(r.quote_amount) : '', note: r.quote_note || '' });
      requestAnimationFrame(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; });
    } catch (e) { setError(e.message || 'Could not load.'); }
  }, [requestId, adminKey]);

  useEffect(() => { load(); }, [load]);

  const act = async (fn, okMsg) => {
    setBusy(true); setError('');
    try { await fn(); await load(); onChanged?.(); }
    catch (e) { setError(e.message || 'Action failed.'); }
    finally { setBusy(false); }
  };

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true); setError('');
    try {
      const msg = await api.renovations.admin.sendMessage(requestId, adminKey, body);
      setMessages((m) => [...m, msg]); setText('');
      requestAnimationFrame(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; });
    } catch (er) { setError(er.message || 'Could not send.'); }
    finally { setBusy(false); }
  };

  if (!data) return <Detail><Panel>Loading…</Panel></Detail>;
  const r = data.request;
  const milestones = data.milestones || [];
  const media = Array.isArray(r.media) ? r.media : [];

  return (
    <Detail>
      {/* Left: request info + media + actions */}
      <Panel>
        <div>
          <PanelTitle>Request</PanelTitle>
          {r.description && <div style={{ fontSize: '0.9rem', lineHeight: 1.5, marginTop: '0.4rem' }}>{r.description}</div>}
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-muted)', marginTop: '0.5rem' }}>
            {[r.property_type, r.size_band, r.budget_band].filter(Boolean).join(' · ')}
            {r.address ? <><br />{r.address}</> : null}
          </div>
          {r.estimate && (
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-green-deep)', marginTop: '0.4rem' }}>
              Indicative: {money(r.estimate.low, r.estimate.currency)} – {money(r.estimate.high, r.estimate.currency)}
            </div>
          )}
        </div>

        {media.length > 0 && (
          <div>
            <PanelTitle>Media ({media.length})</PanelTitle>
            <AdminMedia media={media} adminKey={adminKey} label="Customer photos" />
          </div>
        )}

        {/* Schedule inspection */}
        <div>
          <PanelTitle><FaRegCalendarAlt style={{ marginRight: 5 }} />Book inspection</PanelTitle>
          <Row style={{ marginTop: '0.4rem' }}>
            <div><Label>Date</Label><Input type="date" value={sched.date} onChange={(e) => setSched((s) => ({ ...s, date: e.target.value }))} /></div>
            <div><Label>Window</Label>
              <Select value={sched.window} onChange={(e) => setSched((s) => ({ ...s, window: e.target.value }))}>
                <option value="">Any</option>
                {INSPECTION_WINDOWS.map((w) => <option key={w}>{w}</option>)}
              </Select>
            </div>
          </Row>
          <div><Label>Inspector</Label><Input value={sched.inspector} onChange={(e) => setSched((s) => ({ ...s, inspector: e.target.value }))} placeholder="Assigned team member" /></div>
          <Btn disabled={busy || !sched.date} onClick={() => act(() => api.renovations.admin.schedule(requestId, adminKey, sched))}>
            <FaRegCalendarAlt /> {r.inspection_status === 'scheduled' ? 'Update slot' : 'Confirm inspection'}
          </Btn>
        </div>

        {/* Quote */}
        <div>
          <PanelTitle><FaFileInvoiceDollar style={{ marginRight: 5 }} />Issue quote</PanelTitle>
          <Row style={{ marginTop: '0.4rem' }}>
            <div><Label>Amount ({r.currency || 'currency'})</Label><Input type="number" value={quote.amount} onChange={(e) => setQuote((q) => ({ ...q, amount: e.target.value }))} placeholder="Enter quote amount" /></div>
            <div><Label>Note</Label><Input value={quote.note} onChange={(e) => setQuote((q) => ({ ...q, note: e.target.value }))} placeholder="Scope summary" /></div>
          </Row>
          <Btn disabled={busy || !Number(quote.amount)} onClick={() => act(() => api.renovations.admin.quote(requestId, adminKey, { amount: Number(quote.amount), note: quote.note }))}>
            <FaFileInvoiceDollar /> {r.quote_amount ? 'Update quote' : 'Send quote (40/40/20 plan)'}
          </Btn>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.66rem', color: 'var(--color-ink-faint)' }}>
            Creates a deposit + progress + completion milestone plan automatically.
          </div>
        </div>

        <div>
          <Btn $ghost disabled={busy} onClick={() => act(() => api.renovations.admin.setStatus(requestId, adminKey, 'in_progress'))}>Mark in progress</Btn>{' '}
          <Btn $ghost disabled={busy} onClick={() => act(() => api.renovations.admin.setStatus(requestId, adminKey, 'completed'))}><FaCheckCircle /> Complete</Btn>{' '}
          <Btn $ghost disabled={busy} onClick={() => { if (window.confirm('Delete this request permanently?')) act(() => api.renovations.admin.remove(requestId, adminKey)); }}><FaTrashAlt /> Delete</Btn>
        </div>
      </Panel>

      {/* Right: milestones + thread */}
      <Panel>
        {milestones.length > 0 && (
          <div>
            <PanelTitle>Payment plan</PanelTitle>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', marginTop: '0.4rem' }}>
              {milestones.map((m) => (
                <MRow key={m.id}>
                  <div>
                    <div className="l">{m.label}</div>
                    <div className="a">{money(m.amount, m.currency)} · {m.status}</div>
                  </div>
                  {m.status !== 'paid'
                    ? <Btn $ghost disabled={busy} onClick={() => act(() => api.renovations.admin.markPaid(requestId, m.id, adminKey))}><FaMoneyBillWave /> Mark paid</Btn>
                    : <FaCheckCircle style={{ color: 'var(--color-green)' }} />}
                </MRow>
              ))}
            </div>
          </div>
        )}

        <div>
          <PanelTitle>Messages with {r.contact_name?.split(' ')[0]}</PanelTitle>
          <Stream ref={streamRef} style={{ marginTop: '0.4rem' }}>
            {messages.length === 0 ? (
              <div style={{ textAlign: 'center', color: 'var(--color-ink-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.74rem', padding: '1rem 0' }}>No messages yet.</div>
            ) : messages.map((m) => (
              <Bubble key={m.id} $mine={m.sender === 'admin'}>
                {m.body}
                <span className="meta">{m.sender === 'admin' ? 'EasyMoveZone' : r.contact_name} · {fmt(m.created_at)}</span>
              </Bubble>
            ))}
          </Stream>
          <Composer onSubmit={send}>
            <Textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Reply to the homeowner…"
              onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }} />
            <Btn type="submit" disabled={busy || !text.trim()}><FaPaperPlane /></Btn>
          </Composer>
        </div>

        {error && <Err>{error}</Err>}
      </Panel>
    </Detail>
  );
}
