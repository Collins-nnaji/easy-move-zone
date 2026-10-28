import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { api } from '../../api';
import { useAuth } from '../../AuthContext';
import TrustIcon from '../TrustIcon';
import { formatMoneyFull } from '../../utils/format';
import { VERIFICATION_TYPES } from '../../config/verification';
import { BOOK_SESSION_URL } from '../../config/platform';
import { LOCALE } from '../../config/markets';

const Wrap = styled.div``;
const Head = styled.div`display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;flex-wrap:wrap;margin-bottom:1.25rem;`;
const Heading = styled.h2`font-size:1.35rem;margin:0 0 .35rem;`;
const Copy = styled.p`font-size:.9rem;color:var(--color-ink-muted);margin:0;line-height:1.5;`;
const New = styled(Link)`display:inline-flex;align-items:center;gap:.45rem;padding:.72rem 1rem;border-radius:10px;background:#2f5d50;color:#fff;font-size:.85rem;font-weight:700;&:hover{color:#fff;background:#2f5d50;}`;
const Notice = styled.div`padding:.8rem 1rem;border-radius:11px;background:${p=>p.$error?'#fff0f0':'#e8f6ed'};color:${p=>p.$error?'#942525':'#155b38'};font-size:.84rem;margin-bottom:1rem;`;
const List = styled.div`display:flex;flex-direction:column;gap:1rem;`;
const Card = styled.article`background:#fff;border:1px solid rgba(13,17,23,.08);border-radius:18px;padding:1.35rem;`;
const CardTop = styled.div`display:flex;justify-content:space-between;gap:1rem;align-items:flex-start;padding-bottom:1rem;border-bottom:1px solid #eeefe5;`;
const Ref = styled.div`font-family:var(--font-mono);font-size:.65rem;letter-spacing:.06em;color:#758078;text-transform:uppercase;margin-bottom:.3rem;`;
const Property = styled.h3`font-size:1.1rem;margin:0 0 .2rem;`;
const Address = styled.div`font-size:.82rem;color:#6a746e;`;
const Status = styled.span`font-family:var(--font-mono);font-size:.63rem;text-transform:uppercase;letter-spacing:.05em;padding:.35rem .55rem;border-radius:7px;background:${p=>p.$done?'#e3f6ea':'#fff5d9'};color:${p=>p.$done?'#2f5d50':'#8a5a00'};white-space:nowrap;`;
const Grid = styled.div`display:grid;grid-template-columns:1fr 1fr;gap:1.3rem;margin-top:1.1rem;@media(max-width:720px){grid-template-columns:minmax(0,1fr);}`;
const SectionLabel = styled.div`font-family:var(--font-mono);font-size:.65rem;text-transform:uppercase;letter-spacing:.07em;color:#758078;margin-bottom:.7rem;`;
const Checklist = styled.div`display:flex;flex-direction:column;gap:.55rem;`;
const CheckRow = styled.div`display:flex;align-items:center;gap:.6rem;font-size:.8rem;color:${p=>p.$done?'#1a3c29':'#69736d'};`;
const Dot = styled.div`width:22px;height:22px;border-radius:50%;display:grid;place-items:center;flex:none;background:${p=>p.$done?'#2f5d50':'#eeefe5'};color:${p=>p.$done?'#fff':'#89928d'};`;
const Track = styled.div`height:7px;border-radius:9px;background:#eeefe5;overflow:hidden;margin:.8rem 0 .5rem;span{display:block;height:100%;width:${p=>p.$pct}%;background:#2f5d50;border-radius:9px;}`;
const TrackMeta = styled.div`font-size:.76rem;color:#69736d;display:flex;justify-content:space-between;`;
const Timeline = styled.div`display:flex;flex-direction:column;`;
const Event = styled.div`position:relative;padding:0 0 1rem 1.35rem;font-size:.8rem;color:#5e6962;&::before{content:'';position:absolute;left:3px;top:5px;width:7px;height:7px;border-radius:50%;background:#2f5d50;box-shadow:0 0 0 4px #e4f4ea;}&::after{content:'';position:absolute;left:6px;top:14px;bottom:0;width:1px;background:#dce3de;}&:last-child::after{display:none;}strong{display:block;color:#17221b;margin-bottom:.15rem;}small{color:#8a938e;}`;
const AdvisorNote = styled.div`margin-top:.8rem;padding:.75rem;border-radius:10px;background:#f4f7f5;font-size:.8rem;color:#58635c;line-height:1.5;`;
const Buttons = styled.div`display:flex;gap:.55rem;flex-wrap:wrap;margin-top:1rem;padding-top:1rem;border-top:1px solid #eeefe5;`;
const Action = styled.a`display:inline-flex;align-items:center;gap:.4rem;padding:.62rem .85rem;border-radius:9px;background:${p=>p.$primary?'#2f5d50':'#eeefe5'};color:${p=>p.$primary?'#fff':'#253129'};border:0;font-weight:700;font-size:.78rem;cursor:pointer;&:hover{color:${p=>p.$primary?'#fff':'#2f5d50'};}`;
const ActionButton = styled.button`display:inline-flex;align-items:center;gap:.4rem;padding:.62rem .85rem;border-radius:9px;background:#10291e;color:#fff;border:0;font-weight:700;font-size:.78rem;cursor:pointer;&:disabled{opacity:.55;}`;
const Details = styled.details`
  margin-top:1rem;border-top:1px solid #eeefe5;padding-top:.9rem;
  summary{cursor:pointer;font-size:.82rem;font-weight:700;color:#2f5d50;list-style:none;}
  summary::-webkit-details-marker{display:none;}
  dl{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:.8rem 1.4rem;margin:.9rem 0 0;}
  dt{font-family:var(--font-mono);font-size:.62rem;text-transform:uppercase;letter-spacing:.06em;color:#758078;}
  dd{margin:.2rem 0 0;font-size:.86rem;color:#17221b;overflow-wrap:anywhere;}
  .wide{grid-column:1/-1;}
`;
const Empty = styled.div`background:#fff;border:1px solid rgba(13,17,23,.08);border-radius:18px;text-align:center;padding:3rem 1.25rem;svg{color:#2f5d50;margin-bottom:1rem;}h3{font-size:1.15rem;margin-bottom:.45rem;}p{font-size:.86rem;color:#6a746e;max-width:420px;margin:0 auto 1.2rem;}`;

