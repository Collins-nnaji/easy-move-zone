import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import {
  FaBuilding, FaChevronDown, FaFileAlt, FaMoneyBillWave, FaPaperPlane,
  FaPlus, FaSyncAlt, FaTrashAlt, FaUserTie,
} from 'react-icons/fa';
import { api } from '../api';
import AdminMedia from './AdminMedia';
import { formatMoneyFull } from '../utils/format';
import { LOCALE } from '../config/markets';

const STATUSES = ['new', 'reviewing', 'visit_booked', 'proposal_sent', 'onboarding', 'active', 'paused', 'ended', 'cancelled'];
const EXPENSES = ['repairs', 'maintenance', 'utilities', 'service_charge', 'insurance', 'legal', 'tax', 'cleaning', 'other'];
const today = () => new Date().toISOString().slice(0, 10);
const firstOfMonth = () => `${new Date().toISOString().slice(0, 7)}-01`;

const Wrap = styled.div` min-width: 0; `;
const Toolbar = styled.div` display:flex;gap:.55rem;align-items:center;flex-wrap:wrap;margin-bottom:1rem; `;
const Chip = styled.button`
  border:1px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background:${(p) => (p.$on ? 'var(--color-green-soft)' : '#fff')};color:${(p) => (p.$on ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
  border-radius:999px;padding:.48rem .75rem;font-size:.76rem;font-weight:700;cursor:pointer;text-transform:capitalize;
`;
const Refresh = styled(Chip)` margin-left:auto;display:inline-flex;align-items:center;gap:.4rem; `;
const List = styled.div` display:grid;gap:.8rem; `;
const Card = styled.article` background:#fff;border:1px solid var(--color-line);border-radius:16px;overflow:hidden;min-width:0; `;
const Head = styled.button`
  width:100%;border:0;background:#fff;padding:1rem 1.1rem;display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;text-align:left;cursor:pointer;
  &:hover{background:var(--color-bg-sunken)}
  .title{font-weight:750;color:var(--color-ink);font-size:1rem}.sub{font-size:.78rem;color:var(--color-ink-muted);margin-top:.25rem;line-height:1.45}
  svg{flex:none;margin-top:.25rem;color:var(--color-ink-faint);transition:transform .15s;transform:${(p) => (p.$open ? 'rotate(180deg)' : 'none')}}
`;
const Status = styled.span` display:inline-flex;margin-top:.45rem;border-radius:999px;padding:.2rem .5rem;background:var(--color-green-soft);color:var(--color-green-deep);font-size:.65rem;font-weight:750;text-transform:uppercase;letter-spacing:.04em; `;
const Detail = styled.div` border-top:1px solid var(--color-line);padding:1rem;display:grid;gap:1rem; `;
const Summary = styled.div` display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.55rem;@media(max-width:800px){grid-template-columns:repeat(2,1fr)}@media(max-width:430px){grid-template-columns:1fr} `;
const Metric = styled.div` background:var(--color-bg-sunken);border-radius:10px;padding:.65rem .75rem;min-width:0;.k{font-size:.62rem;color:var(--color-ink-faint);text-transform:uppercase;letter-spacing:.05em}.v{font-size:.84rem;font-weight:700;margin-top:.18rem;overflow-wrap:anywhere} `;
const WorkGrid = styled.div` display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem;align-items:start;@media(max-width:780px){grid-template-columns:1fr} `;
const Box = styled.details` border:1px solid var(--color-line);border-radius:12px;background:#fff;overflow:hidden;summary{list-style:none;cursor:pointer;padding:.8rem .9rem;font-weight:750;font-size:.86rem;display:flex;align-items:center;gap:.5rem;color:var(--color-ink)}summary::-webkit-details-marker{display:none}.body{border-top:1px solid var(--color-line);padding:.85rem;display:grid;gap:.65rem} `;
const Fields = styled.div` display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.55rem;@media(max-width:520px){grid-template-columns:1fr} `;
const Field = styled.label`
  min-width:0;font-size:.65rem;font-weight:700;letter-spacing:.045em;text-transform:uppercase;color:var(--color-ink-faint);display:grid;gap:.3rem;
  input,select,textarea{min-width:0;width:100%;border:1px solid var(--color-line-strong);border-radius:9px;background:var(--color-bg-sunken);padding:.62rem .68rem;font:400 .85rem var(--font-sans);color:var(--color-ink);text-transform:none;letter-spacing:0;&:focus{outline:none;border-color:var(--color-green);background:#fff}}
  textarea{resize:vertical;min-height:64px}
`;
const WideField = styled(Field)` grid-column:1/-1; `;
const Button = styled.button`
  width:fit-content;border:1px solid ${(p) => (p.$danger ? '#fecaca' : 'var(--color-green-deep)')};border-radius:9px;padding:.58rem .8rem;background:${(p) => (p.$ghost ? '#fff' : p.$danger ? '#fff' : 'var(--color-green-deep)')};color:${(p) => (p.$danger ? '#b91c1c' : p.$ghost ? 'var(--color-green-deep)' : '#fff')};font-weight:700;font-size:.78rem;cursor:pointer;display:inline-flex;align-items:center;gap:.4rem;&:disabled{opacity:.45;cursor:not-allowed}
`;
const Actions = styled.div` display:flex;gap:.45rem;flex-wrap:wrap;align-items:center; `;
const InviteBox = styled.div`
  margin-top:.75rem;padding:.75rem .85rem;border-radius:10px;background:var(--color-green-wash);border:1px solid var(--color-line);font-size:.82rem;display:grid;gap:.5rem;
  code{display:block;overflow-wrap:anywhere;font-size:.75rem;background:#fff;border:1px solid var(--color-line);border-radius:8px;padding:.45rem .55rem}
`;
const Ledger = styled.div` overflow-x:auto;border:1px solid var(--color-line);border-radius:10px;table{width:100%;border-collapse:collapse;min-width:520px}th,td{padding:.55rem .65rem;border-bottom:1px solid var(--color-line);text-align:left;font-size:.75rem}th{color:var(--color-ink-faint);text-transform:uppercase;font-size:.61rem}.num{text-align:right}tr:last-child td{border-bottom:0} `;
const Thread = styled.div` max-height:220px;overflow:auto;background:var(--color-bg-sunken);border-radius:10px;padding:.65rem;display:grid;gap:.4rem; `;
const Bubble = styled.div` justify-self:${(p) => (p.$admin ? 'end' : 'start')};max-width:85%;border-radius:10px;padding:.48rem .62rem;background:${(p) => (p.$admin ? 'var(--color-green-deep)' : '#fff')};color:${(p) => (p.$admin ? '#fff' : 'var(--color-ink)')};font-size:.78rem;line-height:1.4; `;
const Composer = styled.form` display:flex;gap:.4rem;input{min-width:0;flex:1;border:1px solid var(--color-line-strong);border-radius:9px;padding:.62rem .7rem;font:inherit} `;
const Note = styled.div` padding:1.2rem;text-align:center;color:var(--color-ink-muted);font-size:.86rem; `;
const Error = styled.div` color:#b91c1c;background:#fff1f2;border:1px solid #fecdd3;border-radius:10px;padding:.65rem .75rem;font-size:.8rem;margin-bottom:.75rem; `;

