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
  min-height: ${(p) => (p.$image ? '240px' : '0')};
  display: flex;
  align-items: center;
  overflow: hidden;
  background: ${(p) => (p.$image ? `var(--color-band) url(${p.$image}) center / cover no-repeat` : 'var(--color-bg)')};
  border-bottom: 1px solid var(--color-line);

  /* A light shade, not a dark one: the words sit on grey, the photo shows
     through on the right. No photo means no shade and no empty right-hand band. */
  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(90deg, rgba(255, 255, 255, 0.98), rgba(255, 255, 255, 0.92) 52%, rgba(255, 255, 255, 0.3));
    display: ${(p) => (p.$image ? 'block' : 'none')};
  }

  @media (max-width: 720px) {
    min-height: 0;
    background-image: none;
    &::before { display: none; }
  }
`;

export const ServiceHeroInner = styled(Stagger)`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: var(--container);
  margin: 0 auto;
  padding: 2rem 2.5rem;
  color: var(--color-ink);
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 2rem;
  align-items: center;

  .art { width: min(100%, 380px); justify-self: end; filter: drop-shadow(var(--shadow-lift)); }
  .spot { display: none; }
  @media (max-width: 960px) { &:has(.art) { grid-template-columns: minmax(0, 1fr); } .art { display: none; } }

  .eyebrow, .kicker { color: var(--color-green-deep); font-size: .75rem; font-weight: 750; letter-spacing: .07em; text-transform: uppercase; margin: 0; }
  .aside { margin-top: .9rem; font-size: .9rem; color: var(--color-ink-muted); }
  .aside a { display: inline-flex; align-items: center; gap: .35rem; color: var(--color-green-deep); font-weight: 700; }
  .aside a:hover { color: var(--color-green-forest); }
  h1 { color: var(--color-ink); max-width: 720px; margin: .5rem 0 .6rem; font-size: clamp(1.8rem, 3.2vw, 2.6rem); font-weight: 550; letter-spacing: -.035em; line-height: 1.08; }
  p { color: var(--color-ink-muted); max-width: 650px; font-size: 1rem; line-height: 1.6; }

  /* No illustration: title and intro share the row. A loose heading was
     landing in the empty right column and leaving a blank band under it. */
  &:not(:has(.art)):has(> :nth-child(2)) {
    grid-template-columns: minmax(0, 1.05fr) minmax(0, 0.95fr);
    column-gap: 2.5rem;
    row-gap: 0.35rem;
    align-items: end;
    padding: 1.35rem 1.5rem 1.25rem;
    > :first-child { grid-column: 1 / -1; }
    h1 { max-width: none; margin: 0; font-size: clamp(1.7rem, 2.6vw, 2.35rem); }
    > p { max-width: none; margin: 0; }
  }

  @media (max-width: 720px) {
    padding: 1.2rem 1rem 1.3rem;
    &:not(:has(.art)):has(> :nth-child(2)) {
      grid-template-columns: minmax(0, 1fr);
      padding: 1.1rem 1rem 1.15rem;
      > :first-child { grid-column: auto; }
      h1 { font-size: 1.5rem; }
    }
    .eyebrow, .kicker { font-size: .63rem; }
    h1 { margin: .4rem 0 .2rem; font-size: 1.5rem; line-height: 1.1; }
    p { font-size: .88rem; line-height: 1.45; }
    .aside { margin-top: .6rem; }
    .spot { display: block; position: absolute; right: .75rem; top: .9rem; width: 88px; }
    .spot.low { top: 4.4rem; width: 80px; }
    ${(p) => p.$spot && 'h1, > div > p, .eyebrow { padding-right: 92px; }'}
  }
`;
