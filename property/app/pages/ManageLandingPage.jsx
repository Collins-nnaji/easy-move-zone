import React, { useState } from 'react';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaArrowRight, FaCheck, FaFileInvoiceDollar, FaKey, FaPaintRoller, FaTools, FaUserCheck, FaUserTie,
} from 'react-icons/fa';
import { ArrowRight, MessagesSquare } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { MANAGE_URL, MANAGE_ADD_URL, BOOK_SESSION_URL, AGENT_APPLY_URL } from '../config/platform';
import { AgentFinder } from './AgentsDirectoryPage';
import ListHomeDialog from '../components/ListHomeDialog';
import {
  PageShell, Section, Inner, SectionHead, Kicker, SectionTitle, SectionSub, CheckGrid, CheckItem, Callout, CalloutAction,
} from '../components/page';
import { useIsMobile } from '../utils/useMediaQuery';
import { JourneyTimelineArt, VerifyFlowArt, ServiceArt } from '../components/graphics';
import ChipPhoto from '../components/ChipPhoto';
import { MobileMore } from '../components/MobileFold';
import { Reveal, Stagger, StaggerItem } from '../components/motion';
import { RentCalculator } from './landing-sections';
import { Button } from '../components/shadcn/button';
import { Badge } from '../components/shadcn/badge';

/* ── Hero: soft grey; the timeline illustration on desktop, one small photo on phones ── */

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background: var(--color-bg);
  color: var(--color-on-black);
  border-bottom: 1px solid var(--color-black-line);

  &::after {
    content: '';
    position: absolute;
    right: -12%;
    top: -40%;
    width: 720px;
    height: 720px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(184, 90, 48, 0.22), transparent 62%);
    pointer-events: none;
  }
`;

const HeroInner = styled.div`
  position: relative;
  z-index: 1;
  max-width: var(--container);
  margin: 0 auto;
  padding: 3.25rem 2.5rem 3rem;
  display: grid;
  grid-template-columns: minmax(0, 1.2fr) minmax(280px, 0.8fr);
  gap: 3rem;
  align-items: center;

  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); gap: 2rem; padding: 2.5rem 1.5rem 2.25rem; }
  @media (max-width: 720px) { padding: 1.6rem 1.25rem 1.75rem; gap: 1.35rem; }