function OperationBox({ title, icon, children }) {
  return <Box><summary>{icon} {title}</summary><div className="body">{children}</div></Box>;
}

export default function ManagementAdmin({ adminKey }) {
  const [filter, setFilter] = useState('all');
  const [items, setItems] = useState([]);
  const [openId, setOpenId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    try { setItems(await api.management.admin.list(adminKey, filter === 'all' ? '' : filter)); setError(''); }
    catch (err) { setError(err.message || 'Could not load managed properties.'); }
    finally { setLoading(false); }
  }, [adminKey, filter]);

  const loadDetail = useCallback(async (id) => {
    if (!id) return;
    try {
      const [record, thread] = await Promise.all([
        api.management.admin.get(id, adminKey),
        api.management.admin.messages(id, adminKey),
      ]);
      setDetail(record); setMessages(thread); setError('');
    } catch (err) { setError(err.message || 'Could not load this managed property.'); }
  }, [adminKey]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => { if (openId) loadDetail(openId); }, [openId, loadDetail]);

  const act = async (fn, { close = false } = {}) => {
    setBusy(true); setError('');
    try {
      await fn();
      if (close) { setOpenId(null); setDetail(null); }
      await load();
      if (openId && !close) await loadDetail(openId);
    } catch (err) { setError(err.message || 'That action could not be completed.'); }
    finally { setBusy(false); }
  };

  return (
    <Wrap>
      <Toolbar>
        {['all', ...STATUSES].map((status) => <Chip key={status} $on={filter === status} onClick={() => setFilter(status)}>{status.replaceAll('_', ' ')}</Chip>)}
        <Refresh onClick={load} disabled={loading}><FaSyncAlt /> Refresh</Refresh>
        <Refresh
          style={{ marginLeft: 0 }}
          disabled={busy}
          title="Mark unpaid rent past its due date overdue and send due-soon and overdue reminders (this also runs every six hours)"
          onClick={() => act(async () => {
            const out = await api.management.admin.runRentReminders(adminKey);
            window.alert(`${out.markedOverdue} marked overdue · ${out.remindedDue} due-soon reminders · ${out.remindedOverdue} overdue reminders`);
          })}
        >
          Run rent reminders
        </Refresh>
      </Toolbar>
      {error && <Error>{error}</Error>}
      {loading && !items.length ? <Note>Loading managed properties…</Note> : !items.length ? <Note>No managed properties at this stage.</Note> : (
        <List>{items.map((item) => (
          <Card key={item.id}>
            <Head $open={openId === item.id} onClick={() => setOpenId(openId === item.id ? null : item.id)}>
              <div>
                <div className="title">{item.address || item.title}</div>
                <div className="sub">{item.ref} · {item.contact_name} · {item.contact_email} · {[item.city, item.state, item.country].filter(Boolean).join(', ')}</div>
                <Status>{item.status.replaceAll('_', ' ')}</Status>
              </div>
              <FaChevronDown />
            </Head>
            {openId === item.id && (detail?.request?.id === item.id ? (
              <ManagementDetail
                data={detail}
                messages={messages}
                busy={busy}
                onAction={act}
                onSend={(body) => act(() => api.management.admin.sendMessage(item.id, adminKey, body))}
                adminKey={adminKey}
              />
            ) : <Note>Loading property operations…</Note>)}
          </Card>
        ))}</List>
      )}
    </Wrap>
  );
}

