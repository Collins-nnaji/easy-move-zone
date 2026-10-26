import React, { useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import * as Dialog from '@radix-ui/react-dialog';
import { ArrowRight, Calculator, Landmark, Scale, MessageSquare, X } from 'lucide-react';
import { formatMoneyFull } from '../utils/format';
import { INCOME_BANDS } from '../config/rentals';
import { api } from '../api';
import { LIST_URL, MARKETPLACE_URL } from '../config/platform';
import { PRODUCTS, productById, quote } from '../config/mortgageProducts';

/**
 * Mortgages, built like the moving page: a short hub, and each job opens
 * in a full-page panel with its own address. The numbers are what FMBN,
 * Stanbic IBTC and Access Bank publish. EasyMoveZone does not lend.
 */

const money = (n) => formatMoneyFull(n || 0, 'NGN');

const Page = styled.div`background: var(--color-bg);`;
const Hero = styled.header`
  max-width: var(--container);
  margin: 0 auto;
  padding: 1.6rem 1.5rem 0.4rem;
  h1 { font-size: clamp(1.8rem, 3vw, 2.5rem); letter-spacing: -0.03em; margin: 0.35rem 0 0.45rem; max-width: 18ch; }
  p { max-width: 62ch; color: var(--color-ink-muted); line-height: 1.55; margin: 0; }
  .k { font-size: 0.72rem; font-weight: 750; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-green-deep); }
`;
const Grid = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 1.25rem 1.5rem 2.5rem;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.8rem;
  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); padding: 1rem 1.15rem 2rem; }
`;
const Tile = styled(Link)`
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) 20px;
  grid-template-rows: auto auto;
  column-gap: 0.85rem;
  align-items: center;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 16px;
  padding: 1.05rem 1.1rem;
  color: inherit;
  &:hover { border-color: var(--color-green); }
  .ic {
    grid-column: 1; grid-row: 1 / span 2;
    width: 40px; height: 40px; border-radius: 10px;
    display: grid; place-items: center;
    background: var(--color-green-soft); color: var(--color-green-deep);
  }
  strong { grid-column: 2; grid-row: 1; font-size: 1.02rem; }
  span { grid-column: 2; grid-row: 2; color: var(--color-ink-muted); font-size: 0.88rem; }
  svg.arrow { grid-column: 3; grid-row: 1 / span 2; color: var(--color-green-deep); }
`;

const Overlay = styled(Dialog.Overlay)`
  position: fixed; inset: 0; z-index: 1300;
  background: rgba(27, 35, 30, 0.45);
`;
const Modal = styled(Dialog.Content)`
  position: fixed; inset: 12px; z-index: 1301;
  display: flex; flex-direction: column; overflow: hidden;
  border-radius: 18px; background: var(--color-bg); outline: none;
  box-shadow: 0 30px 80px -30px rgba(27, 35, 30, 0.55);
  @media (max-width: 720px) { inset: 0; border-radius: 0; }
`;
const ModalHead = styled.header`
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  padding: 0.85rem 1.15rem; border-bottom: 1px solid var(--color-line); background: #fff;
  .id { display: flex; align-items: center; gap: 0.75rem; min-width: 0; }
  .ic { width: 38px; height: 38px; border-radius: 10px; display: grid; place-items: center; background: var(--color-green-soft); color: var(--color-green-deep); flex: none; }
  p { margin: 0; font-size: 0.68rem; font-weight: 750; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-green-deep); }
  h2 { margin: 0.1rem 0 0; font-size: clamp(1.05rem, 2vw, 1.35rem); letter-spacing: -0.03em; }
`;
const Close = styled(Dialog.Close)`
  width: 40px; height: 40px; border-radius: 999px; border: 1px solid var(--color-line);
  background: #fff; display: grid; place-items: center; cursor: pointer; flex: none;
  &:hover { background: var(--color-bg); }
`;
const ModalBody = styled.div`flex: 1; min-height: 0; overflow-y: auto;`;
const ModalInner = styled.div`
  width: min(100% - 2rem, ${(p) => (p.$wide ? '1080px' : '720px')});
  margin: 0 auto; padding: 1.5rem 0 2.5rem;
  display: grid; gap: 1.1rem;
