import styled from 'styled-components';
import { Stagger } from './motion';

/**
 * The header every service page shares (Sell, Build, Renovate, Consult): a
 * photo under a dark green shade on desktop, a flat forest band on phones.
 * Children: an `.eyebrow`, an h1, a p and optionally an `.aside` link line.
 * A `.spot` child (a <SpotArt>) is the phone's picture: hidden on desktop,
 * where the photo does that job, and tucked beside the heading on phones.
 */
export const ServiceHero = styled.section`
  position: relative;
  min-height: 330px;
  display: flex;
  align-items: center;
  overflow: hidden;
  background: var(--color-band) url(${(p) => p.$image}) center / cover no-repeat;
  border-bottom: 1px solid var(--color-line);

  /* A light shade, not a dark one: the words sit on grey, the photo shows
     through on the right. Phones get the plain grey band. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(243, 240, 231, 0.97), rgba(243, 240, 231, 0.9) 52%, rgba(243, 240, 231, 0.25));
  }

  @media (max-width: 720px) {
    min-height: 0;
    background-image: none;
  }
`;

export const ServiceHeroInner = styled(Stagger)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 3rem 2.5rem;
  color: var(--color-ink);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: center;

  .art { width: min(100%, 380px); justify-self: end; filter: drop-shadow(var(--shadow-lift)); }
  .spot { display: none; }
  @media (max-width: 960px) { grid-template-columns: minmax(0, 1fr); .art { display: none; } }

  .eyebrow { color: var(--color-green-deep); font-size: .75rem; font-weight: 750; letter-spacing: .07em; text-transform: uppercase; }
  .aside { margin-top: .9rem; font-size: .9rem; color: var(--color-ink-muted); }
  .aside a { display: inline-flex; align-items: center; gap: .35rem; color: var(--color-green-deep); font-weight: 700; }
  .aside a:hover { color: var(--color-green-forest); }
  h1 { color: var(--color-ink); max-width: 720px; margin: .65rem 0 .8rem; font-size: clamp(2rem, 4vw, 3.1rem); font-weight: 520; letter-spacing: -.035em; line-height: 1.06; }
  p { color: var(--color-ink-muted); max-width: 650px; font-size: 1rem; line-height: 1.6; }

  @media (max-width: 720px) {
    padding: 1.2rem 1rem 1.3rem;
    .eyebrow { font-size: .63rem; }
    h1 { margin: .4rem 0 .2rem; font-size: 1.5rem; line-height: 1.1; }
    p { font-size: .88rem; line-height: 1.45; }
    .aside { margin-top: .6rem; }
    .spot { display: block; position: absolute; right: .75rem; top: .9rem; width: 88px; }
    .spot.low { top: 4.4rem; width: 80px; }
    ${(p) => p.$spot && 'h1, > div > p, .eyebrow { padding-right: 92px; }'}
  }
`;
