import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaCheckCircle, FaEnvelope, FaWhatsapp, FaRegQuestionCircle, FaRegComments } from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { ServiceHero, ServiceHeroInner } from '../components/ServiceHero';
import { StaggerItem, staggerItem } from '../components/motion';
import { SpotArt } from '../components/graphics';
import { useIsMobile } from '../utils/useMediaQuery';
import {
  BOOK_SESSION_URL, CONTACT_EMAIL, HELP_URL, whatsappLink,
} from '../config/platform';

/**
 * Contact — a plain message to the team, for anything that is not one of the
 * app's own forms. It posts to /api/leads and lands in Admin → Messages.
 */

const TOPICS = ['Renting a home', 'Checking a rental', 'Letting and management', 'Listing as an agent', 'Renovation', 'My account', 'Something else'];

const Page = styled.div`background: var(--color-bg-panel); min-height: 70vh;`;
const Body = styled.section`
  max-width: 1080px; margin: 0 auto; padding: 2rem 1.5rem 5rem;
  display: grid; grid-template-columns: minmax(0, 1.4fr) minmax(0, 0.8fr); gap: 1.5rem; align-items: start;
  @media (max-width: 880px) { grid-template-columns: minmax(0, 1fr); padding: 1.25rem 1rem 3.5rem; }
`;
const Card = styled.form`
  background: #fff; border: 1px solid var(--color-line); border-radius: 20px; padding: 1.75rem; box-shadow: var(--shadow-soft);
  h2 { font-size: 1.2rem; margin: 0 0 1.1rem; }
  @media (max-width: 560px) { padding: 1.2rem 1rem; border-radius: 16px; }
`;
const Two = styled.div`display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 0.85rem; @media (max-width: 560px) { grid-template-columns: minmax(0, 1fr); }`;
const Field = styled.label`
  display: block; margin-bottom: 0.9rem;
  span { display: block; font-size: 0.72rem; font-weight: 700; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-muted); margin-bottom: 0.4rem; }
  input, select, textarea { width: 100%; box-sizing: border-box; min-height: 46px; border: 1px solid var(--color-line-strong); border-radius: 11px; background: #fff; color: var(--color-ink); padding: 0.7rem 0.85rem; font: inherit; outline: none; }
  textarea { min-height: 130px; resize: vertical; line-height: 1.5; }
  input:focus, select:focus, textarea:focus { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(47, 93, 80, 0.1); }
`;
const Submit = styled.button`
  display: inline-flex; align-items: center; justify-content: center; gap: 0.5rem; width: 100%;
  min-height: 48px; border: 0; border-radius: 12px; background: var(--color-green-deep); color: #fff; font-weight: 700; font-size: 0.95rem; cursor: pointer;
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
const Rail = styled.aside`display: flex; flex-direction: column; gap: 0.75rem;`;
const Way = styled.a`
  display: flex; align-items: center; gap: 0.85rem; padding: 1rem 1.1rem; border-radius: 14px;
  background: #fff; border: 1px solid var(--color-line); color: var(--color-ink); font-weight: 700;
  .ic { display: grid; place-items: center; width: 38px; height: 38px; flex-shrink: 0; border-radius: 11px; background: var(--color-green-soft); color: var(--color-green-deep); }
  small { display: block; font-weight: 400; color: var(--color-ink-muted); margin-top: 0.1rem; }
  &:hover { color: var(--color-green-deep); border-color: rgba(47, 93, 80, 0.35); }
`;

export default function ContactPage() {
  const { user } = useAuth();
  const mobile = useIsMobile();
  const [params] = useSearchParams();
  const [form, setForm] = useState({
    name: '', email: '', phone: '', topic: TOPICS.includes(params.get('topic')) ? params.get('topic') : TOPICS[0], message: '',
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const wa = whatsappLink('Hello EasyMoveZone, ');

  useEffect(() => {
    if (user) setForm((f) => ({ ...f, name: f.name || user.name || '', email: f.email || user.email || '' }));
  }, [user]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (sending) return;
    if (!form.message.trim()) { setError('Please tell us how we can help.'); return; }
    setSending(true);
    setError('');
    try {
      await api.submitLead({
        type: 'general', name: form.name, email: form.email, phone: form.phone, service: form.topic, message: form.message,
      });
      setSent(true);
    } catch (err) {
      setError(err?.message || 'Could not send your message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  return (
    <Page>
      <ServiceHero $image="/media/inspection.jpg">
        <ServiceHeroInner $spot={mobile}>
          {mobile && <SpotArt className="spot" kind="consult" />}
          <div>
            <StaggerItem className="eyebrow">Contact us</StaggerItem>
            <motion.h1 variants={staggerItem}>How can we help?</motion.h1>
            <motion.p variants={staggerItem}>Send us a message and a person on our team replies, usually within one business day.</motion.p>
          </div>
        </ServiceHeroInner>
      </ServiceHero>

      <Body>
        <Card onSubmit={submit} noValidate={false}>
          {sent ? (
            <Done>
              <FaCheckCircle />
              <h2>Message sent</h2>
              <p>Thanks{form.name ? `, ${form.name.split(' ')[0]}` : ''}. We will reply to {form.email}.</p>
            </Done>
          ) : (
            <>
              <h2>Send a message</h2>
              <Two>
                <Field><span>Your name</span><input value={form.name} onChange={set('name')} placeholder="Full name" required autoComplete="name" /></Field>
                <Field><span>Email</span><input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" required autoComplete="email" /></Field>
              </Two>
              <Two>
                <Field><span>Phone or WhatsApp</span><input value={form.phone} onChange={set('phone')} placeholder="Include country code" autoComplete="tel" /></Field>
                <Field><span>About</span><select value={form.topic} onChange={set('topic')}>{TOPICS.map((t) => <option key={t}>{t}</option>)}</select></Field>
              </Two>
              <Field><span>Message</span><textarea value={form.message} onChange={set('message')} placeholder="Tell us what you need" required /></Field>
              <Submit type="submit" disabled={sending}>{sending ? 'Sending…' : <>Send message <FaArrowRight size={12} /></>}</Submit>
              {error && <Err>{error}</Err>}
            </>
          )}
        </Card>

        <Rail>
          {wa && (
            <Way href={wa} target="_blank" rel="noopener noreferrer">
              <span className="ic"><FaWhatsapp /></span><span>Chat on WhatsApp<small>Quickest for a short question</small></span>
            </Way>
          )}
          <Way href={`mailto:${CONTACT_EMAIL}`}>
            <span className="ic"><FaEnvelope /></span><span>Email us<small>{CONTACT_EMAIL}</small></span>
          </Way>
          <Way as={Link} to={HELP_URL}>
            <span className="ic"><FaRegQuestionCircle /></span><span>Help and FAQs<small>Answers to common questions</small></span>
          </Way>
          <Way as={Link} to={BOOK_SESSION_URL}>
            <span className="ic"><FaRegComments /></span><span>Talk to a property adviser<small>Free, about a specific property</small></span>
          </Way>
        </Rail>
      </Body>
    </Page>
  );
}