`;
const Note = styled.p`
  margin: 0; font-size: 0.84rem; line-height: 1.5; color: var(--color-ink-muted);
  a { font-weight: 650; }
`;
const Cards = styled.div`
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.75rem;
  @media (max-width: 800px) { grid-template-columns: minmax(0, 1fr); }
`;
const Product = styled.article`
  background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 1rem 1.05rem;
  display: flex; flex-direction: column; gap: 0.45rem;
  h3 { margin: 0; font-size: 1.05rem; }
  .lender { font-size: 0.78rem; color: var(--color-ink-muted); }
  .rate { font-size: 1.35rem; font-weight: 700; letter-spacing: -0.03em; color: var(--color-green-deep); }
  p { margin: 0; font-size: 0.88rem; line-height: 1.5; color: var(--color-ink-muted); }
  a.go { margin-top: auto; font-weight: 700; }
`;
const Form = styled.form`
  background: #fff; border: 1px solid var(--color-line); border-radius: 16px; padding: 1.1rem;
  display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem 1rem;
  label { display: block; }
  label.wide { grid-column: 1 / -1; }
  span { display: block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-muted); margin-bottom: 0.3rem; }
  input, select, textarea {
    width: 100%; min-height: 44px; border: 1px solid var(--color-line-strong); border-radius: 11px;
    padding: 0.65rem 0.8rem; font: inherit; background: #fff;
  }
  textarea { min-height: 80px; }
  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;
const Result = styled.div`
  background: var(--color-green-wash); border: 1px solid var(--color-line); border-radius: 16px; padding: 1.1rem 1.2rem;
  .k { font-size: 0.72rem; font-weight: 750; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-green-deep); }
  .n { font-size: clamp(1.6rem, 3vw, 2.2rem); font-weight: 700; letter-spacing: -0.03em; margin: 0.15rem 0 0.4rem; }
  p { margin: 0 0 0.4rem; line-height: 1.5; }
`;
const Choice = styled.div`
  display: flex; flex-wrap: wrap; gap: 0.4rem;
  button {
    border: 1px solid var(--color-line-strong); background: #fff; border-radius: 999px;
    min-height: 40px; padding: 0 0.9rem; font: inherit; font-weight: 650; cursor: pointer;
  }
  button[aria-pressed='true'] { background: var(--color-green-deep); color: #fff; border-color: var(--color-green-deep); }
`;
const Submit = styled.button`
  grid-column: 1 / -1; min-height: 46px; border: 0; border-radius: 999px;
  background: var(--color-green-deep); color: #fff; font: inherit; font-weight: 700; cursor: pointer;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;
const Warn = styled.p`margin: 0; color: #9a3412; font-size: 0.9rem; line-height: 1.45;`;

function digits(value) {
  return Number(String(value).replace(/[^\d.]/g, '')) || 0;
}

function Sources() {
  return (
    <Note>
      These figures are copied from the lenders’ own pages and can change.
      EasyMoveZone does not lend, and this is not an offer of credit.
      {' '}
      {PRODUCTS.map((p, i) => (
        <React.Fragment key={p.id}>
          {i ? ' · ' : ''}
          <a href={p.source} target="_blank" rel="noreferrer">{p.sourceLabel}</a>
        </React.Fragment>
      ))}
    </Note>
  );
}

function ComparePanel() {
  return (
    <>
      <Sources />
      <Cards>
        {PRODUCTS.map((p) => (
          <Product key={p.id}>
            <div className="lender">{p.lender}</div>
            <h3>{p.name}</h3>
            <div className="rate">{p.rateLabel}</div>
            <p>Up to {money(p.max)}{p.min ? `, from ${money(p.min)}` : ''}. Up to {p.years} years.</p>
            <p>{p.equityNote}</p>
            <p>{p.who}</p>
            <p>{p.fees}</p>
            <p>{p.where}</p>
            <Link className="go" to={`/mortgage/payment?product=${p.id}`}>Estimate a payment <ArrowRight size={14} /></Link>
          </Product>
        ))}
      </Cards>
    </>
  );
}

