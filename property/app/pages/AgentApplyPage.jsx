import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, Navigate, useLocation } from 'react-router-dom';
import { FaArrowRight, FaCheckCircle } from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { ServiceHero, ServiceHeroInner } from '../components/ServiceHero';
import { StaggerItem, staggerItem } from '../components/motion';
import { motion } from 'framer-motion';
import { AGENT_URL, AGENT_APPLY_NAV } from '../config/platform';
import ConsoleShell from '../components/ConsoleShell';
import { siteAuthUrl } from '../auth';
import { MARKET } from '../config/markets';

/**
 * KYC form for agencies. Signed out, it is a public page asking you to sign
 * in. Signed in, it is the agent portal's first page, inside the portal shell
 * (switcher, menu, way back), until staff verify the agency.
 */

const Page = styled.div`background: var(--color-bg-panel); min-height: 70vh;`;
const Body = styled.section`
  max-width: 720px; margin: 0 auto; padding: 2rem 1.5rem 5rem;
  @media (max-width: 560px) { padding: 1.25rem 1rem 3.5rem; }
`;
const Card = styled.form`
  background: #fff; border: 1px solid var(--color-line); border-radius: 20px; padding: 1.75rem; box-shadow: var(--shadow-soft);
  h2 { font-size: 1.2rem; margin: 0 0 0.4rem; }
  p.lead { color: var(--color-ink-muted); font-size: 0.92rem; line-height: 1.55; margin: 0 0 1.2rem; }
`;
const Two = styled.div`display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.85rem; @media (max-width: 560px) { grid-template-columns: minmax(0, 1fr); }`;
const Field = styled.label`
  display: block; margin-bottom: 0.9rem;
  span { display: block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-muted); margin-bottom: 0.4rem; }
  input, select, textarea { width: 100%; box-sizing: border-box; min-height: 46px; border: 1px solid var(--color-line-strong); border-radius: 11px; background: #fff; color: var(--color-ink); padding: 0.7rem 0.85rem; font: inherit; outline: none; }
  textarea { min-height: 110px; resize: vertical; line-height: 1.5; }
  input:focus, select:focus, textarea:focus { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(184, 90, 48, 0.1); }
`;
const Submit = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%;
  min-height: 48px; border: 0; border-radius: 6px; background: var(--color-green-deep); color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer;
  &:hover { background: var(--color-green-forest); }
  &:disabled { opacity: 0.6; cursor: default; }
`;
const Err = styled.p`color: #b91c1c; font-size: 0.88rem; margin: 0.75rem 0 0;`;
const Done = styled.div`
  text-align: center; padding: 1.5rem 0.5rem;
  svg { color: var(--color-green); font-size: 2.4rem; }
  h2 { margin: 0.8rem 0 0.4rem; }
  p { color: var(--color-ink-muted); margin: 0; line-height: 1.55; }
`;
const SignIn = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 20px; padding: 2rem; text-align: center;
  h2 { margin: 0 0 0.4rem; }
  p { color: var(--color-ink-muted); margin: 0 0 1.2rem; }
  a {
    display: inline-flex; align-items: center; gap: 0.45rem; min-height: 46px; padding: 0 1.2rem;
    border-radius: 6px; background: var(--color-green-deep); color: #fff; font-weight: 700;
  }
`;

export default function AgentApplyPage() {
  const { user, loading } = useAuth();
  const location = useLocation();
  const [me, setMe] = useState(null);
  const [form, setForm] = useState({
    contactName: '', company: '', phone: '', website: '', licenseNumber: '',
    city: '', state: '', country: MARKET.name, bio: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return undefined;
    setForm((f) => ({ ...f, contactName: f.contactName || user.name || '' }));
    let live = true;
    api.agent.me().then((r) => { if (live) setMe(r); }).catch(() => {});
    return () => { live = false; };
  }, [user]);

  if (loading) return null;
  if (me?.membership?.verification_status === 'verified') {
    return <Navigate to={AGENT_URL} replace />;
  }

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    setSending(true);
    setError('');
    try {
      await api.agent.apply(form);
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Could not submit your application.');
    } finally {
      setSending(false);
    }
  };

  const application = sent || me?.application?.status === 'pending' ? (
    <Card as="div">
      <Done>
        <FaCheckCircle />
        <h2>Application received</h2>
        <p>Staff will review {form.company || me?.application?.company || 'your agency'} and email you. That usually takes one or two working days.</p>
        <p style={{ marginTop: '0.8rem' }}><Link to="/agents">Browse agencies already on EasyMoveZone</Link></p>
      </Done>
    </Card>
  ) : (
    <Card onSubmit={submit}>
      <h2>Agency details</h2>
      <p className="lead">
        We list verified agencies only — licence number, a working phone, and a person we can reach.
        {me?.application?.status === 'needs_more' ? ' Staff asked for a bit more; update the form and send it again.' : ''}
        {me?.application?.status === 'rejected' ? ' A previous application was not approved. You can apply again.' : ''}
      </p>
      {me?.application?.admin_note && <p className="lead">Note from staff: {me.application.admin_note}</p>}
      <Two>
        <Field><span>Your name</span><input required value={form.contactName} onChange={set('contactName')} /></Field>
        <Field><span>Agency name</span><input required value={form.company} onChange={set('company')} /></Field>
      </Two>
      <Two>
        <Field><span>Phone</span><input required value={form.phone} onChange={set('phone')} placeholder="Include country code" /></Field>
        <Field><span>Website</span><input value={form.website} onChange={set('website')} placeholder="https://" /></Field>
      </Two>
      <Field><span>Licence / CAC number</span><input required value={form.licenseNumber} onChange={set('licenseNumber')} /></Field>
      <Two>
        <Field><span>City</span><input required value={form.city} onChange={set('city')} /></Field>
        <Field>
          <span>State</span>
          <select value={form.state} onChange={set('state')} required>
            <option value="">Select</option>
            {(MARKET.regions || []).map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </Field>
      </Two>
      <Field><span>About the agency</span><textarea value={form.bio} onChange={set('bio')} placeholder="Areas you cover, years in business, typical stock." /></Field>
      <Submit type="submit" disabled={sending}>{sending ? 'Sending…' : 'Submit application'}</Submit>
      {error && <Err>{error}</Err>}
    </Card>
  );

  if (user) {
    return (
      <ConsoleShell
        workspace="agent"
        nav={AGENT_APPLY_NAV}
        title="Apply to list homes"
        sub="Apply once. We verify the agency, you pick a plan, then you post homes to rent yourself."
      >
        <div style={{ width: '100%', maxWidth: 720 }}>{application}</div>
      </ConsoleShell>
    );
  }

  return (
    <Page>
      <ServiceHero>
        <ServiceHeroInner>
          <StaggerItem><p className="kicker">For agencies</p></StaggerItem>
          <motion.h1 variants={staggerItem}>List homes to rent as an agent.</motion.h1>
          <motion.p variants={staggerItem} className="intro">
            Apply once. We verify the agency, you pick a plan, then you post homes to rent yourself.
          </motion.p>
        </ServiceHeroInner>
      </ServiceHero>
      <Body>
        <SignIn>
          <h2>Sign in to apply</h2>
          <p>Use the same EasyMoveZone account you already have, or create one.</p>
          <a href={siteAuthUrl({ from: location.pathname })}>Sign in <FaArrowRight size={12} /></a>
        </SignIn>
      </Body>
    </Page>
  );
}
