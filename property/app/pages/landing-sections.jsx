import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  FaArrowRight, FaCheck, FaKey, FaShieldAlt, FaBolt,
} from 'react-icons/fa';
import { ArrowRight, ShieldCheck, KeyRound } from 'lucide-react';
import {
  Hero, HeroGrid, HeroCopy, Eyebrow, HeroTitle, TitleAccent, HeroSub, ActionRow,
  PrimaryAction, SecondaryAction, TrustRow, StatBand, StatBandInner, StatNum, StatLabel,
  Section, Inner, SectionHead, Kicker, SectionTitle, SectionSub,
  CheckGrid, CheckItem, CalloutAction, Panel,
  enterContainer, enterItem,
} from '../components/page';
import { Segmented, useCountUp } from '../components/ui';
import { Reveal, Stagger, StaggerItem } from '../components/motion';
import { PassportChecksArt, VerifyFlowArt, SpotArt } from '../components/graphics';
import { Button } from '../components/shadcn/button';
import { Badge } from '../components/shadcn/badge';
import { Carousel, CarouselContent, CarouselItem, CarouselDots } from '../components/shadcn/carousel';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/shadcn/accordion';
import { Tabs, TabsList, TabsTrigger } from '../components/shadcn/tabs';
import { api } from '../api';
import { ListingCard } from './MarketplacePage';
import { RENT_URL, RENTAL_CHECK_URL, AREAS_URL, MANAGE_ADD_URL, LIST_URL } from '../config/platform';
import { MANAGEMENT_PLANS, estimateFees } from '../config/management';
import { formatMoneyFull } from '../utils/format';
import { CURRENCY } from '../config/markets';
import { useIsMobile } from '../utils/useMediaQuery';
import ChipPhoto from '../components/ChipPhoto';

/* ═══════════════════════════════════════════════════════════════════
   Hero — desktop keeps the video; phones get a bespoke, video-free hero
   ═══════════════════════════════════════════════════════════════════ */

const VideoHero = styled(Hero)`
  min-height: min(420px, calc(100vh - var(--nav-h)));
  display: flex;
  align-items: center;
  background: #ffffff url('/media/hero-poster.jpg') center / cover no-repeat;
  color: var(--color-ink);
  padding: 1.75rem 0;
`;

const HeroVideo = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;

  @media (prefers-reduced-motion: reduce) { display: none; }
`;

const HeroShade = styled.div`
  position: absolute;
  inset: 0;
  /* A white shade: the copy sits on white, the video shows through on the right. */
  background: linear-gradient(90deg, rgba(255, 255, 255, 0.98) 0%, rgba(255, 255, 255, 0.93) 46%, rgba(255, 255, 255, 0.45) 78%, rgba(255, 255, 255, 0.2) 100%);
`;

const VideoHeroGrid = styled(HeroGrid)`
  position: relative;
  z-index: 1;
  width: 100%;
  grid-template-columns: minmax(0, 1.15fr) minmax(280px, 0.7fr);

  ${HeroCopy} { max-width: 46rem; }
  ${Eyebrow} { box-shadow: none; }
  ${HeroTitle} { color: var(--color-ink); font-size: clamp(2.3rem, 4.1vw, 3.7rem); font-weight: 600; line-height: 1.04; letter-spacing: -0.06em; margin-bottom: 1.4rem; }
  ${HeroTitle} .line { display: block; white-space: nowrap; }
  ${TitleAccent} { color: var(--color-green-deep); }
  ${HeroSub} { color: var(--color-ink-muted); font-size: clamp(1rem, 1.6vw, 1.125rem); line-height: 1.75; max-width: 34rem; }
  ${TrustRow} { color: var(--color-ink-muted); }
  ${TrustRow} svg { color: var(--color-green-deep); }

  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); }
`;

const HeroProof = styled(motion.div)`
  justify-self: end;
  width: min(100%, 380px);
  filter: drop-shadow(var(--shadow-lift));

  @media (max-width: 960px) { justify-self: start; width: min(100%, 440px); }
