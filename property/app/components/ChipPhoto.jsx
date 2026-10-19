import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

/**
 * A phone hero's picture: one small photo (a /m webp, ~30KB) that settles in,
 * with up to two chips floating over it that say what we do for that home.
 * Desktop heroes keep their own video/photos; this is for phones.
 */

const Frame = styled(motion.div)`
  position: relative;
  aspect-ratio: ${(p) => p.$ratio};
  border-radius: 20px;
  overflow: hidden;
  box-shadow: var(--shadow-lift);
  background: var(--color-band-strong);

  img { width: 100%; height: 100%; object-fit: cover; display: block; }
`;

const Chip = styled(motion.div)`
  position: absolute;
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.5rem 0.75rem;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 10px 28px -14px rgba(13, 17, 23, 0.45);
  font-size: 0.76rem;
  font-weight: 600;
  line-height: 1.25;
  color: var(--color-ink);
  white-space: nowrap;

  .ic { display: grid; place-items: center; width: 24px; height: 24px; flex-shrink: 0; border-radius: 7px; background: var(--color-green-soft); color: var(--color-green-deep); }
  small { display: block; font-size: 0.66rem; font-weight: 500; color: var(--color-ink-faint); }
`;

const EASE = [0.22, 1, 0.36, 1];
const SPOTS = [{ left: 12, top: 12 }, { right: 12, bottom: 12 }];

export default function ChipPhoto({
  src, alt, chips = [], ratio = '3 / 2', priority = false, className, style,
}) {
  return (
    <Frame
      $ratio={ratio}
      className={className}
      style={style}
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.2, ease: EASE }}
    >
      <motion.img
        src={src}
        alt={alt}
        loading={priority ? 'eager' : 'lazy'}
        fetchpriority={priority ? 'high' : undefined}
        initial={{ scale: 1.12 }}
        animate={{ scale: 1 }}
        transition={{ duration: 2.4, ease: EASE }}
      />
      {chips.slice(0, 2).map(({ icon: Icon, title, sub }, i) => (
        <Chip
          key={title}
          style={SPOTS[i]}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.9 + i * 0.35, ease: EASE }}
        >
          <span className="ic"><Icon size={13} /></span>
          <span>{title}{sub && <small>{sub}</small>}</span>
        </Chip>
      ))}
    </Frame>
  );
}