function CheckPanel() {
  const [answers, setAnswers] = useState({
    contributes: 'yes', work: 'employed', history: 'yes', liveIn: 'yes', price: '25000000',
  });
  const price = digits(answers.price);
  const contributes = answers.contributes === 'yes';
  const longEnough = answers.history === 'yes';
  const ownHome = answers.liveIn === 'yes';
  const nhf = productById('nhf');
  const q = quote(nhf, price, nhf.years);
  let verdict = 'You can ask a primary mortgage bank to look at an NHF loan.';
  if (!contributes) verdict = 'NHF is only for people already paying into the fund. A bank mortgage or MREIF does not need those contributions.';
  else if (!longEnough) verdict = answers.work === 'employed'
    ? 'Keep contributing. Employed applicants are usually asked for six continuous months before FMBN will look at the file.'
    : 'Self-employed applicants are asked for a longer contribution history, often up to three years. A bank or MREIF loan does not wait on that.';
  else if (!ownHome) verdict = 'NHF is for a home you will live in, not a property you are buying only to let.';
  else if (q.capped) verdict = 'NHF stops at ₦50 million. Anything above that has to come from you, or from a second loan such as MREIF or a bank mortgage.';

  return (
    <>
      <Sources />
      <Form as="div">
        <label className="wide"><span>Do you already pay 2.5% of your basic salary into the NHF?</span>
          <Choice>
            <button type="button" aria-pressed={answers.contributes === 'yes'} onClick={() => setAnswers({ ...answers, contributes: 'yes' })}>Yes</button>
            <button type="button" aria-pressed={answers.contributes === 'no'} onClick={() => setAnswers({ ...answers, contributes: 'no' })}>No</button>
          </Choice>
        </label>
        <label><span>Work</span>
          <Choice>
            <button type="button" aria-pressed={answers.work === 'employed'} onClick={() => setAnswers({ ...answers, work: 'employed' })}>Employed</button>
            <button type="button" aria-pressed={answers.work === 'self'} onClick={() => setAnswers({ ...answers, work: 'self' })}>Self-employed</button>
          </Choice>
        </label>
        <label><span>{answers.work === 'employed' ? 'Six months of contributions?' : 'About three years of contributions?'}</span>
          <Choice>
            <button type="button" aria-pressed={answers.history === 'yes'} onClick={() => setAnswers({ ...answers, history: 'yes' })}>Yes</button>
            <button type="button" aria-pressed={answers.history === 'no'} onClick={() => setAnswers({ ...answers, history: 'no' })}>Not yet</button>
          </Choice>
        </label>
        <label className="wide"><span>Is this a home you will live in?</span>
          <Choice>
            <button type="button" aria-pressed={answers.liveIn === 'yes'} onClick={() => setAnswers({ ...answers, liveIn: 'yes' })}>Yes</button>
            <button type="button" aria-pressed={answers.liveIn === 'no'} onClick={() => setAnswers({ ...answers, liveIn: 'no' })}>No, I want to let it</button>
          </Choice>
        </label>
        <label className="wide"><span>Price you have in mind (₦)</span>
          <input value={answers.price} onChange={(e) => setAnswers({ ...answers, price: e.target.value })} />
        </label>
      </Form>
      <Result>
        <div className="k">What this suggests</div>
        <p>{verdict}</p>
        {contributes && longEnough && ownHome && (
          <p>At 6% over 30 years that price is about {money(q.monthly)} a month, after {money(q.down)} from you. A primary mortgage bank still has to agree.</p>
        )}
        <p><Link to="/mortgage/compare">See the other two loans</Link> or <Link to="/mortgage/ask?product=nhf">ask us to introduce a bank</Link>.</p>
      </Result>
    </>
  );
}

