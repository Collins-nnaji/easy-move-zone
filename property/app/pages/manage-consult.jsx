import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { FaCheck, FaArrowRight, FaTimes } from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import {
  CONSULT_TIERS, CONSULT_TIER_BY_ID, PORTFOLIO_BANDS, CONSULT_WINDOWS, FEE_DISCLOSURE,
} from '../config/management';
import { RentFlow, ProcessTrack } from '../components/graphics';

/**
 * Talk to a property manager — a console sub-page: the three ways to start,
 * and the request form. The page shell it used to carry is gone; the console
 * header supplies the title.
 * A submitted request lands in `consultations` and shows up in the admin
 * pipeline and under Consultations on the owner's own profile.
 */





const Sub = styled.p`
  margin: 0 0 1.75rem;
  font-size: 1rem;
  color: var(--color-ink-muted);
  max-width: 62ch;
  line-height: 1.6;
`;

const Tiers = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-bottom: 2.5rem;
  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }
`;

const Tier = styled.button`
  text-align: left;
  display: flex;
  flex-direction: column;
  padding: 1.75rem 1.6rem 1.85rem;
  border-radius: 20px;
  background: ${(p) => (p.$active
    ? 'linear-gradient(140deg, var(--color-green-deep) 0%, var(--color-green-forest) 100%)'
    : '#fff')};
  color: ${(p) => (p.$active ? '#fff' : 'var(--color-ink)')};
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green-forest)' : 'var(--color-line)')};
  box-shadow: var(--shadow-soft);
  cursor: pointer;
  transition: transform 0.18s, box-shadow 0.18s, border-color 0.18s;
  &:hover { transform: translateY(-3px); box-shadow: var(--shadow-card); border-color: ${(p) => (p.$active ? 'var(--color-green-forest)' : 'rgba(47, 93, 80, 0.35)')}; }
`;

const TierFlag = styled.div`
  font-size: 0.65rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: ${(p) => (p.$active ? 'var(--color-green-mint)' : 'var(--color-green-deep)')};
  margin-bottom: 0.6rem;
  min-height: 0.9rem;
`;

const TierName = styled.h2`
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.015em;
  margin: 0 0 0.4rem;
  color: inherit;
`;

const TierPrice = styled.div`
  font-family: var(--font-display);
  font-weight: 700;
  font-size: 1.05rem;
  color: ${(p) => (p.$active ? 'var(--color-green-mint)' : 'var(--color-green-deep)')};
  margin-bottom: 0.9rem;
`;

const TierSummary = styled.p`
  margin: 0 0 1.1rem;
  font-size: 1rem;
  line-height: 1.5;
  color: ${(p) => (p.$active ? 'rgba(255,255,255,0.72)' : 'var(--color-ink-muted)')};

  /* Phones: only the chosen plan opens up; the others are a name, a price and "Choose this". */
  @media (max-width: 720px) { ${(p) => (p.$active ? '' : 'display: none;')} }
`;

const Includes = styled.ul`
  list-style: none;
  margin: 0 0 1.25rem;
  padding: 0;
  display: grid;
  gap: 0.5rem;
  flex: 1;

  li {
    display: flex;
    align-items: flex-start;
    gap: 0.55rem;
    font-size: 0.95rem;
    line-height: 1.45;
    color: ${(p) => (p.$active ? 'rgba(255,255,255,0.85)' : 'var(--color-ink-muted)')};
  }
  svg {
    margin-top: 0.25rem;
    flex-shrink: 0;
    font-size: 0.7rem;
    color: ${(p) => (p.$active ? 'var(--color-green-mint)' : 'var(--color-green)')};
  }

  /* Phones: only the chosen plan opens up; the others are a name, a price and "Choose this". */
  @media (max-width: 720px) { ${(p) => (p.$active ? '' : 'display: none;')} }
`;

const TierPick = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-family: var(--font-mono);
  font-size: 0.85rem;
  font-weight: 700;
  color: ${(p) => (p.$active ? 'var(--color-green-mint)' : 'var(--color-green-deep)')};
`;

