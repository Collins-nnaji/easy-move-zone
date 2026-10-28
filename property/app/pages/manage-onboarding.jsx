import React, { useEffect, useMemo, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaArrowRight, FaCheck, FaRedo, FaTimes } from 'react-icons/fa';
import { api } from '../api';
import { useAuth } from '../AuthContext';
import { MATCH_QUESTIONS, profileFromAnswers, recommendationByKey } from '../config/landlord';
import { PLAN_BY_ID, VAT_PERCENT } from '../config/management';
import { MANAGE_ADD_URL, MANAGE_CONSULT_URL } from '../config/platform';
import { InvolvementSpectrum } from '../components/graphics';

/**
 * Onboarding — the console's "where do I start" sub-page.
 *
 * Seven questions about the owner's situation, scored by config/landlord.js
 * into one of the management plans, plus the jobs that plan leaves with the
 * owner. Signed-in owners have the result saved, which is what pre-selects
 * their plan on the handover form. It used to live at `/manage/match` as
 * "Find my plan"; inside the console it is the first thing a new owner does.
 */



const Sub = styled.p`
  margin: 0 0 1.5rem;
  font-size: 1rem;
  color: var(--color-ink-muted);
  max-width: 62ch;
  line-height: 1.6;
`;

const Progress = styled.div`
  display: flex;
  align-items: center;
  gap: 0.85rem;
  margin-bottom: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: var(--color-ink-muted);

  .track {
    flex: 1;
    height: 6px;
    border-radius: 999px;
    background: #dde2e7;
    overflow: hidden;
  }
  .bar {
    height: 100%;
    background: var(--color-green);
    width: ${(p) => p.$pct}%;
    transition: width 0.35s ease;
  }
`;

const SpectrumCard = styled.div`
  background: var(--color-bg-panel);
  border: 1px solid rgba(13, 17, 23, 0.09);
  border-radius: 20px;
  padding: 1.5rem 1.6rem 1.25rem;
  margin-bottom: 1.5rem;
  box-shadow: 0 14px 34px rgba(13, 17, 23, 0.07);
  @media (max-width: 560px) { padding: 1.1rem 0.9rem 0.85rem; }
`;

const Card = styled.section`
  background: var(--color-bg-panel);
  border: 1px solid rgba(13, 17, 23, 0.09);
  border-radius: 20px;
  padding: 1.6rem 1.7rem 1.75rem;
  margin-bottom: 1rem;
  box-shadow: 0 14px 34px rgba(13, 17, 23, 0.07);
  @media (max-width: 560px) { padding: 1.25rem 1.1rem 1.35rem; }
`;

const QNum = styled.div`
  font-family: var(--font-mono);
  font-size: 0.7rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-green-deep);
  margin-bottom: 0.5rem;
`;

const QText = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.15rem, 2vw, 1.4rem);
  font-weight: 700;
  letter-spacing: -0.025em;
  line-height: 1.2;
  margin: 0 0 0.5rem;
`;

const QHelp = styled.p`
  margin: 0 0 1.1rem;
  font-size: 0.98rem;
  color: var(--color-ink-muted);
  line-height: 1.5;
`;

const Options = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.6rem;
  @media (max-width: 720px) { grid-template-columns: minmax(0, 1fr); }
`;

const Option = styled.button`
  display: flex;
  align-items: center;
  gap: 0.7rem;
  text-align: left;
  padding: 0.95rem 1.1rem;
  border-radius: 13px;
  border: 1px solid ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
  background: ${(p) => (p.$active ? 'var(--color-green-soft)' : '#fff')};
  color: var(--color-ink);
  font-size: 1rem;
  font-weight: ${(p) => (p.$active ? 700 : 500)};
  cursor: pointer;
  transition: border-color 0.15s, background 0.15s;
  &:hover { border-color: var(--color-green); }

  .tick {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid ${(p) => (p.$active ? 'var(--color-green)' : 'var(--color-line-strong)')};
    background: ${(p) => (p.$active ? 'var(--color-green)' : '#fff')};
    color: #fff;
    font-size: 0.6rem;
  }
`;


/* ── Result ── */

const Result = styled.section`
  background: linear-gradient(140deg, var(--color-green-deep) 0%, var(--color-green-forest) 100%);
  color: #fff;
  border-radius: var(--radius-xl);
  box-shadow: 0 26px 52px -28px rgba(17, 17, 17, 0.6);
  padding: 2.1rem 2rem 2.25rem;
  margin-bottom: 1.25rem;
  @media (max-width: 560px) { padding: 1.5rem 1.25rem 1.65rem; }
`;

const ResultTop = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.6rem;
`;

const ResultEyebrow = styled.div`
  font-size: 0.72rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #c9dcd3; /* on the deep-green result card */
  margin-bottom: 0.5rem;
