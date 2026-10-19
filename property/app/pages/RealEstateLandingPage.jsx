import React from 'react';
import { PageShell } from '../components/page';
import {
  LandingHero, LandingStats, PassportSection, ForSaleStrip, JourneySection,
} from './landing-sections';

/**
 * The public pitch. Sections live in landing-sections.jsx; this file is only
 * the order they run in: the hero, how the app fits together (find → verify →
 * move in → manage), the numbers, verifying a property, then what is for
 * sale. The rent calculator lives on the Manage page, and there is no
 * floating CTA bar — the tab bar already has Verify.
 */
export default function RealEstateLandingPage() {
  return (
    <PageShell>
      <LandingHero />
      <JourneySection />
      <LandingStats />
      <PassportSection />
      <ForSaleStrip />
    </PageShell>
  );
}