`;

function DesktopHero() {
  return (
    <VideoHero id="hero">
      <HeroVideo autoPlay muted loop playsInline preload="metadata" poster="/media/hero-poster.jpg" aria-hidden="true">
        <source src="/media/hero.mp4" type="video/mp4" />
      </HeroVideo>
      <HeroShade />
      <VideoHeroGrid>
        <HeroCopy variants={enterContainer} initial="hidden" animate="show">
          <Eyebrow variants={enterItem}>
            <FaShieldAlt /> Rent · Check · Move in
          </Eyebrow>
          <HeroTitle variants={enterItem}>
            <span className="line">Rent a home</span>
            <span className="line">without the risk.</span>
            <TitleAccent className="line">Checked before you pay.</TitleAccent>
          </HeroTitle>
          <ActionRow variants={enterItem}>
            <PrimaryAction to={RENT_URL}>Find a home to rent <FaArrowRight size={13} /></PrimaryAction>
            <SecondaryAction to={RENTAL_CHECK_URL}>Check a rental before you pay</SecondaryAction>
          </ActionRow>
          <TrustRow variants={enterItem}>
            <span><FaCheck /> Every listing checked</span>
            <span><FaBolt /> Landlord and home checked before you pay</span>
            <span><FaKey /> Let and managed for landlords</span>
            <span><Link to={LIST_URL} style={{ color: 'inherit', textDecoration: 'underline' }}>List a home</Link></span>
          </TrustRow>
        </HeroCopy>

        <HeroProof initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7, delay: 0.35, ease: [0.22, 1, 0.36, 1] }}>
          <PassportChecksArt dark={false} />
        </HeroProof>
      </VideoHeroGrid>
    </VideoHero>
  );
}

/*
 * Phone hero: soft grey with one green glow, the promise, one button — and
 * one small photo (a 30KB webp from /m, not the desktop video) with the two
 * things we do for that home floating over it. (Desktop keeps the video.)
 */
const MobileHeroWrap = styled.section`
  position: relative;
  overflow: hidden;
  background: var(--hero-bg);
  color: var(--color-on-black);
  padding: 1.75rem 1.25rem 1.5rem;

  &::before {
    content: '';
    position: absolute;
    right: -40%;
    top: -30%;
    width: 520px;
    height: 520px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(47, 93, 80, 0.26), transparent 62%);
    pointer-events: none;
  }

  > * { position: relative; z-index: 1; }

  h1 {
    color: var(--color-ink);
    font-size: clamp(2.2rem, 10vw, 2.7rem);
    line-height: 1.03;
    letter-spacing: -0.06em;
    font-weight: 600;
    margin: 0.9rem 0 1.2rem;
  }
  h1 .line { display: block; }
  h1 .accent { color: var(--color-green-deep); }
  p { color: var(--color-on-black-muted); font-size: 0.98rem; line-height: 1.5; margin: 0 0 1.2rem; }
`;

const HeroTextLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  width: 100%;
  min-height: 44px;
  color: var(--color-green-deep);
  font-size: 0.92rem;
  font-weight: 600;

  &:hover { color: var(--color-green-forest); }
`;

const HeroPhoto = styled(ChipPhoto)`
  margin-top: 1.3rem;
`;

function MobileHero() {
  return (
    <MobileHeroWrap id="hero" aria-label="Rent a home without the risk">
      <motion.div variants={enterContainer} initial="hidden" animate="show">
        <motion.div variants={enterItem}>
          <Badge variant="dark"><ShieldCheck className="h-3 w-3" /> Rent · Check · Move in</Badge>
        </motion.div>
        <motion.h1 variants={enterItem}>
          <span className="line">Rent a home</span>
          <span className="line">without the risk.</span>
          <span className="line accent">Checked first.</span>
        </motion.h1>
        <motion.div variants={enterItem} className="flex flex-col gap-1.5">
          <Button asChild size="xl" block>
            <Link to={RENT_URL}>Find a home to rent <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div className="grid grid-cols-2">
            <HeroTextLink to={RENTAL_CHECK_URL}>Check a rental</HeroTextLink>
            <HeroTextLink to={LIST_URL}>List a home</HeroTextLink>
          </div>
        </motion.div>
      </motion.div>
      <HeroPhoto
        src="/media/m/home-modern.webp"
        alt="A home to rent"
        priority
        chips={[
          { icon: ShieldCheck, title: 'Landlord checked', sub: 'Before you pay' },
          { icon: KeyRound, title: 'Rent and repairs', sub: 'In one tenant portal' },
        ]}
      />
    </MobileHeroWrap>
  );
}

