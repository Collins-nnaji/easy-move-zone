import React, { useEffect, useMemo, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useSearchParams } from 'react-router-dom';
import {
  FaArrowRight, FaCheckCircle, FaCloudUploadAlt, FaTimes, FaVideo, FaSearch,
  FaKey, FaTools, FaClipboardCheck, FaFileSignature, FaPaperPlane,
  FaShieldAlt, FaRegClock,
} from 'react-icons/fa';
import { api } from '../api';
import SignInGate from '../components/SignInGate';
import {
  MANAGEMENT_PLANS, PLAN_BY_ID, MANAGEMENT_ADDONS, PROPERTY_TYPES, LETTING_STATUSES,
  FURNISHING, BEDROOM_OPTIONS, MANAGEMENT_STEPS, STATUS_LABEL, STATUS_TONE,
  estimateFees,
} from '../config/management';
import {
  COUNTRY_SUGGESTIONS, CURRENCY, CURRENCY_LABEL, DEFAULT_COUNTRY, regionsFor,
} from '../config/markets';
import { formatMoneyFull } from '../utils/format';

/**
 * The Manage console's "Add a property" and "Properties" sub-pages.
 *
 * This file was the standalone `/manage` marketing page. The hero, the tab
 * switcher and the FAQ band that used to wrap it are gone — the console shell
 * supplies the page chrome now, and the flow itself is unchanged.
 */

const MAX_FILES = 20;

/* ── Shell ────────────────────────────────────────── */







/* Owner statement mock — shows what the service actually produces. */



/* ── Body ─────────────────────────────────────────── */





const Split = styled.div`
  display: grid; grid-template-columns: 1.4fr 1fr; gap: 2rem; align-items: start;
  @media (max-width: 1080px) { grid-template-columns: minmax(0, 1fr); }
`;

const SectionTitle = styled.h2`
  font-family: var(--font-display); font-size: 1.15rem; font-weight: 600;
  letter-spacing: -0.02em; margin: 2.25rem 0 1.1rem;
  display: flex; align-items: center; gap: 0.55rem;
  &:first-of-type { margin-top: 0; }
  svg { color: var(--color-green); font-size: 0.9rem; }
  @media (max-width: 720px) { font-size: 1.05rem; }
`;

const PlanGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(230px, 1fr)); gap: 1rem;
`;

const PlanCard = styled.button`
  text-align: left; cursor: pointer;
  background: ${(p) => (p.$on ? 'linear-gradient(180deg,#f3f6f1 0%,#fff 70%)' : '#fff')};
  border: 1.5px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  border-radius: 18px; padding: 1.25rem 1.2rem 1.35rem;
  box-shadow: ${(p) => (p.$on ? '0 10px 30px rgba(184, 90, 48,0.12)' : 'none')};
  transition: border-color 0.15s, box-shadow 0.15s, transform 0.15s;
  display: flex; flex-direction: column;
  &:hover { border-color: var(--color-green); transform: translateY(-2px); }

  .badge {
    align-self: flex-start; font-family: var(--font-mono); font-size: 0.6rem; letter-spacing: 0.08em;
    text-transform: uppercase; color: #fff; background: var(--color-green);
    border-radius: 6px; padding: 0.2rem 0.45rem; margin-bottom: 0.6rem;
  }
  .name { font-family: var(--font-display); font-size: 1.05rem; font-weight: 600; color: var(--color-ink); }
  .rate {
    font-family: var(--font-display); font-size: 1.5rem; font-weight: 700; letter-spacing: -0.02em;
    color: var(--color-green-ink); margin: 0.35rem 0 0.1rem;
    small { font-size: 0.95rem; font-weight: 600; }
  }
  .note { font-family: var(--font-mono); font-size: 0.68rem; color: var(--color-ink-faint); margin-bottom: 0.75rem; }
  .blurb { font-size: 0.88rem; line-height: 1.45; color: var(--color-ink-muted); }
`;

const Includes = styled.ul`
  margin: 0.9rem 0 0; padding: 0; list-style: none;
  display: flex; flex-direction: column; gap: 0.4rem;
  li {
    display: flex; gap: 0.5rem; align-items: flex-start;
    font-size: 0.85rem; line-height: 1.4; color: var(--color-ink-muted);
    svg { color: var(--color-green); font-size: 0.72rem; margin-top: 0.25rem; flex-shrink: 0; }
  }
`;

const Card = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: var(--radius-lg);
  padding: 1.35rem 1.45rem;
  @media (max-width: 720px) { padding: 1.1rem; }
`;

const Fields = styled.div` display: flex; flex-direction: column; gap: 1.25rem; `;
const Field = styled.div``;
const TwoCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr; gap: 1rem;
  @media (max-width: 520px) { grid-template-columns: minmax(0, 1fr); }
`;
const ThreeCol = styled.div`
  display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 1rem;
  @media (max-width: 520px) { grid-template-columns: minmax(0, 1fr); }
`;

const Label = styled.label`
  display: block; font-family: var(--font-mono); font-size: 0.72rem;
  letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink-soft);
  margin-bottom: 0.5rem;
`;

const inputCss = `
  width: 100%;
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong);
  border-radius: 12px;
  padding: 0.9rem 1rem;
  font-family: var(--font-sans);
  font-size: 1rem;
  color: var(--color-ink);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  &:focus { border-color: var(--color-green); background: #fff; }
`;

const Input = styled.input`${inputCss}`;
const Select = styled.select`${inputCss} cursor: pointer;`;
const Textarea = styled.textarea`${inputCss} min-height: 110px; resize: vertical; line-height: 1.5;`;

const Hint = styled.div`
  font-family: var(--font-mono); font-size: 0.72rem;
  color: ${(p) => (p.$accent ? 'var(--color-green-ink)' : 'var(--color-ink-faint)')};
  margin-top: 0.45rem;
`;

const ChipRow = styled.div` display: flex; flex-wrap: wrap; gap: 0.5rem; `;

const AddonChip = styled.button`
  text-align: left; cursor: pointer;
  border: 1px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? 'var(--color-green-soft)' : '#fff')};
  border-radius: 14px; padding: 0.7rem 0.85rem; flex: 1 1 220px;
  transition: border-color 0.15s, background 0.15s;
  &:hover { border-color: var(--color-green); }
  .top {
    display: flex; align-items: center; justify-content: space-between; gap: 0.5rem;
    font-size: 0.87rem; font-weight: 700;
    color: ${(p) => (p.$on ? 'var(--color-green-deep)' : 'var(--color-ink)')};
  }
  .cost { font-family: var(--font-mono); font-size: 0.7rem; color: var(--color-ink-faint); white-space: nowrap; }
  .blurb { font-size: 0.78rem; line-height: 1.35; color: var(--color-ink-muted); margin-top: 0.25rem; }
