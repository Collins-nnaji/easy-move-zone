import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight } from 'react-icons/fa';
import { ServiceHero, ServiceHeroInner } from '../components/ServiceHero';
import { StaggerItem, staggerItem, Reveal } from '../components/motion';
import { SpotArt } from '../components/graphics';
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from '../components/shadcn/accordion';
import { useIsMobile } from '../utils/useMediaQuery';
import { formatMoneyFull } from '../utils/format';
import { VERIFICATION_TYPES } from '../config/verification';
import {
  CONTACT_URL, MARKETPLACE_URL, OFFER_URL, OFFER_VERIFY_URL, OFFER_ANALYZE_URL, BOOK_SESSION_URL, SAVED_URL, RENT_URL,
  PURCHASE_DAYS, AREAS_URL,
} from '../config/platform';

/**
 * Help — the questions people ask before they trust a property app, answered
 * from what the app actually does. Every answer is a drop-down, on every
 * screen size, so the page reads as a list of questions.
 */

const GROUPS = [
  {
    title: 'Buying',
    items: [
      ['Is every property on EasyMoveZone checked?', <>Yes. Nothing goes on the market until we have valued it and an admin has approved it. <Link to={MARKETPLACE_URL}>See what is for sale</Link>.</>],
      ['What do “Owned by EasyMoveZone” and “Sold via EasyMoveZone” mean?', 'Owned by EasyMoveZone: we bought the property outright, so you buy from us. Sold via EasyMoveZone: we are selling it on the owner’s behalf, and title and paperwork are checked before exchange.'],
      ['How do I arrange a viewing?', 'Open the property and tap Enquire. Tick “I’d like to view it”, pick a day, and someone from our desk calls you — usually within one business day.'],
      ['Can I save properties to look at later?', <>Tap the heart on any property. Your saved list is on this device, under your account menu or at <Link to={SAVED_URL}>Saved properties</Link>.</>],
      ['Can I be told when something new comes up?', 'Yes. On the properties page, set your filters and use “Email me new listings”. We write when a match goes live.'],
      ['Can I pay over time?', <>Ask us. Instalments and financing are arranged case by case — <Link to={BOOK_SESSION_URL}>talk to an adviser</Link>.</>],
    ],
  },
  {
    title: 'Renting',
    items: [
      ['Who are the homes to rent from?', <>Every home on the <Link to={RENT_URL}>Rent page</Link> is one we manage for its owner, advertised with the owner’s permission. You deal with EasyMoveZone from the viewing to the keys, and afterwards for rent and repairs.</>],
      ['How do I apply?', 'Open the home and tap Apply. Tell us who you are, when you want to move in and when you can view it. Someone from the lettings desk calls you, usually within one business day.'],
      ['What checks do you do?', 'We confirm your identity, your work or income, and a reference such as an employer or past landlord, and only with your agreement on the form. You show us your ID at or after the viewing; you do not upload it on the website.'],
      ['Why is the street address not shown?', 'The home is often empty while it is advertised, so we give the exact address when we book your viewing.'],
      ['What will I pay?', 'The listing shows the rent and how often it is paid, plus any service charge and refundable caution deposit. Your tenancy agreement sets out the final figures before you pay anything.'],
      ['I rent a home from EasyMoveZone. Where do I report a repair?', 'Your manager sends you a link to your tenant portal; open it and sign in with any email. There you report repairs (with photos, if you like), message your manager, see your rent schedule, pay online or tell us you paid by transfer, and open your tenancy agreement. You get a notice when anything changes.'],
      ['How do I find out what an area is really like?', <>Open its <Link to={AREAS_URL}>neighbourhood page</Link>. Residents score the light, water, flooding, roads, security, noise and network, and post about buildings, streets and the commute. Each page also shows typical rents on the homes we let there, a map, a commute check and what is nearby.</>],
      ['Who can post on a neighbourhood page, and what can I say?', 'Anyone signed in can post, reply and add scores; reading is open to everyone. Talk about places and what you have seen yourself: a building, a street, the light or the traffic. Do not name or accuse people, and do not share phone numbers. Posts that may name someone wait for our team to read them first, and anything reported by several people is hidden until we review it.'],
      ['What does “Verified resident” mean?', 'It marks posts and scores from someone who rents a home we manage in that area, so you know they live there.'],
      ['Can I pay rent online?', 'Yes, where it is switched on: open Rent in your tenant portal and tap Pay now beside any charge. You pay by card, bank transfer or USSD through Paystack, and the payment shows as received straight away.'],
      ['I own a property and rent another home. Which portal do I use?', 'Both, with the same sign-in. The switch at the top of the portal sidebar says which one you are in: Owner for the property we manage for you, Tenant for the home you rent.'],
    ],
  },
  {
    title: 'Verifying a property',
    items: [
      ['What is a Property Passport?', 'One verified record of a property before money moves: seller identity and ownership, title and documents, survey and location, an independent valuation, physical inspection, flood/access/neighbourhood risk and rental and resale potential — with one named adviser throughout.'],
      ['How much does a verification cost?', <>It depends on the type of check, and every price is in naira: {VERIFICATION_TYPES.map((t, i) => <React.Fragment key={t.id}>{i ? '; ' : ''}{t.name} {formatMoneyFull(t.price, 'NGN')}</React.Fragment>)}. Extra services (such as a structural engineer’s inspection or express turnaround) are priced on the form.</>],
      ['Can I verify a property I found somewhere else?', <>Yes — any listing, from any agent, seller or website. <Link to={OFFER_VERIFY_URL}>Start a verification</Link>.</>],
      ['Do I pay before you start?', 'No. You see the price for your check on the form; an adviser then reviews what you sent and confirms it. Nothing is charged until you agree it.'],
      ['What is the free photo scan?', <>A fast read of the photos for visible condition and risk flags. It is an early signal, not a replacement for a full verification. <Link to={OFFER_ANALYZE_URL}>Try the photo scan</Link>.</>],
    ],
  },
  {
    title: 'Selling',
    items: [
      ['How can I sell through EasyMoveZone?', <>Two ways: sell it to us, or list it with us and we find a buyer. <Link to={OFFER_URL}>Start here</Link>.</>],
      ['How fast can EasyMoveZone buy my property?', `Tell us about it and we book an inspection and verify the title. Once that is done we make you a firm offer. Accept it and we complete the purchase within ${PURCHASE_DAYS} days of verification, under a sale agreement you sign. There are no viewings and no waiting for a buyer.`],
      ['Which documents do I need to sell?', "On the Sell form, tick every paper you hold: the C of O, Governor's Consent, a registered Deed of Assignment, the survey plan, receipts, building approval, or anything else. Upload them if you can; they stay private and only our verification team sees them. A registered title is the quickest to verify, but you can start without one and we will tell you what the property needs."],
      ['Do I have to accept your offer?', 'No. The offer is yours to accept or turn down, and you can ask us to list the property for sale instead.'],
      ['Will my property be published straight away?', 'No. Nothing is published unless you ask for it, and a public listing needs both your say-so and our approval.'],
      ['What photos and videos do you need?', 'At least 10 photos and 2 short videos when uploads are available. If they are not, an adviser collects them from you directly.'],
    ],
  },
  {
    title: 'Letting and management',
    items: [
      ['What do you do when you manage my property?', 'We find and vet tenants, collect the rent, handle repairs and upkeep, and can renovate it — then pay you the balance with a statement.'],
      ['Will I have to deal with my tenants?', 'No. EasyMoveZone runs the whole process for you, set up around your property: tenants contact us, never you, and we handle their questions, repairs, payments and renewals. In your portal you see everything — tenancies, rent, costs and documents — approve any cost above your limit, and talk to your manager.'],
      ['Will you advertise my property?', 'Only if you allow it. While a managed property is empty, you can switch on advertising in your console (or tick the box when you add it) and we list it on the Rent page — without your name, contact details or street address. Switch it off and the listing comes down at once.'],
      ['What does management cost?', 'It depends on the plan. The calculator on the Manage page gives an indicative figure; your written proposal carries the final fee.'],
      ['How do renovations work?', 'We inspect and price the scope, you approve each stage before anyone is paid, and you get before-and-after photos and receipts.'],
    ],
  },
  {
    title: 'Agents',
    items: [
      ['How does a home get onto the listings?', <>Two different pages. <Link to="/list">List a property</Link> is for an agent posting their own stock, or an owner selling. <Link to="/manage">Manage</Link> is for a landlord who wants us to find the tenant and run the home.</>],
      ['Can an estate agent list properties here?', <>Yes. <Link to="/agent/apply">Apply as an agency</Link>, wait for staff to verify you, choose a listing plan, then post sale and rental stock from the agent portal. Listings go live after a short review.</>],
      ['Can you help me get a mortgage?', <>The <Link to="/mortgage">mortgages page</Link> estimates a bank loan or a National Housing Fund loan, and you can ask the desk to broker an introduction. That request is not an offer of credit.</>],
      ['How do I find an agent?', <>Open <Link to="/list#agents">Find an agent</Link> on the listing page. Every agency there has been verified before they can post.</>],
      ['How do I estimate a mortgage payment?', <>Use the <Link to="/mortgage">mortgage calculator</Link>. It is an estimate, not a quote or an offer of credit.</>],
    ],
  },
  {
    title: 'Your account',
    items: [
      ['Do I need an account?', 'Not to browse, save properties, verify a property or talk to an adviser. You need one to have us manage a property, so you can follow rent, repairs and statements, as a tenant to use the tenant portal, and as an agent to post listings.'],
      ['How do I sign out?', 'Tap your initials at the top right, then Sign out.'],
      ['How is my data used?', <>See our <Link to="/privacy">privacy policy</Link>. We do not sell your data.</>],
    ],
  },
];