function PaymentPanel() {
  const [params, setParams] = useSearchParams();
  const product = productById(params.get('product'));
  const [price, setPrice] = useState(params.get('price') || '50000000');
  const [years, setYears] = useState(String(product.years));
  const [income, setIncome] = useState('');
  const [high, setHigh] = useState(false);

  const result = useMemo(
    () => quote(product, digits(price), digits(years) || product.years, { highRate: high }),
    [product, price, years, high],
  );
  const pay = digits(income);
  const limit = pay ? pay / 3 : 0;
  const tight = pay > 0 && result.monthly > limit;

  const pick = (id) => {
    const next = productById(id);
    setYears(String(next.years));
    setHigh(false);
    setParams({ product: id }, { replace: true });
  };

  return (
    <>
      <Sources />
      <Choice aria-label="Which published loan">
        {PRODUCTS.map((p) => (
          <button key={p.id} type="button" aria-pressed={p.id === product.id} onClick={() => pick(p.id)}>{p.name}</button>
        ))}
      </Choice>
      <Form as="div">
        <label><span>Property price (₦)</span><input value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label><span>Years</span><input value={years} onChange={(e) => setYears(e.target.value)} /></label>
        <label className="wide"><span>Your monthly income, if you want a sense-check (₦)</span>
          <input value={income} onChange={(e) => setIncome(e.target.value)} placeholder="Optional" />
        </label>
        {product.rateHigh && (
          <label className="wide"><span>Access Bank publishes a band</span>
            <Choice>
              <button type="button" aria-pressed={!high} onClick={() => setHigh(false)}>18%, the bottom</button>
              <button type="button" aria-pressed={high} onClick={() => setHigh(true)}>23%, the top</button>
            </Choice>
          </label>
        )}
      </Form>
      <Result>
        <div className="k">{product.name} · {result.rate}%</div>
        <div className="n">{money(result.monthly)} a month</div>
        <p>Loan {money(result.loan)} after {money(result.down)} from you ({result.equityPct}%). Over {result.years} years you would repay about {money(result.total)}.</p>
        <p>{product.rateNote}</p>
        {result.capped && <Warn>The loan is held at this product’s published ceiling of {money(product.max)}. The rest of the price is yours to fund.</Warn>}
        {result.belowMin && <Warn>This loan is under the {money(product.min)} minimum {product.lender} publishes.</Warn>}
        {result.priceLow && <Warn>Stanbic IBTC publishes a minimum property value of {money(product.minPrice)} for MREIF.</Warn>}
        {result.years > product.years && <Warn>{product.lender} publishes this loan up to {product.years} years.</Warn>}
        {product.selfEmployedYears && <p>If you are self-employed, Stanbic IBTC caps MREIF at {product.selfEmployedYears} years.</p>}
        {pay > 0 && (
          tight
            ? <Warn>This repayment is over a third of the income you entered. Lenders often stop there. It is a guide, not their rule.</Warn>
            : <p>This sits under a third of the income you entered. A lender can still say no.</p>
        )}
      </Result>
    </>
  );
}