`;

/* ── Media ────────────────────────────────────────── */
const Dropzone = styled.button`
  width: 100%;
  border: 2px dashed ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
  border-radius: 16px; background: ${(p) => (p.$active ? '#f3f6f1' : 'var(--color-bg-sunken)')};
  padding: 1.5rem; text-align: center; cursor: pointer;
  &:hover { border-color: var(--color-green); background: #f3f6f1; }
`;
const DropIcon = styled.div`
  width: 44px; height: 44px; margin: 0 auto 0.6rem; border-radius: 12px;
  background: var(--color-green-chip); color: var(--color-green-deep);
  display: flex; align-items: center; justify-content: center; font-size: 1.2rem;
`;
const DropTitle = styled.div` font-size: 0.98rem; font-weight: 700; color: var(--color-ink); margin-bottom: 0.2rem; `;
const DropHint = styled.div` font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); `;

const Thumbs = styled.div`
  display: grid; grid-template-columns: repeat(auto-fill, minmax(88px, 1fr));
  gap: 0.6rem; margin-top: 0.85rem;
`;
const Thumb = styled.div`
  position: relative; aspect-ratio: 1; border-radius: 12px; overflow: hidden;
  border: 1px solid var(--color-line-strong); background: linear-gradient(135deg, var(--color-bg-slate), var(--color-green-wash));
  display: flex; align-items: center; justify-content: center; color: rgba(255,255,255,0.85);
  img { width: 100%; height: 100%; object-fit: cover; }
  .overlay {
    position: absolute; inset: 0; background: rgba(16, 18, 24, 0.62);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 0.72rem; color: #fff;
  }
  .act {
    position: absolute; top: 4px; right: 4px; width: 22px; height: 22px;
    border-radius: 50%; border: none; background: rgba(16, 18, 24, 0.75); color: #fff;
    display: flex; align-items: center; justify-content: center; font-size: 0.6rem; cursor: pointer;
    &:hover { background: var(--color-green); }
  }
`;

/* ── Authorization ────────────────────────────────── */
const Agreement = styled.div`
  background: var(--color-bg-sunken); border: 1px solid var(--color-line-strong);
  border-radius: 14px; padding: 1.1rem 1.2rem; max-height: 230px; overflow-y: auto;
  font-size: 0.85rem; line-height: 1.6; color: var(--color-ink-muted); margin-bottom: 1.1rem;
  h4 {
    font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em;
    text-transform: uppercase; color: var(--color-ink); margin: 0 0 0.6rem;
  }
  ul { margin: 0.5rem 0 0.5rem 1.1rem; padding: 0; }
  li { margin-bottom: 0.3rem; }
  strong { color: var(--color-ink); }
  .ref { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); }
`;

const Check = styled.label`
  display: flex; align-items: flex-start; gap: 0.65rem;
  font-size: 0.9rem; color: var(--color-ink); line-height: 1.45;
  margin-bottom: 0.9rem; cursor: pointer;
  input { width: 18px; height: 18px; margin-top: 0.1rem; accent-color: var(--color-green); flex-shrink: 0; cursor: pointer; }
`;

const Signature = styled.input`
  ${inputCss}
  font-family: var(--font-display); font-size: 1.15rem;