const Page = styled.div`background: var(--color-bg-panel); min-height: 70vh;`;
const Body = styled.section`max-width: 820px; margin: 0 auto; padding: 2rem 1.5rem 5rem; @media (max-width: 720px) { padding: 1.25rem 1rem 3.5rem; }`;
const Group = styled.div`
  background: #fff; border: 1px solid var(--color-line); border-radius: 18px; padding: 0.4rem 1.25rem; margin-bottom: 1rem;
  h2 { font-size: 0.74rem; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: var(--color-green-deep); margin: 1rem 0 0.2rem; }
  p, .a { color: var(--color-ink-muted); font-size: 0.93rem; line-height: 1.6; margin: 0; }
  a { color: var(--color-green-deep); font-weight: 600; }
  @media (max-width: 560px) { padding: 0.3rem 1rem; }
`;
const Still = styled.div`
  margin-top: 1.5rem; display: flex; align-items: center; justify-content: space-between; gap: 1rem; flex-wrap: wrap;
  background: var(--color-band); border: 1px solid var(--color-line); border-radius: 18px; padding: 1.25rem;
  strong { font-size: 1.02rem; }
  a { display: inline-flex; align-items: center; gap: 0.45rem; background: var(--color-green-deep); color: #fff; font-weight: 700; padding: 0.75rem 1.1rem; border-radius: 12px; }
  a:hover { background: var(--color-green-forest); color: #fff; }
`;

