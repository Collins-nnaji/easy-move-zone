import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaArrowRight } from 'react-icons/fa';
import { api } from '../api';
import { MANAGE_ONBOARDING_URL } from '../config/platform';
import { CONSULT_TIER_BY_ID, PLAN_BY_ID } from '../config/management';
import { LOCALE } from '../config/markets';

/**
 * What used to be My Hub, now living inside the one signed-in console:
 * Sales & offers (Overview), My plan and Consultations (Account). Each takes
 * the signed-in email and fetches only what it shows.
 */

const ActionLink = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--color-green);
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  margin-top: auto;
`;

const OverviewNote = styled.div`
  padding: 1.15rem 1.25rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(25, 28, 31, 0.08);
  font-size: 0.9rem;
  color: var(--color-ink-muted);
  line-height: 1.6;
`;

const PanelCard = styled.div`
  padding: 1.35rem 1.4rem;
  border-radius: 16px;
  background: #fff;
  border: 1px solid rgba(25, 28, 31, 0.08);
  margin-bottom: 0.85rem;
`;

const PanelTitle = styled.h2`
  font-family: var(--font-display);
  font-size: 1.35rem;
  font-weight: 700;
  letter-spacing: -0.025em;
  margin: 0 0 0.4rem;
`;

const PanelNote = styled.p`
  margin: 0 0 1rem;
  font-size: 0.95rem;
  color: var(--color-ink-muted);
  line-height: 1.55;
`;

const KeyRow = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.6rem 0;
  border-top: 1px solid var(--color-line);
  font-size: 0.95rem;
  &:first-of-type { border-top: none; }

  .k { color: var(--color-ink-muted); }
  .v { font-weight: 700; }
`;

const Pill = styled.span`
  display: inline-block;
  font-family: var(--font-mono);
  font-size: 0.68rem;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  padding: 0.2rem 0.55rem;
  border-radius: 7px;
  background: ${(p) => (p.$done ? 'var(--color-green-chip)' : 'var(--color-bg-panel)')};
  color: ${(p) => (p.$done ? 'var(--color-green-deep)' : 'var(--color-ink-muted)')};
`;


const Stack = styled.div` display: flex; flex-direction: column; gap: 1rem; `;

function useLoad(fn, email) {
  const [rows, setRows] = useState(null);
  const load = useCallback(async () => {
    if (!email) { setRows([]); return; }
    setRows(await fn(email).catch(() => null));
  }, [email, fn]);
  useEffect(() => { load(); }, [load]);
  return rows;
}

const mineBookings = (email) => api.consult.myBookings(email).then((b) => b || []);
const myPlan = (email) => api.landlord.getProfile(email);

export function PlanSection({ email }) {
  const [profile, setProfile] = useState(undefined);
  useEffect(() => {
    let on = true;
    myPlan(email).then((p) => on && setProfile(p || null)).catch(() => on && setProfile(null));
    return () => { on = false; };
  }, [email]);
  if (profile === undefined) return <PanelCard><PanelNote>Loading your plan…</PanelNote></PanelCard>;
  const plan = profile ? PLAN_BY_ID[profile.plan] : null;
  return (
    <PanelCard>
      <PanelTitle>Management plan</PanelTitle>
      {profile ? (
        <>
          <PanelNote>
            Matched {profile.updatedAt ? new Date(profile.updatedAt).toLocaleDateString(LOCALE) : 'recently'}.
            This is the plan pre-selected when you hand a property over.
          </PanelNote>
          <KeyRow><span className="k">Plan</span><span className="v">{profile.planLabel || profile.plan}</span></KeyRow>
          <KeyRow><span className="k">Hands-off score</span><span className="v">{profile.score} / 100</span></KeyRow>
          {plan && <KeyRow><span className="k">Fee</span><span className="v">{plan.ratePct}% {plan.priceNote}</span></KeyRow>}
          <div style={{ marginTop: '1.1rem' }}>
            <ActionLink as={Link} to={MANAGE_ONBOARDING_URL}>Retake the questionnaire <FaArrowRight size={10} /></ActionLink>
          </div>
        </>
      ) : (
        <>
          <PanelNote>
            You have not run the plan matcher yet. It takes about two minutes and tells you which
            of the four management plans fits your property, and what each one leaves with you.
          </PanelNote>
          <ActionLink as={Link} to={MANAGE_ONBOARDING_URL}>Start onboarding <FaArrowRight size={10} /></ActionLink>
        </>
      )}
    </PanelCard>
  );
}

/** Consultations already requested, shown above the form to book another. */
export function ConsultationsList({ email }) {
  const bookings = useLoad(mineBookings, email);
  if (!bookings || bookings.length === 0) return null;
  return (
    <Stack style={{ marginBottom: '1.5rem' }}>
      <PanelTitle as="h3" style={{ fontSize: '1rem' }}>Your consultations</PanelTitle>
      {bookings.map((b) => (
              <PanelCard key={b.id}>
                <PanelTitle>
                  {CONSULT_TIER_BY_ID[b.service]?.name || b.service}
                  {' '}
                  <Pill $done={b.status === 'completed' || b.status === 'scheduled'}>{b.status}</Pill>
                </PanelTitle>
                <PanelNote>Reference {b.ref}</PanelNote>
                {b.preferredDate && (
                  <KeyRow>
                    <span className="k">Requested date</span>
                    <span className="v">
                      {new Date(b.preferredDate).toLocaleDateString(LOCALE)}
                      {b.preferredWindow ? `, ${b.preferredWindow}` : ''}
                    </span>
                  </KeyRow>
                )}
                {b.managerName && (
                  <KeyRow>
                    <span className="k">Property manager</span>
                    <span className="v">{b.managerName}</span>
                  </KeyRow>
                )}
                {b.portfolioBand && (
                  <KeyRow>
                    <span className="k">How much property</span>
                    <span className="v">{b.portfolioBand}</span>
                  </KeyRow>
                )}
                {b.adminNote && <PanelNote style={{ marginTop: '0.85rem' }}>{b.adminNote}</PanelNote>}
              </PanelCard>
      ))}
    </Stack>
  );
}
