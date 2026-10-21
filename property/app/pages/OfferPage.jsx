import React, { useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion } from 'framer-motion';
import {
  Routes, Route, Navigate, Link, useSearchParams, useNavigate, useLocation,
} from 'react-router-dom';
import {
  FaArrowRight, FaCheckCircle, FaCloudUploadAlt, FaTimes, FaVideo,
  FaStar, FaRegStar, FaClock, FaFileSignature, FaMagic, FaCamera,
  FaHandHoldingUsd, FaCoins, FaShieldAlt,
} from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import {
  BRAND, OFFER_ANALYZE_URL, OFFER_VERIFY_URL, MANAGE_OFFERS_URL, PURCHASE_DAYS,
} from '../config/platform';
import { COUNTRY_SUGGESTIONS, CURRENCY, CURRENCY_LABEL, DEFAULT_COUNTRY } from '../config/markets';
import PhotoAnalyzer from '../components/PhotoAnalyzer';
import PropertySwitch from '../components/PropertySwitch';
import { FormSections, FormSection } from '../components/FormSection';
import TitleDocuments, { titleDocumentsPayload } from '../components/TitleDocuments';
import { Stagger, staggerItem } from '../components/motion';
import { PropertyVerificationForm } from './VerifyPropertyPage';
import { SpotArt } from '../components/graphics';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/shadcn/accordion';
import { useIsMobile } from '../utils/useMediaQuery';

/**
 * Verify — two evidence tools (route: /verify).
 *
 * Each tool has a distinct URL so visitors can open and share it directly:
 *
 *   /verify                 full Property Passport verification
 *   /verify/photo-scan      AI photo analysis
 *
 * A submission lands at `status = 'submitted'` and is invisible to the public.
 * It only reaches the marketplace if EasyMoveZone buys it, or if the owner ticked
 * the optional public-listing consent — and in both cases only after an admin
 * approves it. See `server/routes/listings.js`.
 */

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
`;

const STORAGE_KEY = 'emz_seller_requests';

function saveSellerRequest(entry) {
  try {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
    all.unshift({ ...entry, id: Date.now(), submittedAt: new Date().toISOString() });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(all.slice(0, 20)));
  } catch { /* ignore */ }
}

const Page = styled.div`
  background: var(--color-bg);
`;

/* ── Hero ─────────────────────────────────────────── */
const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(1000px 460px at 85% -10%, rgba(47, 93, 80, 0.16), transparent 70%),
    linear-gradient(180deg, var(--color-green-wash) 0%, #ffffff 92%);
  border-bottom: 1px solid var(--color-line);
  padding: 2rem 2.5rem 1.5rem;
  @media (max-width: 720px) {
    padding: 0.85rem 1rem 0.8rem;
    background: var(--color-green-wash);
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: var(--container);
  margin: 0 auto;

  /* The phone's picture: a small drawing beside the heading. */
  .spot { position: absolute; right: 0; top: 2.4rem; width: 84px; }
  @media (max-width: 720px) { h1 { padding-right: 90px; } }
`;

const StatusPill = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.55rem 1.1rem;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.7);
  font-family: var(--font-mono);
  font-size: 0.76rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-ink-muted);
  margin-bottom: 0.9rem;

  @media (max-width: 720px) { font-size: 0.61rem; padding: 0; margin-bottom: 0.4rem; background: transparent; }
`;

const LiveDot = styled.span`
  width: 9px; height: 9px;
  border-radius: 50%;
  background: var(--color-green-bright);
  animation: ${pulse} 1.8s ease-in-out infinite;
`;

const H1 = styled.h1`
  font-family: var(--font-display);
  font-size: clamp(1.65rem, 2.7vw, 2.25rem);
  font-weight: 600;
  letter-spacing: -0.02em;
  line-height: 1.15;
  max-width: 900px;
  margin: 0 0 1.1rem;

  span { color: var(--color-green-ink); }

  @media (max-width: 720px) { font-size: 1.4rem; line-height: 1.12; margin: 0 0 0.4rem; }
`;

const Lede = styled.p`
  font-size: 0.98rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
  max-width: 640px;
  margin: 0;

  @media (max-width: 720px) { display: none; }
`;

const OnlyDesktop = styled.span`
  @media (max-width: 720px) { display: none; }
`;
const OnlyMobile = styled.span`
  display: none;
  @media (max-width: 720px) { display: inline; }
`;

/* ── The other tool, as one quiet link (it used to be a two-tab switch) ── */
const SwitchLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  margin-top: 0.9rem;
  font-size: 0.88rem;
  font-weight: 600;
  color: var(--color-green-deep);

  svg { font-size: 0.75rem; transition: transform 0.15s ease; }
  &:hover svg { transform: translateX(3px); }
  @media (max-width: 720px) { margin-top: 0.5rem; font-size: 0.84rem; }
`;

/* ── Analyze panel ────────────────────────────────── */
const AnalyzeShell = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 2.25rem 3.5rem 4.5rem;
  @media (max-width: 720px) { padding: 1.5rem 1.25rem 3rem; }
`;

const VerifyShell = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 0 3.5rem 4.5rem;
  @media (max-width: 720px) { padding: 0 1.25rem 3rem; }
`;

const AnalyzeWindow = styled.div`
  border: 1px solid rgba(13, 17, 23, 0.1);
  border-radius: 18px;
  overflow: hidden;
  background: var(--color-bg-panel);
  box-shadow: 0 18px 48px rgba(13, 17, 23, 0.1);
`;

const AnalyzeChrome = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1.2rem;
  background: #e7eaee;
  border-bottom: 1px solid rgba(13, 17, 23, 0.08);
  flex-wrap: wrap;
`;

const Dots = styled.div`
  display: flex;
  gap: 0.4rem;
  span { width: 11px; height: 11px; border-radius: 50%; }
`;

const ChromeTitle = styled.div`
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  letter-spacing: 0.02em;
`;

const AnalyzeBody = styled.div`
  padding: 1.75rem 1.7rem 2rem;
  @media (max-width: 560px) { padding: 1.25rem 1.1rem 1.5rem; }

  --color-bg-sunken: #f2f5f2;
  --color-bg-panel: #ffffff;
  --color-line: rgba(27, 35, 30, 0.08);
  --color-line-strong: rgba(27, 35, 30, 0.16);
  --color-ink: #1b231e;
  --color-ink-muted: #626b60;
  --color-ink-faint: #8a9990;
  --color-green-soft: #e5efeb;

  color: var(--color-ink);
  font-size: 1.02rem;

  textarea { color: var(--color-ink); background: var(--color-bg-sunken); border-color: var(--color-line-strong); }
  textarea:focus { background: #fff; border-color: var(--color-green); }
  button { font-family: inherit; font-size: 1rem; }
`;

const AnalyzeIntro = styled.p`
  font-size: 1.02rem;
  color: var(--color-ink-muted);
  line-height: 1.55;
  margin: 0 0 1.5rem;
  max-width: 58ch;
  span { color: var(--color-green-deep); font-weight: 700; margin-right: 0.35rem; }
`;

const AnalyzeToOffer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1.5rem;
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: var(--color-green-soft, #e7f6ee);
  border: 1px solid rgba(47, 93, 80, 0.2);
  font-size: 0.92rem;
  color: var(--color-ink);
`;

const GhostGoBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-green-deep);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.7rem 1.25rem;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  white-space: nowrap;
  &:hover { opacity: 0.85; }