export function LandingHero() {
  const mobile = useIsMobile();
  return mobile ? <MobileHero /> : <DesktopHero />;
}

/* ═══════════════════════════════════════════════════════════════════
   Stat band — the numbers count up as they scroll in
   ═══════════════════════════════════════════════════════════════════ */

const STATS = [
  { num: 'Every', label: 'Listing checked before it goes live' },
  { num: 3, label: 'Checks on a rental before you pay' },
  { num: 1, label: 'Portal for rent, repairs and documents' },
  { num: 'Human', label: 'Adviser throughout' },
];

function CountStat({ value }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const n = useCountUp(inView ? value : 0, { duration: 1100 });
  return <StatNum ref={ref}>{Math.round(n)}</StatNum>;
}

export function LandingStats() {
  return (
    <StatBand>
      <StatBandInner>
        {STATS.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.06} y={10}>
            {typeof s.num === 'number' ? <CountStat value={s.num} /> : <StatNum>{s.num}</StatNum>}
            <StatLabel>{s.label}</StatLabel>
          </Reveal>
        ))}
      </StatBandInner>
    </StatBand>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Check a rental — what we check before a renter pays
   ═══════════════════════════════════════════════════════════════════ */

const INCLUDED = [
  'Landlord or agent identity',
  'Proof they own the home or may let it',
  'Agent registration, if an agent',
  'Search for scam and fraud reports',
  'A visit: the home matches the advert',
  'Water, power and condition on the day',
  'Tenancy agreement and fair-rent check',
  'Flooding, security and access',
];

const ServiceGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 2.5rem;
  align-items: center;

  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); gap: 1.5rem; }
`;

const PassportFrame = styled.div`
  filter: drop-shadow(var(--shadow-lift));
`;

const FlowWrap = styled.div`
  max-width: 900px;
  margin: 0 auto 2.5rem;

  @media (max-width: 720px) { margin: 0 0 1.75rem; }
`;

export function RentalCheckSection() {
  const mobile = useIsMobile();
  const shown = mobile ? INCLUDED.slice(0, 3) : INCLUDED;
  const rest = INCLUDED.slice(3);

  return (
    <Section id="how-it-works">
      <Inner>
        <Reveal>
          <SectionHead $center>
            <Kicker>Check a rental</Kicker>
            <SectionTitle>Found a home somewhere else? Check it before you pay.</SectionTitle>
            <SectionSub>Fake landlords and homes that are not really for let are the most common rental scams. Send us the advert and who is letting it, and we tell you what is safe.</SectionSub>
          </SectionHead>
        </Reveal>

        <FlowWrap>
          <VerifyFlowArt vertical={mobile} />
        </FlowWrap>

        <ServiceGrid>
          <Reveal>
            <PassportFrame>
              <PassportChecksArt dark={false} inView />
            </PassportFrame>
          </Reveal>
          <Reveal delay={0.1}>
            <SectionTitle as="h3" style={{ fontSize: 'clamp(1.25rem, 2vw, 1.6rem)' }}>What we check for you</SectionTitle>
            <SectionSub style={{ marginBottom: '1.25rem' }}>
              Pick the checks you need, from the landlord alone to the full rental. A fixed fee, agreed before any charge.
            </SectionSub>
            <CheckGrid>
              {shown.map((item) => <CheckItem key={item}><FaCheck /> {item}</CheckItem>)}
            </CheckGrid>
            {mobile && (
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="more" className="border-b-0">
                  <AccordionTrigger className="text-brand-deep">See everything we check</AccordionTrigger>
                  <AccordionContent>
                    <CheckGrid>
                      {rest.map((item) => <CheckItem key={item}><FaCheck /> {item}</CheckItem>)}
                    </CheckGrid>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <ActionRow style={{ marginTop: '1.5rem' }}>
              <PrimaryAction to={RENTAL_CHECK_URL}>Check a rental <FaArrowRight size={13} /></PrimaryAction>
            </ActionRow>
          </Reveal>
        </ServiceGrid>
      </Inner>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   New homes to rent — the newest listings; a carousel on phones
   ═══════════════════════════════════════════════════════════════════ */

const StripGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 1.25rem;

  @media (max-width: 1000px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
`;