function ManagementDetail({ data, messages, busy, onAction, onSend, adminKey }) {
  const r = data.request;
  const currency = r.currency || 'NGN';
  const money = (value) => formatMoneyFull(value, currency);
  const [message, setMessage] = useState('');
  const [assignment, setAssignment] = useState({ manager: r.manager_name || '', feePct: r.agreed_fee_pct || '', startDate: r.start_date?.slice?.(0, 10) || '' });
  const [lifecycle, setLifecycle] = useState({ status: r.status, note: r.admin_note || '' });
  const [tenancy, setTenancy] = useState({ unitLabel: '', tenantName: '', tenantEmail: '', tenantPhone: '', rentAmount: '', rentFrequency: 'monthly', deposit: '', startDate: today(), endDate: '', notes: '' });
  const [charge, setCharge] = useState({ tenancyId: '', periodLabel: '', dueDate: today(), amount: '' });
  const [expense, setExpense] = useState({ category: 'repairs', vendor: '', description: '', amount: '', incurredOn: today(), receiptUrl: '', needsApproval: true });
  const [payout, setPayout] = useState({ periodStart: firstOfMonth(), periodEnd: today(), scheduledFor: today(), adjustment: '', note: '' });
  const [document, setDocument] = useState({ kind: 'statement', name: '', url: '', shareWithTenant: false, tenancyId: '' });
  const setForm = (setter, key, value) => setter((prev) => ({ ...prev, [key]: value }));
  const [invite, setInvite] = useState(null);

  /** A fresh single-use link for the tenant; emailed to them when we have an address. */
  const makeInvite = (t) => onAction(async () => {
    const out = await api.tenant.admin.invite(t.id, adminKey, { email: t.tenant_email || undefined });
    setInvite({ ...out, name: t.tenant_name || t.unit_label || 'the tenant', phone: t.tenant_phone });
  });

  const submitMessage = (e) => {
    e.preventDefault();
    const body = message.trim();
    if (!body) return;
    onSend(body).then?.(() => setMessage(''));
    setMessage('');
  };

  return (
    <Detail>
      <Summary>
        <Metric><div className="k">Plan</div><div className="v">{r.plan?.replaceAll('_', ' ')}</div></Metric>
        <Metric><div className="k">Currency</div><div className="v">{currency}</div></Metric>
        <Metric><div className="k">Expected rent</div><div className="v">{r.expected_rent ? money(r.expected_rent) : 'Not set'}</div></Metric>
        <Metric><div className="k">Manager</div><div className="v">{r.manager_name || 'Unassigned'}</div></Metric>
      </Summary>
      <AdminMedia media={r.media} adminKey={adminKey} label="Property photos and video" />

      <WorkGrid>
        <OperationBox title="Lifecycle and assignment" icon={<FaUserTie />}>
          <Fields>
            <Field>Manager<input value={assignment.manager} onChange={(e) => setForm(setAssignment, 'manager', e.target.value)} /></Field>
            <Field>Agreed fee %<input type="number" min="0" max="100" value={assignment.feePct} onChange={(e) => setForm(setAssignment, 'feePct', e.target.value)} /></Field>
            <Field>Start date<input type="date" value={assignment.startDate} onChange={(e) => setForm(setAssignment, 'startDate', e.target.value)} /></Field>
            <Field>Status<select value={lifecycle.status} onChange={(e) => setForm(setLifecycle, 'status', e.target.value)}>{STATUSES.map((s) => <option key={s} value={s}>{s.replaceAll('_', ' ')}</option>)}</select></Field>
            <WideField>Internal note<textarea value={lifecycle.note} onChange={(e) => setForm(setLifecycle, 'note', e.target.value)} /></WideField>
          </Fields>
          <Actions>
            <Button disabled={busy || !assignment.manager.trim()} onClick={() => onAction(() => api.management.admin.assign(r.id, adminKey, assignment))}>Save assignment</Button>
            <Button $ghost disabled={busy} onClick={() => onAction(() => api.management.admin.setStatus(r.id, adminKey, lifecycle.status, lifecycle.note))}>Update status</Button>
          </Actions>
        </OperationBox>

        <OperationBox title="Message the owner" icon={<FaPaperPlane />}>
          <Thread>{messages.length ? messages.map((m) => <Bubble key={m.id} $admin={m.sender === 'admin'}>{m.body}</Bubble>) : <Note>No messages yet.</Note>}</Thread>
          <Composer onSubmit={submitMessage}><input aria-label="Message owner" value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Write an update…" /><Button type="submit" disabled={busy || !message.trim()}><FaPaperPlane /></Button></Composer>
        </OperationBox>

        <OperationBox title="Add tenancy" icon={<FaBuilding />}>
          <Fields>
            <Field>Unit<input value={tenancy.unitLabel} onChange={(e) => setForm(setTenancy, 'unitLabel', e.target.value)} /></Field>
            <Field>Tenant name<input value={tenancy.tenantName} onChange={(e) => setForm(setTenancy, 'tenantName', e.target.value)} /></Field>
            <Field>Tenant email<input type="email" value={tenancy.tenantEmail} onChange={(e) => setForm(setTenancy, 'tenantEmail', e.target.value)} /></Field>
            <Field>Tenant phone<input value={tenancy.tenantPhone} onChange={(e) => setForm(setTenancy, 'tenantPhone', e.target.value)} /></Field>
            <Field>Rent ({currency})<input type="number" min="0" value={tenancy.rentAmount} onChange={(e) => setForm(setTenancy, 'rentAmount', e.target.value)} /></Field>
            <Field>Frequency<select value={tenancy.rentFrequency} onChange={(e) => setForm(setTenancy, 'rentFrequency', e.target.value)}>{['monthly', 'quarterly', 'biannual', 'annual'].map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field>Deposit<input type="number" min="0" value={tenancy.deposit} onChange={(e) => setForm(setTenancy, 'deposit', e.target.value)} /></Field>
            <Field>Start date<input type="date" value={tenancy.startDate} onChange={(e) => setForm(setTenancy, 'startDate', e.target.value)} /></Field>
            <Field>End date (optional)<input type="date" value={tenancy.endDate} onChange={(e) => setForm(setTenancy, 'endDate', e.target.value)} /></Field>
            <WideField>Notes<textarea value={tenancy.notes} onChange={(e) => setForm(setTenancy, 'notes', e.target.value)} /></WideField>
          </Fields>
          <Button disabled={busy || !Number(tenancy.rentAmount)} onClick={() => onAction(() => api.management.admin.createTenancy(r.id, adminKey, tenancy))}><FaPlus /> Add tenancy</Button>
          {!!data.tenancies?.length && <Ledger><table><thead><tr><th>Tenant</th><th>Unit</th><th>Rent</th><th>Status</th><th>Actions</th></tr></thead><tbody>{data.tenancies.map((t) => <tr key={t.id}><td>{t.tenant_name || 'Not named'}</td><td>{t.unit_label || '—'}</td><td>{money(t.rent_amount)} / {t.rent_frequency}</td><td>{t.status}</td><td><Actions><Button $ghost disabled={busy || !t.start_date} title="Raise every rent period from the start date, end date, rent and frequency" onClick={() => onAction(() => api.management.admin.buildSchedule(t.id, adminKey))}>Rent schedule</Button><Button $ghost disabled={busy || ['ended', 'void'].includes(t.status)} onClick={() => makeInvite(t)}>Invite tenant</Button><Button $ghost disabled={busy || t.status === 'ended'} onClick={() => { const rentAmount = window.prompt(`New rent in ${currency}`, t.rent_amount); if (rentAmount) onAction(() => api.management.admin.updateTenancy(t.id, adminKey, { rentAmount })); }}>Adjust rent</Button>{t.status !== 'ended' && <Button $ghost disabled={busy} onClick={() => onAction(() => api.management.admin.updateTenancy(t.id, adminKey, { status: t.status === 'notice' ? 'active' : 'notice' }))}>{t.status === 'notice' ? 'Keep active' : 'Give notice'}</Button>}<Button $ghost disabled={busy || t.status === 'ended'} onClick={() => onAction(() => api.management.admin.updateTenancy(t.id, adminKey, { status: 'ended', endDate: today() }))}>End</Button></Actions></td></tr>)}</tbody></table></Ledger>}
          {invite && (
            <InviteBox>
              <div><b>Tenant portal link for {invite.name}</b> — works once, until {new Date(invite.expiresAt).toLocaleDateString(LOCALE)}.{invite.sentTo ? ` Emailed to ${invite.sentTo} if email is set up.` : ''}</div>
              <code>{invite.url}</code>
              <Actions>
                <Button $ghost onClick={() => navigator.clipboard?.writeText(invite.url)}>Copy link</Button>
                <Button $ghost as="a" href={`https://wa.me/${String(invite.phone || '').replace(/\D/g, '').replace(/^0/, '234')}?text=${encodeURIComponent(`Hello ${invite.name}, here is your EasyMoveZone tenant portal: ${invite.url}`)}`} target="_blank" rel="noreferrer">WhatsApp</Button>
                <Button $ghost as="a" href={`mailto:${invite.sentTo || ''}?subject=${encodeURIComponent('Your EasyMoveZone tenant portal')}&body=${encodeURIComponent(`Open your tenant portal here (the link works once): ${invite.url}`)}`}>Email</Button>
                <Button $ghost onClick={() => setInvite(null)}>Done</Button>
              </Actions>
            </InviteBox>
          )}
        </OperationBox>

        <OperationBox title="Rent collection" icon={<FaMoneyBillWave />}>
          <Fields>
            <Field>Tenancy<select value={charge.tenancyId} onChange={(e) => setForm(setCharge, 'tenancyId', e.target.value)}><option value="">Whole property</option>{(data.tenancies || []).map((t) => <option key={t.id} value={t.id}>{t.unit_label || t.tenant_name || `Tenancy ${t.id}`}</option>)}</select></Field>
            <Field>Period<input value={charge.periodLabel} onChange={(e) => setForm(setCharge, 'periodLabel', e.target.value)} placeholder="September 2026" /></Field>
            <Field>Due date<input type="date" value={charge.dueDate} onChange={(e) => setForm(setCharge, 'dueDate', e.target.value)} /></Field>
            <Field>Amount ({currency})<input type="number" min="0" value={charge.amount} onChange={(e) => setForm(setCharge, 'amount', e.target.value)} /></Field>
          </Fields>
          <Button disabled={busy || !charge.dueDate || !Number(charge.amount)} onClick={() => onAction(() => api.management.admin.createRentCharge(r.id, adminKey, charge))}><FaPlus /> Raise rent charge</Button>
          {!!data.rentCharges?.length && <Ledger><table><thead><tr><th>Period</th><th>Due</th><th className="num">Amount</th><th>Status</th><th>Receipt</th></tr></thead><tbody>{data.rentCharges.map((c) => <tr key={c.id}><td>{c.period_label || 'Rent'}</td><td>{String(c.due_date).slice(0, 10)}</td><td className="num">{money(c.amount)}</td><td>{c.status}</td><td>{!['received', 'void'].includes(c.status) && <Button $ghost disabled={busy} onClick={() => { const amount = window.prompt(`Amount received in ${currency}`, String(Number(c.amount) - Number(c.amount_received || 0))); if (amount) onAction(() => api.management.admin.recordRent(c.id, adminKey, { amount, receivedOn: today() })); }}>Record</Button>}</td></tr>)}</tbody></table></Ledger>}
        </OperationBox>

        <OperationBox title="Log property cost" icon={<FaMoneyBillWave />}>
          <Fields>
            <Field>Category<select value={expense.category} onChange={(e) => setForm(setExpense, 'category', e.target.value)}>{EXPENSES.map((x) => <option key={x}>{x.replaceAll('_', ' ')}</option>)}</select></Field>
            <Field>Vendor<input value={expense.vendor} onChange={(e) => setForm(setExpense, 'vendor', e.target.value)} /></Field>
            <Field>Amount ({currency})<input type="number" min="0" value={expense.amount} onChange={(e) => setForm(setExpense, 'amount', e.target.value)} /></Field>
            <Field>Date<input type="date" value={expense.incurredOn} onChange={(e) => setForm(setExpense, 'incurredOn', e.target.value)} /></Field>
            <WideField>Description<textarea value={expense.description} onChange={(e) => setForm(setExpense, 'description', e.target.value)} /></WideField>
            <WideField>Receipt URL<input type="url" value={expense.receiptUrl} onChange={(e) => setForm(setExpense, 'receiptUrl', e.target.value)} /></WideField>
            <WideField><span><input type="checkbox" checked={expense.needsApproval} onChange={(e) => setForm(setExpense, 'needsApproval', e.target.checked)} style={{ width: 'auto', marginRight: 6 }} />Needs owner approval</span></WideField>
          </Fields>
          <Button disabled={busy || !Number(expense.amount)} onClick={() => onAction(() => api.management.admin.createExpense(r.id, adminKey, expense))}><FaPlus /> Log cost</Button>
          {!!data.expenses?.length && <Ledger><table><thead><tr><th>Cost</th><th>Vendor</th><th className="num">Amount</th><th>Status</th></tr></thead><tbody>{data.expenses.map((e) => <tr key={e.id}><td>{e.category}</td><td>{e.vendor || '—'}</td><td className="num">{money(e.amount)}</td><td>{e.status}</td></tr>)}</tbody></table></Ledger>}
        </OperationBox>

        <OperationBox title="Create owner payout" icon={<FaMoneyBillWave />}>
          <Fields>
            <Field>Period start<input type="date" value={payout.periodStart} onChange={(e) => setForm(setPayout, 'periodStart', e.target.value)} /></Field>
            <Field>Period end<input type="date" value={payout.periodEnd} onChange={(e) => setForm(setPayout, 'periodEnd', e.target.value)} /></Field>
            <Field>Scheduled for<input type="date" value={payout.scheduledFor} onChange={(e) => setForm(setPayout, 'scheduledFor', e.target.value)} /></Field>
            <Field>Adjustment ({currency})<input type="number" value={payout.adjustment} onChange={(e) => setForm(setPayout, 'adjustment', e.target.value)} /></Field>
            <WideField>Statement note<textarea value={payout.note} onChange={(e) => setForm(setPayout, 'note', e.target.value)} /></WideField>
          </Fields>
          <Button disabled={busy || !payout.periodStart || !payout.periodEnd} onClick={() => onAction(() => api.management.admin.createPayout(r.id, adminKey, payout))}>Create payout</Button>
          {!!data.payouts?.length && <Ledger><table><thead><tr><th>Reference</th><th>Period</th><th className="num">Net</th><th>Status</th><th>Action</th></tr></thead><tbody>{data.payouts.map((p) => <tr key={p.id}><td>{p.ref}</td><td>{String(p.period_start).slice(0, 10)} – {String(p.period_end).slice(0, 10)}</td><td className="num">{money(p.net_amount)}</td><td>{p.status}</td><td>{p.status !== 'paid' && <Button $ghost disabled={busy} onClick={() => { const bankRef = window.prompt('Bank reference (optional)', p.bank_ref || '') || ''; onAction(() => api.management.admin.setPayoutStatus(p.id, adminKey, { status: 'paid', bankRef, paidOn: today() })); }}>Mark paid</Button>}</td></tr>)}</tbody></table></Ledger>}
        </OperationBox>

        <OperationBox title="Attach document" icon={<FaFileAlt />}>
          <Fields>
            <Field>Type<select value={document.kind} onChange={(e) => setForm(setDocument, 'kind', e.target.value)}>{['statement', 'agreement', 'inspection', 'invoice', 'other'].map((x) => <option key={x}>{x}</option>)}</select></Field>
            <Field>Name<input value={document.name} onChange={(e) => setForm(setDocument, 'name', e.target.value)} /></Field>
            <WideField>Secure document URL<input type="url" value={document.url} onChange={(e) => setForm(setDocument, 'url', e.target.value)} placeholder="https://…" /></WideField>
            {/* Owner-only unless shared: tenants see agreements and certificates, never statements. */}
            <Field>Share with tenant<select value={document.shareWithTenant ? (document.tenancyId || 'all') : ''} onChange={(e) => { const v = e.target.value; setDocument((d) => ({ ...d, shareWithTenant: Boolean(v), tenancyId: v && v !== 'all' ? v : '' })); }}><option value="">No — owner only</option><option value="all">Every tenant here</option>{(data.tenancies || []).filter((t) => t.status !== 'void').map((t) => <option key={t.id} value={t.id}>{t.tenant_name || t.unit_label || `Tenancy ${t.id}`}</option>)}</select></Field>
          </Fields>
          <Button disabled={busy || !document.name.trim() || !document.url.trim()} onClick={() => onAction(() => api.management.admin.addDocument(r.id, adminKey, document))}><FaPlus /> Attach document</Button>
          {!!data.documents?.length && <Ledger><table><thead><tr><th>Name</th><th>Type</th><th>Open</th></tr></thead><tbody>{data.documents.map((d) => <tr key={d.id}><td>{d.name}{d.share_with_tenant ? ' · shared with tenant' : ''}</td><td>{d.kind}</td><td><a href={d.url} target="_blank" rel="noreferrer">Open</a></td></tr>)}</tbody></table></Ledger>}
        </OperationBox>
      </WorkGrid>

      <Actions>
        <Button $danger disabled={busy} onClick={() => { if (window.confirm(`Delete ${r.ref}? This cannot be undone.`)) onAction(() => api.management.admin.remove(r.id, adminKey), { close: true }); }}><FaTrashAlt /> Delete request</Button>
      </Actions>
    </Detail>
  );
}
