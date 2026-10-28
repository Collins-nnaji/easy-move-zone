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
  CONTACT_URL, BOOK_SESSION_URL, SAVED_URL, RENT_URL, RENTAL_CHECK_URL, AREAS_URL, AGENT_APPLY_URL, LIST_URL,
} from '../config/platform';

/**
 * Help — the questions people ask before they trust a rental app, answered
 * from what the app actually does. Every answer is a drop-down, on every
 * screen size, so the page reads as a list of questions.
 */

const GROUPS = [
  {
    title: 'Finding a home',
    items: [
      ['Who are the homes to rent from?', <>Every home on <Link to={RENT_URL}>Homes to rent</Link> is either one we manage for its owner, or one listed by a verified agent. Nothing goes live until our team has approved it.</>],
      ['How do I apply?', 'Open the home and tap Apply. Tell us who you are, when you want to move in and when you can view it. Someone from the lettings desk calls you, usually within one business day.'],
      ['Why is the street address not shown?', 'The home is often empty while it is advertised, so we give the exact address when we book your viewing.'],
      ['What will I pay?', 'The listing shows the rent and how often it is paid, plus any service charge and refundable caution deposit. Your tenancy agreement sets out the final figures before you pay anything.'],
      ['Can I save homes to look at later?', <>Tap the heart on any home. Your saved list is under your account menu, or at <Link to={SAVED_URL}>Saved homes</Link>.</>],
      ['Can I be told when a new home comes up?', 'Yes. Set your filters on Homes to rent and use “Email me new homes to rent”. We write when a match goes live.'],
    ],
  },
  {
    title: 'Checking a rental before you pay',
    items: [
      ['What can you check?', <>Three things, before any money moves: the person (is the landlord or agent real, and allowed to let this home?), the home itself (does it exist, and match the photos?), and the deal (the tenancy agreement and whether the rent is fair). <Link to={RENTAL_CHECK_URL}>Check a rental</Link>.</>],
      ['How much does a check cost?', <>Every price is in naira: {VERIFICATION_TYPES.map((t, i) => <React.Fragment key={t.id}>{i ? '; ' : ''}{t.name} {formatMoneyFull(t.price, 'NGN')}</React.Fragment>)}. Extras, such as a 48-hour turnaround, are priced on the form.</>],
      ['Can I check a home I found somewhere else?', 'Yes. That is what it is for: a home from an agent, a landlord, social media or another website. Homes listed on EasyMoveZone are already checked.'],
      ['Do I pay before you start?', 'No. You see the price on the form; we then confirm it. Nothing is charged until you agree it.'],
      ['What are the warning signs of a rental scam?', 'Being asked for an “inspection fee” or deposit before you have seen the inside, a landlord who is always “away”, a price far below the area, pressure to pay today, and a payment account in a different name. If any of these happen, pause and check it first.'],
    ],
  },
  {
    title: 'Neighbourhoods',
    items: [
      ['How do I find out what an area is really like?', <>Open its <Link to={AREAS_URL}>neighbourhood page</Link>. Residents score the light, water, flooding, roads, security, noise and network, and post about buildings, streets and the commute. Each page also shows typical rents on the homes we let there, a map, a commute check and what is nearby.</>],
      ['Who can post on a neighbourhood page, and what can I say?', 'Anyone signed in can post, reply and add scores; reading is open to everyone. Talk about places and what you have seen yourself: a building, a street, the light or the traffic. Do not name or accuse people, and do not share phone numbers. Posts that may name someone wait for our team to read them first, and anything reported by several people is hidden until we review it.'],
      ['What does “Verified resident” mean?', 'It marks posts and scores from someone who rents a home we manage in that area, so you know they live there.'],
    ],
  },
  {
    title: 'Living in a home we manage',
    items: [
      ['Where do I report a repair?', 'In your tenant portal. Your manager sends you a link; open it and sign in with any email. There you report repairs (with photos, if you like), message your manager, see your rent schedule, pay online or tell us you paid by transfer, and open your tenancy agreement. You get a notice when anything changes.'],
      ['Can I pay rent online?', 'Yes, where it is switched on: open Rent in your tenant portal and tap Pay now beside any charge. You pay by card, bank transfer or USSD through Paystack, and the payment shows as received straight away.'],
      ['What checks do you do on tenants?', 'We confirm your identity, your work or income, and a reference such as an employer or past landlord, and only with your agreement on the form. You show us your ID at or after the viewing; you do not upload it on the website.'],
    ],
  },
  {
    title: 'Landlords',
    items: [
      ['What do you do when you manage my property?', 'We find and check tenants, collect the rent, handle repairs and inspections, and can renovate between tenants, then pay you the balance with a statement.'],
      ['How do you check tenants?', 'Every applicant is checked for identity, income or work, and a reference before we recommend them. You see where each application stands in your portal.'],
      ['Do you inspect the home?', 'Yes, on Full Management: a move-in inventory, routine inspections with photo reports, and a move-out check before the caution deposit is returned.'],
      ['Will I have to deal with my tenants?', 'No. Tenants contact us, never you, and we handle their questions, repairs, payments and renewals. In your portal you see everything — tenancies, rent, costs and documents — approve any cost above your limit, and talk to your manager.'],
      ['Will you advertise my property?', 'Only if you allow it. While a managed home is empty, you can switch on advertising in your portal and we list it on Homes to rent, without your name, contact details or street address. Switch it off and the listing comes down at once.'],
      ['What does management cost?', 'It depends on the plan. The calculator on the Manage page gives an indicative figure; your written proposal carries the final fee.'],
    ],
  },
  {
    title: 'Agents',
    items: [
      ['How does a home get onto the listings?', <>Two ways. <Link to={LIST_URL}>List a home to rent</Link> is for an agent or landlord posting it themselves. <Link to="/manage">Manage</Link> is for a landlord who wants us to find the tenant and run the home.</>],
      ['Can a letting agent list homes here?', <>Yes. <Link to={AGENT_APPLY_URL}>Apply as an agency</Link>, wait for staff to verify you, choose a listing plan, then post homes to rent from the agent portal. Listings go live after a short review.</>],
      ['How do I find an agent?', <>Open <Link to="/list#agents">Find an agent</Link>. Every agency there has been verified before they can post.</>],
    ],
  },
  {
    title: 'Your account',
    items: [
      ['Do I need an account?', 'Not to browse, save homes or talk to an adviser. You need one to apply for a home, order a rental check, have us manage a property, use the tenant portal, or post listings as an agent.'],
      ['I own a property and rent another home. Which portal do I use?', 'Both, with the same sign-in. The switch at the top of the portal sidebar says which one you are in: Landlord for the property we manage for you, Tenant for the home you rent.'],
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
            <motion.p variants={staggerItem}>Renting, checking a rental, and letting with EasyMoveZone.</motion.p>
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
