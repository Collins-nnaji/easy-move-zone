import { useEffect, useState } from 'react';

/**
 * 'up' | 'down'. Ignores jitter under `threshold` px and always reports 'up'
 * near the top of the page, so a bar that hides on scroll-down reappears the
 * moment the reader heads back.
 */
export function useScrollDirection({ threshold = 12, topOffset = 80 } = {}) {
  const [direction, setDirection] = useState('up');

  useEffect(() => {
    let last = window.scrollY;
    let ticking = false;

    const update = () => {
      const y = window.scrollY;
      if (y <= topOffset) {
        setDirection('up');
      } else if (Math.abs(y - last) >= threshold) {
        setDirection(y > last ? 'down' : 'up');
      }
      last = y;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(update);
        ticking = true;
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, [threshold, topOffset]);

  return direction;
}
