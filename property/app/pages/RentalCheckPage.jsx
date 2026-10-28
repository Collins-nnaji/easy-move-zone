import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import TrustIcon from '../components/TrustIcon';
import VerificationPanel from '../components/profile/VerificationPanel';
import { BOOK_SESSION_URL, TENANT_CHECKS_URL } from '../config/platform';
import { CURRENCY, DEFAULT_COUNTRY } from '../config/markets';
import { MobileFold } from '../components/MobileFold';
import { useIsMobile } from '../utils/useMediaQuery';
import { formatMoneyFull } from '../utils/format';
import {
  VERIFICATION_TYPES, VERIFICATION_EXTRAS, DEFAULT_VERIFICATION_TYPE, quoteVerification,
} from '../config/verification';

/*
 * `/check` — check a rental before you pay. Rental scams (a "landlord" who
 * does not own the flat, an agent collecting for someone else's home) are
 * the risk, so a check starts with the person and their right to let, then
 * the home itself. Checks belong to an account: you can fill the form signed
 * out, but you sign in to submit, so every request (and its checks, fee and
 * report) is listed above the form and in your tenant portal. While you sign
 * in, the form is kept in sessionStorage and restored on the way back.
 */
const DRAFT_KEY = 'bv.check.draft.v1';
function saveDraft(draft) {
  try { sessionStorage.setItem(DRAFT_KEY, JSON.stringify(draft)); } catch { /* private mode */ }
}
function takeDraft() {
  try {
    const raw = sessionStorage.getItem(DRAFT_KEY);
    sessionStorage.removeItem(DRAFT_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

const Page = styled.div`background:${p=>p.$embedded?'transparent':'var(--color-bg)'}; min-height:${p=>p.$embedded?'0':'100%'};`;
const Hero = styled.section`
  padding: 1.5rem 2.5rem 1.4rem; background:var(--color-bg); color:var(--color-ink); position:relative; overflow:hidden;
  border-bottom:1px solid var(--color-line);
  @media(max-width:720px){padding:1.4rem 1.25rem 1.2rem;}
`;
const Inner = styled.div`max-width:1180px; margin:0 auto; position:relative; z-index:1;`;
const Crumb = styled.div`font-family:var(--font-mono); color:var(--color-green-deep); font-size:.75rem; letter-spacing:.08em; text-transform:uppercase; margin-bottom:1.2rem; display:flex; align-items:center; gap:.5rem;`;
const H1 = styled.h1`font-size:clamp(1.6rem,2.6vw,2.15rem); font-weight:600; letter-spacing:-.018em; color:var(--color-ink); max-width:900px; line-height:1.13; margin:0 0 .75rem;`;
const Lede = styled.p`font-size:clamp(.98rem,1.5vw,1.1rem); color:var(--color-ink-muted); line-height:1.52; max-width:720px; margin:0;`;
const Body = styled.section`max-width:1180px; margin:0 auto; padding:${p=>p.$embedded?'0':'1.5rem 2rem 4rem'}; display:grid; grid-template-columns:minmax(0,1.35fr) minmax(300px,.75fr); gap:1.5rem; align-items:start; @media(max-width:880px){grid-template-columns:minmax(0,1fr);} @media(max-width:720px){padding:${p=>p.$embedded?'0':'1.25rem 1rem 4rem'};}`;
const EmbeddedIntro = styled.div`margin:3rem 0 1.4rem;padding-top:2.6rem;border-top:1px solid var(--color-line-strong);scroll-margin-top:calc(var(--nav-h) + 1rem);h2{font-size:clamp(1.7rem,3.2vw,2.45rem);font-weight:550;letter-spacing:-.025em;margin:0 0 .7rem;}p{max-width:720px;color:var(--color-ink-muted);line-height:1.62;margin:0;} .crumb{display:flex;align-items:center;gap:.45rem;color:var(--color-green-deep);font-size:.7rem;font-weight:700;letter-spacing:.08em;text-transform:uppercase;margin-bottom:.7rem;}@media(max-width:720px){margin:1.35rem 0 1rem;padding-top:1.2rem;h2{font-size:1.35rem;margin-bottom:.4rem}p{font-size:.86rem;line-height:1.45}.crumb{font-size:.62rem;margin-bottom:.4rem}}@media(max-width:720px){p{display:none;}}`;
const Card = styled.div`background:#fff; border:1px solid rgba(13,17,23,.08); border-radius:22px; box-shadow:0 22px 55px -36px rgba(13,17,23,.3); padding:clamp(1.25rem,4vw,2.4rem);@media(max-width:560px){border-radius:16px;padding:1.1rem .95rem;}`;
const Progress = styled.div`display:flex; gap:.45rem; margin-bottom:2rem; span{height:5px; flex:1; border-radius:9px; background:${p=>p.$active?'var(--color-green)':'#e6e9e6'};}@media(max-width:560px){margin-bottom:1.25rem;}`;
const FormHead = styled.div`display:flex; align-items:flex-start; gap:1rem; margin-bottom:1.8rem;@media(max-width:560px){gap:.7rem;margin-bottom:1.2rem;}`;
const Number = styled.div`width:40px; height:40px; flex:none; border-radius:12px; background:#e5f5eb; color:#0f6b3d; display:grid; place-items:center; font-family:var(--font-mono); font-weight:700;`;
const Title = styled.h2`font-size:1.6rem; margin:0 0 .35rem;`;
const Sub = styled.p`color:var(--color-ink-muted); margin:0; line-height:1.55; font-size:.95rem;`;
const Fields = styled.div`display:flex; flex-direction:column; gap:1.15rem;`;
const Two = styled.div`display:grid; grid-template-columns:1fr 1fr; gap:1rem; @media(max-width:600px){grid-template-columns:minmax(0,1fr);}`;
const Field = styled.div``;
const Label = styled.label`display:block; font-size:.72rem; text-transform:uppercase; letter-spacing:.07em; font-family:var(--font-mono); color:#59645e; margin-bottom:.45rem;`;
const inputCss = `width:100%; border:1px solid #d9dedb; border-radius:12px; background:#fff; padding:.92rem 1rem; font-size:1rem; color:var(--color-ink); outline:none; transition:.15s; &:focus{background:#fff;border-color:#2f5d50;box-shadow:0 0 0 3px rgba(47, 93, 80,.09);}`;
const Input = styled.input`${inputCss}`;
const Textarea = styled.textarea`${inputCss} min-height:105px; resize:vertical; line-height:1.5;`;
const ChoiceRow = styled.div`display:grid; grid-template-columns:1fr 1fr; gap:.7rem;`;
const Choice = styled.button`display:flex; gap:.7rem; align-items:center; text-align:left; padding:.9rem; border-radius:12px; cursor:pointer; font-weight:700; border:1px solid ${p=>p.$active?'#2f5d50':'#d9dedb'}; background:${p=>p.$active?'#e9f7ef':'#fff'}; color:${p=>p.$active?'#2f5d50':'#4a525b'};`;
const Upload = styled.label`display:flex; align-items:center; gap:.9rem; border:1px dashed #aeb8b2; background:#f8faf8; padding:1.1rem; border-radius:14px; cursor:pointer; color:#38443d; input{display:none;} svg{color:#2f5d50; flex:none;}`;
const FileList = styled.div`display:flex; flex-wrap:wrap; gap:.45rem; margin-top:.6rem;`;
const File = styled.span`font-size:.76rem; border-radius:999px; background:#eef2ef; color:#47524c; padding:.35rem .65rem;`;
const Actions = styled.div`display:flex; justify-content:space-between; gap:.75rem; margin-top:1.75rem;`;
const Button = styled.button`display:inline-flex; align-items:center; justify-content:center; gap:.55rem; border:0; border-radius:12px; padding:.95rem 1.25rem; font-size:.96rem; font-weight:750; cursor:pointer; background:${p=>p.$primary?'#2f5d50':'var(--color-bg-sunken)'}; color:${p=>p.$primary?'#fff':'#152019'}; &:disabled{opacity:.55;cursor:not-allowed;} @media(max-width:480px){flex:1;}`;
/* ── Choosing the check ── */
const Types = styled.div`display:grid; grid-template-columns:repeat(2,minmax(0,1fr)); gap:.7rem; @media(max-width:600px){grid-template-columns:minmax(0,1fr);}`;
const TypeCard = styled.button`
  position:relative; text-align:left; cursor:pointer; padding:1rem 1rem 1.05rem; border-radius:14px;
  border:2px solid ${p=>p.$active?'var(--color-green)':'var(--color-line-strong)'}; background:${p=>p.$active?'var(--color-green-soft)':'#fff'};
  transition:border-color .15s, background .15s;
  .name{font-weight:750; font-size:1rem; color:var(--color-ink);}
  .price{font-family:var(--font-display); font-weight:700; font-size:1.15rem; color:var(--color-green-deep); margin:.2rem 0 .35rem;}
  .blurb{font-size:.84rem; line-height:1.45; color:var(--color-ink-muted);}
  .tag{display:inline-block; margin-bottom:.35rem; font-size:.62rem; font-weight:700; letter-spacing:.06em; text-transform:uppercase; padding:.2rem .5rem; border-radius:999px; background:var(--color-green-deep); color:#fff;}
  &:hover{border-color:var(--color-green);}
`;
const Extras = styled.div`display:flex; flex-direction:column; gap:.5rem;`;
const Extra = styled.label`
  display:flex; gap:.75rem; align-items:flex-start; padding:.8rem .9rem; border-radius:12px; cursor:${p=>p.$included?'default':'pointer'};
  border:1px solid ${p=>p.$on?'var(--color-green)':'var(--color-line)'}; background:${p=>p.$on?'var(--color-green-wash)':'#fff'};
  input{margin-top:.2rem; width:17px; height:17px; accent-color:#2f5d50; flex:none;}
  .txt{flex:1; min-width:0;}
  .name{font-weight:650; font-size:.92rem; color:var(--color-ink);}
  .blurb{display:block; font-size:.8rem; color:var(--color-ink-muted); line-height:1.4; margin-top:.15rem;}
  .price{font-weight:700; font-size:.9rem; white-space:nowrap; color:${p=>p.$included?'var(--color-green-deep)':'var(--color-ink)'};}
`;
const Total = styled.div`
  display:flex; justify-content:space-between; align-items:baseline; gap:1rem; flex-wrap:wrap;
  padding:1rem 1.1rem; border-radius:14px; background:var(--color-band); border:1px solid var(--color-line);
  .k{font-size:.72rem; font-weight:700; letter-spacing:.08em; text-transform:uppercase; color:var(--color-ink-muted);}
  .v{font-family:var(--font-display); font-size:1.5rem; font-weight:700; color:var(--color-green-deep);}
  small{flex-basis:100%; font-size:.8rem; color:var(--color-ink-muted);}
`;
const RailTotal = styled.div`display:flex; justify-content:space-between; gap:1rem; padding:.8rem 0 .2rem; margin-top:.3rem; border-top:1px solid var(--color-line); font-size:.9rem; b{color:var(--color-green-deep); font-family:var(--font-display); font-size:1.05rem;}`;
const naira = (n) => formatMoneyFull(n, 'NGN');

const Error = styled.div`margin-top:1rem; padding:.8rem 1rem; background:#fff0f0; color:#9f2020; border-radius:10px; font-size:.85rem;`;
const Rail = styled.aside`display:flex; flex-direction:column; gap:1rem; position:sticky; top:calc(var(--nav-h) + 1rem); @media(max-width:880px){position:static;}`;
const RailCard = styled.div`background:#fff; border:1px solid rgba(13,17,23,.08); border-radius:18px; padding:${p=>p.$fold?'.15rem 1.1rem':'1.35rem'};`;

/** A rail card: titled on desktop, a drop-down on phones (the form comes first there). */
function RailBlock({ title, children }) {
  const mobile = useIsMobile();
  if (!mobile) return <RailCard><RailTitle>{title}</RailTitle>{children}</RailCard>;
  return <RailCard $fold><MobileFold title={title}>{children}</MobileFold></RailCard>;
}
const RailTitle = styled.h3`font-size:1rem; margin:0 0 1rem;`;
const Check = styled.div`display:flex; align-items:flex-start; gap:.7rem; padding:.65rem 0; border-bottom:1px solid #edf0ed; font-size:.86rem; color:#4c5751; &:last-child{border:0;} svg{color:#2f5d50; flex:none;} small{display:block; color:var(--color-ink-muted); margin-top:.1rem;}`;
const Advisor = styled.a`display:flex; align-items:center; gap:.8rem; padding:1rem; border-radius:14px; background:var(--color-band); border:1px solid var(--color-line); color:var(--color-ink); font-weight:700; &:hover{color:var(--color-green-deep);background:var(--color-green-wash);} small{display:block;color:var(--color-ink-muted);font-weight:400;margin-top:.1rem;}`;
const Consent = styled.label`display:flex; gap:.65rem; align-items:flex-start; color:#5b655f; font-size:.82rem; line-height:1.5; cursor:pointer; input{margin-top:.2rem;accent-color:#2f5d50;}`;
const Success = styled.div`text-align:center; padding:1.5rem 0 .5rem;`;
const SuccessIcon = styled.div`width:70px;height:70px;border-radius:50%;background:#e5f5eb;color:#2f5d50;display:grid;place-items:center;margin:0 auto 1.25rem;`;
const Ref = styled.div`display:inline-flex;padding:.55rem .85rem;border-radius:8px;background:#f0f3f1;font-family:var(--font-mono);font-size:.78rem;margin:1rem 0 1.5rem;`;
const History = styled.div`max-width:1180px;margin:0 auto ${p=>p.$embedded?'1.5rem':'0'};padding:${p=>p.$embedded?'0':'1.75rem 3.5rem 0'};@media(max-width:720px){padding:${p=>p.$embedded?'0':'1.1rem 1rem 0'};}`;
const SignInNote = styled.div`display:flex;align-items:flex-start;gap:.6rem;margin-top:1rem;padding:.8rem .95rem;border-radius:11px;background:#e8f6ed;color:#155b38;font-size:.84rem;line-height:1.45;a{font-weight:700;color:#2f5d50;}`;
const Account = styled.div`padding:.8rem .95rem;border-radius:11px;background:#f4f7f5;border:1px solid #e3e8e5;font-size:.86rem;color:#26322a;strong{display:block;font-size:.72rem;font-family:var(--font-mono);text-transform:uppercase;letter-spacing:.06em;color:#758078;margin-bottom:.15rem;}`;
const SuccessActions = styled.div`display:flex;gap:.7rem;justify-content:center;flex-wrap:wrap;a{display:inline-flex;align-items:center;gap:.45rem;padding:.85rem 1rem;border-radius:11px;background:#2f5d50;color:#fff;font-weight:700;&:last-child{background:var(--color-bg-sunken);color:#172019;}}`;


export function RentalCheckForm({ embedded = false }) {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const formRef = useRef(null);
  const [restored, setRestored] = useState(false);
  const [historyKey, setHistoryKey] = useState(0);
  const [step, setStep] = useState(1);
  const [source, setSource] = useState('elsewhere');
  // Rentals are checked in the default market; the form no longer asks.
  const [form, setForm] = useState({ propertyLabel:'', country:DEFAULT_COUNTRY, currency:CURRENCY, address:'', propertyUrl:'', askingPrice:'', sellerName:'', contactName:'', contactEmail:user?.email||'', contactPhone:'', concerns:'' });
  const [files, setFiles] = useState([]);
  const [uploadEnabled, setUploadEnabled] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState(null);
  const [consent, setConsent] = useState(false);
  const [vType, setVType] = useState(DEFAULT_VERIFICATION_TYPE);
  const [extras, setExtras] = useState([]);
  const quote = useMemo(()=>quoteVerification(vType, extras),[vType,extras]);
  const toggleExtra = (id) => setExtras(list=>list.includes(id)?list.filter(x=>x!==id):[...list,id]);
  const LAST = 4;

  useEffect(()=>{ api.getMediaConfig().then(c=>setUploadEnabled(Boolean(c.enabled))).catch(()=>{}); },[]);
  useEffect(()=>{ if(user?.email) setForm(v=>({...v,contactEmail:user.email,contactName:v.contactName||user.name||''})); },[user]);

  // Back from signing in: put the form back exactly where it was.
  useEffect(()=>{
    if(authLoading || !user?.email) return;
    const d = takeDraft();
    if(!d) return;
    setForm(v=>({...v,...d.form,contactEmail:user.email}));
    setSource(d.source||'elsewhere'); setVType(d.vType||DEFAULT_VERIFICATION_TYPE); setExtras(d.extras||[]);
    setConsent(Boolean(d.consent)); setStep(d.step||4); setRestored(d.hadFiles?'files':'yes');
    setTimeout(()=>formRef.current?.scrollIntoView({behavior:'smooth',block:'start'}),200);
  },[authLoading,user]);

  const signInNote = !user && !authLoading ? <SignInNote><TrustIcon name="lock" size={16}/><span>You can fill this in now. <Link to="/auth" state={{from:{pathname:location.pathname}}}>Sign in</Link> before you submit, so your check and its report stay in your account.</span></SignInNote> : null;

  const goSignIn = () => {
    saveDraft({ form, source, vType, extras, consent, step, hadFiles: files.length>0 });
    navigate('/auth', { state: { from: { pathname: location.pathname, hash: '#check-form' } } });
  };
  const update = e => setForm(v=>({...v,[e.target.name]:e.target.value}));
  // Step 4 needs a name and consent; the email is the signed-in account's.
  const canNext = useMemo(()=>step===1 ? Boolean(form.propertyLabel.trim() && (form.address.trim()||form.propertyUrl.trim())) : (step===2||step===3) ? true : Boolean(form.contactName.trim() && consent),[step,form,consent]);

  const addFiles = e => setFiles(Array.from(e.target.files||[]).slice(0,8));
  const submit = async () => {
    if(!canNext) return;
    if(!user?.email){ goSignIn(); return; }
    setSubmitting(true); setError('');
    try {
      const documents=[];
      if(uploadEnabled){
        for(const file of files){
          const { blobUrl } = await api.uploadMedia(file,{prefix:'passport'});
          documents.push({url:blobUrl,fileName:file.name,docType:'Rental document'});
        }
      }
      const request = await api.passport.create({...form,source,documents,verificationType:vType,extras:quote.extras.map(e=>e.id)});
      setResult(request);
      setHistoryKey(k=>k+1);
    } catch(e){ setError(e.message||'We could not submit your check. Please try again.'); }
    finally{ setSubmitting(false); }
  };

  // Signed in, your own requests come first; the form for a new one follows.
  const history = user ? <History $embedded={embedded}><VerificationPanel id="your-verifications" hideWhenEmpty refreshKey={historyKey} onNew={()=>{ setResult(null); setStep(1); formRef.current?.scrollIntoView({behavior:'smooth',block:'start'}); }} /></History> : null;

  return <Page $embedded={embedded}>
    {embedded&&history}
    {embedded?<EmbeddedIntro id="check-rental"><div className="crumb"><TrustIcon name="shield" size={16}/> Check a rental</div><h2>Check a rental before you pay</h2><p>Tell us the home and who is letting it. We check the landlord or agent, their right to let it and the home itself, and you follow every check here.</p>{signInNote}</EmbeddedIntro>:<Hero><Inner><Crumb><TrustIcon name="shield" size={17}/> Check a rental</Crumb><H1>Check the landlord and the home before you pay rent.</H1><Lede>Fake landlords and homes that are not really for let are the most common rental scams. Tell us the home and who is letting it: we check the person, their right to let it and the home itself, before any money moves.</Lede>{signInNote}</Inner></Hero>}
    {!embedded&&history}
    <Body $embedded={embedded} id="check-form" ref={formRef}>
      <Card>
        {result ? <Success>
          <SuccessIcon><TrustIcon name="check" size={34}/></SuccessIcon>
          <Title>Rental check requested</Title>
          <Sub>{quote.type.name}, quoted at {naira((+result.quoted_fee)||quote.total)}. We will confirm the fee and timing before any charge. Hold off paying rent or a deposit until your report is in.</Sub>
          <Ref>{result.reference}</Ref>
          <SuccessActions>{embedded?<Link to={TENANT_CHECKS_URL}>Track this check <TrustIcon name="arrow" size={16}/></Link>:<Link to="#your-verifications" onClick={(e)=>{e.preventDefault();document.getElementById('your-verifications')?.scrollIntoView({behavior:'smooth'});}}>Track this check <TrustIcon name="arrow" size={16}/></Link>}<Link to={BOOK_SESSION_URL}>Speak to an adviser</Link></SuccessActions>
        </Success> : <>
          <Progress $active={step===1}>{[1,2,3,4].map(n=><span key={n} style={{background:n<=step?'#2f5d50':undefined}}/>)}</Progress>
          {step===1 && <>
            <FormHead><Number>01</Number><div><Title>Which home, and who is letting it?</Title><Sub>A home you found through an agent, a landlord, social media or another website. Homes listed on EasyMoveZone are already checked.</Sub></div></FormHead>
            <Fields>
              <Field><Label>Where did you find it?</Label><ChoiceRow><Choice type="button" $active={source==='elsewhere'} onClick={()=>setSource('elsewhere')}><TrustIcon name="search"/>Agent or website</Choice><Choice type="button" $active={source==='platform'} onClick={()=>setSource('platform')}><TrustIcon name="home"/>Direct from a landlord</Choice></ChoiceRow></Field>
              <Field><Label htmlFor="propertyLabel">The home, in a few words *</Label><Input id="propertyLabel" name="propertyLabel" value={form.propertyLabel} onChange={update} placeholder="e.g. 2-bedroom flat in Yaba"/></Field>
              <Field><Label htmlFor="address">Address or estate *</Label><Input id="address" name="address" value={form.address} onChange={update} placeholder="Street, estate, city and region"/></Field>
              <Field><Label htmlFor="propertyUrl">Listing or shared link</Label><Input id="propertyUrl" name="propertyUrl" value={form.propertyUrl} onChange={update} placeholder="https:// or WhatsApp / Drive link"/></Field>
              <Two><Field><Label htmlFor="askingPrice">Rent asked (₦ a year)</Label><Input id="askingPrice" name="askingPrice" value={form.askingPrice} onChange={update} inputMode="decimal" placeholder="e.g. 2,500,000"/></Field><Field><Label htmlFor="sellerName">Landlord or agent name</Label><Input id="sellerName" name="sellerName" value={form.sellerName} onChange={update} placeholder="As they gave it to you"/></Field></Two>
            </Fields>
          </>}
          {step===2 && <>
            <FormHead><Number>02</Number><div><Title>Choose your check</Title><Sub>Fixed prices in naira. Add anything else you want checked.</Sub></div></FormHead>
            <Fields>
              <Field><Label>Check</Label>
                <Types role="radiogroup" aria-label="Check">
                  {VERIFICATION_TYPES.map(t=><TypeCard key={t.id} type="button" role="radio" aria-checked={vType===t.id} $active={vType===t.id} onClick={()=>setVType(t.id)}>
                    {t.featured&&<span className="tag">Most chosen</span>}
                    <div className="name">{t.name}</div>
                    <div className="price">{naira(t.price)}</div>
                    <div className="blurb">{t.blurb}</div>
                  </TypeCard>)}
                </Types>
              </Field>
              <Field><Label>Extra services</Label>
                <Extras>
                  {VERIFICATION_EXTRAS.map(e=>{const included=e.includedIn.includes(vType); const on=included||extras.includes(e.id); return (
                    <Extra key={e.id} $on={on} $included={included}>
                      <input type="checkbox" checked={on} disabled={included} onChange={()=>toggleExtra(e.id)}/>
                      <span className="txt"><span className="name">{e.name}</span><span className="blurb">{e.blurb}</span></span>
                      <span className="price">{included?'Included':`+ ${naira(e.price)}`}</span>
                    </Extra>);})}
                </Extras>
              </Field>
              <Total><span className="k">Your check</span><span className="v">{naira(quote.total)}</span><small>{quote.type.name}{quote.extras.length?` + ${quote.extras.length} extra${quote.extras.length>1?'s':''}`:''}. We confirm the fee before you pay anything.</small></Total>
            </Fields>
          </>}
          {step===3 && <>
            <FormHead><Number>03</Number><div><Title>Add what you already have</Title><Sub>Screenshots of the advert, chats with the landlord or agent, an ID they sent, a draft agreement or receipts. You can also send them later.</Sub></div></FormHead>
            <Fields>
              <Field><Label>Screenshots and documents</Label><Upload><TrustIcon name="upload" size={25}/><div><strong>{uploadEnabled?'Choose documents':'Documents can follow after submission'}</strong><Sub>{uploadEnabled?'PDF, JPG or PNG · up to 8 files':'Your adviser will send a secure upload link.'}</Sub></div>{uploadEnabled&&<input type="file" multiple accept=".pdf,.jpg,.jpeg,.png" onChange={addFiles}/>}</Upload>{files.length>0&&<FileList>{files.map(f=><File key={f.name}>{f.name}</File>)}</FileList>}</Field>
              <Field><Label htmlFor="concerns">What worries you about it?</Label><Textarea id="concerns" name="concerns" value={form.concerns} onChange={update} placeholder="e.g. They want an inspection fee first, will not show the inside, or are rushing you to pay."/></Field>
            </Fields>
          </>}
          {step===4 && <>
            <FormHead><Number>04</Number><div><Title>Where should we send updates?</Title><Sub>We confirm the fee and timing before the check starts.</Sub></div></FormHead>
            <Fields><Field><Label htmlFor="contactName">Full name *</Label><Input id="contactName" name="contactName" value={form.contactName} onChange={update} placeholder="Your full name"/></Field><Two><Field><Label>Account</Label>{user?<Account><strong>Updates go to</strong>{user.email}</Account>:<Account><strong>Not signed in</strong>You will sign in on the next tap — we keep what you typed.</Account>}</Field><Field><Label htmlFor="contactPhone">WhatsApp / phone</Label><Input id="contactPhone" name="contactPhone" value={form.contactPhone} onChange={update} placeholder="e.g. 0803 123 4567"/></Field></Two><Consent><input type="checkbox" checked={consent} onChange={e=>setConsent(e.target.checked)}/> <span>EasyMoveZone may contact me, the landlord or the agent about this check. No payment is taken until the fee is confirmed.</span></Consent></Fields>
          </>}
          {restored&&step===4&&<SignInNote style={{marginTop:0,marginBottom:'1rem'}}><TrustIcon name="check" size={16}/><span>Signed in. Check the details and submit.{restored==='files'?' Please re-attach your documents in step 3 — files cannot be carried across sign-in.':''}</span></SignInNote>}
          {error&&<Error>{error}</Error>}
          <Actions>{step>1?<Button type="button" onClick={()=>setStep(s=>s-1)}>Back</Button>:<span/>}<Button type="button" $primary disabled={!canNext||submitting} onClick={()=>step<LAST?setStep(s=>s+1):submit()}>{submitting?'Submitting securely…':step<LAST?'Continue':!user?'Sign in to submit':`Request check · ${naira(quote.total)}`} <TrustIcon name="arrow" size={16}/></Button></Actions>
        </>}
      </Card>
      <Rail>
        <RailBlock title={`Included in ${quote.type.name}`}>{quote.type.covers.map(item=><Check key={item}><TrustIcon name="check" size={17}/><span>{item}</span></Check>)}{quote.extras.map(e=><Check key={e.id}><TrustIcon name="check" size={17}/><span>{e.name}<small>+ {naira(e.price)}</small></span></Check>)}<RailTotal><span>Total</span><b>{naira(quote.total)}</b></RailTotal></RailBlock>
        <RailBlock title="What happens next"><Check><TrustIcon name="timeline"/><span><strong>1. We confirm</strong><small>We read what you sent and confirm the fee.</small></span></Check><Check><TrustIcon name="lock"/><span><strong>2. Protected payment</strong><small>Pay securely only when you are ready.</small></span></Check><Check><TrustIcon name="file"/><span><strong>3. Your report</strong><small>Each check marked safe or not, usually in 3 to 5 working days.</small></span></Check></RailBlock>
        <Advisor as={Link} to={BOOK_SESSION_URL}><TrustIcon name="support"/><span>Not sure it is worth it?<small>Ask an adviser, free</small></span></Advisor>
      </Rail>
    </Body>
  </Page>;
}

export default function RentalCheckPage() {
  return <RentalCheckForm />;
}