`;

const ResultBand = styled.h2`
  font-family: var(--font-display);
  font-size: clamp(1.5rem, 2.6vw, 2rem);
  font-weight: 700;
  letter-spacing: -0.02em;
  color: #fff;
  margin: 0 0 0.6rem;
`;

const ResultSummary = styled.p`
  margin: 0;
  font-size: 1.08rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.72);
  max-width: 46ch;
`;


const Actions = styled.div`
  display: flex;
  gap: 0.7rem;
  flex-wrap: wrap;
`;

const Primary = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 1rem 1.7rem;
  border-radius: var(--radius-md);
  background: var(--color-green-deep);
  color: #fff;
  font-weight: 700;
  font-size: 1.02rem;
  &:hover { color: #fff; background: var(--color-green-bright); }
`;

const Ghost = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 1rem 1.6rem;
  border-radius: var(--radius-md);
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.22);
  color: #fff;
  font-weight: 700;
  font-size: 1.02rem;
  cursor: pointer;
  &:hover { background: rgba(255, 255, 255, 0.07); }
`;

const SaveState = styled.div`
  margin-top: 1.1rem;
  font-family: var(--font-mono);
  font-size: 0.8rem;
  color: ${(p) => (p.$error ? '#fca5a5' : 'var(--color-green-mint)')};
`;

const Disclaimer = styled.p`
  margin: 1.5rem 0 0;
  font-size: 0.88rem;
  line-height: 1.6;
  color: var(--color-ink-faint);
  max-width: 70ch;
`;


/* ── What we take on, and what stays yours ── */

const Split = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.7rem;
  margin-bottom: 1.5rem;

  @media (max-width: 640px) { grid-template-columns: minmax(0, 1fr); }
`;

const SplitCol = styled.div`
  padding: 1.1rem 1.2rem 1.25rem;
  border-radius: 15px;
  background: ${(p) => (p.$mine ? 'rgba(110,231,164,0.14)' : 'rgba(255,255,255,0.08)')};
  border: 1px solid ${(p) => (p.$mine ? 'rgba(110,231,164,0.32)' : 'rgba(255,255,255,0.16)')};

  .k {
    font-size: 0.66rem;
    font-weight: 700;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: ${(p) => (p.$mine ? 'var(--color-green-mint)' : 'rgba(255,255,255,0.66)')};
    margin-bottom: 0.75rem;
  }

  ul { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.55rem; }
  li {
    display: grid;
    grid-template-columns: 16px 1fr;
    gap: 0.6rem;
    align-items: start;
    font-size: 0.96rem;
    line-height: 1.4;
    color: rgba(255, 255, 255, 0.82);
  }
  li svg {
    margin-top: 0.28rem;
    font-size: 0.68rem;
    color: ${(p) => (p.$mine ? 'var(--color-green-mint)' : 'rgba(255,255,255,0.55)')};
  }
`;

const Fee = styled.div`
  display: flex;
  align-items: baseline;
  gap: 0.6rem;
  flex-wrap: wrap;
  padding: 0.9rem 1.1rem;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.18);
  margin-bottom: 1.5rem;

  .rate {
    font-family: var(--font-display);
    font-size: 1.6rem;
    font-weight: 700;
    letter-spacing: -0.02em;
  }
  .note { font-size: 0.95rem; color: rgba(255, 255, 255, 0.62); }
`;

const Upgraded = styled.p`
  margin: 0 0 1.4rem;
  padding: 0.8rem 1rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border-left: 3px solid var(--color-green-mint);
  font-size: 0.95rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.75);
`;

const Score = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1.5rem;
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: rgba(255, 255, 255, 0.55);

  .track {
    flex: 1;
    max-width: 260px;
    height: 8px;
    border-radius: 999px;
    background: rgba(255, 255, 255, 0.12);
    overflow: hidden;
  }
  .fill {
    display: block;
    height: 100%;
    border-radius: 999px;
    background: var(--color-green-mint);
    width: ${(p) => p.$pct}%;
    transition: width 0.5s ease;
  }