const Split = styled.div`
  display: grid;
  grid-template-columns: 1.25fr 1fr;
  gap: 1.25rem;
  align-items: start;
  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }
`;

const Panel = styled.section`
  background: var(--color-bg-panel);
  border: 1px solid rgba(13, 17, 23, 0.09);
  border-radius: 20px;
  padding: 1.85rem 1.75rem 2rem;
  box-shadow: 0 14px 34px rgba(13, 17, 23, 0.07);
  @media (max-width: 560px) { padding: 1.35rem 1.15rem 1.5rem; }
`;

const PanelTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0 0 0.5rem;
`;

const PanelSub = styled.p`
  margin: 0 0 1.5rem;
  font-size: 1rem;
  color: var(--color-ink-muted);
  line-height: 1.55;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
  @media (max-width: 560px) { grid-template-columns: minmax(0, 1fr); }
`;

const Field = styled.label`
  display: block;
  grid-column: ${(p) => (p.$wide ? '1 / -1' : 'auto')};

  span {
    display: block;
    font-family: var(--font-mono);
    font-size: 0.68rem;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: var(--color-ink-faint);
    margin-bottom: 0.35rem;
  }
  input, select, textarea {
    width: 100%;
    padding: 0.8rem 0.9rem;
    border: 1px solid rgba(13, 17, 23, 0.14);
    border-radius: 12px;
    background: #fff;
    font-size: 1rem;
    color: var(--color-ink);
    outline: none;
  }
  textarea { min-height: 110px; resize: vertical; line-height: 1.5; }
  input:focus, select:focus, textarea:focus { border-color: var(--color-green); }
`;

const Submit = styled.button`
  margin-top: 1.25rem;
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 1rem 1.9rem;
  border: none;
  border-radius: 999px;
  background: var(--color-green-deep);
  color: #fff;
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  &:disabled { opacity: 0.55; cursor: not-allowed; }
  &:hover:not(:disabled) { background: var(--color-green-forest); }
`;

const Err = styled.div`
  margin-top: 0.85rem;
  color: #b91c1c;
  font-size: 0.95rem;
`;

const Done = styled.div`
  padding: 1.5rem 1.4rem;
  border-radius: 16px;
  background: var(--color-green-soft);
  border: 1px solid rgba(47, 93, 80, 0.28);

  h3 { font-size: 1.3rem; margin: 0 0 0.5rem; }
  p { margin: 0 0 0.5rem; font-size: 1rem; line-height: 1.55; color: var(--color-ink-muted); }
  code {
    font-family: var(--font-mono);
    font-size: 0.9rem;
    color: var(--color-green-deep);
    font-weight: 700;
  }
`;

const Aside = styled.div`
  display: grid;
  gap: 1rem;
`;

/* `$wide`: detail that helps on desktop but turns the phone form into a long scroll. */
const Note = styled.div`
  ${(p) => p.$wide && '@media (max-width: 720px) { display: none; }'}
  background: var(--color-bg-panel);
  border: 1px solid rgba(13, 17, 23, 0.09);
  border-radius: 18px;
  padding: 1.4rem 1.45rem;

  h3 {
    font-family: var(--font-display);
    font-size: 1.15rem;
    margin: 0 0 1rem;
  }
  a { font-weight: 700; }
`;

/* One-line caption under a graphic — the graphic carries the explanation. */
const Caption = styled.div`
  margin-top: 0.9rem;
  font-family: var(--font-mono);
  font-size: 0.74rem;
  letter-spacing: 0.03em;
  color: var(--color-ink-faint);
  text-align: center;
`;

const Disclosure = styled.p`
  margin: 0;
  font-size: 0.92rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