`;

/* ── Intent picker ────────────────────────────────── */
const IntentGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 0.85rem;
  margin-bottom: 1.75rem;
  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); gap: 0.65rem; }
`;

const IntentCard = styled.button`
  text-align: left;
  border-radius: 16px;
  border: 2px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? 'var(--color-green-soft)' : '#fff')};
  padding: 1.15rem 1.2rem;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;

  &:hover { border-color: var(--color-green); }

  .ic {
    width: 34px; height: 34px; border-radius: 10px;
    display: flex; align-items: center; justify-content: center;
    background: ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-green-chip)')};
    color: ${(p) => (p.$on ? '#fff' : 'var(--color-green-deep)')};
    font-size: 0.95rem;
    margin-bottom: 0.65rem;
  }
  .t { font-family: var(--font-display); font-size: 1.02rem; font-weight: 700; letter-spacing: -0.01em; color: var(--color-ink); margin-bottom: 0.3rem; }
  .d { font-size: 0.84rem; line-height: 1.45; color: var(--color-ink-muted); }
`;

/* ── Body grid ────────────────────────────────────── */
const Body = styled.section`
  max-width: var(--container);
  margin: 0 auto;
  padding: 2.5rem 2.5rem 5rem;
  display: grid;
  /* minmax(0, …): a bare 1fr track never shrinks below its widest child,
     which pushed the form past the right edge on phones. */
  grid-template-columns: minmax(0, 1.35fr) minmax(0, 1fr);
  gap: 2rem;
  align-items: start;

  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 720px) { padding: 1.75rem 1.25rem 4rem; }
`;

const FormCard = styled.div`
  min-width: 0;
  background: #fff;
  border-radius: 24px;
  padding: 2.5rem;
  box-shadow: var(--shadow-lift);
  @media (max-width: 720px) { padding: 1.25rem; border-radius: 18px; }
`;

const StepRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 2rem;
`;

const StepLabel = styled.span`
  font-family: var(--font-mono);
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  color: var(--color-green-ink);
  white-space: nowrap;
`;

const StepBar = styled.div`
  flex: 1;
  height: 6px;
  border-radius: 999px;
  background: var(--color-bg);
  overflow: hidden;
  div { height: 100%; width: ${(p) => p.$pct || 50}%; background: var(--color-green); }
`;

const FormTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 1.7rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  margin: 0 0 1.75rem;

  @media (max-width: 720px) { font-size: 1.3rem; margin: 0 0 1.25rem; }
`;

const Fields = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.4rem;
`;

const TwoCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  @media (max-width: 520px) { grid-template-columns: minmax(0, 1fr); }
`;

const ThreeCol = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
  @media (max-width: 520px) { grid-template-columns: 1fr 1fr; }
`;

const Field = styled.div``;

const Label = styled.label`
  display: block;
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-ink-soft);
  margin-bottom: 0.5rem;