const StripHead = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 1.5rem;
  flex-wrap: wrap;
  margin-bottom: 1.75rem;

  @media (max-width: 720px) { margin-bottom: 1.1rem; }
`;

const SeeAll = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  font-size: 0.92rem;
  font-weight: 600;
  color: var(--color-green-deep);
  white-space: nowrap;
`;

/**
 * The three newest homes to rent. It renders nothing at all when there is
 * no stock — an empty "featured" rail is worse than no rail.
 */
export function NewRentalsStrip() {
  const [listings, setListings] = useState([]);
  const mobile = useIsMobile();

  useEffect(() => {
    let active = true;
    api.listings.browse({ mode: 'rent', limit: 3 })
      .then((d) => { if (active) setListings(d.listings || []); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  if (!listings.length) return null;

  return (
    <Section $panel $divide>
      <Inner>
        <Reveal>
          <StripHead>
            <div>
              <Kicker>Renting</Kicker>
              <SectionTitle>New homes to rent</SectionTitle>
              <SectionSub>Every one checked by us before it went up.</SectionSub>
            </div>
            <SeeAll to={RENT_URL}>See every home to rent <FaArrowRight size={12} /></SeeAll>
          </StripHead>
        </Reveal>
        {mobile ? (
          <Carousel opts={{ align: 'start', containScroll: 'trimSnaps' }}>
            <CarouselContent>
              {listings.map((l) => (
                <CarouselItem key={l.id} className="basis-[86%]"><ListingCard listing={l} /></CarouselItem>
              ))}
            </CarouselContent>
            <CarouselDots />
          </Carousel>
        ) : (
          <Stagger as="div">
            <StripGrid>
              {listings.map((l) => <StaggerItem key={l.id}><ListingCard listing={l} /></StaggerItem>)}
            </StripGrid>
          </Stagger>
        )}
      </Inner>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   Rent calculator
   ═══════════════════════════════════════════════════════════════════ */

const PLAN_OPTIONS = MANAGEMENT_PLANS
  .filter((p) => !p.bespoke)
  .map((p) => ({ value: p.id, label: p.name }));

const CalcGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 0.9fr);
  gap: 1.5rem;
  align-items: stretch;

  @media (max-width: 900px) { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 720px) { gap: 1rem; }
`;

const CalcResult = styled.div`
  background: var(--color-band);
  border: 1px solid var(--color-black-line);
  color: var(--color-on-black);
  border-radius: var(--radius-lg);
  padding: 1.6rem 1.7rem;
  display: flex;
  flex-direction: column;
  justify-content: center;

  @media (max-width: 720px) { padding: 1.35rem 1.25rem; }
`;

const CalcRow = styled.div`
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.7rem 0;
  border-bottom: 1px solid var(--color-black-line);
  font-size: 0.94rem;
  color: var(--color-on-black-muted);

  &:last-of-type { border-bottom: none; }

  b {
    font-family: var(--font-display);
    font-size: 1.02rem;
    font-weight: 600;
    color: var(--color-on-black);
  }
`;

const CalcHeadline = styled.div`
  margin-top: 1rem;

  .k { font-size: 0.7rem; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-green-deep); }
  .v { font-family: var(--font-display); font-size: clamp(1.6rem, 2.8vw, 2.15rem); font-weight: 700; letter-spacing: -0.02em; line-height: 1.1; margin-top: 0.25rem; color: var(--color-green-deep); }
  .m { font-size: 0.86rem; color: var(--color-on-black-muted); margin-top: 0.4rem; }
`;

const CalcNote = styled.p`
  margin-top: 1rem;
  font-size: 0.85rem;
  color: var(--color-ink-faint);

  @media (max-width: 720px) { display: none; }
`;

const AmountFields = styled.div`
  display: grid;
  grid-template-columns: 150px minmax(0, 1fr);
  gap: .75rem;
  align-items: end;

  label { display: block; font-size: .7rem; font-weight: 700; letter-spacing: .07em; text-transform: uppercase; color: var(--color-ink-muted); margin-bottom: .45rem; }
  select, input { width: 100%; min-height: 48px; border: 1px solid var(--color-line-strong); border-radius: 11px; background: #fff; color: var(--color-ink); padding: .75rem .85rem; font: inherit; outline: none; }
  select:focus, input:focus { border-color: var(--color-green); box-shadow: 0 0 0 3px rgba(47, 93, 80,.09); }

  @media (max-width: 560px) { grid-template-columns: 110px minmax(0, 1fr); }
`;

export function RentCalculator({
  kicker = 'For landlords',
  title = 'Let it. We run it for you.',
  sub = 'We find and check the tenant, collect the rent, handle repairs and inspections, and pay you the balance. See what you keep.',
  tint = true,
}) {
  const [annualRent, setAnnualRent] = useState(3_000_000);
  const currency = CURRENCY;
  const [plan, setPlan] = useState('full_management');
  const mobile = useIsMobile();
  const quote = estimateFees({ plan, annualRent, vatPercent: 0, currency });
  const net = useCountUp(quote.netAnnual, { duration: 600 });

  return (
    <Section $tint={tint} $divide>
      <Inner>
        <Reveal>
          <SectionHead>
            <Kicker>{kicker}</Kicker>
            <SectionTitle>{title}</SectionTitle>
            <SectionSub>{sub}</SectionSub>
          </SectionHead>
        </Reveal>

        <CalcGrid>
          <Reveal>
            <Panel>
              <div style={{ marginBottom: '1.4rem' }}>
                {mobile ? (
                  <Tabs value={plan} onValueChange={setPlan}>
                    <TabsList className="w-full justify-start">
                      {PLAN_OPTIONS.map((o) => <TabsTrigger key={o.value} value={o.value}>{o.label}</TabsTrigger>)}
                    </TabsList>
                  </Tabs>
                ) : (
                  <Segmented options={PLAN_OPTIONS} value={plan} onChange={setPlan} name="plan" />
                )}
              </div>
              <AmountFields>
                <div>
                  <label htmlFor="rent-currency">Currency</label>
                  <input id="rent-currency" value="₦ Naira" readOnly aria-readonly="true" tabIndex={-1} />
                </div>
                <div>
                  <label htmlFor="annual-rent">Annual rent</label>
                  <input id="annual-rent" type="number" inputMode="numeric" min="0" step="50000" value={annualRent} onChange={(event) => setAnnualRent(Math.max(0, Number(event.target.value) || 0))} />
                </div>
              </AmountFields>
              <CalcNote>
                {quote.planName}: {quote.planRatePct}% {quote.oneOff ? 'of the first year’s rent, one-off' : 'of rent collected'}. Indicative only — your proposal carries the final fee.
              </CalcNote>
            </Panel>
          </Reveal>

          <Reveal delay={0.08}>
            <CalcResult>
              <CalcRow>
                <span>Gross annual rent</span>
                <b>{formatMoneyFull(quote.grossAnnual, currency)}</b>
              </CalcRow>
              <CalcRow>
                <span>{quote.planName} fee</span>
                <b>−{formatMoneyFull(quote.feeAnnual, currency)}</b>
              </CalcRow>
              <CalcHeadline>
                <div className="k">You keep</div>
                <div className="v">{formatMoneyFull(Math.round(net), currency)}</div>
                <div className="m">About {formatMoneyFull(quote.netMonthly, currency)} a month, on a fixed cycle.</div>
              </CalcHeadline>
              <ActionRow style={{ marginTop: '1.6rem' }}>
                <CalloutAction to={MANAGE_ADD_URL}>Let us manage it <FaArrowRight size={13} /></CalloutAction>
              </ActionRow>
            </CalcResult>
          </Reveal>
        </CalcGrid>
      </Inner>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   How it fits together — the app's flow, straight under the hero.
   Drawn, not photographed, and no buttons: the navbar already links each
   step, so this only shows how one leads to the next.
   ═══════════════════════════════════════════════════════════════════ */

const FLOW = [
  { kind: 'sell', k: 'Find', title: 'Find a home to rent', body: 'Homes we manage and homes from verified agents, checked before they go live.' },
  { kind: 'verify', k: 'Check', title: 'Check it before you pay', body: 'Found one elsewhere? We check the landlord, the home and the agreement first.' },
  { kind: 'move', k: 'Move', title: 'Move in without the stress', body: 'A crew, the right truck and packing help, priced up front and tracked.' },
  { kind: 'manage', k: 'Live', title: 'Rent and repairs in one place', body: 'Pay rent, report repairs and keep your tenancy papers in the tenant portal.' },
];

const FlowGrid = styled(Stagger)`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 1rem;

  @media (max-width: 1000px) { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  @media (max-width: 560px) { grid-template-columns: minmax(0, 1fr); gap: 0.6rem; }
`;

const FlowStep = styled(StaggerItem)`
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  padding: 0.85rem 1rem 1rem;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 16px;

  .art { height: 62px; display: flex; align-items: center; justify-content: center; margin-bottom: 0.3rem; border-radius: 10px; background: var(--color-bg-panel); }
  .art svg { width: 76px; height: auto; }
  .n { display: inline-flex; align-items: center; gap: 0.5rem; font-size: 11px; font-weight: 700; letter-spacing: 0.14em; text-transform: uppercase; color: var(--color-eyebrow); }
  .n b { display: inline-flex; align-items: center; justify-content: center; width: 22px; height: 22px; border-radius: 999px; background: var(--color-green-deep); color: #fff; font-size: 11px; letter-spacing: 0; }
  h3 { font-size: 1rem; margin: 0.1rem 0 0; }
  p { font-size: 0.85rem; line-height: 1.45; color: var(--color-ink-muted); margin: 0; }

  /* The connector to the next step. */
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 50%;
    right: -0.85rem;
    width: 0.7rem;
    height: 0.7rem;
    border-top: 2px solid var(--color-green-deep);
    border-right: 2px solid var(--color-green-deep);
    transform: translateY(-50%) rotate(45deg);
    z-index: 1;
  }
  @media (max-width: 1000px) { &:not(:last-child)::after { display: none; } }

  /* Phones: art on the left, words beside it. */
  @media (max-width: 560px) {
    display: grid;
    grid-template-columns: 76px minmax(0, 1fr);
    column-gap: 0.9rem;
    align-items: center;
    padding: 0.8rem 0.9rem;
    .art { grid-row: span 3; height: 64px; margin: 0; }
    .art svg { width: 70px; }
    p { display: none; }
  }
`;

/** Under the journey: the neighbourhood pages, for anyone still choosing where to live. */
const AreasCallout = styled(Link)`
  display: flex; align-items: center; justify-content: space-between; gap: 1rem; margin-top: 1rem;
  padding: 0.95rem 1.15rem; border-radius: 16px; background: var(--color-green-soft); color: var(--color-ink);
  b { display: block; font-size: 0.98rem; }
  span { font-size: 0.86rem; color: var(--color-ink-muted); }
  svg { flex-shrink: 0; color: var(--color-green-deep); }
  &:hover { background: var(--color-green-chip); }
`;

export function JourneySection() {
  return (
    <Section $sm style={{ paddingTop: '1.75rem', paddingBottom: '2rem' }}>
      <Inner>
        <Reveal>
          <SectionHead $center style={{ marginBottom: '1.1rem' }}>
            <Kicker style={{ marginBottom: '0.4rem' }}>How it fits together</Kicker>
            <SectionTitle style={{ fontSize: 'clamp(1.35rem, 2.1vw, 1.9rem)' }}>From finding a home to living in it.</SectionTitle>
          </SectionHead>
        </Reveal>
        <FlowGrid forwardedAs="ol">
          {FLOW.map((step, i) => (
            <FlowStep key={step.k} forwardedAs="li">
              <div className="art"><SpotArt kind={step.kind} /></div>
              <span className="n"><b>{i + 1}</b>{step.k}</span>
              <h3>{step.title}</h3>
              <p>{step.body}</p>
            </FlowStep>
          ))}
        </FlowGrid>
        <AreasCallout to={AREAS_URL}>
          <div>
            <b>Choosing where to live?</b>
            <span>Residents rate the light, water, flooding and security in areas across Nigeria. Read them before you pay rent.</span>
          </div>
          <ArrowRight size={18} />
        </AreasCallout>
      </Inner>
    </Section>
  );
}