function AskPanel() {
  const [params] = useSearchParams();
  const preset = PRODUCTS.some((p) => p.id === params.get('product')) ? params.get('product') : 'unsure';
  const [lead, setLead] = useState({
    name: '', email: '', phone: '', city: '', employment: 'Employed', incomeBand: '', notes: '', product: preset === 'access' ? 'bank' : preset === 'mreif' ? 'bank' : preset,
  });
  const [consent, setConsent] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(null);
  const [error, setError] = useState('');
  const set = (k) => (e) => setLead((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    try {
      const res = await api.mortgages.enquire({ ...lead, consent: true });
      setSent(res.ref);
    } catch (err) {
      setError(err?.message || 'Could not send that.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return <Result><div className="k">Sent</div><p>Reference <strong>{sent}</strong> is with the mortgage desk. We introduce you. The lender decides. Your details are not published.</p></Result>;
  }

  return (
    <Form onSubmit={submit}>
      <label><span>Your name</span><input required value={lead.name} onChange={set('name')} /></label>
      <label><span>Email</span><input required type="email" value={lead.email} onChange={set('email')} /></label>
      <label><span>Phone</span><input value={lead.phone} onChange={set('phone')} placeholder="Include country code" /></label>
      <label><span>City</span><input value={lead.city} onChange={set('city')} placeholder="Lagos, Abuja…" /></label>
      <label><span>Which route</span>
        <select value={lead.product} onChange={set('product')}>
          <option value="nhf">National Housing Fund</option>
          <option value="bank">A bank or MREIF loan</option>
          <option value="unsure">I am not sure</option>
        </select>
      </label>
      <label><span>Work</span>
        <select value={lead.employment} onChange={set('employment')}>
          <option>Employed</option>
          <option>Self-employed</option>
          <option>NHF contributor</option>
        </select>
      </label>
      <label className="wide"><span>Income</span>
        <select value={lead.incomeBand} onChange={set('incomeBand')}>
          <option value="">Rather not say</option>
          {INCOME_BANDS.map((b) => <option key={b}>{b}</option>)}
        </select>
      </label>
      <label className="wide"><span>The home, if you have one in mind</span>
        <textarea value={lead.notes} onChange={set('notes')} placeholder="A listing, a price, or whether you already contribute to NHF." />
      </label>
      <label className="wide" style={{ display: 'flex', gap: '0.55rem', alignItems: 'flex-start' }}>
        <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ width: 18, height: 18, marginTop: 2 }} />
        <span style={{ textTransform: 'none', letterSpacing: 0, fontWeight: 500, fontSize: '0.88rem' }}>EasyMoveZone may contact me about an introduction. This is not a loan offer, and my details are not published.</span>
      </label>
      <Submit type="submit" disabled={sending || !consent}>{sending ? 'Sending…' : 'Ask for an introduction'}</Submit>
      {error && <Warn style={{ gridColumn: '1 / -1' }}>{error}</Warn>}
    </Form>
  );
}

const PANELS = [
  { id: 'compare', icon: Scale, title: 'Compare the loans', sub: 'NHF, MREIF and Access Bank', heading: 'Three published ways to borrow', wide: true, Body: ComparePanel },
  { id: 'check', icon: Landmark, title: 'Can I use the NHF?', sub: 'Contributions, job and price', heading: 'A first check for the National Housing Fund', Body: CheckPanel },
  { id: 'payment', icon: Calculator, title: 'What would I pay?', sub: 'Monthly figure and an income check', heading: 'A payment from the published rate', wide: true, Body: PaymentPanel },
  { id: 'ask', icon: MessageSquare, title: 'Ask for an introduction', sub: 'We pass it to the mortgage desk', heading: 'Ask the desk to introduce a lender', Body: AskPanel },
];

function PanelModal({ panel, onClose }) {
  const { Body, icon: Icon } = panel;
  return (
    <Dialog.Root open onOpenChange={(open) => { if (!open) onClose(); }}>
      <Dialog.Portal>
        <Overlay />
        <Modal aria-describedby={undefined}>
          <ModalHead>
            <div className="id">
              <span className="ic"><Icon size={18} /></span>
              <div>
                <p>Mortgages · {panel.title}</p>
                <Dialog.Title asChild><h2>{panel.heading}</h2></Dialog.Title>
              </div>
            </div>
            <Close aria-label="Close"><X size={20} /></Close>
          </ModalHead>
          <ModalBody>
            <ModalInner $wide={panel.wide}>
              <Body />
            </ModalInner>
          </ModalBody>
        </Modal>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

export default function MortgagePage() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const id = pathname.replace(/^\/mortgage\/?/, '').split('/')[0];
  const panel = PANELS.find((p) => p.id === id) || null;

  return (
    <Page>
      <Hero>
        <p className="k">Mortgages</p>
        <h1>Work out the loan before you apply.</h1>
        <p>
          Compare what FMBN, Stanbic IBTC and Access Bank publish, see if the NHF fits, and get a monthly figure.
          When you want a person to take it further, ask for an introduction. We do not lend.
        </p>
        <p style={{ marginTop: '0.7rem' }}>
          <Link to={MARKETPLACE_URL}>Browse homes</Link>
          {' · '}
          <Link to={LIST_URL}>List one</Link>
        </p>
      </Hero>
      <Grid>
        {PANELS.map(({ id: panelId, icon: Icon, title, sub }) => (
          <Tile key={panelId} to={`/mortgage/${panelId}`}>
            <span className="ic"><Icon size={20} /></span>
            <strong>{title}</strong>
            <ArrowRight className="arrow" size={16} />
            <span>{sub}</span>
          </Tile>
        ))}
      </Grid>
      {panel && <PanelModal panel={panel} onClose={() => navigate('/mortgage')} />}
    </Page>
  );
}
