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

const PrivacyPage = () => (
  <Page>
    <Shell>
      <Sheet>
      <Eyebrow>Legal</Eyebrow>
      <Title>Privacy Policy</Title>
      <Meta>Effective date: 18 October 2026 &nbsp;·&nbsp; EasyMoveZone</Meta>
      <Divider />

      <FoldByHeading heading={H2}>
      <H2>1. Who we are</H2>
      <P>
        EasyMoveZone ("EasyMoveZone", "we", "us") operates the easymovezone.com property verification,
        acquisition, construction-control, renovation and management platform. This policy explains what data we
        collect, how we use it, and the choices you have.
      </P>

      <H2>2. Data we collect</H2>
      <UL>
        <li><strong>Account data:</strong> email address and display name when you create an account or sign in by email or Google.</li>
        <li><strong>Usage data:</strong> pages visited, features used, and session length, collected anonymously for product improvement.</li>
        <li><strong>Property data:</strong> addresses, ownership and seller details, documents, photographs, videos, inspection evidence, verification results and service requests you submit.</li>
        <li><strong>Management data:</strong> your plan answers, managed properties, tenancy and rent records, expenses, approvals, payouts and consultation details.</li>
        <li><strong>Session state:</strong> advisor chat history tied to your session or account.</li>
        <li><strong>Technical data:</strong> browser type, device type, and IP address for security and diagnostics.</li>
      </UL>

      <H2>3. How we use your data</H2>
      <UL>
        <li>Delivering the platform and personalising your experience (e.g. saving progress).</li>
        <li>Improving and debugging the service through aggregated analytics.</li>
        <li>Communicating service updates if you have opted in.</li>
        <li>Preventing abuse and ensuring platform security.</li>
      </UL>
      <P>We do not sell your data to third parties or use it for targeted advertising.</P>

      <H2>4. AI features and third-party APIs</H2>
      <P>
        EasyAdviser uses AI models via a third-party API provider. Queries you submit, and the plan
        and property or financial records needed to answer them, may be processed by that provider subject to their
        data-handling policies. We do not share your name, email or contact details with the AI
        provider, and AI output is educational commentary rather than personal financial advice.
      </P>

      <H2>5. Cookies and local storage</H2>
      <P>
        We use browser local storage to retain session preferences and notes client-side. No third-party
        advertising cookies are set. Authentication uses secure HTTP-only cookies scoped to your session.
      </P>

      <H2>6. Data retention</H2>
      <P>
        Account data is retained while your account is active. You can request deletion at any time by
        contacting us. Anonymised analytics data may be retained for up to 24 months.
      </P>

      <H2>7. Your rights</H2>
      <P>
        We process personal data in line with {MARKET.law.dataProtection}. You have the right to be told
        how your data is used, and to access, correct, move or delete it, and to object to or withdraw consent
        for its use. To exercise any of these rights, contact us at the address below. If you are not
        satisfied with our answer, you can complain to {MARKET.law.regulator}.
      </P>

      <H2>8. Security</H2>
      <P>
        We use industry-standard encryption in transit (TLS) and at rest. Access to user data is
        restricted to authorised personnel only. No system is perfectly secure; please use a strong
        password and keep your account credentials private.
      </P>

      <H2>9. Children</H2>
      <P>
        EasyMoveZone is not directed at children under 16. We do not knowingly collect data from anyone
        under 16. If you believe we have done so in error, contact us and we will delete it promptly.
      </P>

      <H2>10. Changes to this policy</H2>
      <P>
        We may update this policy from time to time. Material changes will be signalled by updating the
        effective date above. Continued use of the platform after changes constitutes acceptance.
      </P>

      </FoldByHeading>

      <ContactBox>
        <strong>Questions?</strong> Contact us at{' '}
        <a href="mailto:hello@easymovezone.com">hello@easymovezone.com</a>. We aim to respond within 5 business days.
      </ContactBox>
      </Sheet>
    </Shell>
  </Page>
);

export default PrivacyPage;
