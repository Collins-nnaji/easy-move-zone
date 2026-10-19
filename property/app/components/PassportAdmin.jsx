import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { FaCheck, FaFileAlt, FaSyncAlt } from 'react-icons/fa';
import { api } from '../api';
import { formatMoneyFull } from '../utils/format';
import { VERIFICATION_TYPES } from '../config/verification';
import { LOCALE } from '../config/markets';

const naira = (n) => formatMoneyFull(n, 'NGN');
const typeName = (id) => VERIFICATION_TYPES.find((t) => t.id === id)?.name || 'Not chosen (older request)';

const Top = styled.div`display:flex;justify-content:space-between;align-items:center;gap:1rem;margin-bottom:1rem;`;
const Intro = styled.p`font-size:.9rem;color:var(--color-ink-muted);margin:0;`;
const Refresh = styled.button`display:inline-flex;align-items:center;gap:.4rem;padding:.55rem .8rem;border:1px solid var(--color-line-strong);border-radius:9px;background:#fff;cursor:pointer;font-weight:600;color:var(--color-ink-muted);`;
const List = styled.div`display:flex;flex-direction:column;gap:1rem;`;
const Card = styled.article`background:#fff;border:1px solid var(--color-line);border-radius:16px;padding:1.2rem;box-shadow:var(--shadow-soft);`;
const CardHead = styled.div`display:flex;justify-content:space-between;gap:1rem;margin-bottom:1rem;`;
const Title = styled.h3`font-size:1.1rem;margin:0 0 .25rem;`;
const Sub = styled.div`font-size:.78rem;color:var(--color-ink-muted);line-height:1.5;`;
const Status = styled.span`height:fit-content;padding:.3rem .55rem;border-radius:99px;background:${p=>p.$done?'var(--color-green-soft)':'#fff6dc'};color:${p=>p.$done?'var(--color-green-deep)':'#815800'};font-size:.64rem;font-weight:700;text-transform:uppercase;white-space:nowrap;`;
const Meta = styled.div`display:grid;grid-template-columns:repeat(4,1fr);gap:.55rem;margin-bottom:1rem;@media(max-width:700px){grid-template-columns:1fr 1fr;}div{background:var(--color-bg-panel);border-radius:9px;padding:.65rem}.k{font-size:.6rem;text-transform:uppercase;color:var(--color-ink-faint)}.v{font-size:.8rem;font-weight:600;margin-top:.15rem;}`;
const Label = styled.label`display:block;font-size:.65rem;text-transform:uppercase;letter-spacing:.06em;color:var(--color-ink-faint);margin:.7rem 0 .35rem;`;
const Checks = styled.div`display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:.45rem;margin-bottom:.9rem;label{display:flex;gap:.45rem;align-items:center;font-size:.78rem;cursor:pointer}input{accent-color:var(--color-green);}`;
const Fields = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:.7rem;@media(max-width:650px){grid-template-columns:minmax(0,1fr);}`;
const Input = styled.input`width:100%;padding:.65rem .75rem;border:1px solid var(--color-line-strong);border-radius:9px;background:var(--color-bg-panel);`;
const Select = styled.select`width:100%;padding:.65rem .75rem;border:1px solid var(--color-line-strong);border-radius:9px;background:#fff;`;
const Textarea = styled.textarea`width:100%;min-height:72px;padding:.65rem .75rem;border:1px solid var(--color-line-strong);border-radius:9px;background:var(--color-bg-panel);resize:vertical;`;
const Docs = styled.div`display:flex;gap:.4rem;flex-wrap:wrap;`;
const Doc = styled.button`display:inline-flex;align-items:center;gap:.35rem;padding:.42rem .65rem;border:1px solid var(--color-line);border-radius:8px;background:var(--color-green-soft);color:var(--color-green-deep);cursor:pointer;font-size:.74rem;font-weight:600;`;
const Save = styled.button`display:inline-flex;align-items:center;gap:.4rem;margin-top:.9rem;padding:.65rem .9rem;border:0;border-radius:9px;background:var(--color-green-deep);color:#fff;font-weight:600;cursor:pointer;&:disabled{opacity:.5;}`;
const Empty = styled.div`padding:2.5rem;text-align:center;color:var(--color-ink-muted);background:#fff;border:1px solid var(--color-line);border-radius:14px;`;
const Error = styled.div`padding:.7rem .85rem;background:#fff0f0;color:#982525;border-radius:9px;margin-bottom:.75rem;font-size:.82rem;`;