export default function HelpPage() {
  const mobile = useIsMobile();
  return (
    <Page>
      <ServiceHero $image="/media/building.jpg">
        <ServiceHeroInner $spot={mobile}>
          {mobile && <SpotArt className="spot" kind="verify" />}
          <div>
            <StaggerItem className="eyebrow">Help</StaggerItem>
            <motion.h1 variants={staggerItem}>Questions, answered.</motion.h1>
            <motion.p variants={staggerItem}>Buying, verifying, selling and letting with EasyMoveZone.</motion.p>
          </div>
        </ServiceHeroInner>
      </ServiceHero>
      <Body>
        {GROUPS.map((g) => (
          <Reveal key={g.title}>
            <Group>
              <h2>{g.title}</h2>
              <Accordion type="single" collapsible>
                {g.items.map(([q, a], i) => (
                  <AccordionItem key={q} value={q} className={i === g.items.length - 1 ? 'border-b-0' : undefined}>
                    <AccordionTrigger>{q}</AccordionTrigger>
                    <AccordionContent><div className="a">{a}</div></AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Group>
          </Reveal>
        ))}
        <Still>
          <strong>Still need help?</strong>
          <Link to={CONTACT_URL}>Contact us <FaArrowRight size={11} /></Link>
        </Still>
      </Body>
    </Page>
  );
}
