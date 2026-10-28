import React, { useCallback, useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import {
  FaCheckCircle, FaPaperPlane, FaRegClock, FaLock, FaHardHat, FaFileInvoiceDollar,
} from 'react-icons/fa';
import { api } from '../api';
import { STATUS_STEPS, STATUS_LABEL, SERVICE_BY_ID } from '../config/renovations';
import { LOCALE } from '../config/markets';

/**
 * Customer-facing progress tracker for one EasyMoveZone Upgrade request:
 * lifecycle timeline, the firm quote, milestone (escrow-style) payments, and a
 * message thread with the EasyMoveZone team. Reused after submit and in "My upgrades".
 */

const Wrap = styled.div`
  border: 1px solid var(--color-line-strong);
  border-radius: 18px;
  background: #fff;
  overflow: hidden;
`;

const Head = styled.div`
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid var(--color-line);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  .title { font-family: var(--font-display); font-size: 1.15rem; font-weight: 700; letter-spacing: -0.01em; display: flex; align-items: center; gap: 0.5rem; }
  .ref { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); }
`;

const Pill = styled.span`
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  color: var(--color-green-deep);
  background: var(--color-green-soft);
  border: 1px solid rgba(184, 90, 48,0.2);
  padding: 0.3rem 0.7rem;
  border-radius: 999px;
`;

const Body = styled.div` padding: 1.5rem; display: flex; flex-direction: column; gap: 1.5rem; `;

const Timeline = styled.div` display: flex; flex-direction: column; gap: 0; `;
const Step = styled.div`
  display: flex;
  gap: 0.85rem;
  align-items: flex-start;
  padding-bottom: 1rem;
  position: relative;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    left: 12px; top: 26px; bottom: 0;
    width: 2px;
    background: ${(p) => (p.$done ? 'var(--color-green)' : 'var(--color-line-strong)')};
  }
  .dot {
    flex-shrink: 0;
    width: 26px; height: 26px; border-radius: 50%;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.7rem;
    background: ${(p) => (p.$done ? 'var(--color-green)' : p.$current ? '#fff' : 'var(--color-bg-sunken)')};
    color: ${(p) => (p.$done ? '#fff' : 'var(--color-ink-faint)')};
    border: 2px solid ${(p) => (p.$done || p.$current ? 'var(--color-green)' : 'var(--color-line-strong)')};
  }
  .label { font-size: 0.95rem; font-weight: ${(p) => (p.$current ? 700 : 500)}; color: ${(p) => (p.$done || p.$current ? 'var(--color-ink)' : 'var(--color-ink-faint)')}; }
  .sub { font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-ink-faint); margin-top: 0.15rem; }
`;

const QuoteCard = styled.div`
  border: 1px solid rgba(184, 90, 48,0.22);
  background: linear-gradient(180deg, #f3f6f1 0%, #fff 70%);
  border-radius: 14px;
  padding: 1.2rem 1.3rem;
  .top { display: flex; align-items: center; gap: 0.5rem; font-family: var(--font-display); font-weight: 700; margin-bottom: 0.4rem; svg { color: var(--color-green); } }
  .amount { font-family: var(--font-display); font-size: 1.8rem; font-weight: 700; letter-spacing: -0.02em; }
  .note { font-size: 0.88rem; color: var(--color-ink-muted); line-height: 1.5; margin-top: 0.5rem; }
`;

const AcceptBtn = styled.button`
  margin-top: 0.9rem;
  background: var(--color-green-deep);
  color: #fff; border: none;
  padding: 0.85rem 1.4rem;
  border-radius: 12px;
  font-weight: 700; font-size: 0.95rem;
  cursor: pointer;
  &:hover:not(:disabled) { background: var(--color-green-forest); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const Milestones = styled.div` display: flex; flex-direction: column; gap: 0.6rem; `;
const MilestoneRow = styled.div`
  display: flex; align-items: center; justify-content: space-between; gap: 0.85rem;
  border: 1px solid ${(p) => (p.$paid ? 'rgba(184, 90, 48,0.3)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$paid ? 'var(--color-green-soft)' : 'var(--color-bg-sunken)')};
  border-radius: 12px;
  padding: 0.75rem 0.9rem;
  .info .label { font-size: 0.9rem; font-weight: 600; color: var(--color-ink); }
  .info .amt { font-family: var(--font-mono); font-size: 0.75rem; color: var(--color-ink-muted); margin-top: 0.15rem; }
`;

const PayBtn = styled.button`
  flex-shrink: 0;
  background: var(--color-green-deep); color: #fff; border: none;
  padding: 0.55rem 1.1rem; border-radius: 999px;
  font-weight: 700; font-size: 0.82rem; cursor: pointer;
  display: inline-flex; align-items: center; gap: 0.4rem;
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const StatusTag = styled.span`
  font-family: var(--font-mono); font-size: 0.66rem;
  padding: 0.25rem 0.55rem; border-radius: 999px;
  background: ${(p) => (p.$paid ? 'var(--color-green)' : p.$due ? 'var(--color-ink)' : 'var(--color-line-strong)')};
  color: ${(p) => (p.$paid || p.$due ? '#fff' : 'var(--color-ink-faint)')};
`;

/* ── Thread ── */
const Thread = styled.div` border: 1px solid var(--color-line-strong); border-radius: 14px; overflow: hidden; `;
const Stream = styled.div` max-height: 300px; overflow-y: auto; padding: 1rem; display: flex; flex-direction: column; gap: 0.6rem; background: var(--color-bg-sunken); `;
const Bubble = styled.div`
  align-self: ${(p) => (p.$mine ? 'flex-end' : 'flex-start')};
  max-width: 82%;
  padding: 0.6rem 0.85rem;
  border-radius: 14px;
  background: ${(p) => (p.$mine ? 'var(--color-green)' : '#fff')};
  color: ${(p) => (p.$mine ? '#fff' : 'var(--color-ink)')};
  border: 1px solid ${(p) => (p.$mine ? 'var(--color-green)' : 'var(--color-line-strong)')};
  font-size: 0.9rem; line-height: 1.45; white-space: pre-wrap; word-break: break-word;
  .meta { display: block; margin-top: 0.3rem; font-family: var(--font-mono); font-size: 0.6rem; opacity: 0.7; }
`;
const Composer = styled.form` display: flex; gap: 0.5rem; padding: 0.65rem; border-top: 1px solid var(--color-line-strong); background: #fff; `;
const TextInput = styled.textarea`
  flex: 1; resize: none; min-height: 40px; max-height: 120px;
  border: 1px solid var(--color-line-strong); border-radius: 10px; padding: 0.6rem 0.8rem;
  font-family: inherit; font-size: 0.9rem; outline: none;
  &:focus { border-color: var(--color-green); }
`;
const Send = styled.button`
  flex-shrink: 0; width: 42px; border: none; border-radius: 10px;
  background: var(--color-green); color: #fff; display: flex; align-items: center; justify-content: center; cursor: pointer;
  &:hover:not(:disabled) { background: var(--color-green-forest); }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;
const Err = styled.div` color: #b91c1c; font-size: 0.82rem; margin-top: 0.4rem; `;
const SectionLabel = styled.div` font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-soft); margin-bottom: 0.6rem; `;

const money = (v, ccy = 'NGN') => {
  const n = Number(v) || 0;
  try { return new Intl.NumberFormat(LOCALE, { style: 'currency', currency: ccy, currencyDisplay: 'narrowSymbol', maximumFractionDigits: 0 }).format(n); }
  catch { return `${ccy} ${n.toLocaleString()}`; }
};
const fmt = (iso) => { try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };
const fmtDate = (iso) => { try { return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' }); } catch { return iso; } };

const stepIndex = (status) => {
  const order = ['new', 'inspection_booked', 'quoted', 'in_progress', 'completed'];
  const map = { reviewing: 0, inspected: 2, accepted: 2, cancelled: -1 };
  const idx = order.indexOf(status);
  return idx >= 0 ? idx : (map[status] ?? 0);
};

export default function RenovationTracker({ id, email }) {
  const [data, setData] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [payingId, setPayingId] = useState(null);
  const streamRef = useRef(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const [detail, msgs] = await Promise.all([
        api.renovations.get(id, email),
        api.renovations.messages(id, email),
      ]);
      setData(detail);
      setMessages(msgs);
      requestAnimationFrame(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; });
    } catch (e) {
      setError(e.message || 'Could not load this request.');
    } finally {
      setLoading(false);
    }
  }, [id, email]);

  useEffect(() => { load(); }, [load]);

  const send = async (e) => {
    e.preventDefault();
    const body = text.trim();
    if (!body || busy) return;
    setBusy(true);
    try {
      const msg = await api.renovations.sendMessage(id, email, body);
      setMessages((m) => [...m, msg]);
      setText('');
      requestAnimationFrame(() => { if (streamRef.current) streamRef.current.scrollTop = streamRef.current.scrollHeight; });
    } catch (err) {
      setError(err.message || 'Could not send.');
    } finally { setBusy(false); }
  };

  const accept = async () => {
    setBusy(true); setError('');
    try { await api.renovations.accept(id, email); await load(); }
    catch (e) { setError(e.message || 'Could not accept the quote.'); }
    finally { setBusy(false); }
  };

  const pay = async (milestoneId) => {
    setPayingId(milestoneId); setError('');
    try {
      const { url } = await api.renovations.payMilestone(id, milestoneId, email);
      if (url) window.location.href = url;
      else { setError('Could not start payment.'); setPayingId(null); }
    } catch (e) {
      setError(e.message || 'Could not start payment.');
      setPayingId(null);
    }
  };

  if (loading) return <Wrap><Body>Loading…</Body></Wrap>;
  if (!data) return <Wrap><Body><Err>{error || 'Request not found.'}</Err></Body></Wrap>;

  const r = data.request;
  const milestones = data.milestones || [];
  const svc = SERVICE_BY_ID[r.service];
  const currentIdx = stepIndex(r.status);
  const cancelled = r.status === 'cancelled';

  return (
    <Wrap>
      <Head>
        <div>
          <div className="title">{svc ? svc.name : r.title}</div>
          <div className="ref">{r.ref} · {r.city ? `${r.city}, ` : ''}{r.state}{r.country ? `, ${r.country}` : ''}</div>
        </div>
        <Pill>{STATUS_LABEL[r.status] || r.status}</Pill>
      </Head>
      <Body>
        {/* Progress timeline */}
        <div>
          <SectionLabel>Progress</SectionLabel>
          <Timeline>
            {STATUS_STEPS.map((s, i) => {
              const done = !cancelled && i < currentIdx;
              const current = !cancelled && i === currentIdx;
              let sub = '';
              if (s.id === 'inspection_booked' && r.inspection_date) sub = `${fmtDate(r.inspection_date)}${r.inspection_window ? ` · ${r.inspection_window}` : ''}${r.inspector_name ? ` · ${r.inspector_name}` : ''}`;
              return (
                <Step key={s.id} $done={done} $current={current}>
                  <span className="dot">{done ? <FaCheckCircle /> : current ? <FaRegClock /> : i + 1}</span>
                  <div>
                    <div className="label">{s.label}</div>
                    {sub && <div className="sub">{sub}</div>}
                  </div>
                </Step>
              );
            })}
          </Timeline>
          {cancelled && <Err>This request was cancelled. Message us if you'd like to reopen it.</Err>}
        </div>

        {/* Indicative estimate before a firm quote exists */}
        {!r.quote_amount && r.estimate && (
          <QuoteCard>
            <div className="top"><FaFileInvoiceDollar /> Indicative range</div>
            <div className="amount">{money(r.estimate.low, r.estimate.currency)} – {money(r.estimate.high, r.estimate.currency)}</div>
            <div className="note">{r.estimate.note}</div>
          </QuoteCard>
        )}

        {/* Firm quote + accept */}
        {r.quote_amount != null && (
          <QuoteCard>
            <div className="top"><FaFileInvoiceDollar /> Your quote</div>
            <div className="amount">{money(r.quote_amount, r.currency)}</div>
            {r.quote_note && <div className="note">{r.quote_note}</div>}
            {r.status === 'quoted' && (
              <AcceptBtn onClick={accept} disabled={busy}>
                {busy ? 'Working…' : 'Accept quote & start'}
              </AcceptBtn>
            )}
          </QuoteCard>
        )}

        {/* Milestone (escrow-style) payments */}
        {milestones.length > 0 && (
          <div>
            <SectionLabel><FaHardHat style={{ marginRight: 6 }} />Payment plan</SectionLabel>
            <Milestones>
              {milestones.map((m) => {
                const paid = m.status === 'paid';
                const due = m.status === 'due';
                return (
                  <MilestoneRow key={m.id} $paid={paid}>
                    <div className="info">
                      <div className="label">{m.label}</div>
                      <div className="amt">{money(m.amount, m.currency)}</div>
                    </div>
                    {paid ? (
                      <StatusTag $paid><FaCheckCircle style={{ marginRight: 4 }} />Paid</StatusTag>
                    ) : due ? (
                      <PayBtn onClick={() => pay(m.id)} disabled={payingId === m.id}>
                        <FaLock size={10} /> {payingId === m.id ? 'Opening…' : 'Pay now'}
                      </PayBtn>
                    ) : (
                      <StatusTag>Upcoming</StatusTag>
                    )}
                  </MilestoneRow>
                );
              })}
            </Milestones>
          </div>
        )}

        {error && <Err>{error}</Err>}

        {/* Message thread */}
        <div>
          <SectionLabel>Messages</SectionLabel>
          <Thread>
            <Stream ref={streamRef}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: 'var(--color-ink-faint)', fontFamily: 'var(--font-mono)', fontSize: '0.78rem', padding: '1.5rem 0' }}>No messages yet.</div>
              ) : messages.map((m) => (
                <Bubble key={m.id} $mine={m.sender === 'customer'}>
                  {m.body}
                  <span className="meta">{m.sender === 'admin' ? 'EasyMoveZone' : 'You'} · {fmt(m.created_at)}</span>
                </Bubble>
              ))}
            </Stream>
            <Composer onSubmit={send}>
              <TextInput
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(e); } }}
                placeholder="Message the EasyMoveZone team…"
              />
              <Send type="submit" disabled={busy || !text.trim()}><FaPaperPlane size={13} /></Send>
            </Composer>
          </Thread>
        </div>
      </Body>
    </Wrap>
  );
}
