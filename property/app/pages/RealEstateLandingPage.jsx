import React from 'react';
import { PageShell } from '../components/page';
import {
  LandingHero, LandingStats, RentalCheckSection, NewRentalsStrip, JourneySection, RentCalculator,
} from './landing-sections';

/**
 * The public pitch. Sections live in landing-sections.jsx; this file is only
 * the order they run in: the hero, how renting with us fits together (find →
 * check → move in → live), the numbers, checking a rental before you pay, the
 * newest homes to rent, then what we do for landlords (on phones, a
 * callout and a button rather than the fee calculator).
 */
export default function RealEstateLandingPage() {
  return (
    <PageShell>
      <LandingHero />
      <JourneySection />
      <LandingStats />
      <NewRentalsStrip />
      <RentalCheckSection />
      <RentCalculator tint={false} calloutOnMobile />
    </PageShell>
  );
}