function CaseCard({ item, adminKey, onSaved }) {
  const [status,setStatus]=useState(item.status||'submitted');
  const [paymentStatus,setPaymentStatus]=useState(item.payment_status||'pending');
  const [note,setNote]=useState(item.advisor_note||'');
  const [reportUrl,setReportUrl]=useState(item.report_url||'');
  const [fee,setFee]=useState(item.quoted_fee?String(Math.round(Number(item.quoted_fee))):'');
  const [checks,setChecks]=useState(Array.isArray(item.checklist)?item.checklist:[]);
  const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');
  const toggle=id=>setChecks(list=>list.map(c=>c.id===id?{...c,status:c.status==='complete'?'pending':'complete'}:c));
  const openDoc=async blob=>{const popup=window.open('about:blank','_blank');if(popup)popup.opener=null;try{const {url}=await api.admin.getPrivateDocumentUrl(blob,adminKey);if(popup)popup.location=url;else window.location.assign(url);}catch(e){popup?.close();setError(e.message);}};
  const save=async()=>{setBusy(true);setError('');try{await api.admin.updatePassportRequest(item.id,adminKey,{status,paymentStatus,checklist:checks,advisorNote:note,reportUrl,quotedFee:fee?Number(fee):undefined});await onSaved();}catch(e){setError(e.message||'Could not save this case.');}finally{setBusy(false);}};
  return <Card><CardHead><div><Title>{item.property_label}</Title><Sub>{item.reference} · {[item.address||item.property_url,item.country].filter(Boolean).join(', ')||'Location to confirm'}<br/>{item.contact_name} · {item.contact_email}{item.contact_phone?` · ${item.contact_phone}`:''}</Sub></div><Status $done={status==='complete'}>{status.replace(/_/g,' ')}</Status></CardHead>
    {error&&<Error>{error}</Error>}<Meta><div><span className="k">Asking price</span><div className="v">{item.asking_price?`₦${item.asking_price}`:'Not supplied'}</div></div><div><span className="k">Verification</span><div className="v">{typeName(item.verification_type)}{Array.isArray(item.extras)&&item.extras.length>0?` + ${item.extras.map(e=>e.name).join(', ')}`:''}</div></div><div><span className="k">Quoted fee</span><div className="v">{item.quoted_fee?naira(item.quoted_fee):'To confirm'}</div></div><div><span className="k">Seller / agent</span><div className="v">{item.seller_name||'Not supplied'}</div></div><div><span className="k">Payment</span><div className="v">{paymentStatus}</div></div><div><span className="k">Opened</span><div className="v">{new Date(item.created_at).toLocaleDateString(LOCALE)}</div></div></Meta>
    {item.concerns&&<><Label>Customer concerns</Label><Sub>{item.concerns}</Sub></>}{Array.isArray(item.documents)&&item.documents.length>0&&<><Label>Private documents</Label><Docs>{item.documents.map((d,i)=><Doc key={d.url||i} type="button" onClick={()=>openDoc(d.url)}><FaFileAlt/>{d.fileName||`Document ${i+1}`}</Doc>)}</Docs></>}
    <Label>Verification checklist</Label><Checks>{checks.map(c=><label key={c.id}><input type="checkbox" checked={c.status==='complete'} onChange={()=>toggle(c.id)}/>{c.label}</label>)}</Checks>
    <Fields><div><Label>Status</Label><Select value={status} onChange={e=>setStatus(e.target.value)}>{['submitted','scope_review','payment_due','in_progress','action_required','complete','cancelled'].map(v=><option key={v} value={v}>{v.replace(/_/g,' ')}</option>)}</Select></div><div><Label>Payment</Label><Select value={paymentStatus} onChange={e=>setPaymentStatus(e.target.value)}>{['pending','paid','waived','refunded'].map(v=><option key={v}>{v}</option>)}</Select></div></Fields>
    <Label>Confirmed fee (₦) — what the customer pays at checkout</Label><Input type="number" min="0" step="1000" value={fee} onChange={e=>setFee(e.target.value)} placeholder="e.g. 650000"/><Label>Adviser note shown to customer</Label><Textarea value={note} onChange={e=>setNote(e.target.value)}/><Label>Finished Passport URL</Label><Input value={reportUrl} onChange={e=>setReportUrl(e.target.value)} placeholder="https://…/property-passport.pdf"/><Save type="button" disabled={busy} onClick={save}><FaCheck/>{busy?'Saving…':'Save case update'}</Save>
  </Card>;
}

export default function PassportAdmin({ adminKey }) {
  const [items,setItems]=useState([]);const [loading,setLoading]=useState(true);const [error,setError]=useState('');
  const load=useCallback(async()=>{setLoading(true);try{setItems(await api.admin.listPassportRequests(adminKey));setError('');}catch(e){setError(e.message||'Could not load Passport cases.');}finally{setLoading(false);}},[adminKey]);
  useEffect(()=>{load();},[load]);
  return <><Top><Intro>Review new requests, complete checks, request payment and publish the final report.</Intro><Refresh type="button" onClick={load}><FaSyncAlt/>Refresh</Refresh></Top>{error&&<Error>{error}</Error>}{loading&&!items.length?<Empty>Loading Property Passport cases…</Empty>:!items.length?<Empty>No verification requests yet.</Empty>:<List>{items.map(item=><CaseCard key={item.id} item={item} adminKey={adminKey} onSaved={load}/>)}</List>}</>;
}