`;

const SubmitBtn = styled.button`
  width: 100%; margin-top: 0.5rem;
  background: var(--color-green); color: #fff; border: none;
  padding: 1.1rem; border-radius: 999px;
  font-family: var(--font-sans); font-weight: 700; font-size: 1.05rem; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 0.6rem;
  &:hover:not(:disabled) { background: var(--color-green-forest); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const FootNote = styled.div`
  font-family: var(--font-mono); font-size: 0.74rem;
  color: var(--color-ink-faint); text-align: center; margin-top: 0.85rem;
`;

const ErrorMsg = styled.p` color: #b91c1c; font-size: 0.88rem; margin: 0.6rem 0 0; text-align: center; `;

/* ── Rail: live fee calculator ────────────────────── */
const Rail = styled.div`
  display: flex; flex-direction: column; gap: 1.25rem;
  position: sticky; top: calc(var(--nav-h) + 1.5rem);
  @media (max-width: 1080px) { position: static; }
`;

const QuoteCard = styled.div`
  background: var(--color-band); color: var(--color-on-black);
  border: 1px solid var(--color-black-line);
  border-radius: var(--radius-lg); padding: 1.4rem 1.5rem;
  @media (max-width: 720px) { padding: 1.15rem; }
`;

const QuoteHead = styled.div`
  font-size: 0.72rem; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase;
  color: var(--color-green-deep); margin-bottom: 1.1rem;
`;

const QuoteBig = styled.div`
  font-family: var(--font-display); font-size: 1.85rem; font-weight: 700; letter-spacing: -0.02em;
  color: var(--color-green-deep); line-height: 1.1;
  @media (max-width: 720px) { font-size: 1.6rem; }
`;

const QuoteSub = styled.div` font-size: 0.8rem; color: var(--color-ink-muted); margin-top: 0.4rem; `;

const QuoteRows = styled.div`
  margin-top: 1.3rem; display: flex; flex-direction: column; gap: 0.15rem;
`;

const QuoteRow = styled.div`
  display: flex; align-items: baseline; justify-content: space-between; gap: 1rem;
  padding: 0.5rem 0; font-size: 0.88rem; color: var(--color-ink-muted);
  border-bottom: 1px solid var(--color-line);
  &:last-child { border-bottom: none; }
  b { font-weight: 700; color: ${(p) => (p.$accent ? 'var(--color-green-deep)' : 'var(--color-ink)')}; white-space: nowrap; }
`;

const QuoteNote = styled.div`
  margin-top: 1.1rem; font-size: 0.78rem; line-height: 1.45; color: #8f98a3;
`;

const StepsCard = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: var(--radius-lg);
  padding: 1.35rem 1.45rem;
  @media (max-width: 720px) { padding: 1.1rem; }
`;

const StepsHead = styled.div`
  font-family: var(--font-mono); font-size: 0.74rem; color: var(--color-green-ink); margin-bottom: 1.2rem;
`;

const Step = styled.div`
  display: flex; gap: 0.85rem; align-items: flex-start; margin-bottom: 1.05rem;
  &:last-child { margin-bottom: 0; }
  .n {
    flex-shrink: 0; width: 26px; height: 26px; border-radius: 50%;
    background: var(--color-green-soft); color: var(--color-green-deep);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 0.72rem; font-weight: 700;
  }
  .t { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: var(--color-ink); margin-bottom: 0.15rem; }
  .b { font-size: 0.87rem; line-height: 1.45; color: var(--color-ink-muted); }
`;

/* ── Tracker / my properties ──────────────────────── */
const RequestRow = styled.button`
  width: 100%; text-align: left; cursor: pointer;
  background: #fff; border: 1px solid var(--color-line-strong); border-radius: 16px;
  padding: 1.1rem 1.2rem; margin-bottom: 0.85rem;
  display: flex; align-items: center; justify-content: space-between; gap: 1rem;
  &:hover { border-color: var(--color-green); }
  .title { font-family: var(--font-display); font-size: 1.05rem; font-weight: 700; color: var(--color-ink); }
  .meta { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); margin-top: 0.3rem; }
`;

const Pill = styled.span`
  display: inline-flex; align-items: center; gap: 0.35rem; white-space: nowrap;
  font-family: var(--font-mono); font-size: 0.68rem; letter-spacing: 0.04em;
  border-radius: 999px; padding: 0.32rem 0.7rem;
  background: ${(p) => ({
    good: 'var(--color-green-soft)', info: 'rgba(3,105,161,0.1)', warn: 'rgba(180,83,9,0.1)',
  }[p.$tone] || 'var(--color-bg-sunken)')};
  color: ${(p) => ({
    good: 'var(--color-green-deep)', info: '#0369a1', warn: '#b45309',
  }[p.$tone] || 'var(--color-ink-muted)')};
  border: 1px solid ${(p) => ({
    good: 'rgba(184, 90, 48,0.25)', info: 'rgba(3,105,161,0.2)', warn: 'rgba(180,83,9,0.2)',
  }[p.$tone] || 'var(--color-line-strong)')};
`;

const Timeline = styled.div` display: flex; flex-direction: column; gap: 0.65rem; margin: 1.25rem 0 1.5rem; `;

const TimelineStep = styled.div`
  display: flex; align-items: center; gap: 0.75rem; font-size: 0.9rem;
  color: ${(p) => (p.$done ? 'var(--color-ink)' : 'var(--color-ink-faint)')};
  .dot {
    width: 24px; height: 24px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 0.62rem;
    background: ${(p) => (p.$done ? 'var(--color-green)' : 'var(--color-bg-sunken)')};
    color: ${(p) => (p.$done ? '#fff' : 'var(--color-ink-faint)')};
    border: 1px solid ${(p) => (p.$done ? 'var(--color-green)' : 'var(--color-line-strong)')};
  }
`;

const Thread = styled.div`
  display: flex; flex-direction: column; gap: 0.7rem;
  max-height: 320px; overflow-y: auto; padding-right: 0.25rem;
`;

const Bubble = styled.div`
  align-self: ${(p) => (p.$mine ? 'flex-end' : 'flex-start')};
  max-width: 82%; border-radius: 14px; padding: 0.7rem 0.9rem;
  font-size: 0.9rem; line-height: 1.45;
  background: ${(p) => (p.$mine ? 'var(--color-green)' : 'var(--color-bg-sunken)')};
  color: ${(p) => (p.$mine ? '#fff' : 'var(--color-ink)')};
  border: 1px solid ${(p) => (p.$mine ? 'var(--color-green)' : 'var(--color-line-strong)')};
  .when { display: block; font-family: var(--font-mono); font-size: 0.62rem; opacity: 0.7; margin-top: 0.35rem; }
`;

const Composer = styled.div` display: flex; gap: 0.6rem; margin-top: 1rem; `;

const SendBtn = styled.button`
  flex-shrink: 0; border: none; cursor: pointer; border-radius: 12px;
  background: var(--color-green); color: #fff; padding: 0 1.1rem; font-size: 0.95rem;
  &:disabled { opacity: 0.5; cursor: not-allowed; }
`;

const Empty = styled.div`
  border: 1px dashed var(--color-line-strong); border-radius: 16px;
  padding: 2rem 1.25rem; text-align: center; color: var(--color-ink-muted); font-size: 0.95rem;
`;

const Lookup = styled.div` display: flex; gap: 0.6rem; margin-bottom: 1.25rem; max-width: 460px; `;

const Success = styled(motion.div)` text-align: center; padding: 1.5rem 0.5rem 0.5rem; `;

const SuccessIcon = styled.div`
  width: 60px; height: 60px; border-radius: 50%; margin: 0 auto 1.1rem;
  background: var(--color-green-soft); color: var(--color-green);
  display: flex; align-items: center; justify-content: center; font-size: 1.6rem;
`;



const FaqGrid = styled.div`
  display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 1rem;
