import React from 'react';
import styled from 'styled-components';
import { FaCheck, FaTimes, FaMinus, FaRegClock } from 'react-icons/fa';
import {
  SCREENING_CHECKS, SCREENING_RESULTS, SCREENING_RESULT_LABEL, screeningProgress,
} from '../config/rentals';

/**
 * A rental applicant's screening, check by check: identity, income or work,
 * a reference and a previous landlord. Staff (Admin → Rentals) and agents
 * (on their own homes) mark each one with `onChange`; a landlord sees the
 * same row read-only, without who the applicant is.
 */

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.4rem;
  margin: 0.6rem 0 0.2rem;

  .sum { font-size: 0.78rem; font-weight: 700; color: var(--color-ink-muted); margin-right: 0.2rem; }
  .sum.bad { color: #b91c1c; }
`;

const TONE = {
  passed: { bg: 'var(--color-green-soft)', fg: 'var(--color-green-deep)', icon: FaCheck },
  failed: { bg: '#fdecec', fg: '#b91c1c', icon: FaTimes },
  waived: { bg: 'var(--color-bg-sunken)', fg: 'var(--color-ink-muted)', icon: FaMinus },
  pending: { bg: '#fff', fg: 'var(--color-ink-muted)', icon: FaRegClock },
};

const Chip = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.25rem 0.55rem;
  border-radius: 999px;
  border: 1px solid var(--color-line);
  background: ${(p) => TONE[p.$result].bg};
  color: ${(p) => TONE[p.$result].fg};
  font-size: 0.76rem;
  font-weight: 650;
  svg { font-size: 0.62rem; }

  select {
    border: 0;
    background: transparent;
    color: inherit;
    font: inherit;
    padding: 0 0.1rem;
    cursor: pointer;
  }
`;

export default function ScreeningChecks({ screening, onChange, disabled = false }) {
  const s = screening && typeof screening === 'object' ? screening : {};
  const { done, total, failed } = screeningProgress(s);
  return (
    <Row role="group" aria-label="Tenant screening">
      <span className={`sum${failed ? ' bad' : ''}`}>Screening {done}/{total}{failed ? ' · a check failed' : ''}</span>
      {SCREENING_CHECKS.map((c) => {
        const result = SCREENING_RESULTS.includes(s[c.id]) ? s[c.id] : 'pending';
        const Icon = TONE[result].icon;
        return (
          <Chip key={c.id} $result={result} title={`${c.label}: ${SCREENING_RESULT_LABEL[result]}`}>
            <Icon aria-hidden="true" /> {c.label}
            {onChange ? (
              <select
                aria-label={`${c.label} check`}
                value={result}
                disabled={disabled}
                onChange={(e) => onChange({ [c.id]: e.target.value })}
              >
                {SCREENING_RESULTS.map((r) => <option key={r} value={r}>{SCREENING_RESULT_LABEL[r]}</option>)}
              </select>
            ) : (
              <span className="sr-only">: {SCREENING_RESULT_LABEL[result]}</span>
            )}
          </Chip>
        );
      })}
    </Row>
  );
}