`;

const HeroCopy = styled.div`
  min-width: 0;

  h1 {
    color: var(--color-ink);
    font-size: clamp(2.4rem, 4.2vw, 3.6rem);
    font-weight: 500;
    line-height: 1.02;
    letter-spacing: -0.03em;
    margin: 0.85rem 0 0.9rem;
    max-width: none;
    word-break: normal;
    overflow-wrap: normal;
    hyphens: manual;
  }
  h1 .line { display: block; }
  h1 .accent {
    background: var(--gradient-brand);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  p {
    color: var(--color-ink-muted);
    font-size: 1.05rem;
    line-height: 1.5;
    max-width: 40rem;
    margin: 0 0 1.4rem;
    word-break: normal;
    overflow-wrap: normal;
  }
  p .line { display: block; }

  @media (max-width: 720px) {
    h1 { font-size: clamp(1.85rem, 8vw, 2.25rem); margin: 0.7rem 0 0.65rem; }
    p { font-size: 0.95rem; margin-bottom: 1.1rem; }
  }
`;

const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.35rem 1.1rem;

  a { white-space: nowrap; }

  @media (max-width: 560px) {
    flex-direction: column;
    align-items: stretch;
    a { white-space: normal; }
  }
`;

const HeroArt = styled(motion.div)`
  width: min(100%, 440px);
  justify-self: end;
  filter: drop-shadow(var(--shadow-lift));

  @media (max-width: 960px) { justify-self: start; }
  @media (max-width: 720px) { order: -1; width: 100%; max-width: 420px; }
`;

/* ── Services ── */

/* Manage is property management on the owner's behalf: letting it, running
   it, and renovating it. */
const SERVICES = [
  { title: 'Find and vet tenants', body: 'Viewings, referencing and a signed tenancy — we choose who moves in, with your say-so.', icon: FaUserCheck, art: 'tenants', to: `${MANAGE_ADD_URL}?service=rental`, action: 'Let my property' },
  { title: 'Collect the rent', body: 'Rent collected on time, arrears chased, and the balance paid to you with a statement.', icon: FaFileInvoiceDollar, art: 'rent', to: `${MANAGE_ADD_URL}?service=rental`, action: 'Add my property' },
  { title: 'Repairs and upkeep', body: 'Issues logged, quotes approved by you, work evidenced before anyone is paid.', icon: FaTools, art: 'repairs', to: `${MANAGE_ADD_URL}?service=rental`, action: 'Hand it over' },
  { title: 'Renovate', body: 'Upgrade to let faster or for more — scoped, quoted and approved stage by stage.', icon: FaPaintRoller, art: 'renovate', to: '/renovate', action: 'Request a renovation' },
];

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 980px) { grid-template-columns: 1fr 1fr; }
`;

const Service = styled(Link)`
  display: flex;
  flex-direction: column;
  height: 100%;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 18px;
  overflow: hidden;
  box-shadow: var(--shadow-soft);
  color: var(--color-ink);
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;

  &:hover { color: var(--color-ink); transform: translateY(-3px); box-shadow: var(--shadow-card); border-color: rgba(184, 90, 48, 0.3); }

  .shot { position: relative; height: 165px; overflow: hidden; transition: transform 0.45s ease; }
  &:hover .shot svg { transform: scale(1.04); }
  .shot svg { transition: transform 0.45s ease; }
  .icon { position: absolute; left: 0.75rem; top: 0.75rem; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center; background: #fff; color: var(--color-green-deep); box-shadow: 0 6px 16px -8px rgba(13, 17, 23, 0.4); font-size: 0.85rem; }
  .body { padding: 1.1rem 1.15rem 1.2rem; display: flex; flex-direction: column; flex: 1; }
  h3 { font-size: 1.1rem; margin: 0 0 0.4rem; }
  p { font-size: 0.88rem; line-height: 1.55; color: var(--color-ink-muted); margin: 0 0 1rem; }
  .act { display: inline-flex; align-items: center; gap: 0.4rem; margin-top: auto; color: var(--color-green-deep); font-size: 0.84rem; font-weight: 700; }
  &:hover .act svg { transform: translateX(3px); }
  .act svg { transition: transform 0.15s ease; }

  ${(p) => p.$compact && `
    flex-direction: row;
    align-items: stretch;
    border-radius: 16px;
    .thumb { position: relative; display: grid; width: 104px; min-height: 84px; flex-shrink: 0; }
    .thumb .glyph { position: absolute; right: -14px; top: 50%; transform: translateY(-50%); display: grid; place-items: center; width: 30px; height: 30px; border-radius: 9px; background: #fff; color: var(--color-green-deep); font-size: 0.85rem; box-shadow: 0 6px 16px -8px rgba(13, 17, 23, 0.4); }
    .body { padding: 0.8rem 0.95rem 0.8rem 1.4rem; justify-content: center; }
    h3 { font-size: 0.98rem; margin: 0; }
    p { display: none; }
    .act { display: inline-flex; margin-top: 0.3rem; font-size: 0.78rem; }
  `}
`;

/** Desktop: a photo card. Phones (`compact`): a row with a small /m photo. */
function ServiceCard({ item, compact = false }) {
  return (
    <Service to={item.to} $compact={compact}>
      {compact ? (
        <span className="thumb">
          <ServiceArt kind={item.art} />
          <span className="glyph"><item.icon /></span>
        </span>
      ) : (
        <div className="shot">
          <ServiceArt kind={item.art} />
          <span className="icon"><item.icon /></span>
        </div>
      )}
      <div className="body">
        <h3>{item.title}</h3>
        <p>{item.body}</p>
        <span className="act">{item.action} <FaArrowRight size={11} /></span>
      </div>
    </Service>
  );
}

const MobileShot = styled.img`
  display: block;
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 18px;
  box-shadow: var(--shadow-soft);
`;

const RENOVATION_INCLUDES = [
  'Inspection and a priced scope of work',
  'Vetted artisans — we take no cut from them',
  'You approve each stage before payment',
  'Before-and-after photos, receipts and progress',
  'Back on the market as soon as it is done',
];

/* ── How it works ── */

const HOW = [
  { title: 'Hand it over', sub: 'Add the property, pick a plan' },
  { title: 'We run it', sub: 'Tenants, rent, repairs, renovation' },
  { title: 'You get paid', sub: 'Balance and statement, every month' },
];

const LIST_STEPS = [
  { title: 'Post the home', sub: 'Address, rent, and photos if storage is on' },
  { title: 'We check it', sub: 'Nothing goes live until then' },
  { title: 'You reply', sub: 'Enquiries sit in your portal' },
];

/* ── Renovation ── */

const BuildGrid = styled.div`
  display: grid;
  grid-template-columns: 1.05fr 0.95fr;
  gap: 2.5rem;
  align-items: center;

  @media (max-width: 850px) { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; }
`;

const BuildVisual = styled.div`
  position: relative;
  min-height: 460px;
  border-radius: 22px;
  overflow: hidden;
  background: #dce5df;

  img.main { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; }
  .team { position: absolute; right: 1rem; bottom: 1rem; width: 34%; height: 43%; object-fit: cover; border: 4px solid #fff; border-radius: 16px; box-shadow: 0 16px 35px rgba(0, 0, 0, 0.22); }

  @media (max-width: 560px) {
    min-height: 240px;
    border-radius: 16px;
    .team { width: 36%; height: 42%; right: 0.65rem; bottom: 0.65rem; border-width: 3px; border-radius: 11px; }
  }
`;

/* ── Remote control ── */

const Choices = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.65rem;
  margin-bottom: 0.35rem;

  @media (max-width: 640px) { grid-template-columns: 1fr; }
`;

const Choice = styled.button`
  text-align: left;
  border-radius: 16px;
  border: 1px solid var(--color-line);
  background: #fff;
  padding: 0.85rem 0.95rem;
  cursor: pointer;
  font: inherit;

  strong {
    display: block;
    margin-bottom: 0.25rem;
    font-size: 0.98rem;
    font-weight: 700;
    letter-spacing: -0.01em;
    color: var(--color-ink);
  }
  span {
    display: block;
    font-size: 0.82rem;
    font-weight: 500;
    line-height: 1.4;
    color: var(--color-ink-muted);
  }

  &[aria-pressed='true'] {
    border-color: #111;
    background: #111;
    strong, span { color: #fff; }
  }
`;

const AgencyNote = styled.p`
  margin: 1.25rem 0 0;
  color: var(--color-ink-muted);
  a { font-weight: 700; color: var(--color-green-deep); }
`;

const StoryGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;

  @media (max-width: 760px) { grid-template-columns: minmax(0, 1fr); }
`;

const Story = styled.article`
  display: grid;
  grid-template-columns: 180px 1fr;
  min-height: 280px;
  background: var(--color-band);
  color: var(--color-ink);
  border: 1px solid var(--color-black-line);
  border-radius: 20px;
  overflow: hidden;

  video, img { width: 100%; height: 100%; object-fit: cover; }
  .copy { padding: 1.5rem; align-self: center; }
  .copy svg { color: var(--color-green-deep); font-size: 1.35rem; }
  .copy h3 { color: var(--color-ink); font-size: 1.25rem; margin: 0.7rem 0 0.45rem; }
  .copy p { color: var(--color-on-black-muted); font-size: 0.9rem; line-height: 1.6; margin: 0; }

  /* Phones show no footage: the story is the words. */
  @media (max-width: 720px) {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
    .copy p { display: none; }
  }

  @media (max-width: 480px) {
    min-height: 200px;
    border-radius: 16px;
    .copy { padding: 1rem; }
    .copy h3 { font-size: 1.05rem; margin: 0.45rem 0 0.3rem; }
    .copy p { font-size: 0.8rem; line-height: 1.45; }
  }
`;

export default function ManageLandingPage() {
  const { user } = useAuth();
  const mobile = useIsMobile();
  const [params, setParams] = useSearchParams();
  const listing = params.get('let') === 'list';
  const [listOpen, setListOpen] = useState(false);
  const accountTo = user ? MANAGE_URL : { pathname: '/auth', search: '?mode=signup', state: { from: { pathname: MANAGE_URL } } };

  const setMode = (next) => {
    const nextParams = new URLSearchParams(params);
    if (next === 'list') nextParams.set('let', 'list');
    else nextParams.delete('let');
    setParams(nextParams, { replace: true });
  };

  return (
    <PageShell>
      <Hero id="hero">
        <HeroInner>
          <HeroCopy>
            <Choices role="group" aria-label="How the home is let">
              <Choice type="button" aria-pressed={!listing} onClick={() => setMode('manage')}>
                <strong>We run the property</strong>
                <span>We find the tenant, collect the rent and handle repairs. You get paid.</span>
              </Choice>
              <Choice type="button" aria-pressed={listing} onClick={() => setMode('list')}>
                <strong>List the home yourself</strong>
                <span>It goes on EasyMoveZone. Enquiries come to you, in your portal.</span>
              </Choice>
            </Choices>
            {listing ? (
              <>
                <h1>
                  <span className="line">List it on EasyMoveZone.</span>
                  <span className="line accent">Enquiries come to you.</span>
                </h1>
                <p>
                  <span className="line">You post the home. We check it before it goes live.</span>
                  <span className="line">You reply from your portal.</span>
                </p>
                <HeroActions>
                  <Button type="button" size="xl" variant="bright" block={mobile} onClick={() => setListOpen(true)}>
                    List this home <ArrowRight className="h-4 w-4" />
                  </Button>
                </HeroActions>
              </>
            ) : (
              <>
                <div>
                  <Badge variant="dark"><FaKey /> EasyMoveZone Manage</Badge>
                </div>
                <h1>
                  <span className="line">Your property, looked after.</span>
                  <span className="line accent">You collect the rent.</span>
                </h1>
                <p>
                  <span className="line">Tenants, rent, repairs and renovation.</span>
                  <span className="line">Handled for you. Every naira is accounted for.</span>
                </p>
                <HeroActions>
                  <Button asChild size="xl" variant="bright" block={mobile}>
                    <Link to={user ? `${MANAGE_ADD_URL}?service=rental` : { pathname: '/auth', search: '?mode=signup', state: { from: { pathname: MANAGE_ADD_URL, search: '?service=rental' } } }}>Hand over my property <ArrowRight className="h-4 w-4" /></Link>
                  </Button>
                  <Button asChild size="xl" variant="link" block={mobile}>
                    <Link to={BOOK_SESSION_URL}><MessagesSquare className="h-4 w-4" /> Talk to an adviser</Link>
                  </Button>
                </HeroActions>
              </>
            )}
          </HeroCopy>

          {listing ? (
            mobile ? (
              <ChipPhoto
                src="/media/m/home-modern.webp"
                alt="A home listed on EasyMoveZone"
                priority
                chips={[
                  { icon: FaKey, title: 'Listed by you', sub: 'Checked before it goes live' },
                  { icon: FaUserCheck, title: 'Replies in your portal', sub: 'Enquiries come to you' },
                ]}
              />
            ) : (
              <HeroArt initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
                <img src="/media/m/home-modern.webp" alt="A home listed on EasyMoveZone" style={{ display: 'block', width: '100%', borderRadius: 22, aspectRatio: '4 / 3', objectFit: 'cover' }} />
              </HeroArt>
            )
          ) : mobile ? (
            <ChipPhoto
              src="/media/m/lounge.webp"
              alt="A furnished living room in a let home"
              priority
              chips={[
                { icon: FaUserCheck, title: 'Tenant moved in', sub: 'Referenced and signed' },
                { icon: FaFileInvoiceDollar, title: 'Rent collected', sub: 'Paid out with a statement' },
              ]}
            />
          ) : (
            <HeroArt initial={{ opacity: 0, y: 24, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} transition={{ duration: 0.7, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}>
              <JourneyTimelineArt />
            </HeroArt>
          )}
        </HeroInner>
      </Hero>
      <ListHomeDialog open={listOpen} user={user} onClose={() => setListOpen(false)} />

      {listing ? (
        <>
          <Section $tint $divide>
            <Inner>
              <Reveal>
                <SectionHead $center>
                  <Kicker>How listing works</Kicker>
                  <SectionTitle>Three steps, then it lives in your portal.</SectionTitle>
                </SectionHead>
              </Reveal>
              <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <VerifyFlowArt vertical={mobile} steps={LIST_STEPS} label="How listing works: post the home, we check it, you reply from your portal" />
              </div>
              <AgencyNote>
                Already a letting agency with several homes? <Link to={AGENT_APPLY_URL}>Apply for an agency account.</Link>
              </AgencyNote>
            </Inner>
          </Section>
          <Section id="agents">
            <Inner>
              <Reveal>
                <SectionHead>
                  <Kicker>Find an agent</Kicker>
                  <SectionTitle>Or pick a verified agency.</SectionTitle>
                  <SectionSub>Every agency here was checked before it could post a home.</SectionSub>
                </SectionHead>
              </Reveal>
              <AgentFinder />
            </Inner>
          </Section>
        </>
      ) : (
      <>
      <Section id="services">
        <Inner>
          <Reveal>
            <SectionHead $center>
              <Kicker>What we take care of</Kicker>
              <SectionTitle>Everything a landlord does — done for you.</SectionTitle>
              <SectionSub>You own the property. We let it, run it and keep it in shape.</SectionSub>
            </SectionHead>
          </Reveal>
          {mobile ? (
            <Stagger>
              <div className="flex flex-col gap-3">
                {SERVICES.map((item) => <StaggerItem key={item.title}><ServiceCard item={item} compact /></StaggerItem>)}
              </div>
            </Stagger>
          ) : (
            <Stagger>
              <ServiceGrid>
                {SERVICES.map((item) => <StaggerItem key={item.title}><ServiceCard item={item} /></StaggerItem>)}
              </ServiceGrid>
            </Stagger>
          )}
        </Inner>
      </Section>

      <Section $tint $divide>
        <Inner>
          <Reveal>
            <SectionHead $center>
              <Kicker>How it works</Kicker>
              <SectionTitle>Three steps from keys to rent.</SectionTitle>
            </SectionHead>
          </Reveal>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <VerifyFlowArt vertical={mobile} steps={HOW} label="How Manage works: hand the property over, we run it, you get paid" />
          </div>
        </Inner>
      </Section>

      <Section $divide id="renovation">
        <Inner>
          <BuildGrid>
            {mobile ? (
              <Reveal>
                <MobileShot src="/media/m/renovation.webp" alt="Renovation work under way on a property" loading="lazy" />
              </Reveal>
            ) : (
            <Reveal>
              <BuildVisual>
                <img className="main" src="/media/construction.jpg" alt="Renovation work under way on a property" loading="lazy" />
                <img className="team" src="/media/project-team.jpg" alt="Our team checking the work on site" loading="lazy" />
              </BuildVisual>
            </Reveal>
            )}
            <Reveal delay={0.1}>
              <Kicker>Renovation</Kicker>
              <SectionTitle>Renovate to let faster — or for more.</SectionTitle>
              <SectionSub>We scope the work, you approve each stage, and nobody is paid until it is checked.</SectionSub>
              <div style={{ margin: '1.4rem 0 1.6rem' }}>
                <MobileMore
                  items={RENOVATION_INCLUDES}
                  label="See everything included"
                  wrap={(nodes) => <CheckGrid $cols={1}>{nodes}</CheckGrid>}
                  render={(item) => <CheckItem key={item}><FaCheck /> {item}</CheckItem>}
                />
              </div>
              <Button asChild size="lg"><Link to="/renovate">Request a renovation <ArrowRight className="h-4 w-4" /></Link></Button>
            </Reveal>
          </BuildGrid>
        </Inner>
      </Section>

      {/* Footage-led, so desktop only: on a phone it was two empty boxes. */}
      {!mobile && (
      <Section $panel $divide>
        <Inner>
          <Reveal>
            <SectionHead>
              <Kicker>Remote control</Kicker>
              <SectionTitle>See the work and the money, wherever you are.</SectionTitle>
              <SectionSub>Adviser updates, approvals, documents and money in one property history.</SectionSub>
            </SectionHead>
          </Reveal>
          <StoryGrid>
            <Reveal>
              <Story>
                {!mobile && <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/media/finance-control.mp4" type="video/mp4" /></video>}
                <div className="copy"><FaFileInvoiceDollar /><h3>Money follows milestones</h3><p>Approve defined stages and see what was paid, to whom and why.</p></div>
              </Story>
            </Reveal>
            <Reveal delay={0.08}>
              <Story>
                {!mobile && <video autoPlay muted loop playsInline preload="metadata" aria-hidden="true"><source src="/media/remote-adviser.mp4" type="video/mp4" /></video>}
                <div className="copy"><FaUserTie /><h3>A person stays accountable</h3><p>Your adviser coordinates the ground and keeps every decision visible.</p></div>
              </Story>
            </Reveal>
          </StoryGrid>
        </Inner>
      </Section>
      )}

      <RentCalculator
        kicker="Renting it out"
        title="See what you keep from the rent."
        sub="We find the tenant, collect the rent, handle repairs and pay you the balance."
        tint={false}
      />

      <Section>
        <Inner>
          <Reveal>
            <Callout>
              <div>
                <h2>Already working with EasyMoveZone?</h2>
                <p>Open your console to see properties, approvals, documents, repairs and money.</p>
              </div>
              <CalloutAction to={accountTo}>{user ? 'Open my console' : 'Sign in to continue'} <FaArrowRight size={13} /></CalloutAction>
            </Callout>
          </Reveal>
        </Inner>
      </Section>
      </>
      )}
    </PageShell>
  );
}
