import React, { useState } from 'react';
import styled from 'styled-components';
import { Heart, Share2, Check } from 'lucide-react';
import { FaWhatsapp } from 'react-icons/fa';
import { shortlist, useSaved } from '../utils/shortlist';

/* Save (heart) and Share for a listing — on cards and on the detail page. */

const Round = styled.button`
  display: inline-grid;
  place-items: center;
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: 1px solid var(--color-line-strong);
  background: rgba(255, 255, 255, 0.95);
  color: ${(p) => (p.$on ? '#dc2626' : 'var(--color-ink)')};
  cursor: pointer;
  box-shadow: 0 6px 16px -10px rgba(13, 17, 23, 0.45);
  transition: transform 0.15s ease, color 0.15s ease;

  &:active { transform: scale(0.9); }
  svg { width: 17px; height: 17px; }
`;

const Pill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  min-height: 40px;
  padding: 0 0.9rem;
  border-radius: 999px;
  border: 1px solid var(--color-line-strong);
  background: #fff;
  color: ${(p) => (p.$on ? '#dc2626' : 'var(--color-ink)')};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;

  &:hover { border-color: var(--color-green); color: ${(p) => (p.$on ? '#dc2626' : 'var(--color-green-deep)')}; }
  svg { width: 16px; height: 16px; }
`;

/** Heart toggle. `round` floats on a card photo; otherwise a labelled pill. */
export function SaveButton({ listing, round = false, className }) {
  const saved = useSaved();
  const on = saved.some((x) => x.id === listing.id);
  const toggle = (e) => {
    // On a card the button sits inside the card's link.
    e.preventDefault();
    e.stopPropagation();
    shortlist.toggle(listing);
  };
  const label = on ? 'Remove from saved' : 'Save property';
  const heart = <Heart fill={on ? 'currentColor' : 'none'} />;
  return round
    ? <Round type="button" className={className} $on={on} onClick={toggle} aria-pressed={on} aria-label={label} title={label}>{heart}</Round>
    : <Pill type="button" className={className} $on={on} onClick={toggle} aria-pressed={on}>{heart} {on ? 'Saved' : 'Save'}</Pill>;
}

/**
 * Share: the phone's own share sheet where there is one; otherwise copy the
 * link, with WhatsApp — how most people send a property to family — beside it.
 */
export function ShareButtons({ listing }) {
  const [copied, setCopied] = useState(false);
  const url = typeof window !== 'undefined' ? window.location.href : '';
  const text = `${listing.title} on EasyMoveZone`;
  const canShare = typeof navigator !== 'undefined' && typeof navigator.share === 'function';

  const share = async () => {
    if (canShare) {
      try { await navigator.share({ title: text, url }); } catch { /* dismissed */ }
      return;
    }
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch { /* no clipboard: the WhatsApp link still works */ }
  };

  return (
    <>
      <Pill type="button" onClick={share}>
        {copied ? <Check /> : <Share2 />} {copied ? 'Link copied' : 'Share'}
      </Pill>
      {!canShare && (
        <Pill as="a" href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`} target="_blank" rel="noopener noreferrer">
          <FaWhatsapp /> WhatsApp
        </Pill>
      )}
    </>
  );
}
