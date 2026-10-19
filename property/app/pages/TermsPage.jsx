import React from 'react';
import styled from 'styled-components';
import { FoldByHeading } from '../components/MobileFold';
import { MARKET } from '../config/markets';

const Page = styled.div`
  min-height: 60vh;
  background:
    radial-gradient(900px 380px at 80% -20%, rgba(47, 93, 80, 0.12), transparent 70%),
    linear-gradient(180deg, var(--color-green-wash) 0%, var(--color-bg) 45%);
  font-family: var(--font-sans);
`;

/* The document sits on a white sheet over the tinted page — same shape as
   every other content panel in the app. */
const Shell = styled.div`
  max-width: 840px;
  margin: 0 auto;
  padding: 3.25rem 1.5rem 4rem;

  @media (max-width: 640px) {
    padding: 2rem 1.25rem 3rem;
  }
`;

const Sheet = styled.div`
  background: #fff;
  border: 1px solid var(--color-line);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-card);
  padding: 2.75rem 3rem 3rem;

  @media (max-width: 640px) { padding: 1.5rem 1.25rem 2rem; border-radius: var(--radius-lg); }
`;

const Eyebrow = styled.p`
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-green-deep);
  margin: 0 0 0.6rem;
`;

const Title = styled.h1`
  font-family: var(--font-display);
  font-size: clamp(1.6rem, 3vw, 2.2rem);
  font-weight: 700;
  color: var(--color-ink);
  margin: 0 0 0.5rem;
  letter-spacing: -0.02em;
`;

const Meta = styled.p`
  font-size: 0.8rem;
  color: var(--color-ink-faint);
  margin: 0 0 2.5rem;
`;

const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--color-line);
  margin: 2rem 0;
`;

const H2 = styled.h2`
  font-family: var(--font-display);
  font-size: 1.2rem;
  font-weight: 700;
  color: var(--color-ink);
  margin: 0 0 0.6rem;
`;

const P = styled.p`
  font-size: 0.98rem;
  line-height: 1.75;
  color: var(--color-ink-muted);
  margin: 0 0 1rem;
`;

const UL = styled.ul`
  margin: 0 0 1rem;
  padding-left: 1.3rem;

  li {
    font-size: 0.88rem;
    line-height: 1.72;
    color: var(--color-ink-muted);
    margin-bottom: 0.3rem;
  }
`;

const DisclaimerBox = styled.div`
  margin: 2rem 0;
  padding: 1.25rem 1.35rem;
  background: #fffbeb;
  border: 1px solid #fde68a;
  border-radius: 12px;
  font-size: 0.85rem;
  color: #78350f;
  line-height: 1.65;
  font-weight: 500;
`;

const ContactBox = styled.div`
  margin-top: 2rem;
  padding: 1.25rem 1.35rem;
  background: #ffffff;
  border: 1px solid var(--color-line-strong);
  border-radius: 12px;
  font-size: 0.85rem;
  color: var(--color-ink-muted);
  line-height: 1.65;

  a {
    color: var(--color-green-deep);
    text-decoration: none;
    font-weight: 600;
    &:hover { text-decoration: underline; }
  }
`;

const TermsPage = () => (
  <Page>
    <Shell>
      <Sheet>
      <Eyebrow>Legal</Eyebrow>
      <Title>Terms of Service</Title>
      <Meta>Effective date: 18 October 2026 &nbsp;·&nbsp; EasyMoveZone</Meta>
      <Divider />

      <DisclaimerBox>
        <strong>Educational use only.</strong> Nothing on EasyMoveZone constitutes personalised financial
        advice, a solicitation, or a recommendation to buy or sell any security. All content is for
        informational and educational purposes. Always consult a licensed financial professional before
        making investment decisions.
      </DisclaimerBox>

      <FoldByHeading heading={H2}>
      <H2>1. Acceptance of terms</H2>
      <P>
        By accessing or using EasyMoveZone ("the Service") you agree to be bound by these Terms of
        Service and our Privacy Policy. If you do not agree, do not use the Service.
      </P>

      <H2>2. Description of service</H2>
      <P>
        EasyMoveZone provides property verification, valuation, purchase coordination,
        construction and renovation oversight, and ongoing property management. EasyMoveZone Manage
        includes tenant coordination, rent collection, maintenance and owner reporting for properties
        placed under management. The scope, price and conditions for a specific engagement are set out
        in its written proposal or signed service agreement, not this general page.
      </P>

      <H2>3. Eligibility</H2>
      <P>
        You must be at least 16 years old to use the Service. By using it you confirm that you meet this
        requirement.
      </P>

      <H2>4. No financial advice</H2>
      <P>
        Automated photo analysis, indicative valuations, rental-yield estimates and AI responses are
        decision-support tools, not legal, financial or investment advice. They may be incomplete and
        do not replace title searches, physical inspections, professional surveys or advice from an
        appropriately qualified professional. A Property Passport records the checks actually included
        in its agreed scope; it is not a guarantee against every possible defect or dispute.
      </P>

      <H2>5. Acceptable use</H2>
      <P>You agree not to:</P>
      <UL>
        <li>Use the Service for any unlawful purpose.</li>
        <li>Scrape, copy, or redistribute content without permission.</li>
        <li>Attempt to reverse-engineer or interfere with the platform's infrastructure.</li>
        <li>Impersonate any person or entity.</li>
        <li>Use the Service to generate, distribute, or act on financial advice to third parties.</li>
      </UL>

      <H2>6. Intellectual property</H2>
      <P>
        All platform content, branding, and code remain the property of EasyMoveZone. User-generated
        content and property materials you submit belong to you; you grant us a limited licence to
        store, process and display them as needed to provide the requested service.
      </P>

      <H2>7. Third-party data and AI</H2>
      <P>
        The Service may use public records, market comparables, mapping services, payment providers,
        storage providers and third-party AI APIs. Availability and coverage vary by country. We do not
        guarantee the accuracy, completeness or timeliness of third-party data or automated output.
      </P>

      <H2>8. Disclaimers and limitation of liability</H2>
      <P>
        The Service is provided "as is" without warranties of any kind. To the maximum extent permitted
        by law, EasyMoveZone shall not be liable for any direct, indirect, incidental, or consequential
        damages arising from your use of, or inability to use, the Service, subject to any liability
        that cannot lawfully be excluded.
      </P>

      <H2>9. Termination</H2>
      <P>
        We reserve the right to suspend or terminate your access at any time for breach of these Terms.
        You may stop using the Service at any time; contact us to request account deletion.
      </P>

      <H2>10. Governing law</H2>
      <P>
        These Terms are governed by {MARKET.law.governing}. Any disputes will be subject to the
        exclusive jurisdiction of {MARKET.law.courts}.
      </P>

      <H2>11. Changes to these terms</H2>
      <P>
        We may update these Terms at any time. Continued use after changes are posted constitutes
        acceptance. Material changes will be flagged by updating the effective date above.
      </P>

      </FoldByHeading>

      <ContactBox>
        <strong>Questions?</strong> Contact us at{' '}
        <a href="mailto:hello@easymovezone.com">hello@easymovezone.com</a>.
      </ContactBox>
      </Sheet>
    </Shell>
  </Page>
);

export default TermsPage;