`;

export default function ManageOnboarding() {
  const { user } = useAuth();
  const email = user?.email || null;

  const [answers, setAnswers] = useState({});
  const [saved, setSaved] = useState(null);
  const [saveError, setSaveError] = useState('');
  const [restored, setRestored] = useState(false);

  // Bring back a saved answer set so returning owners see their plan, not a blank form.
  useEffect(() => {
    let active = true;
    if (!email) { setRestored(true); return undefined; }
    (async () => {
      try {
        const profile = await api.landlord.getProfile(email);
        if (active && profile?.answers && Object.keys(profile.answers).length) {
          setAnswers(profile.answers);
          setSaved(profile);
        }
      } catch { /* a missing profile is the normal first-visit case */ }
      if (active) setRestored(true);
    })();
    return () => { active = false; };
  }, [email]);

  const profile = useMemo(() => profileFromAnswers(answers), [answers]);
  const pct = Math.round((profile.answered / MATCH_QUESTIONS.length) * 100);
  const plan = PLAN_BY_ID[profile.plan] || null;

  // Persist as soon as the questionnaire is complete, and on every later change.
  useEffect(() => {
    if (!email || !profile.complete || !restored) return undefined;
    let active = true;
    (async () => {
      try {
        const stored = await api.landlord.saveProfile(email, {
          score: profile.score,
          plan: profile.plan,
          planLabel: profile.planLabel,
          location: profile.location,
          units: profile.units,
          answers,
        });
        if (active) { setSaved(stored); setSaveError(''); }
      } catch (e) {
        if (active) setSaveError(e.message || 'Could not save your match.');
      }
    })();
    return () => { active = false; };
  }, [email, restored, profile, answers]);

  const choose = (qid, value) => setAnswers((a) => ({ ...a, [qid]: value }));
  const upgradedFrom = profile.upgradedFrom ? recommendationByKey(profile.upgradedFrom) : null;

  return (
    <>
      <Sub>
        Start here. Seven questions about where you are, what you have time for, and who picks
        up when something breaks. The answer is one of four plans, and the jobs it still leaves
        with you.
      </Sub>

        <SpectrumCard>
          <InvolvementSpectrum activePlan={profile.complete ? profile.plan : null} />
        </SpectrumCard>

        <Progress $pct={pct}>
          <span>{profile.answered} / {MATCH_QUESTIONS.length}</span>
          <div className="track"><div className="bar" /></div>
          <span>{pct}%</span>
        </Progress>

        {MATCH_QUESTIONS.map((q, i) => (
          <Card key={q.id}>
            <QNum>question {String(i + 1).padStart(2, '0')}</QNum>
            <QText>{q.question}</QText>
            {q.help && <QHelp>{q.help}</QHelp>}
            <Options>
              {q.options.map((o) => {
                const active = answers[q.id] === o.value;
                return (
                  <Option
                    key={o.value}
                    type="button"
                    $active={active}
                    aria-pressed={active}
                    onClick={() => choose(q.id, o.value)}
                  >
                    <span className="tick">{active ? <FaCheck /> : null}</span>
                    {o.label}
                  </Option>
                );
              })}
            </Options>
          </Card>
        ))}

        {profile.complete && (
          <Result>
            <ResultTop>
              <div>
                <ResultEyebrow>Your match</ResultEyebrow>
                <ResultBand>{profile.planLabel}</ResultBand>
                <ResultSummary>{profile.summary}</ResultSummary>
              </div>
            </ResultTop>

            {upgradedFrom && (
              <Upgraded>
                On your answers alone this would have been <strong>{upgradedFrom.label}</strong>. Multi-unit
                and serviced stock is a different job, with service charges, facilities and turnover, so we
                have put you on {profile.planLabel} instead.
              </Upgraded>
            )}

            {plan && (
              <Fee>
                <span className="rate">{plan.ratePct}%</span>
                <span className="note">
                  {plan.priceNote} · plus {VAT_PERCENT}% VAT
                  {plan.bespoke ? ' · quoted after a visit' : ''}
                </span>
              </Fee>
            )}

            <Score $pct={profile.score}>
              <span>hands-off score</span>
              <span className="track"><span className="fill" /></span>
              <span>{profile.score} / 100</span>
            </Score>

            <Split>
              <SplitCol $mine>
                <div className="k">we take this on</div>
                <ul>
                  {profile.weTake.map((item) => (
                    <li key={item}><FaCheck />{item}</li>
                  ))}
                </ul>
              </SplitCol>
              <SplitCol>
                <div className="k">still yours</div>
                <ul>
                  {profile.stillYours.map((item) => (
                    <li key={item}><FaTimes />{item}</li>
                  ))}
                </ul>
              </SplitCol>
            </Split>

            <Actions>
              <Primary to={`${MANAGE_ADD_URL}?plan=${profile.plan}`}>
                Hand over this property <FaArrowRight size={12} />
              </Primary>
              <Primary
                to={MANAGE_CONSULT_URL}
                style={{ background: 'transparent', border: '1px solid rgba(255,255,255,0.4)', color: '#fff' }}
              >
                Talk it through first
              </Primary>
              <Ghost type="button" onClick={() => { setAnswers({}); setSaved(null); }}>
                <FaRedo size={11} /> Start over
              </Ghost>
            </Actions>

            {email ? (
              <SaveState $error={Boolean(saveError)}>
                {saveError || (saved ? 'Saved. This plan is pre-selected when you hand a property over.' : 'Saving…')}
              </SaveState>
            ) : (
              <SaveState>Sign in to save this match and carry it into the handover form.</SaveState>
            )}
          </Result>
        )}

        <Disclaimer>
          A starting point, not a quote. The fee on your management agreement is set after a manager
          has seen the property. The rate above is what that plan normally costs.
        </Disclaimer>

    </>
  );
}
