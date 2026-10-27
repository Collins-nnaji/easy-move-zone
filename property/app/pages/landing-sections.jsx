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
import { MARKETPLACE_URL, OFFER_VERIFY_URL, PURCHASE_DAYS, AREAS_URL, MANAGE_ADD_URL } from '../config/platform';
import { MANAGEMENT_PLANS, estimateFees } from '../config/management';
import { formatMoneyFull } from '../utils/format';
import { CURRENCY } from '../config/markets';
import { useIsMobile } from '../utils/useMediaQuery';
import ChipPhoto from '../components/ChipPhoto';

/* ═══════════════════════════════════════════════════════════════════
   Hero — desktop keeps the video; phones get a bespoke, video-free hero
   ═══════════════════════════════════════════════════════════════════ */

const VideoHero = styled(Hero)`
  min-height: min(470px, calc(100vh - var(--nav-h)));
  display: flex;
  align-items: center;
  background: #f3f0e7 url('/media/hero-poster.jpg') center / cover no-repeat;
  color: var(--color-ink);
  padding: 2.25rem 0;
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
  /* EasyMoveZone cream shade: the copy sits on warm cream with the sage glow,
     the video shows through on the right. */
  background:
    radial-gradient(ellipse at 85% 30%, rgba(232, 237, 223, 0.55) 0%, transparent 55%),
    linear-gradient(90deg, rgba(243, 240, 231, 0.98) 0%, rgba(243, 240, 231, 0.92) 46%, rgba(243, 240, 231, 0.4) 78%, rgba(243, 240, 231, 0.18) 100%);
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
            <FaShieldAlt /> Buy · Sell · Rent · Manage
          </Eyebrow>
          <HeroTitle variants={enterItem}>
            <span className="line">Buy, sell, rent</span>
            <span className="line">and manage property.</span>
            <TitleAccent className="line">With ease.</TitleAccent>
          </HeroTitle>
          <ActionRow variants={enterItem}>
            <PrimaryAction to={MARKETPLACE_URL}>Browse properties <FaArrowRight size={13} /></PrimaryAction>
            <SecondaryAction to="/listings/sell">Get an offer on my property</SecondaryAction>
          </ActionRow>
          <TrustRow variants={enterItem}>
            <span><FaCheck /> Every listing verified</span>
            <span><FaBolt /> Sold to us within {PURCHASE_DAYS} days</span>
            <span><FaKey /> Let and managed for you</span>
            <span><Link to="/list" style={{ color: 'inherit', textDecoration: 'underline' }}>List a property</Link></span>
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
    <MobileHeroWrap id="hero" aria-label="Buy, sell, rent and manage property with ease">
      <motion.div variants={enterContainer} initial="hidden" animate="show">
        <motion.div variants={enterItem}>
          <Badge variant="dark"><ShieldCheck className="h-3 w-3" /> Buy · Sell · Rent · Manage</Badge>
        </motion.div>
        <motion.h1 variants={enterItem}>
          <span className="line">Buy, sell, rent</span>
          <span className="line">and manage property.</span>
          <span className="line accent">With ease.</span>
        </motion.h1>
        <motion.div variants={enterItem} className="flex flex-col gap-1.5">
          <Button asChild size="xl" block>
            <Link to={MARKETPLACE_URL}>Browse properties <ArrowRight className="h-4 w-4" /></Link>
          </Button>
          <div className="grid grid-cols-2">
            <HeroTextLink to="/listings/sell">Get an offer</HeroTextLink>
            <HeroTextLink to="/list">List a property</HeroTextLink>
          </div>
        </motion.div>
      </motion.div>
      <HeroPhoto
        src="/media/m/home-modern.webp"
        alt="A modern detached home"
        priority
        chips={[
          { icon: ShieldCheck, title: 'Passport verified', sub: '8 of 8 checks' },
          { icon: KeyRound, title: 'Rent paid out', sub: 'Every month, with a statement' },
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
  { num: 'Any', label: 'Supported market' },
  { num: 8, label: 'Core checks' },
  { num: 1, label: 'Clear report' },
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
   Property Passport — what a verification produces
   ═══════════════════════════════════════════════════════════════════ */

const INCLUDED = [
  'Seller identity and ownership',
  'Title and document checks',
  'Survey and location',
  'Independent valuation',
  'Physical inspection evidence',
  'Flood, access and neighbourhood',
  'Rental yield and resale potential',
  'One named adviser throughout',
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

export function PassportSection() {
  const mobile = useIsMobile();
  const shown = mobile ? INCLUDED.slice(0, 3) : INCLUDED;
  const rest = INCLUDED.slice(3);

  return (
    <Section id="how-it-works">
      <Inner>
        <Reveal>
          <SectionHead $center>
            <Kicker>Verify a property</Kicker>
            <SectionTitle>Verify my property before I pay.</SectionTitle>
            <SectionSub>Send us the listing or the seller’s papers. We check it and give you a Property Passport that says what is safe.</SectionSub>
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
              The same eight checks every time, in your Property Passport. A fixed fee, agreed before any charge.
            </SectionSub>
            <CheckGrid>
              {shown.map((item) => <CheckItem key={item}><FaCheck /> {item}</CheckItem>)}
            </CheckGrid>
            {mobile && (
              <Accordion type="single" collapsible className="mt-2">
                <AccordionItem value="more" className="border-b-0">
                  <AccordionTrigger className="text-brand-deep">See all 8 checks</AccordionTrigger>
                  <AccordionContent>
                    <CheckGrid>
                      {rest.map((item) => <CheckItem key={item}><FaCheck /> {item}</CheckItem>)}
                    </CheckGrid>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            )}
            <ActionRow style={{ marginTop: '1.5rem' }}>
              <PrimaryAction to={OFFER_VERIFY_URL}>Verify my property <FaArrowRight size={13} /></PrimaryAction>
            </ActionRow>
          </Reveal>
        </ServiceGrid>
      </Inner>
    </Section>
  );
}

/* ═══════════════════════════════════════════════════════════════════
   On the market — newest listings; a carousel on phones
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
 * The three newest properties on the market. It renders nothing at all when
 * there is no stock — an empty "featured" rail is worse than no rail.
 */
export function ForSaleStrip() {
  const [listings, setListings] = useState([]);
  const mobile = useIsMobile();

  useEffect(() => {
    let active = true;
    api.listings.browse({ limit: 3 })
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
              <Kicker>Buying</Kicker>
              <SectionTitle>On the market now</SectionTitle>
              <SectionSub>Every one valued by us before it went up. Some we own outright.</SectionSub>
            </div>
            <SeeAll to={MARKETPLACE_URL}>See everything for sale <FaArrowRight size={12} /></SeeAll>
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
  kicker = 'Renting it out',
  title = 'Not selling? We will run it for you.',
  sub = 'We find the tenant, collect the rent, handle repairs and pay you the balance. See what you keep.',
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
  { kind: 'sell', k: 'Listings', title: 'Find a home — or sell yours', body: `Approved homes and land to buy or rent, or a firm offer on yours within ${PURCHASE_DAYS} days.` },
  { kind: 'verify', k: 'Verify', title: 'Check it before you pay', body: 'Seller, title, survey, price and the building, in one Property Passport.' },
  { kind: 'move', k: 'Moving', title: 'Move in without the stress', body: 'A crew, the right truck and packing help, priced up front and tracked.' },
  { kind: 'manage', k: 'Manage', title: 'Let it, and leave the rest to us', body: 'Tenants, rent, repairs and renovation, run for you and paid out monthly.' },
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