const STATUS_LABELS = { submitted:'Submitted', scope_review:'Scope review', payment_due:'Ready for payment', in_progress:'Checks in progress', action_required:'Action needed', complete:'Report ready', cancelled:'Cancelled' };
const fallbackChecks = [
  {id:'request',label:'Request received',status:'complete'},
  {id:'identity',label:'Landlord or agent identity',status:'pending'},
  {id:'authority',label:'Right to let the home',status:'pending'},
    {id:'inspection',label:'Visit and condition of the home',status:'pending'},
  {id:'passport',label:'Rental check report issued',status:'pending'},
];

function formatDate(value){
  if(!value) return '';
  try{return new Intl.DateTimeFormat(LOCALE,{day:'numeric',month:'short',year:'numeric'}).format(new Date(value));}catch{return '';}
}

/**
 * Every rental check on the signed-in account, with its checks, timeline,
 * fee, payment and the details that were sent. Used on the Check a rental
 * page (above the form) and in the tenant portal (Overview → Checks). Requests are
 * tied to the account — you sign in to submit one — so there is nothing to
 * look up on the device.
 */
export default function VerificationPanel({ newTo = '/check', onNew, hideWhenEmpty = false, refreshKey = 0, id }){
  const { user } = useAuth();
  const [items,setItems]=useState([]);
  const [loaded,setLoaded]=useState(false);
  const [error,setError]=useState('');
  const [paying,setPaying]=useState(null);

  useEffect(()=>{
    let active=true;
    if(!user?.email){ setItems([]); setLoaded(true); return undefined; }
    api.passport.mine().then(rows=>{ if(active){ setItems(rows||[]); setError(''); } })
      .catch(e=>{ if(active) setError(e.message||'Could not load your requests.'); })
      .finally(()=>{ if(active) setLoaded(true); });
    return()=>{active=false;};
  },[user?.email, refreshKey]);

  const ordered=useMemo(()=>[...items].sort((a,b)=>new Date(b.created_at||0)-new Date(a.created_at||0)),[items]);
  const checkout=async item=>{
    setPaying(item.id);setError('');
    try{const {url}=await api.passport.checkout(item.id);window.location.assign(url);}
    catch(e){setError(e.message||'Secure checkout is not available.');}
    finally{setPaying(null);}
  };

  if(hideWhenEmpty && loaded && !error && ordered.length===0) return null;
  const newProps = onNew ? { to:'#check-form', onClick:(e)=>{ e.preventDefault(); onNew(); } } : { to:newTo };

  return <Wrap id={id}>
    <Head><div><Heading>Your rental checks</Heading><Copy>Follow every check, document request and update from one place.</Copy></div><New {...newProps}>Check another rental <TrustIcon name="arrow" size={15}/></New></Head>
    {new URLSearchParams(window.location.search).get('payment')==='success'&&<Notice>Payment received. Your rental check can now start.</Notice>}
    {error&&<Notice $error>{error}</Notice>}
    {ordered.length===0?<Empty><TrustIcon name="shield" size={36}/><h3>{loaded?'No rental checks yet':'Loading your rental checks…'}</h3><p>Before you pay rent or a deposit, send us the home and who is letting it, and we check them.</p><New {...newProps}>Check a rental</New></Empty>:<List>{ordered.map(item=>{
      const checklist=Array.isArray(item.checklist)&&item.checklist.length?item.checklist:fallbackChecks;
      const timeline=Array.isArray(item.timeline)&&item.timeline.length?item.timeline:[{title:'Rental check requested',detail:'Details received by EasyMoveZone.',at:item.created_at}];
      const complete=checklist.filter(c=>c.status==='complete').length;
      const pct=Math.round((complete/checklist.length)*100);
      const done=item.status==='complete';
      const location=[item.address||item.property_url,item.country].filter(Boolean).join(', ')||'Location to be confirmed';
      return <Card key={item.reference||item.id}><CardTop><div><Ref>{item.reference||'Rental check'}</Ref><Property>{item.property_label}</Property><Address>{location} · {VERIFICATION_TYPES.find(t=>t.id===item.verification_type)?.name||'Rental check'}{item.quoted_fee?` · ${formatMoneyFull(item.quoted_fee,'NGN')}`:''} · Opened {formatDate(item.created_at)}</Address></div><Status $done={done}>{STATUS_LABELS[item.status]||'Submitted'}</Status></CardTop>
        <Grid><div><SectionLabel>Checklist</SectionLabel><Checklist>{checklist.map(c=><CheckRow key={c.id||c.label} $done={c.status==='complete'}><Dot $done={c.status==='complete'}><TrustIcon name={c.status==='complete'?'check':'timeline'} size={12}/></Dot>{c.label}</CheckRow>)}</Checklist><Track $pct={pct}><span/></Track><TrackMeta><span>{complete} of {checklist.length} checks complete</span><strong>{pct}%</strong></TrackMeta></div>
        <div><SectionLabel>Property timeline</SectionLabel><Timeline>{timeline.map((event,index)=><Event key={event.id||index}><strong>{event.title}</strong>{event.detail}<small>{event.at?<><br/>{formatDate(event.at)}</>:null}</small></Event>)}</Timeline>{item.advisor_note&&<AdvisorNote><strong>Adviser note</strong><br/>{item.advisor_note}</AdvisorNote>}</div></Grid>
        <Details><summary>What you sent us</summary><dl>
          <div><dt>Asking price</dt><dd>{item.asking_price?`₦${item.asking_price}`:'—'}</dd></div>
          <div><dt>Seller or agent</dt><dd>{item.seller_name||'—'}</dd></div>
          <div><dt>Contact</dt><dd>{item.contact_name}{item.contact_phone?` · ${item.contact_phone}`:''}</dd></div>
          <div><dt>Documents</dt><dd>{Array.isArray(item.documents)&&item.documents.length?item.documents.map(d=>d.fileName).join(', '):'None yet — your adviser can collect them'}</dd></div>
          {item.property_url&&<div className="wide"><dt>Listing link</dt><dd>{item.property_url}</dd></div>}
          {item.concerns&&<div className="wide"><dt>Your concerns</dt><dd>{item.concerns}</dd></div>}
          {Array.isArray(item.extras)&&item.extras.length>0&&<div className="wide"><dt>Extra services</dt><dd>{item.extras.map(x=>x.name||x.id).join(', ')}</dd></div>}
          <div><dt>Payment</dt><dd>{item.payment_status==='paid'?'Paid':item.status==='payment_due'?'Ready to pay':'Not yet due'}</dd></div>
        </dl></Details>
        <Buttons>{item.status==='payment_due'&&item.payment_status!=='paid'&&<ActionButton type="button" disabled={paying===item.id} onClick={()=>checkout(item)}><TrustIcon name="lock" size={14}/>{paying===item.id?'Opening checkout…':'Pay securely'}</ActionButton>}{done&&item.report_url?<Action $primary href={item.report_url} target="_blank" rel="noreferrer"><TrustIcon name="file" size={14}/>Download report</Action>:<Action as="span"><TrustIcon name="file" size={14}/>Report unlocks when complete</Action>}<Action as={Link} to={BOOK_SESSION_URL}><TrustIcon name="support" size={14}/>Speak to adviser</Action></Buttons>
      </Card>;
    })}</List>}
  </Wrap>;
}