`;

const Faq = styled.div`
  background: #fff; border: 1px solid var(--color-line-strong); border-radius: 16px; padding: 1.25rem 1.35rem;
  .q { font-family: var(--font-display); font-size: 0.98rem; font-weight: 600; color: var(--color-ink); margin-bottom: 0.4rem; }
  .a { font-size: 0.9rem; line-height: 1.5; color: var(--color-ink-muted); }
`;

const CrossLink = styled(Link)`
  display: inline-flex; align-items: center; gap: 0.4rem;
  font-size: 0.9rem; font-weight: 700; color: var(--color-green-deep);
  margin-top: 1rem;
  &:hover { color: var(--color-green-deep); }
`;

const FAQS = [
  {
    q: 'What does the fee actually cover?',
    a: 'Everything listed in your plan, covering letting, rent collection, repairs coordination and reporting. It is deducted from rent collected, so there is nothing to pay up front.',
  },
  {
    q: 'Who pays for repairs?',
    a: 'You do, as the owner. We agree a float and a per-job approval limit up front; anything above it needs your sign-off before work starts.',
  },
  {
    q: 'Do you take a property that already has a tenant?',
    a: 'Yes. We take over the existing tenancy, verify the paperwork and deposit, and move rent collection onto our cycle at the next due date.',
  },
  {
    q: 'How often do I get paid?',
    a: 'On a fixed cycle agreed at onboarding, typically within five working days of rent clearing, with an itemised statement of every deduction.',
  },
  {
    q: 'Can I end the arrangement?',
    a: 'Yes. The authorization is non-exclusive and terminable in writing with 30 days notice, subject to any tenancy already in place.',
  },
  {
    q: 'What if the property needs work first?',
    a: 'The management visit flags it. We can run the works through EasyMoveZone Upgrade and let the property as soon as it is ready.',
  },
];

const TIMELINE_ORDER = ['new', 'reviewing', 'visit_booked', 'proposal_sent', 'onboarding', 'active'];

function money(value, currency = 'NGN') {
  return formatMoneyFull(value, currency);
}

/* ─────────────────────────── Onboarding flow ─────────────────────────── */
function OnboardFlow({ user, onDone }) {
  const [params] = useSearchParams();
  const fileInputRef = useRef(null);

  const [plan, setPlan] = useState(
    MANAGEMENT_PLANS.some((p) => p.id === params.get('plan')) ? params.get('plan') : 'full_management'
  );
  const [addons, setAddons] = useState([]);
  const [media, setMedia] = useState([]);
  const [uploadEnabled, setUploadEnabled] = useState(true);
  const [dragActive, setDragActive] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const [f, setF] = useState({
    address: params.get('address') || '',
    country: DEFAULT_COUNTRY, currency: CURRENCY, state: '', city: '', area: '',
    propertyType: 'Detached house',
    bedrooms: '3',
    furnished: 'Unfurnished',
    lettingStatus: 'vacant',
    units: '1',
    expectedRent: '',
    startDate: '',
    description: '',
    name: user?.name || '',
    email: user?.email || '',
    phone: '',
  });

  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [consent, setConsent] = useState(false);
  // Optional and separate from the authorization: advertising on the public
  // Rent page is never implied by signing it, so this starts unticked.
  const [advertise, setAdvertise] = useState(false);
  const [signature, setSignature] = useState(user?.name || '');
  const [sigTouched, setSigTouched] = useState(false);

  const set = (key, val) => setF((prev) => ({ ...prev, [key]: val }));

  useEffect(() => {
    let active = true;
    api.getMediaConfig().then((c) => active && setUploadEnabled(!!c.enabled)).catch(() => {});
    return () => { active = false; };
  }, []);

  // The authorization signs itself with the owner's name unless they override it.
  useEffect(() => { if (!sigTouched) setSignature(f.name); }, [f.name, sigTouched]);

  const toggleAddon = (id) => setAddons((prev) => (
    prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
  ));

  const quoteAddons = useMemo(() => addons.filter((id) => {
    const addon = MANAGEMENT_ADDONS.find((item) => item.id === id);
    return !addon?.flatAnnual || f.currency === 'NGN';
  }), [addons, f.currency]);

  const quote = useMemo(() => estimateFees({
    plan,
    annualRent: Number(String(f.expectedRent).replace(/[^\d.]/g, '')) || 0,
    units: f.units,
    addons: quoteAddons,
  }), [plan, f.expectedRent, f.units, quoteAddons]);
  const showMoney = (value) => money(value, f.currency || 'NGN');

  const selectedPlan = PLAN_BY_ID[plan];

  /* ── Media ── */
  const pickFiles = () => fileInputRef.current && fileInputRef.current.click();

  const uploadFiles = async (fileList) => {
    const files = Array.from(fileList || []).slice(0, MAX_FILES);
    for (const file of files) {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const isVideo = file.type.startsWith('video/');
      const previewUrl = isVideo ? null : URL.createObjectURL(file);
      setMedia((m) => [...m, { id, name: file.name, kind: isVideo ? 'video' : 'image', previewUrl, status: 'uploading', pct: 0 }]);
      try {
        const { blobUrl } = await api.uploadMedia(file, {
          prefix: 'manage',
          onProgress: (pct) => setMedia((m) => m.map((x) => (x.id === id ? { ...x, pct } : x))),
        });
        setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'done', url: blobUrl, pct: 100 } : x)));
      } catch {
        setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'error' } : x)));
      }
    }
  };

  const onFiles = async (e) => { const list = Array.from(e.target.files || []); e.target.value = ''; await uploadFiles(list); };
  const onDrop = (e) => {
    e.preventDefault(); setDragActive(false);
    if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files);
  };
  const removeMedia = async (id) => {
    const item = media.find((x) => x.id === id);
    if (!item) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.status === 'done' && item.url) {
      try { await api.deleteMedia(item.url); } catch { /* leave the orphan blob */ }
    }
    setMedia((m) => m.filter((x) => x.id !== id));
  };

  const canSubmit = Boolean(
    plan && f.address.trim() && f.country.trim() && f.currency && f.state.trim() && f.name.trim() && f.email.trim()
    && ownerConfirmed && consent && signature.trim().length >= 2 && !submitting
  );

  const submit = async () => {
    if (!canSubmit) {
      setError('Please complete the property country, address, region, currency, your details, and sign the management authorization.');
      return;
    }
    setSubmitting(true); setError('');
    try {
      const uploaded = media.filter((x) => x.status === 'done' && x.url).map((x) => ({ url: x.url, kind: x.kind }));
      const res = await api.management.submit({
        plan,
        title: `${selectedPlan.name} · ${f.address.trim()}`,
        description: f.description,
        propertyType: f.propertyType,
        units: Number(f.units) || 1,
        bedrooms: f.bedrooms,
        furnished: f.furnished,
        lettingStatus: f.lettingStatus,
        country: f.country, currency: f.currency, state: f.state, city: f.city, area: f.area, address: f.address,
        expectedRent: Number(String(f.expectedRent).replace(/[^\d.]/g, '')) || null,
        addons,
        startDate: f.startDate || null,
        media: uploaded,
        contactName: f.name, contactEmail: f.email, phone: f.phone,
        ownerConfirmed: true, consent: true, consentName: signature.trim(),
        advertiseConsent: advertise,
      });
      onDone({ id: res.id, ref: res.ref, email: f.email.trim().toLowerCase(), name: f.name });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SignInGate title="Sign in to hand over a property" action="instruct EasyMoveZone to manage your property">
      <SectionTitle><FaKey /> 1. Choose how much you want us to do</SectionTitle>
      <PlanGrid>
        {MANAGEMENT_PLANS.map((p) => (
          <PlanCard key={p.id} type="button" $on={plan === p.id} onClick={() => setPlan(p.id)}>
            {p.featured && <span className="badge">Most owners</span>}
            <div className="name">{p.name}</div>
            <div className="rate">{p.ratePct}<small>%</small></div>
            <div className="note">{p.priceNote}</div>
            <div className="blurb">{p.blurb}</div>
          </PlanCard>
        ))}
      </PlanGrid>

      <Card style={{ marginTop: '1.25rem' }}>
        <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-faint)', marginBottom: '0.6rem' }}>
          {selectedPlan.name.toUpperCase()} · {selectedPlan.tagline}
        </div>
        <Includes>
          {selectedPlan.includes.map((item) => (
            <li key={item}><FaCheckCircle /> {item}</li>
          ))}
        </Includes>
      </Card>

      <SectionTitle><FaTools /> 2. Add anything else you need</SectionTitle>
      <ChipRow>
        {MANAGEMENT_ADDONS.map((a) => (
          <AddonChip key={a.id} type="button" $on={addons.includes(a.id)} onClick={() => toggleAddon(a.id)}>
            <div className="top">
              <span>{a.name}</span>
              <span className="cost">
                {a.ratePct ? `+${a.ratePct}%` : a.flatAnnual ? (f.currency === 'NGN' ? `${money(a.flatAnnual, 'NGN')}/yr` : 'quoted locally') : 'per job'}
              </span>
            </div>
            <div className="blurb">{a.blurb}</div>
          </AddonChip>
        ))}
      </ChipRow>

      <Split style={{ marginTop: '2.25rem' }}>
        <div>
          <SectionTitle style={{ marginTop: 0 }}><FaClipboardCheck /> 3. Tell us about the property</SectionTitle>
          <Card>
            <Fields>
              <Field>
                <Label>Property address</Label>
                <Input
                  value={f.address}
                  onChange={(e) => set('address', e.target.value)}
                  placeholder="Street, estate, area, e.g. 12 Admiralty Way, Lekki Phase 1"
                />
              </Field>

              <TwoCol>
                <Field>
                  <Label>Country</Label>
                  <Input value={f.country} list="manage-country-options" onChange={(e) => set('country', e.target.value)} placeholder="Start typing a country" />
                  <datalist id="manage-country-options">{COUNTRY_SUGGESTIONS.map((country) => <option key={country} value={country} />)}</datalist>
                </Field>
                <Field>
                  <Label>Working currency</Label>
                  <Input value={CURRENCY_LABEL} readOnly aria-readonly="true" tabIndex={-1} />
                </Field>
              </TwoCol>

              <ThreeCol>
                <Field>
                  <Label>State / region</Label>
                  {regionsFor(f.country) ? (
                    <Select value={f.state} onChange={(e) => set('state', e.target.value)}>
                      <option value="">Select state…</option>
                      {regionsFor(f.country).map((s) => <option key={s}>{s}</option>)}
                    </Select>
                  ) : <Input value={f.state} onChange={(e) => set('state', e.target.value)} placeholder="State, county or region" />}
                </Field>
                <Field>
                  <Label>City / LGA</Label>
                  <Input value={f.city} onChange={(e) => set('city', e.target.value)} placeholder="e.g. Eti-Osa" />
                </Field>
                <Field>
                  <Label>Area / estate</Label>
                  <Input value={f.area} onChange={(e) => set('area', e.target.value)} placeholder="e.g. Lekki Phase 1" />
                </Field>
              </ThreeCol>

              <ThreeCol>
                <Field>
                  <Label>Property type</Label>
                  <Select value={f.propertyType} onChange={(e) => set('propertyType', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Bedrooms per unit</Label>
                  <Select value={f.bedrooms} onChange={(e) => set('bedrooms', e.target.value)}>
                    {BEDROOM_OPTIONS.map((b) => <option key={b}>{b}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Lettable units</Label>
                  <Input
                    value={f.units}
                    onChange={(e) => set('units', e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    placeholder="1"
                  />
                </Field>
              </ThreeCol>

              <TwoCol>
                <Field>
                  <Label>Current status</Label>
                  <Select value={f.lettingStatus} onChange={(e) => set('lettingStatus', e.target.value)}>
                    {LETTING_STATUSES.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
                  </Select>
                </Field>
                <Field>
                  <Label>Furnishing</Label>
                  <Select value={f.furnished} onChange={(e) => set('furnished', e.target.value)}>
                    {FURNISHING.map((s) => <option key={s}>{s}</option>)}
                  </Select>
                </Field>
              </TwoCol>

              <TwoCol>
                <Field>
                  <Label>Expected annual rent (per unit)</Label>
                  <Input
                    value={f.expectedRent}
                    onChange={(e) => set('expectedRent', e.target.value.replace(/[^\d]/g, ''))}
                    inputMode="numeric"
                    placeholder="4500000"
                  />
                  <Hint $accent={Boolean(f.expectedRent)}>
                    {f.expectedRent
                      ? `${showMoney(f.expectedRent)} per unit · ${showMoney(quote.grossAnnual)} across ${quote.units} unit${quote.units === 1 ? '' : 's'}`
                      : 'Not sure? Put your best guess. We confirm it at the rental valuation.'}
                  </Hint>
                </Field>
                <Field>
                  <Label>When should we take over?</Label>
                  <Input type="date" value={f.startDate} onChange={(e) => set('startDate', e.target.value)} />
                </Field>
              </TwoCol>

              <Field>
                <Label>Anything we should know?</Label>
                <Textarea
                  value={f.description}
                  onChange={(e) => set('description', e.target.value)}
                  placeholder="Existing tenant and when their rent is due, outstanding repairs, service charge arrangements, access and keys, who currently holds the property…"
                />
              </Field>

              <Field>
                <Label>Photos &amp; video (optional)</Label>
                <Dropzone
                  type="button"
                  $active={dragActive}
                  onClick={uploadEnabled ? pickFiles : undefined}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={uploadEnabled ? onDrop : (e) => e.preventDefault()}
                >
                  <DropIcon><FaCloudUploadAlt /></DropIcon>
                  <DropTitle>
                    {uploadEnabled
                      ? (dragActive ? 'Drop your files to upload' : 'Drag photos & video here, or click to browse')
                      : 'Photos & video'}
                  </DropTitle>
                  <DropHint>
                    {uploadEnabled
                      ? 'Helps us value the rent before the visit, not required'
                      : 'Uploads unavailable. Your property manager will take photos at the visit'}
                  </DropHint>
                </Dropzone>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} />
                {media.length > 0 && (
                  <Thumbs>
                    {media.map((m) => (
                      <Thumb key={m.id}>
                        {m.kind === 'image' && m.previewUrl ? <img src={m.previewUrl} alt={m.name} /> : <FaVideo />}
                        {m.status === 'uploading' && <div className="overlay">{m.pct}%</div>}
                        {m.status === 'error' && <div className="overlay">failed</div>}
                        {m.status !== 'uploading' && (
                          <button type="button" className="act" title="Remove" onClick={() => removeMedia(m.id)}>
                            <FaTimes />
                          </button>
                        )}
                      </Thumb>
                    ))}
                  </Thumbs>
                )}
              </Field>
            </Fields>
          </Card>

          <SectionTitle><FaFileSignature /> 4. Your details &amp; management authorization</SectionTitle>
          <Card>
            <Fields>
              <TwoCol>
                <Field>
                  <Label>Full name</Label>
                  <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
                </Field>
                <Field>
                  <Label>Phone / WhatsApp</Label>
                  <Input value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+234…" />
                </Field>
              </TwoCol>
              <Field>
                <Label>Email</Label>
                <Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="you@example.com" />
              </Field>

              <Field>
                <Agreement>
                  <h4>Property management authorization</h4>
                  <p>
                    This agreement is between <strong>{signature.trim() || f.name.trim() || '[your name]'}</strong> (the
                    &ldquo;Owner&rdquo;) and <strong>EasyMoveZone Ltd</strong>. I confirm that I am the legal owner (or an
                    authorized representative of the owner) of the property at{' '}
                    <strong>{f.address.trim() || '[property address]'}</strong>, and I appoint{' '}
                    <strong>EasyMoveZone Ltd</strong> under the <strong>{selectedPlan.name}</strong> plan to:
                  </p>
                  <ul>
                    <li>market the property, conduct viewings and screen prospective tenants;</li>
                    <li>negotiate, prepare and execute tenancy agreements on my behalf;</li>
                    <li>collect rent, deposits and service charges into a designated account;</li>
                    <li>deduct the agreed management fee and remit the balance to me;</li>
                    {plan !== 'tenant_find' && <li>coordinate repairs and maintenance within the agreed approval limit;</li>}
                    <li>hold keys and access credentials for the purpose of managing the property.</li>
                  </ul>
                  <p>
                    The fee is <strong>{selectedPlan.ratePct}%</strong>
                    {selectedPlan.oneOff ? ' of the first year’s rent, charged once' : ' of rent collected'}
                    {addons.length ? `, plus the add-on services I have selected` : ''}, exclusive of VAT at {quote.vatPercent}%.
                    Fees are deducted from rent collected, so there is no up-front charge. Repairs and third-party costs are
                    for the Owner&rsquo;s account and, above the agreed limit, require my approval.
                  </p>
                  <p>
                    This is a non-exclusive appointment. Either party may terminate it in writing on 30 days notice,
                    subject to any tenancy already in place. Final terms are confirmed in the management proposal issued
                    after the property visit.
                    <br />
                    <span className="ref">EasyMoveZone Ltd manages properties for verified owners only, not for third-party agents.</span>
                  </p>
                </Agreement>

                <Check>
                  <input type="checkbox" checked={ownerConfirmed} onChange={(e) => setOwnerConfirmed(e.target.checked)} />
                  <span>I confirm I am the <strong>owner</strong> of this property (or an authorized representative), not a third-party agent.</span>
                </Check>
                <Check>
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>I have read and agree to the authorization above, and I appoint EasyMoveZone Ltd to let and manage this property.</span>
                </Check>
                {f.lettingStatus !== 'tenanted' && (
                  <Check>
                    <input type="checkbox" checked={advertise} onChange={(e) => setAdvertise(e.target.checked)} />
                    <span>
                      <strong>Optional:</strong> advertise it on the EasyMoveZone Rent page while it is vacant. Photos, area,
                      rent and features are shown; your name, contact details and the street address never are. You can
                      switch this off at any time from your console.
                    </span>
                  </Check>
                )}

                <Label>Signature {f.name.trim() && !sigTouched ? '· prefilled from your details' : '· type your full name'}</Label>
                <Signature
                  value={signature}
                  onChange={(e) => { setSigTouched(true); setSignature(e.target.value); }}
                  placeholder="Your full name"
                />
              </Field>

              <div>
                <SubmitBtn type="button" onClick={submit} disabled={!canSubmit}>
                  {submitting ? 'Submitting…' : <>Sign &amp; hand over the property <FaArrowRight size={13} /></>}
                </SubmitBtn>
                {error && <ErrorMsg>{error}</ErrorMsg>}
                <FootNote>no up-front fee · fees come out of rent collected · cancel on 30 days notice</FootNote>
              </div>
            </Fields>
          </Card>
        </div>

        <Rail>
          <QuoteCard>
            <QuoteHead>Fee estimate · {selectedPlan.name}</QuoteHead>
            <QuoteBig>{f.expectedRent ? showMoney(quote.netMonthly) : `${quote.ratePct}%`}</QuoteBig>
            <QuoteSub>
              {f.expectedRent
                ? `NET TO YOU, PER MONTH · ${quote.units} UNIT${quote.units === 1 ? '' : 'S'}`
                : 'ALL-IN RATE · ADD EXPECTED RENT FOR LOCAL-CURRENCY FIGURES'}
            </QuoteSub>

            <QuoteRows>
              <QuoteRow>
                <span>Gross rent (annual)</span>
                <b>{showMoney(quote.grossAnnual)}</b>
              </QuoteRow>
              <QuoteRow>
                <span>{selectedPlan.name} fee · {quote.planRatePct}%</span>
                <b>{showMoney((quote.grossAnnual * quote.planRatePct) / 100)}</b>
              </QuoteRow>
              {quote.addonRatePct > 0 && (
                <QuoteRow>
                  <span>Add-on services · {quote.addonRatePct}%</span>
                  <b>{showMoney((quote.grossAnnual * quote.addonRatePct) / 100)}</b>
                </QuoteRow>
              )}
              {quote.addonFlatAnnual > 0 && (
                <QuoteRow>
                  <span>Fixed-fee add-ons</span>
                  <b>{showMoney(quote.addonFlatAnnual)}</b>
                </QuoteRow>
              )}
              <QuoteRow>
                <span>VAT · {quote.vatPercent}%</span>
                <b>{showMoney(quote.vat)}</b>
              </QuoteRow>
              <QuoteRow $accent>
                <span>Net to you (annual)</span>
                <b>{showMoney(quote.netAnnual)}</b>
              </QuoteRow>
            </QuoteRows>

            <QuoteNote>
              {selectedPlan.oneOff
                ? 'Tenant Find is charged once, against the first year’s rent, so there is no ongoing fee.'
                : 'Fees are deducted from rent as it is collected, so you never pay up front.'}
              {selectedPlan.bespoke && ' Portfolio pricing is indicative. The confirmed rate comes with your proposal.'}
              {' '}Repairs and third-party costs are separate and always itemised.
            </QuoteNote>
          </QuoteCard>

          <StepsCard>
            <StepsHead>How it works</StepsHead>
            {MANAGEMENT_STEPS.map((s, i) => (
              <Step key={s.title}>
                <span className="n">{i + 1}</span>
                <div>
                  <div className="t">{s.title}</div>
                  <div className="b">{s.body}</div>
                </div>
              </Step>
            ))}
            <CrossLink to="/renovate">Property needs work first? Request a renovation <FaArrowRight size={10} /></CrossLink>
          </StepsCard>
        </Rail>
      </Split>
    </SignInGate>
  );
}

/* ─────────────────────────── Tracker ─────────────────────────── */
function ManagementTracker({ id, email }) {
  const [request, setRequest] = useState(null);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    if (!id || !email) return undefined;
    (async () => {
      try {
        const [detail, msgs] = await Promise.all([
          api.management.getById(id, email),
          api.management.messages(id, email),
        ]);
        if (!active) return;
        setRequest(detail.request);
        setMessages(msgs);
      } catch (err) {
        if (active) setError(err?.message || 'Could not load this property.');
      }
    })();
    return () => { active = false; };
  }, [id, email]);

  const send = async () => {
    const body = draft.trim();
    if (!body) return;
    setSending(true);
    try {
      const msg = await api.management.sendMessage(id, email, body);
      setMessages((m) => [...m, msg]);
      setDraft('');
    } catch (err) {
      setError(err?.message || 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  if (error && !request) return <Empty>{error}</Empty>;
  if (!request) return <Empty>Loading…</Empty>;

  const currentIndex = TIMELINE_ORDER.indexOf(request.status);
  const plan = PLAN_BY_ID[request.plan];

  return (
    <Card>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem', flexWrap: 'wrap', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 700 }}>
            {request.address}
          </div>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: 'var(--color-ink-faint)', marginTop: '0.35rem' }}>
            {request.ref} · {plan?.name || request.plan} · {request.units} unit{Number(request.units) === 1 ? '' : 's'}
            {request.manager_name ? ` · manager: ${request.manager_name}` : ''}
          </div>
        </div>
        <Pill $tone={STATUS_TONE[request.status]}>{STATUS_LABEL[request.status] || request.status}</Pill>
      </div>

      <Timeline>
        {TIMELINE_ORDER.map((s, i) => (
          <TimelineStep key={s} $done={currentIndex >= i}>
            <span className="dot">{currentIndex >= i ? <FaCheckCircle /> : i + 1}</span>
            <span>{STATUS_LABEL[s]}</span>
          </TimelineStep>
        ))}
      </Timeline>

      {(request.agreed_fee_pct != null || request.quote) && (
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', marginBottom: '1.25rem' }}>
          <Pill $tone="good">
            Fee {request.agreed_fee_pct != null ? `${Number(request.agreed_fee_pct)}% agreed` : `${request.quote?.ratePct}% indicative`}
          </Pill>
          {request.expected_rent && <Pill>Rent {money(request.expected_rent, request.currency)}/yr per unit</Pill>}
          {request.quote?.netAnnual > 0 && <Pill>Net {money(request.quote.netAnnual, request.currency)}/yr</Pill>}
        </div>
      )}

      <Label>Messages with your property manager</Label>
      <Thread>
        {messages.length === 0 && <Empty>No messages yet.</Empty>}
        {messages.map((m) => (
          <Bubble key={m.id} $mine={m.sender === 'customer'}>
            {m.body}
            <span className="when">{new Date(m.created_at).toLocaleString()}</span>
          </Bubble>
        ))}
      </Thread>
      <Composer>
        <Input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
          placeholder="Ask about the visit, the tenant, a repair…"
        />
        <SendBtn type="button" onClick={send} disabled={sending || !draft.trim()}><FaPaperPlane /></SendBtn>
      </Composer>
      {error && <ErrorMsg>{error}</ErrorMsg>}
    </Card>
  );
}

/* ─────────────────────────── My managed properties ─────────────────────────── */
function MyProperties({ user, highlightRef }) {
  const [email, setEmail] = useState(user?.email || '');
  const [lookupEmail, setLookupEmail] = useState(user?.email || '');
  const [requests, setRequests] = useState(null);
  const [loading, setLoading] = useState(false);
  const [openId, setOpenId] = useState(null);

  const load = useMemo(() => async (e) => {
    if (!e) return;
    setLoading(true);
    try {
      const list = await api.management.mine(e);
      setRequests(list);
      const match = highlightRef ? list.find((r) => r.ref === highlightRef) : null;
      setOpenId(match ? match.id : (list[0]?.id ?? null));
    } catch {
      setRequests([]);
    } finally {
      setLoading(false);
    }
  }, [highlightRef]);

  useEffect(() => { if (user?.email) load(user.email); }, [user?.email, load]);

  return (
    <SignInGate title="Sign in to see your properties" action="track the properties we manage for you">
      {!user?.email && (
        <Lookup>
          <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email you used to sign up" />
          <SendBtn type="button" onClick={() => { setLookupEmail(email); load(email); }}><FaSearch /></SendBtn>
        </Lookup>
      )}

      {loading ? (
        <Empty>Loading your properties…</Empty>
      ) : requests == null ? (
        <Empty>Enter your email to see the properties we manage for you.</Empty>
      ) : requests.length === 0 ? (
        <Empty>
          No handover in progress. Add a property and it will show up here while we onboard it.
        </Empty>
      ) : (
        requests.map((r) => (
          <div key={r.id} style={{ marginBottom: '0.85rem' }}>
            {openId === r.id ? (
              <ManagementTracker id={r.id} email={lookupEmail || user?.email} />
            ) : (
              <RequestRow type="button" onClick={() => setOpenId(r.id)}>
                <div>
                  <div className="title">{r.address}</div>
                  <div className="meta">
                    {r.ref} · {PLAN_BY_ID[r.plan]?.name || r.plan} · {r.city ? `${r.city}, ` : ''}{r.state}
                    {Number(r.unread) > 0 ? ` · ${r.unread} new message${Number(r.unread) === 1 ? '' : 's'}` : ''}
                  </div>
                </div>
                <Pill $tone={STATUS_TONE[r.status]}>{STATUS_LABEL[r.status] || r.status}</Pill>
              </RequestRow>
            )}
          </div>
        ))
      )}
    </SignInGate>
  );
}

/* ─────────────────────── Console sections ─────────────────────── */

/**
 * "Add a property" — the hand-over flow, its post-submission tracker, and the
 * questions owners ask before signing. This was the whole of the old `/manage`
 * marketing page; inside the console it is one sub-page among several.
 */
export function AddPropertySection({ user }) {
  const [done, setDone] = useState(null);

  if (done) {
    return (
      <>
        <Card>
          <Success initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SuccessIcon><FaCheckCircle /></SuccessIcon>
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>
              Property received. Reference {done.ref}
            </div>
            <p style={{ color: 'var(--color-ink-muted)', maxWidth: 520, margin: '0 auto 1.5rem', lineHeight: 1.55 }}>
              Thanks{done.name ? `, ${done.name.split(' ')[0]}` : ''}. Your signed authorization is on file. A property
              manager will call to book the management visit and rental valuation, then send your proposal with the
              confirmed fee. Track it and message us below.
            </p>
          </Success>
          <ManagementTracker id={done.id} email={done.email} />
          <SubmitBtn
            type="button"
            style={{ maxWidth: 300, margin: '1.5rem auto 0' }}
            onClick={() => setDone(null)}
          >
            Hand over another property
          </SubmitBtn>
        </Card>
        <ManageFaqs />
      </>
    );
  }

  return (
    <>
      <OnboardFlow user={user} onDone={setDone} />
      <ManageFaqs />
    </>
  );
}

/** The handovers an owner has in flight, alongside the managed-property roll-up. */
export function MyPropertiesSection({ user, highlightRef }) {
  return (
    <Card>
      <SectionTitle style={{ marginTop: 0 }}><FaRegClock /> Handovers in progress</SectionTitle>
      <MyProperties user={user} highlightRef={highlightRef} />
    </Card>
  );
}

function ManageFaqs() {
  return (
    <Card style={{ marginTop: '1.15rem' }}>
      <SectionTitle style={{ marginTop: 0 }}><FaShieldAlt /> Questions owners ask us</SectionTitle>
      <FaqGrid>
        {FAQS.map((item) => (
          <Faq key={item.q}>
            <div className="q">{item.q}</div>
            <div className="a">{item.a}</div>
          </Faq>
        ))}
      </FaqGrid>
    </Card>
  );
}
