import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaHome, FaInbox } from 'react-icons/fa';
import { ArrowRight } from 'lucide-react';
import { AGENT_APPLY_URL, AGENT_URL } from '../config/platform';
import { AgentFinder } from './AgentsDirectoryPage';
import {
  PageShell, Section, Inner, SectionHead, Kicker, SectionTitle, SectionSub, Callout, CalloutAction, enterContainer, enterItem,
} from '../components/page';
import { useIsMobile } from '../utils/useMediaQuery';
import { VerifyFlowArt } from '../components/graphics';
import ChipPhoto from '../components/ChipPhoto';
import { Reveal } from '../components/motion';
import { Button } from '../components/shadcn/button';
import { Badge } from '../components/shadcn/badge';

/**
 * The listing landing. Separate from Manage: here an agent puts homes to
 * rent on the site themselves. Manage is the other product, where we find
 * the tenant (and, on the fuller plans, run the home) for a landlord.
 */

const STEPS = [
  { title: 'Apply', sub: 'We check the agency' },
  { title: 'Post', sub: 'Photos, price, floorplan' },
  { title: 'Reply', sub: 'Enquiries come to you' },
];

const Hero = styled.section`
  position: relative;
  overflow: hidden;
  background: var(--color-band);
  border-bottom: 1px solid var(--color-black-line);
`;

const HeroInner = styled.div`
  max-width: var(--container);
  margin: 0 auto;
  padding: 4rem 2.5rem;
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(280px, 0.9fr);
  gap: 2.5rem;
  align-items: center;
  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); padding: 2.5rem 2rem; }
  @media (max-width: 720px) { padding: 1.5rem 1.25rem 1.75rem; gap: 1.25rem; }
`;

const HeroCopy = styled(motion.div)`
  h1 {
    color: var(--color-ink);
    font-size: clamp(2.1rem, 4vw, 3.2rem);
    font-weight: 550;
    line-height: 1.04;
    letter-spacing: -0.035em;
    margin: 0.9rem 0 0.85rem;
    max-width: 16ch;
  }
  h1 span { color: var(--color-green-deep); }
  p { color: var(--color-on-black-muted); font-size: clamp(1rem, 1.5vw, 1.12rem); line-height: 1.55; max-width: 36rem; margin: 0 0 1.5rem; }
  @media (max-width: 720px) {
    h1 { font-size: 2rem; margin: 0.7rem 0 0.6rem; max-width: none; }
    p { font-size: 0.98rem; }
  }
`;

const HeroActions = styled(motion.div)`
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
  @media (max-width: 560px) { flex-direction: column; }
`;

const Other = styled(motion.p)`
  margin: 0.9rem 0 0;
  font-size: 0.9rem;
  color: var(--color-on-black-muted);
  a { font-weight: 700; color: var(--color-green-deep); }
`;

const Shot = styled(motion.div)`
  border-radius: 22px;
  overflow: hidden;
  box-shadow: var(--shadow-lift);
  img { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; }
  @media (max-width: 720px) { display: none; }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 1rem;
  @media (max-width: 800px) { grid-template-columns: minmax(0, 1fr); }
`;

const Path = styled.article`
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
  min-width: 0;
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: 18px;
  padding: 1.3rem 1.25rem 1.35rem;
  box-shadow: var(--shadow-soft);
  h3 { margin: 0; font-size: 1.2rem; }
  p { margin: 0; flex: 1; color: var(--color-ink-muted); line-height: 1.55; }
  .k { font-size: 0.72rem; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: var(--color-green-deep); }
`;