`;

const inputCss = `
  width: 100%;
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong);
  border-radius: 12px;
  padding: 0.95rem 1.1rem;
  font-family: var(--font-sans);
  font-size: 0.98rem;
  color: var(--color-ink);
  outline: none;
  transition: border-color 0.15s, background 0.15s;
  &:focus { border-color: var(--color-green); background: #fff; }
`;

const Input = styled.input`${inputCss}`;
const Select = styled.select`${inputCss} cursor: pointer;`;
const Textarea = styled.textarea`
  ${inputCss}
  min-height: 110px;
  resize: vertical;
  line-height: 1.5;
`;

/* ── AI description assist ────────────────────────── */
const AssistPanel = styled.div`
  border: 1px solid rgba(47, 93, 80, 0.22);
  background: linear-gradient(180deg, #f3f6f1 0%, #fff 72%);
  border-radius: 16px;
  padding: 1.15rem 1.2rem 1.25rem;
`;

const AssistHead = styled.div`
  display: flex;
  align-items: center;
  gap: 0.55rem;
  margin-bottom: 0.35rem;
  font-family: var(--font-display);
  font-size: 1rem;
  font-weight: 700;
  color: var(--color-ink);
  svg { color: var(--color-green); font-size: 0.9rem; }
`;

const AssistSub = styled.div`
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  line-height: 1.45;
  margin-bottom: 1rem;
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-bottom: 0.9rem;
`;

const FeatureChip = styled.button`
  border: 1px solid ${(p) => (p.$on ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$on ? 'var(--color-green)' : '#fff')};
  color: ${(p) => (p.$on ? '#fff' : 'var(--color-ink-muted)')};
  border-radius: 999px;
  padding: 0.42rem 0.8rem;
  font-family: var(--font-sans);
  font-size: 0.78rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.13s;
  &:hover { border-color: var(--color-green); color: ${(p) => (p.$on ? '#fff' : 'var(--color-green-deep)')}; }
`;

const AssistBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  background: var(--color-green-deep);
  color: #fff;
  border: none;
  border-radius: 999px;
  padding: 0.75rem 1.3rem;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 0.88rem;
  cursor: pointer;
  transition: opacity 0.15s;
  &:hover:not(:disabled) { opacity: 0.85; }
  &:disabled { opacity: 0.5; cursor: not-allowed; }
  svg { color: var(--color-green-mint, #b9d3c9); }
`;

const AssistNote = styled.div`
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: ${(p) => (p.$err ? '#b91c1c' : 'var(--color-green-ink)')};
  margin-top: 0.6rem;
`;

/* ── Media requirement meter ──────────────────────── */
const MediaReq = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-top: 0.9rem;
`;

const ReqPill = styled.div`
  border: 1px solid ${(p) => (p.$done ? 'rgba(47, 93, 80,0.35)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$done ? 'var(--color-green-soft)' : 'var(--color-bg-sunken)')};
  border-radius: 12px;
  padding: 0.7rem 0.85rem;

  .top {
    display: flex; align-items: center; justify-content: space-between;
    font-family: var(--font-mono); font-size: 0.66rem; letter-spacing: 0.05em;
    color: ${(p) => (p.$done ? 'var(--color-green-deep)' : 'var(--color-ink-soft)')};
    margin-bottom: 0.45rem;
    svg { font-size: 0.75rem; }
  }
  .bar {
    height: 5px; border-radius: 999px; background: var(--color-line-strong); overflow: hidden;
    div { height: 100%; background: var(--color-green); border-radius: 999px; transition: width 0.25s; }
  }
`;

/* ── Upload ───────────────────────────────────────── */
const Dropzone = styled.button`
  width: 100%;
  border: 2px dashed ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
  border-radius: 16px;
  background: ${(p) => (p.$active ? '#f3f6f1' : 'var(--color-bg-sunken)')};
  padding: 1.75rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  &:hover { border-color: var(--color-green); background: #f3f6f1; }
`;

const DropIcon = styled.div`
  width: 48px; height: 48px;
  margin: 0 auto 0.75rem;
  border-radius: 13px;
  background: var(--color-green-chip);
  color: var(--color-green-deep);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.35rem;
`;

const DropTitle = styled.div` font-size: 0.98rem; font-weight: 700; margin-bottom: 0.25rem; color: var(--color-ink); `;
const DropHint = styled.div` font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); `;

const UploadBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
  margin: 0.9rem 0 0.5rem;
  font-size: 0.8rem;
  color: var(--color-ink-muted);
  .count { font-weight: 700; color: var(--color-ink); }
  .add {
    font-family: var(--font-mono);
    font-size: 0.72rem;
    color: var(--color-green-ink);
    background: none; border: none; cursor: pointer; padding: 0;
    &:hover { color: var(--color-green-deep); }
  }
`;

const Thumbs = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(96px, 1fr));
  gap: 0.65rem;
`;

const Thumb = styled.div`
  position: relative;
  aspect-ratio: 1;
  border-radius: 12px;
  overflow: hidden;
  background: ${(p) => p.$bg || 'linear-gradient(135deg, var(--color-bg-slate), var(--color-green-wash))'};
  border: 2px solid ${(p) => (p.$cover ? 'var(--color-green)' : 'var(--color-line-strong)')};
  display: flex; align-items: center; justify-content: center;
  color: var(--color-ink-faint);
  font-size: 1.3rem;

  img { width: 100%; height: 100%; object-fit: cover; }

  .cover-badge {
    position: absolute; top: 5px; left: 5px;
    display: inline-flex; align-items: center; gap: 0.25rem;
    font-family: var(--font-mono); font-size: 0.55rem; font-weight: 600;
    color: #fff; background: var(--color-green);
    padding: 0.16rem 0.4rem; border-radius: 6px;
  }
  .kind {
    position: absolute; bottom: 5px; left: 6px;
    font-family: var(--font-mono); font-size: 0.55rem; color: #fff;
    text-shadow: 0 1px 3px rgba(0,0,0,0.6);
  }
  .overlay {
    position: absolute; inset: 0;
    background: rgba(27, 35, 30, 0.62);
    display: flex; align-items: center; justify-content: center;
    font-family: var(--font-mono); font-size: 0.72rem; color: #fff;
  }
  .err { background: rgba(185,28,28,0.65); }
  .actions { position: absolute; top: 4px; right: 4px; display: flex; gap: 4px; }
  .act {
    width: 22px; height: 22px;
    border-radius: 50%; border: none;
    background: rgba(27, 35, 30, 0.75); color: #fff;
    display: flex; align-items: center; justify-content: center;
    font-size: 0.6rem; cursor: pointer;
    &:hover { background: var(--color-green); }
  }
`;

const Section = styled.div`
  border-top: 1px solid var(--color-line-strong);
  padding-top: 1.5rem;
`;

const SectionTitle = styled.h3`
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0 0 1.15rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  svg { color: var(--color-green); font-size: 1rem; }
`;

/* ── Authorization / consent ──────────────────────── */
const Agreement = styled.div`
  background: var(--color-bg-sunken);
  border: 1px solid var(--color-line-strong);
  border-radius: 14px;
  padding: 1.15rem 1.25rem;
  max-height: 210px;
  overflow-y: auto;
  font-size: 0.84rem;
  line-height: 1.6;
  color: var(--color-ink-muted);
  margin-bottom: 1.1rem;

  h4 { font-family: var(--font-mono); font-size: 0.72rem; letter-spacing: 0.06em; text-transform: uppercase; color: var(--color-ink); margin: 0 0 0.6rem; }
  ul { margin: 0.5rem 0 0.5rem 1.1rem; padding: 0; }
  li { margin-bottom: 0.3rem; }
  strong { color: var(--color-ink); }
  .ref { font-family: var(--font-mono); font-size: 0.72rem; color: var(--color-ink-faint); }
`;

const Check = styled.label`
  display: flex;
  align-items: flex-start;
  gap: 0.65rem;
  font-size: 0.88rem;
  color: var(--color-ink);
  line-height: 1.45;
  margin-bottom: 0.9rem;
  cursor: pointer;

  input { width: 18px; height: 18px; margin-top: 0.1rem; accent-color: var(--color-green); flex-shrink: 0; cursor: pointer; }
`;

const SignRow = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const SignField = styled.div`
  flex: 1;
  min-width: 200px;
`;

const Signature = styled.input`
  ${inputCss}
  font-family: var(--font-display);
  font-size: 1.1rem;
  letter-spacing: 0.01em;
`;

const SubmitBtn = styled.button`
  width: 100%;
  margin-top: 0.25rem;
  background: var(--color-green-deep);
  color: #fff;
  border: none;
  padding: 1.15rem;
  border-radius: 999px;
  font-family: var(--font-sans);
  font-weight: 700;
  font-size: 1.05rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.6rem;
  transition: background 0.15s;
  &:hover:not(:disabled) { background: var(--color-green-forest); }
  &:disabled { opacity: 0.55; cursor: not-allowed; }
`;

const FootNote = styled.div`
  font-family: var(--font-mono);
  font-size: 0.72rem;
  color: var(--color-ink-faint);
  text-align: center;
  margin-top: 0.9rem;
`;

const ErrorMsg = styled.p`
  color: #b91c1c;
  font-size: 0.86rem;
  margin: 0.5rem 0 0;
  text-align: center;
`;

/* ── Right rail ───────────────────────────────────── */
const Rail = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  position: sticky;
  top: calc(var(--nav-h) + 1.5rem);
  /* Stacked, the 'why sell with us' panel comes first: it is what a seller
     reads before deciding to fill the form in. */
  @media (max-width: 960px) { position: static; order: -1; }
`;

const PreviewCard = styled.div`
  background: #fff;
  border-radius: 24px;
  padding: 1.85rem 2rem;
  box-shadow: var(--shadow-lift);
  /* Once the rail stacks under the form, a live preview of what you just
     typed is only more scrolling, so it is a side-by-side feature only. */
  @media (max-width: 960px) { display: none; }
`;

const PreviewChrome = styled.div`
  text-align: center;
  font-size: 0.7rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-ink-faint);
  border-bottom: 1px solid var(--color-line);
  padding-bottom: 1.1rem;
  margin-bottom: 1.25rem;
`;

const PreviewImage = styled.div`
  aspect-ratio: 16 / 10;
  border-radius: 14px;
  overflow: hidden;
  margin-bottom: 1.1rem;
  background: ${(p) => (p.$src ? `var(--color-bg-slate) url(${p.$src}) center/cover no-repeat` : 'linear-gradient(135deg, var(--color-bg-slate), var(--color-green-wash))')};
  display: flex; align-items: center; justify-content: center;
  color: var(--color-ink-faint);
  font-family: var(--font-mono);
  font-size: 0.7rem;
`;

const PreviewTitle = styled.div`
  font-family: var(--font-display);
  font-size: 1.15rem;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin-bottom: 0.15rem;
`;

const PreviewRegion = styled.div`
  font-size: 0.84rem;
  color: var(--color-ink-muted);
  margin-bottom: 1.1rem;
`;

const PreviewGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
`;

const PreviewCell = styled.div`
  border: 1px solid var(--color-line-strong);
  border-radius: 12px;
  padding: 0.9rem;
  .k { font-family: var(--font-mono); font-size: 0.66rem; color: var(--color-ink-faint); margin-bottom: 0.4rem; }
  .v { font-family: var(--font-display); font-size: 1rem; font-weight: 700; color: ${(p) => (p.$accent ? 'var(--color-green-ink)' : 'var(--color-ink)')}; }
`;

const WhyCard = styled.div`
  background: linear-gradient(140deg, var(--color-green-deep) 0%, var(--color-green-forest) 100%);
  border-radius: var(--radius-xl);
  padding: 1.85rem 2rem;
  color: #fff;
  box-shadow: 0 24px 48px -26px rgba(35, 75, 64, 0.6);
  @media (max-width: 720px) { padding: 1.35rem; border-radius: 18px; }
`;

const WhyHead = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c9dcd3; /* light mint: this panel stays deep green */
  margin-bottom: 1.25rem;
`;

const Perks = styled.div` display: flex; flex-direction: column; gap: 1.15rem; `;
const Perk = styled.div` display: flex; gap: 0.9rem; align-items: flex-start; `;
const PerkIcon = styled.div`
  flex-shrink: 0;
  width: 30px; height: 30px;
  border-radius: 9px;
  background: rgba(110, 231, 164, 0.18);
  color: #c9dcd3;
  display: flex; align-items: center; justify-content: center;
  font-size: 0.85rem;
`;
const PerkTitle = styled.div` font-family: var(--font-display); font-size: 1rem; font-weight: 700; margin-bottom: 0.2rem; `;
const PerkBody = styled.div` font-size: 0.9rem; color: rgba(255, 255, 255, 0.78); line-height: 1.4; `;

/* ── Success ──────────────────────────────────────── */
const Success = styled(motion.div)`
  text-align: center;
  padding: 2.5rem 1rem;
`;

const SuccessIcon = styled.div`
  width: 64px; height: 64px;
  border-radius: 50%;
  background: var(--color-green-soft);
  color: var(--color-green);
  display: flex; align-items: center; justify-content: center;
  font-size: 1.7rem;
  margin: 0 auto 1.25rem;
`;

const ReviewSteps = styled.div`
  display: flex; flex-direction: column; gap: 0.75rem;
  max-width: 360px; margin: 1.75rem auto 0; text-align: left;
`;

const ReviewStep = styled.div`
  display: flex; align-items: center; gap: 0.75rem;
  font-size: 0.9rem; color: var(--color-ink-muted);
  .dot {
    width: 26px; height: 26px; border-radius: 50%; flex-shrink: 0;
    display: flex; align-items: center; justify-content: center; font-size: 0.7rem;
    background: ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-bg-panel)')};
    color: ${(p) => (p.$active ? '#fff' : 'var(--color-ink-faint)')};
    border: 1px solid ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
  }
  strong { color: var(--color-ink); }
`;

const PERKS = [
  { icon: '✓', title: `Sold in ${PURCHASE_DAYS} days`, body: `Choose a EasyMoveZone offer and we inspect the property and verify the title, then make you a firm offer. Accept it and we complete the purchase within ${PURCHASE_DAYS} days of verification. No viewings, no waiting for a buyer.` },
  { icon: '✓', title: 'You decide who sees it', body: 'Nothing is published unless you ask for it. Every case is reviewed one-to-one, and a public listing needs both your say-so and our approval.' },
  { icon: '✓', title: 'Renovate before you sell', body: 'If it adds value, we can offer to renovate first, so you see the estimate and the projected uplift before agreeing.' },
];

const MIN_PHOTOS = 10;
const MIN_VIDEOS = 2;
const MAX_FILES = 30;

const PROPERTY_TYPES = [
  'Detached house',
  'Semi-detached house',
  'Terrace / townhouse',
  'Apartment / flat',
  'Duplex',
  'Bungalow',
  'Land / plot',
  'Commercial',
  'Other',
];

const FEATURE_OPTIONS = [
  'Fitted kitchen',
  'All rooms en-suite',
  'BQ / staff quarters',
  'Swimming pool',
  'Gym',
  '24/7 power / inverter',
  'Solar panels',
  'Borehole water',
  'Gated estate',
  '24/7 security',
  'CCTV',
  'Ample parking',
  'Balcony / terrace',
  'Garden / green area',
  'Smart home',
  'Elevator',
  'Waterfront',
  'Newly built',
  'Serviced',
  'C of O / verified title',
];

/* The EasyMoveZone offer comes first: it is the fastest, surest way to sell. */
const INTENTS = [
  {
    id: 'buyout',
    icon: FaCoins,
    title: 'Sell it to EasyMoveZone',
    desc: `We inspect it and verify the title, then make you a firm offer. Accept it and we complete the purchase within ${PURCHASE_DAYS} days.`,
  },
  {
    id: 'private',
    icon: FaHandHoldingUsd,
    title: 'List it for sale',
    desc: 'We agree the price with you and market it to buyers, published only after our review and with your authorization.',
  },
];

function AnalyzeTab() {
  const navigate = useNavigate();
  const [health, setHealth] = useState(null);

  useEffect(() => {
    let active = true;
    api.engineHealth().then((h) => { if (active) setHealth(h); });
    return () => { active = false; };
  }, []);

  const online = health ? health.online !== false : null;
  const statusLabel = health === null ? 'checking…' : online ? 'engine online' : 'engine offline';

  return (
    <AnalyzeShell>
      <AnalyzeWindow>
        <AnalyzeChrome>
          <Dots>
            <span style={{ background: '#ff5f57' }} />
            <span style={{ background: '#febc2e' }} />
            <span style={{ background: '#28c840' }} />
          </Dots>
          <ChromeTitle>Photo scan · condition · quality · risk flags</ChromeTitle>
          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: online ? '#426f62' : '#9aa3ad' }}>
            {statusLabel}
          </span>
        </AnalyzeChrome>

        <AnalyzeBody>
          <AnalyzeIntro>
            <span>✓</span> Upload property photos for a fast read of visible condition,
            image quality and risk flags. No account is required.
          </AnalyzeIntro>
          <PhotoAnalyzer allowNotes />
          <AnalyzeToOffer>
            <span>Need proof beyond the photos? Move on to the full property verification.</span>
            <GhostGoBtn type="button" onClick={() => navigate(OFFER_VERIFY_URL)}>
              Verify this property <FaArrowRight size={11} />
            </GhostGoBtn>
          </AnalyzeToOffer>
        </AnalyzeBody>
      </AnalyzeWindow>
    </AnalyzeShell>
  );
}

function VerifyTab() {
  return (
    <VerifyShell>
      <PropertyVerificationForm embedded />
    </VerifyShell>
  );
}

export function OfferForm() {
  const { user } = useAuth();
  const [params] = useSearchParams();

  const [intent, setIntent] = useState('buyout');
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const mobile = useIsMobile();
  const [media, setMedia] = useState([]);
  const [uploadEnabled, setUploadEnabled] = useState(true);

  const [insight] = useState(() => {
    const area = params.get('area');
    if (!area) return null;
    return {
      area,
      region: params.get('region') || '',
      score: params.get('score') ? Number(params.get('score')) : null,
      grade: params.get('grade') || '',
    };
  });

  useEffect(() => {
    let active = true;
    api.getMediaConfig().then((c) => active && setUploadEnabled(!!c.enabled)).catch(() => {});
    return () => { active = false; };
  }, []);

  const [f, setF] = useState({
    address: params.get('area') || '',
    country: DEFAULT_COUNTRY,
    currency: CURRENCY,
    type: 'Detached house',
    typeOther: '',
    beds: '',
    baths: '',
    size: '',
    price: '',
    desc: '',
    name: user?.name || '',
    phone: '',
    email: user?.email || '',
  });

  const [features, setFeatures] = useState([]);
  const [titleDocs, setTitleDocs] = useState([]);
  const [extraFeature, setExtraFeature] = useState('');
  const [aiBusy, setAiBusy] = useState(false);
  const [aiNote, setAiNote] = useState(null);

  const [ownerConfirmed, setOwnerConfirmed] = useState(false);
  const [publishConsent, setPublishConsent] = useState(false);
  const [consent, setConsent] = useState(false);
  const [signature, setSignature] = useState(user?.name || '');
  const [sigTouched, setSigTouched] = useState(false);

  useEffect(() => {
    if (!sigTouched) setSignature(f.name);
  }, [f.name, sigTouched]);

  const set = (key, val) => setF((prev) => ({ ...prev, [key]: val }));

  const resolvedType = f.type === 'Other' ? (f.typeOther.trim() || 'Other') : f.type;

  const toggleFeature = (feat) => setFeatures((prev) => (
    prev.includes(feat) ? prev.filter((x) => x !== feat) : [...prev, feat]
  ));

  const photoCount = media.filter((x) => x.status === 'done' && x.kind === 'image').length;
  const videoCount = media.filter((x) => x.status === 'done' && x.kind === 'video').length;
  const mediaReady = !uploadEnabled || (photoCount >= MIN_PHOTOS && videoCount >= MIN_VIDEOS);

  const canSubmit = f.address.trim() && f.country.trim() && f.currency && f.name.trim() && (f.phone.trim() || f.email.trim())
    && ownerConfirmed && consent && signature.trim().length >= 2 && mediaReady
    && (intent !== 'private' || publishConsent);

  const generateDescription = async () => {
    setAiBusy(true);
    setAiNote(null);
    try {
      const { description } = await api.generateListingDescription({
        type: resolvedType,
        location: f.address,
        beds: f.beds,
        baths: f.baths,
        size: f.size,
        features,
        extra: extraFeature,
      });
      set('desc', description);
      setAiNote({ text: 'Draft ready below. Edit it until it sounds like you.' });
    } catch (err) {
      setAiNote({ err: true, text: err?.message || 'Could not draft a description. Please try again.' });
    } finally {
      setAiBusy(false);
    }
  };

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
          prefix: 'offer',
          onProgress: (pct) => setMedia((m) => m.map((x) => (x.id === id ? { ...x, pct } : x))),
        });
        setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'done', url: blobUrl, pct: 100 } : x)));
      } catch {
        setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'error' } : x)));
      }
    }
  };

  const onFiles = async (e) => {
    // Copy first: in Chrome the FileList is live, and clearing the input
    // (so the same file can be picked again) would empty it.
    const list = Array.from(e.target.files || []);
    e.target.value = '';
    await uploadFiles(list);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer?.files?.length) uploadFiles(e.dataTransfer.files);
  };

  const makeCover = (id) => setMedia((m) => {
    const idx = m.findIndex((x) => x.id === id);
    if (idx <= 0) return m;
    const next = [...m];
    const [item] = next.splice(idx, 1);
    next.unshift(item);
    return next;
  });

  const removeMedia = async (id) => {
    const item = media.find((x) => x.id === id);
    if (!item) return;
    if (item.previewUrl) URL.revokeObjectURL(item.previewUrl);
    if (item.status !== 'done' || !item.url) {
      setMedia((m) => m.filter((x) => x.id !== id));
      return;
    }
    setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'deleting' } : x)));
    try {
      await api.deleteMedia(item.url);
      setMedia((m) => m.filter((x) => x.id !== id));
    } catch {
      setMedia((m) => m.map((x) => (x.id === id ? { ...x, status: 'done' } : x)));
      setError('Could not delete that file. Please try again.');
    }
  };

  const uploadedCount = media.filter((x) => x.status === 'done').length;
  const coverSrc = media.find((x) => x.status === 'done' && x.kind === 'image')?.previewUrl
    || media.find((x) => x.previewUrl)?.previewUrl
    || null;

  const intentMeta = INTENTS.find((i) => i.id === intent) || INTENTS[0];

  const docsUploading = titleDocs.some((d) => d.files.some((x) => x.status === 'uploading'));

  const submit = async () => {
    if (docsUploading) {
      setError('Wait a moment for your documents to finish uploading.');
      return;
    }
    if (!canSubmit) {
      if (!mediaReady) {
        setError(`Please upload at least ${MIN_PHOTOS} photos and ${MIN_VIDEOS} videos of the property (you have ${photoCount} photo${photoCount === 1 ? '' : 's'} and ${videoCount} video${videoCount === 1 ? '' : 's'}).`);
      } else {
        setError('Please complete the required fields and sign the authorization.');
      }
      return;
    }
    setSubmitting(true);
    setError('');
    try {
      const uploaded = media.filter((x) => x.status === 'done' && x.url).map((x) => ({ url: x.url, kind: x.kind }));
      await api.submitListing({
        title: f.address,
        address: f.address,
        country: f.country,
        currency: f.currency,
        area: insight?.area || null,
        type: resolvedType,
        listing: 'EasyOffer',
        intent,
        beds: f.beds,
        baths: f.baths,
        size: f.size,
        features,
        price: f.price,
        description: f.desc,
        media: uploaded,
        titleDocuments: titleDocumentsPayload(titleDocs),
        insight: insight || null,
        contactName: f.name,
        contactEmail: f.email,
        phone: f.phone,
        ownerConfirmed: true,
        consent: true,
        publishConsent,
        consentName: signature.trim(),
      });
      saveSellerRequest({
        email: f.email,
        address: f.address,
        situation: `${intentMeta.title} · ${resolvedType}`,
        guidePrice: f.price,
        status: 'Pending review',
      });
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      setError(err?.message || 'Could not submit. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Body>
      <FormCard>
        {submitted ? (
          <Success initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <SuccessIcon><FaCheckCircle /></SuccessIcon>
            <FormTitle style={{ marginBottom: '0.5rem' }}>Submitted</FormTitle>
            <Lede style={{ margin: '0 auto', fontSize: '1rem' }}>
              Thanks{f.name ? `, ${f.name.split(' ')[0]}` : ''}. Your signed request is with our advisors
              {f.email ? <>. Track it and message us from <strong>My deals</strong>.</> : '.'}
            </Lede>
            {intent === 'buyout' ? (
              <ReviewSteps>
                <ReviewStep $active><span className="dot"><FaCheckCircle /></span><span><strong>Signed &amp; submitted.</strong> Authorization on file.</span></ReviewStep>
                <ReviewStep $active><span className="dot"><FaClock /></span><span><strong>Inspection and title check.</strong> We book a visit and verify the documents.</span></ReviewStep>
                <ReviewStep><span className="dot">3</span><span><strong>Your firm offer.</strong> In My deals as soon as verification is done.</span></ReviewStep>
                <ReviewStep><span className="dot">4</span><span><strong>Completed within {PURCHASE_DAYS} days.</strong> Accept it and we complete the purchase within {PURCHASE_DAYS} days of verification.</span></ReviewStep>
              </ReviewSteps>
            ) : (
              <ReviewSteps>
                <ReviewStep $active><span className="dot"><FaCheckCircle /></span><span><strong>Signed &amp; submitted.</strong> Authorization on file.</span></ReviewStep>
                <ReviewStep $active><span className="dot"><FaClock /></span><span><strong>In review.</strong> An advisor values the property and confirms your path.</span></ReviewStep>
                <ReviewStep><span className="dot">3</span><span><strong>{intentMeta.title}.</strong> Handled one-to-one. Nothing goes public without your consent and our review.</span></ReviewStep>
              </ReviewSteps>
            )}
            <SubmitBtn
              as={Link}
              to={MANAGE_OFFERS_URL}
              style={{ maxWidth: 280, margin: '1.25rem auto 0', textDecoration: 'none' }}
            >
              View my deals
            </SubmitBtn>
            <SubmitBtn
              type="button"
              style={{ maxWidth: 280, margin: '0.65rem auto 0', background: 'var(--color-ink)' }}
              onClick={() => {
                setSubmitted(false); setMedia([]); setOwnerConfirmed(false); setConsent(false);
                setFeatures([]); setExtraFeature(''); setAiNote(null); setTitleDocs([]);
                setF((prev) => ({ ...prev, address: '', price: '', desc: '', beds: '', baths: '', size: '', typeOther: '' }));
              }}
            >
              Submit another property
            </SubmitBtn>
          </Success>
        ) : (
          <>
            <StepRow>
            <StepLabel>SELL YOUR PROPERTY</StepLabel>
              <StepBar $pct={100}><div /></StepBar>
            </StepRow>

            <FormTitle>How would you like to sell?</FormTitle>

            <IntentGrid>
              {INTENTS.map((i) => (
                <IntentCard key={i.id} type="button" $on={intent === i.id} onClick={() => setIntent(i.id)}>
                  <div className="ic"><i.icon /></div>
                  <div className="t">{i.title}</div>
                  <div className="d">{i.desc}</div>
                </IntentCard>
              ))}
            </IntentGrid>

            <Fields>
              <Field>
                <Label>Address {insight ? '· prefilled from your research' : ''}</Label>
                <Input value={f.address} onChange={(e) => set('address', e.target.value)} placeholder="Street, estate, city and region" />
              </Field>

              <TwoCol>
                <Field>
                  <Label>Property country</Label>
                  <Input value={f.country} list="offer-country-options" onChange={(e) => set('country', e.target.value)} placeholder="Start typing a country" />
                  <datalist id="offer-country-options">{COUNTRY_SUGGESTIONS.map((country) => <option key={country} value={country} />)}</datalist>
                </Field>
                <Field>
                  <Label>Price currency</Label>
                  <Input value={CURRENCY_LABEL} readOnly aria-readonly="true" tabIndex={-1} />
                </Field>
              </TwoCol>

              <TwoCol>
                <Field>
                  <Label>Property type</Label>
                  <Select value={f.type} onChange={(e) => set('type', e.target.value)}>
                    {PROPERTY_TYPES.map((t) => <option key={t}>{t}</option>)}
                  </Select>
                </Field>
                {f.type === 'Other' ? (
                  <Field>
                    <Label>Describe the property type</Label>
                    <Input value={f.typeOther} onChange={(e) => set('typeOther', e.target.value)} placeholder="e.g. Penthouse, warehouse, hotel…" />
                  </Field>
                ) : (
                  <Field>
                    <Label>Size / dimensions</Label>
                    <Input value={f.size} onChange={(e) => set('size', e.target.value)} placeholder="e.g. 650 sqm plot · 420 sqm built" />
                  </Field>
                )}
              </TwoCol>

              {f.type === 'Other' && (
                <Field>
                  <Label>Size / dimensions</Label>
                  <Input value={f.size} onChange={(e) => set('size', e.target.value)} placeholder="e.g. 650 sqm plot · 420 sqm built" />
                </Field>
              )}

              <ThreeCol>
                <Field>
                  <Label>Bedrooms</Label>
                  <Input value={f.beds} onChange={(e) => set('beds', e.target.value)} placeholder="4" inputMode="numeric" />
                </Field>
                <Field>
                  <Label>Bathrooms</Label>
                  <Input value={f.baths} onChange={(e) => set('baths', e.target.value)} placeholder="4" inputMode="numeric" />
                </Field>
                <Field>
                  <Label>{intent === 'buyout' ? 'Your asking price' : 'Guide price'}</Label>
                  <Input value={f.price} onChange={(e) => set('price', e.target.value)} placeholder={f.currency ? `Amount in ${f.currency}` : 'Select a currency first'} />
                </Field>
              </ThreeCol>

            </Fields>

            <FormSections defaultOpen={['photos']}>
              <FormSection
                id="photos"
                step={2}
                title="Photos & video"
                required={uploadEnabled}
                done={mediaReady && media.length > 0}
                summary={uploadEnabled ? `${photoCount}/${MIN_PHOTOS} photos · ${videoCount}/${MIN_VIDEOS} videos` : 'Media can follow after submission'}
              >
              <Field>
                <Dropzone
                  type="button"
                  $active={dragActive}
                  onClick={pickFiles}
                  onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
                  onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
                  onDrop={onDrop}
                >
                  <DropIcon><FaCloudUploadAlt /></DropIcon>
                  <DropTitle>
                    {uploadEnabled
                      ? (dragActive ? 'Drop your files to upload' : 'Drag photos & video here, or click to browse')
                      : 'Photos & video'}
                  </DropTitle>
                  <DropHint>
                    {uploadEnabled
                      ? `jpg · png · mp4 · mov · at least ${MIN_PHOTOS} photos and ${MIN_VIDEOS} videos · first photo becomes the cover`
                      : 'Uploads unavailable. A EasyMoveZone advisor will collect media directly'}
                  </DropHint>
                </Dropzone>
                <input ref={fileInputRef} type="file" accept="image/*,video/*" multiple hidden onChange={onFiles} />
                {uploadEnabled && (
                  <MediaReq>
                    <ReqPill $done={photoCount >= MIN_PHOTOS}>
                      <div className="top">
                        <span><FaCamera /> PHOTOS</span>
                        <span>{photoCount >= MIN_PHOTOS ? <FaCheckCircle /> : `${photoCount}/${MIN_PHOTOS}`}</span>
                      </div>
                      <div className="bar"><div style={{ width: `${Math.min(100, (photoCount / MIN_PHOTOS) * 100)}%` }} /></div>
                    </ReqPill>
                    <ReqPill $done={videoCount >= MIN_VIDEOS}>
                      <div className="top">
                        <span><FaVideo /> VIDEOS</span>
                        <span>{videoCount >= MIN_VIDEOS ? <FaCheckCircle /> : `${videoCount}/${MIN_VIDEOS}`}</span>
                      </div>
                      <div className="bar"><div style={{ width: `${Math.min(100, (videoCount / MIN_VIDEOS) * 100)}%` }} /></div>
                    </ReqPill>
                  </MediaReq>
                )}
                {media.length > 0 && (
                  <>
                    <UploadBar>
                      <span><span className="count">{uploadedCount}</span> uploaded · {media.length} total</span>
                      <button type="button" className="add" onClick={pickFiles}>+ add more</button>
                    </UploadBar>
                    <Thumbs>
                      {media.map((m, i) => (
                        <Thumb key={m.id} $cover={i === 0}>
                          {m.kind === 'image' && m.previewUrl ? <img src={m.previewUrl} alt={m.name} /> : <FaVideo />}
                          {i === 0 && <span className="cover-badge"><FaStar size={7} /> COVER</span>}
                          <span className="kind">{m.kind === 'video' ? 'VIDEO' : 'IMG'}</span>
                          {m.status === 'uploading' && <div className="overlay">{m.pct}%</div>}
                          {m.status === 'deleting' && <div className="overlay">…</div>}
                          {m.status === 'error' && <div className="overlay err">failed</div>}
                          {m.status !== 'uploading' && m.status !== 'deleting' && (
                            <div className="actions">
                              {i !== 0 && (
                                <button type="button" className="act" title="Set as cover" onClick={() => makeCover(m.id)}>
                                  <FaRegStar />
                                </button>
                              )}
                              <button type="button" className="act" title="Remove" onClick={() => removeMedia(m.id)}>
                                <FaTimes />
                              </button>
                            </div>
                          )}
                        </Thumb>
                      ))}
                    </Thumbs>
                  </>
                )}
              </Field>

              </FormSection>

              <FormSection
                id="documents"
                step={3}
                title="Title documents"
                done={titleDocs.length > 0}
                summary={titleDocs.length
                  ? `${titleDocs.length} ticked · ${titleDocs.reduce((n, d) => n + d.files.filter((x) => x.status === 'done').length, 0)} uploaded`
                  : 'Tick the documents you have: C of O, deed, survey plan…'}
              >
                <TitleDocuments value={titleDocs} onChange={setTitleDocs} uploadEnabled={uploadEnabled} />
              </FormSection>

              <FormSection
                id="description"
                step={4}
                title="Description"
                done={Boolean(f.desc.trim())}
                summary={f.desc.trim() ? f.desc.trim().slice(0, 80) : 'Tick what the property has and let AI draft it'}
              >
              <Field>
                <AssistPanel>
                  <AssistHead><FaMagic /> AI writing assist</AssistHead>
                  <AssistSub>
                    No need to write from scratch. Tick what the property has, add anything we missed,
                    and we&apos;ll draft a description from your details above (type, location, size, layout).
                  </AssistSub>
                  <ChipRow>
                    {FEATURE_OPTIONS.map((feat) => (
                      <FeatureChip
                        key={feat}
                        type="button"
                        $on={features.includes(feat)}
                        onClick={() => toggleFeature(feat)}
                      >
                        {feat}
                      </FeatureChip>
                    ))}
                  </ChipRow>
                  <div style={{ marginBottom: '0.9rem' }}>
                    <Input
                      value={extraFeature}
                      onChange={(e) => setExtraFeature(e.target.value)}
                      placeholder="Anything else? e.g. 5 mins from the new mall, recently repainted…"
                    />
                  </div>
                  <AssistBtn type="button" onClick={generateDescription} disabled={aiBusy}>
                    <FaMagic /> {aiBusy ? 'Drafting…' : (f.desc ? 'Redraft description' : 'Draft my description')}
                  </AssistBtn>
                  {aiNote && <AssistNote $err={aiNote.err}>{aiNote.text}</AssistNote>}
                </AssistPanel>
                <div style={{ marginTop: '0.75rem' }}>
                  <Textarea
                    value={f.desc}
                    onChange={(e) => set('desc', e.target.value)}
                    placeholder="Your description appears here. Draft it with AI above, or write your own."
                  />
                </div>
              </Field>

              </FormSection>

              <FormSection
                id="details"
                step={5}
                title="Your details"
                required
                done={Boolean(f.name.trim() && (f.phone.trim() || f.email.trim()))}
                summary={f.name.trim() ? [f.name.trim(), f.email.trim() || f.phone.trim()].filter(Boolean).join(' · ') : 'Name and one way to reach you'}
              >
              <Section style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                <TwoCol>
                  <Input value={f.name} onChange={(e) => set('name', e.target.value)} placeholder="Full name" />
                  <Input value={f.phone} onChange={(e) => set('phone', e.target.value)} placeholder="Phone / WhatsApp" />
                </TwoCol>
                <div style={{ marginTop: '1rem' }}>
                  <Input type="email" value={f.email} onChange={(e) => set('email', e.target.value)} placeholder="Email" />
                </div>
              </Section>

              </FormSection>

              <FormSection
                id="authorization"
                step={6}
                title="Owner authorization"
                icon={FaFileSignature}
                required
                done={Boolean(ownerConfirmed && consent && signature.trim())}
                summary={consent ? 'Signed' : 'Read, tick the boxes and type your name'}
              >
              <Section style={{ marginTop: 0, paddingTop: 0, borderTop: 0 }}>
                <Agreement>
                  <h4>Owner authorization</h4>
                  <p>
                    This agreement is between <strong>{signature.trim() || f.name.trim() || '[your name]'}</strong> (the
                    &ldquo;Owner&rdquo;) and <strong>EasyMoveZone Ltd</strong>. I confirm that I am the legal owner
                    (or an authorized representative of the owner) of the property at{' '}
                    <strong>{f.address.trim() || '[property address]'}</strong>, and I authorize{' '}
                    <strong>EasyMoveZone Ltd</strong> to:
                  </p>
                  <ul>
                    <li>value the property and prepare a {BRAND.passport}™ for internal and buyer review;</li>
                    {intent === 'buyout' ? (
                      <li>inspect the property and verify its title and, once that is done, issue a firm EasyMoveZone purchase offer through My deals. If I accept it, EasyMoveZone completes the purchase within {PURCHASE_DAYS} days of verification, under a sale agreement signed separately;</li>
                    ) : (
                      <li>prepare, market and sell the property on my behalf after the evidence and listing are approved.</li>
                    )}
                  </ul>
                  <p>
                    <strong>Nothing about this property is published anywhere unless I tick the public listing
                    box below.</strong> Without it, EasyMoveZone handles the property privately. Even with it, a
                    EasyMoveZone reviewer must approve the listing before it appears, and I may withdraw it in
                    writing at any time.
                  </p>
                  <p>
                    This is a non-exclusive authorization. EasyMoveZone Ltd does not take ownership of the property
                    unless a EasyMoveZone purchase offer is agreed and signed separately. There is no fee to submit, and
                    no fee is due unless a sale, purchase or renovation instruction completes. I confirm the
                    information provided is accurate and I may withdraw this authorization in writing at any
                    time before completion.
                    <br />
                    <span className="ref">EasyMoveZone Ltd accepts requests from verified owners only, not from agents or third parties.</span>
                  </p>
                </Agreement>

                <Check>
                  <input type="checkbox" checked={ownerConfirmed} onChange={(e) => setOwnerConfirmed(e.target.checked)} />
                  <span>I confirm I am the <strong>owner</strong> of this property (or an authorized representative), not a third-party agent.</span>
                </Check>
                <Check>
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} />
                  <span>I have read and agree to the authorization above, and I authorize EasyMoveZone Ltd to value and handle this property as described.</span>
                </Check>
                {/* Publishing is opt-in and opt-in only: the server refuses to
                    put a property on the marketplace without either this flag
                    or EasyMoveZone having bought it outright. */}
                <Check>
                  <input type="checkbox" checked={publishConsent} onChange={(e) => setPublishConsent(e.target.checked)} />
                  <span>
                    <strong>{intent === 'private' ? 'Required to list.' : 'Optional.'}</strong>{' '}
                    EasyMoveZone may list this property publicly only after its evidence has been reviewed and an admin
                    approves it. Leave this unticked to keep a purchase-offer request private.
                  </span>
                </Check>
                <SignRow>
                  <SignField>
                    <Label>Signature {f.name.trim() && !sigTouched ? '· prefilled from your details' : '· type your full name'}</Label>
                    <Signature
                      value={signature}
                      onChange={(e) => { setSigTouched(true); setSignature(e.target.value); }}
                      placeholder="Your full name"
                    />
                  </SignField>
                </SignRow>
              </Section>
              </FormSection>
            </FormSections>

            <Fields style={{ marginTop: '1.25rem' }}>
              <div>
                <SubmitBtn type="button" onClick={submit} disabled={submitting || !canSubmit}>
                  {submitting ? 'Submitting…' : <>Sign &amp; submit <FaArrowRight size={13} /></>}
                </SubmitBtn>
                {error && <ErrorMsg>{error}</ErrorMsg>}
                <FootNote>
                  no submission fee · owners only · {publishConsent ? 'published only after our review' : 'nothing published'}
                </FootNote>
              </div>
            </Fields>
          </>
        )}
      </FormCard>

      <Rail>
        <PreviewCard>
          <PreviewChrome>Seller request preview · private review</PreviewChrome>
          <PreviewImage $src={coverSrc}>{coverSrc ? '' : 'Your cover photo appears here'}</PreviewImage>
          <PreviewTitle>{f.address ? f.address : 'Your property'}</PreviewTitle>
          <PreviewRegion>{insight?.area || resolvedType} · {intentMeta.title}</PreviewRegion>
          <PreviewGrid>
            <PreviewCell>
              <div className="k">LAYOUT</div>
              <div className="v">{f.beds || '—'} bd · {f.baths || '—'} ba</div>
            </PreviewCell>
            <PreviewCell $accent>
              <div className="k">{intent === 'buyout' ? 'ASKING PRICE' : 'GUIDE PRICE'}</div>
              <div className="v">{f.price || '—'}</div>
            </PreviewCell>
            <PreviewCell>
              <div className="k">MEDIA</div>
              <div className="v">{uploadedCount ? `${photoCount} ph · ${videoCount} vid` : '—'}</div>
            </PreviewCell>
            <PreviewCell $accent={!!insight}>
              <div className="k">{insight ? 'AREA SCORE' : 'PASSPORT'}</div>
              <div className="v">{insight?.score != null ? `${insight.score} / 100` : 'On review'}</div>
            </PreviewCell>
          </PreviewGrid>
        </PreviewCard>

        <WhyCard>
          <WhyHead>Why sell with EasyMoveZone</WhyHead>
          {mobile ? (
            /* Phones: the three reasons as drop-downs — every word still there, one tap away. */
            <Accordion type="single" collapsible defaultValue={PERKS[0].title}>
              {PERKS.map((p) => (
                <AccordionItem key={p.title} value={p.title} className="border-white/15 last:border-b-0">
                  <AccordionTrigger className="py-3 text-white hover:text-[#c9dcd3] [&>svg]:text-[#c9dcd3]">
                    <span className="flex items-center gap-3"><PerkIcon>{p.icon}</PerkIcon><PerkTitle style={{ margin: 0 }}>{p.title}</PerkTitle></span>
                  </AccordionTrigger>
                  <AccordionContent><PerkBody style={{ paddingLeft: 42 }}>{p.body}</PerkBody></AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          ) : (
            <Perks>
              {PERKS.map((p) => (
                <Perk key={p.title}>
                  <PerkIcon>{p.icon}</PerkIcon>
                  <div>
                    <PerkTitle>{p.title}</PerkTitle>
                    <PerkBody>{p.body}</PerkBody>
                  </div>
                </Perk>
              ))}
            </Perks>
          )}
        </WhyCard>
      </Rail>
    </Body>
  );
}

const PAGE_COPY = {
  analyse: {
    status: 'Quick photo scan · free',
    other: { to: OFFER_VERIFY_URL, label: 'Need the full check? Verify the property' },
    title: 'See what the property photos reveal.',
    accent: 'Before the physical inspection.',
    desktop: 'Run a fast photo-condition scan for visible quality issues and risk flags. It is an early read, not a replacement for full verification.',
    mobile: 'Scan property photos for visible condition and risk flags.',
  },
  verify: {
    status: 'Property Passport',
    other: { to: OFFER_ANALYZE_URL, label: 'Only have photos? Start with a free quick scan' },
    title: 'Verify the property.',
    accent: 'Before you pay.',
    desktop: 'Submit any property for seller, document, location, valuation and physical checks, then follow the evidence in one Property Passport.',
    mobile: 'Verify the seller, documents, location, price and condition.',
  },
};

export default function OfferPage() {
  const location = useLocation();
  const scan = location.pathname.startsWith(OFFER_ANALYZE_URL);
  const copy = scan ? PAGE_COPY.analyse : PAGE_COPY.verify;
  const mobile = useIsMobile();
  return (
    <Page>
      <Hero>
        <HeroInner as={Stagger}>
          {mobile && <SpotArt className="spot" kind={scan ? 'scan' : 'verify'} />}
          <motion.div variants={staggerItem}>
            <PropertySwitch />
          </motion.div>
          <StatusPill as={motion.div} variants={staggerItem}>
            <LiveDot />
            {copy.status}
          </StatusPill>
          <H1 as={motion.h1} variants={staggerItem}>{copy.title} <span>{copy.accent}</span></H1>
          <Lede as={motion.p} variants={staggerItem}>
            <OnlyDesktop>{copy.desktop}</OnlyDesktop>
            <OnlyMobile>{copy.mobile}</OnlyMobile>
          </Lede>

          <motion.div variants={staggerItem}>
            <SwitchLink to={copy.other.to}>{copy.other.label} <FaArrowRight /></SwitchLink>
          </motion.div>
        </HeroInner>
      </Hero>

      <Routes>
        <Route index element={<VerifyTab />} />
        <Route path="photo-scan" element={<AnalyzeTab />} />
        <Route path="*" element={<Navigate to={OFFER_VERIFY_URL} replace />} />
      </Routes>
    </Page>
  );
}
