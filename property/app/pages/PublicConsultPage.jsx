import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ManageConsult from './manage-consult';
import { ServiceHero, ServiceHeroInner } from '../components/ServiceHero';
import { StaggerItem, staggerItem } from '../components/motion';
import { SpotArt } from '../components/graphics';
import { useIsMobile } from '../utils/useMediaQuery';

const Page = styled.div`background:var(--color-bg-panel);min-height:70vh;`;
const Body = styled.section`max-width:1080px;margin:0 auto;padding:2rem 1.25rem 5rem;@media(max-width:560px){padding:1.4rem .9rem 3.5rem}`;

/** Same header as Sell, Build and Renovate, so the adviser form reads as part of the same site. */
export default function PublicConsultPage() {
  const mobile = useIsMobile();
  return (
    <Page>
      <ServiceHero $image="/media/inspection.jpg">
        <ServiceHeroInner $spot={mobile}>
          {mobile && <SpotArt className="spot" kind="consult" />}
          <div>
            <StaggerItem className="eyebrow">Free · no account needed</StaggerItem>
            <motion.h1 variants={staggerItem}>Talk to a property adviser.</motion.h1>
            <motion.p variants={staggerItem}>Tell us what you are buying, building, renovating or letting. An adviser replies within one business day.</motion.p>
          </div>
        </ServiceHeroInner>
      </ServiceHero>
      <Body><ManageConsult /></Body>
    </Page>
  );
}