const Go = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  align-self: flex-start;
  margin-top: 0.4rem;
  background: var(--color-green-deep);
  color: #fff;
  border-radius: 999px;
  padding: 0.7rem 1.05rem;
  font-weight: 650;
  &:hover { color: #fff; background: var(--color-green-forest); }
`;

const Alt = styled(Link)`
  font-size: 0.88rem;
  font-weight: 650;
  color: var(--color-green-deep);
`;

const Anchor = styled.div`scroll-margin-top: calc(var(--nav-h, 72px) + 16px);`;

export default function ListLandingPage() {
  const mobile = useIsMobile();

  return (
    <PageShell>
      <Hero>
        <HeroInner>
          <HeroCopy variants={enterContainer} initial="hidden" animate="show">
            <motion.div variants={enterItem}>
              <Badge variant="dark"><FaHome /> List on the portal</Badge>
            </motion.div>
            <motion.h1 variants={enterItem}>Post the home. <span>The leads come to you.</span></motion.h1>
            <motion.p variants={enterItem}>
              Letting agents advertise their own homes to rent, and every enquiry comes to them.
              A landlord who would rather we find the tenant and run it uses Manage.
            </motion.p>
            <HeroActions variants={enterItem}>
              <Button asChild size="xl" variant="bright" block={mobile}>
                <Link to={AGENT_APPLY_URL}>Apply to list <ArrowRight className="h-4 w-4" /></Link>
              </Button>
              <Button asChild size="xl" variant="link" block={mobile}>
                <a href="#agents">Find an agent</a>
              </Button>
            </HeroActions>
            <Other variants={enterItem}>
              Want us to let it and run it? <Link to="/manage">That is Manage.</Link>
            </Other>
          </HeroCopy>
          {mobile ? (
            <ChipPhoto
              src="/media/m/home-modern.webp"
              alt="A home listed on EasyMoveZone"
              priority
              chips={[
                { icon: FaHome, title: 'Listed by you', sub: 'Homes to rent' },
                { icon: FaInbox, title: 'Leads to you', sub: 'Not published' },
              ]}
            />
          ) : (
            <Shot initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.15 }}>
              <img src="/media/m/home-modern.webp" alt="A home listed on EasyMoveZone" />
            </Shot>
          )}
        </HeroInner>
      </Hero>

      <Section $tint $divide>
        <Inner>
          <Reveal>
            <SectionHead $center>
              <Kicker>How listing works</Kicker>
              <SectionTitle>Three steps onto the portal.</SectionTitle>
            </SectionHead>
          </Reveal>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <VerifyFlowArt vertical={mobile} steps={STEPS} label="How listing works: apply, post the home, reply to leads" />
          </div>
        </Inner>
      </Section>

      <Section $divide>
        <Inner>
          <Reveal>
            <SectionHead>
              <Kicker>Who is listing</Kicker>
              <SectionTitle>Two ways to let a home here.</SectionTitle>
              <SectionSub>An agency posts its own homes and answers its own leads. A landlord can have us find the tenant, or run the whole tenancy.</SectionSub>
            </SectionHead>
          </Reveal>
          <Grid>
            <Path>
              <div className="k">Letting agent</div>
              <h3>Post and let your own homes</h3>
              <p>Apply once. We check the agency, you choose a plan, then the portal is yours: drafts, photos, floorplans, offices, and every enquiry.</p>
              <Go to={AGENT_APPLY_URL}>Apply to list <FaArrowRight size={11} /></Go>
              <Alt to={AGENT_URL}>Already verified? Open your portal</Alt>
            </Path>
            <Path>
              <div className="k">Landlord</div>
              <h3>We find the tenant, or run it all</h3>
              <p>Hand the home to us. We advertise it, show it, check every applicant and sign the tenancy. On the fuller plans we also collect the rent and handle repairs.</p>
              <Go to="/manage">See how we manage <FaArrowRight size={11} /></Go>
            </Path>
          </Grid>
        </Inner>
      </Section>

      <Anchor id="agents">
        <Section $tint $divide>
          <Inner>
            <Reveal>
              <SectionHead>
                <Kicker>Find an agent</Kicker>
                <SectionTitle>Verified letting agencies.</SectionTitle>
                <SectionSub>Search by city or name. Every agency here was reviewed before they could post.</SectionSub>
              </SectionHead>
            </Reveal>
            <AgentFinder />
          </Inner>
        </Section>
      </Anchor>

      <Section>
        <Inner>
          <Reveal>
            <Callout>
              <div>
                <h2>Already listing with us?</h2>
                <p>Open the agent portal to post, edit, and answer the people who enquire.</p>
              </div>
              <CalloutAction to={AGENT_URL}>Open the portal <FaArrowRight size={13} /></CalloutAction>
            </Callout>
          </Reveal>
        </Inner>
      </Section>
    </PageShell>
  );
}