`;

const ProjectTabs = styled.div`
  display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:.6rem;margin:1rem 0 1.35rem;
  button{border:1px solid var(--color-line-strong);border-radius:11px;background:#fff;color:var(--color-ink-muted);padding:.78rem .65rem;font:inherit;font-size:.82rem;font-weight:650;cursor:pointer;}
  button.active{border-color:var(--color-green);background:var(--color-green-soft);color:var(--color-green-deep);}
  @media(max-width:680px){grid-template-columns:1fr 1fr;}
`;

const ProjectBrief = styled.div`
  margin:0 0 1.4rem;padding:1rem 1.1rem;border:1px solid rgba(47, 93, 80,.18);border-radius:13px;background:var(--color-green-wash);
  strong{display:block;margin-bottom:.25rem;color:var(--color-green-deep)}span{font-size:.88rem;line-height:1.55;color:var(--color-ink-muted)}
`;

const Rules = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  gap: 0.5rem;

  li {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    font-size: 0.95rem;
    font-weight: 600;
    color: var(--color-ink-muted);
  }
  svg { flex-shrink: 0; color: #b91c1c; font-size: 0.8rem; }
`;

const BOOKING_STEPS = [
  { label: 'You send this form', meta: 'today' },
  { label: 'A manager calls you back', meta: 'within 1 business day' },
  { label: 'We walk the property', meta: 'inspection and rental valuation' },
  { label: 'Written proposal', meta: 'plan, fee and works list' },
];

const PROJECT_BOOKING_STEPS = [
  { label: 'You send this brief', meta: 'today' },
  { label: 'A project adviser calls', meta: 'within 1 business day' },
  { label: 'Evidence and site review', meta: 'scope and risks' },
  { label: 'Written control plan', meta: 'budget, stages and reporting' },
];

const PROJECT_TYPES = [
  { value: 'purchase', label: 'Property purchase' },
  { value: 'build', label: 'New building project' },
  { value: 'renovation', label: 'Renovation project' },
  { value: 'rental', label: 'Renting and ongoing management' },
];

export default function ManageConsult() {
  const { user } = useAuth();
  const [params] = useSearchParams();
  const [service, setService] = useState('visit');
  const [project, setProject] = useState(() => PROJECT_TYPES.some((item) => item.value === params.get('project')) ? params.get('project') : 'rental');
  const [form, setForm] = useState({
    name: '', email: '', phone: '', portfolioBand: '', goals: '',
    preferredDate: '', preferredWindow: '',
  });
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const [booking, setBooking] = useState(null);

  // Prefill from the signed-in account so owners aren't retyping what we know.
  useEffect(() => {
    if (!user) return;
    setForm((f) => ({
      ...f,
      email: f.email || user.email || '',
      name: f.name || user.name || '',
    }));
  }, [user]);
  useEffect(() => { if (project !== 'rental') setService('discovery'); }, [project]);

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    try {
      const projectLabel = PROJECT_TYPES.find((item) => item.value === project)?.label || 'Property project';
      const saved = await api.consult.book({ ...form, service, goals: `[${projectLabel}] ${form.goals}`.trim() });
      setBooking(saved);
    } catch (err) {
      setError(err.message || 'Could not submit your request.');
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <Sub>
          Choose the part of the property journey you want us to control, then tell us what stage it is at.
          Nothing is charged until you approve a written scope.
        </Sub>

        <ProjectTabs>{PROJECT_TYPES.map((item)=><button key={item.value} type="button" className={project===item.value?'active':''} onClick={()=>setProject(item.value)}>{item.label}</button>)}</ProjectTabs>

        {project === 'rental' ? <Tiers>
          {CONSULT_TIERS.map((t) => {
            const active = service === t.id;
            return (
              <Tier
                key={t.id}
                type="button"
                $active={active}
                aria-pressed={active}
                onClick={() => setService(t.id)}
              >
                <TierFlag $active={active}>{t.featured ? 'Most chosen' : ''}</TierFlag>
                <TierName>{t.name}</TierName>
                <TierPrice $active={active}>{t.price}</TierPrice>
                <TierSummary $active={active}>{t.summary}</TierSummary>
                <Includes $active={active}>
                  {t.includes.map((line) => (
                    <li key={line}><FaCheck /> {line}</li>
                  ))}
                </Includes>
                <TierPick $active={active}>
                  {active ? 'Selected' : 'Choose this'} <FaArrowRight size={11} />
                </TierPick>
              </Tier>
            );
          })}
        </Tiers> : <ProjectBrief><strong>{PROJECT_TYPES.find((item)=>item.value===project)?.label}</strong><span>Start with a scoping call. We will review the property, location, current evidence and the controls needed, then issue a written plan before any payment.</span></ProjectBrief>}

        <Split>
          <Panel>
            {booking ? (
              <Done>
                <h3>Request received</h3>
                <p>
                  Reference <code>{booking.ref}</code>. A property manager confirms within one
                  business day, and it appears under Consultations on your profile.
                </p>
                <p>We will use the contact details you supplied to confirm the right next step.</p>
              </Done>
            ) : (
              <>
                <PanelTitle>Request a consultation</PanelTitle>
                <PanelSub>
                  Selected: <strong>{project === 'rental' ? CONSULT_TIER_BY_ID[service]?.name : PROJECT_TYPES.find((item)=>item.value===project)?.label}</strong>.
                  Nothing is charged until you have agreed the scope.
                </PanelSub>
                <form onSubmit={submit}>
                  <Grid>
                    <Field>
                      <span>full name</span>
                      <input
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        required
                      />
                    </Field>
                    <Field>
                      <span>email</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        required
                      />
                    </Field>
                    <Field>
                      <span>phone (optional)</span>
                      <input
                        value={form.phone}
                        onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      />
                    </Field>
                    <Field>
                      <span>how much property</span>
                      <select
                        value={form.portfolioBand}
                        onChange={(e) => setForm({ ...form, portfolioBand: e.target.value })}
                      >
                        <option value="">Prefer not to say</option>
                        {PORTFOLIO_BANDS.map((b) => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </Field>
                    <Field>
                      <span>preferred date</span>
                      <input
                        type="date"
                        value={form.preferredDate}
                        onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
                      />
                    </Field>
                    <Field>
                      <span>preferred time</span>
                      <select
                        value={form.preferredWindow}
                        onChange={(e) => setForm({ ...form, preferredWindow: e.target.value })}
                      >
                        <option value="">No preference</option>
                        {CONSULT_WINDOWS.map((w) => <option key={w.value} value={w.value}>{w.label}</option>)}
                      </select>
                    </Field>
                    <Field $wide>
                      <span>tell us about the property</span>
                      <textarea
                        value={form.goals}
                        onChange={(e) => setForm({ ...form, goals: e.target.value })}
                        placeholder="Tell us the property location, current stage, target, budget range and the main problem you need us to control…"
                      />
                    </Field>
                  </Grid>
                  <Submit type="submit" disabled={sending || !form.name.trim() || !form.email.trim()}>
                    {sending ? 'Sending…' : 'Request consultation'} <FaArrowRight size={12} />
                  </Submit>
                  {error && <Err>{error}</Err>}
                </form>
              </>
            )}
          </Panel>

          <Aside>
            <Note $wide>
              <h3>{project === 'rental' ? 'Who pays us' : 'How money is controlled'}</h3>
              {project === 'rental' ? <RentFlow /> : <Disclosure>Budgets and milestones are agreed in writing. Work is independently evidenced before you approve the next stage.</Disclosure>}
              <Caption>{project === 'rental' ? 'Paid from rent we collected · no contractor commissions' : 'No hidden contractor commissions · no unapproved spending'}</Caption>
            </Note>
            <Note>
              <h3>What happens next</h3>
              <ProcessTrack steps={project === 'rental' ? BOOKING_STEPS : PROJECT_BOOKING_STEPS} activeIndex={booking ? 0 : -1} />
            </Note>
            <Note $wide>
              <h3>What we will not do</h3>
              <Rules>
                <li><FaTimes /> Take a cut from the artisans we hire</li>
                <li><FaTimes /> Spend your money without your say-so</li>
                <li><FaTimes /> Take the property on if you don&apos;t need us</li>
              </Rules>
            </Note>
            <Note $wide>
              <h3>How our fee works</h3>
              <Disclosure>{FEE_DISCLOSURE}</Disclosure>
            </Note>
          </Aside>
      </Split>
    </>
  );
}
