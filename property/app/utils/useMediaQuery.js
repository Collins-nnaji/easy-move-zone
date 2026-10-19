import { useEffect, useState } from 'react';

/**
 * Subscribe to a CSS media query. Used to *not mount* desktop-only trees on a
 * phone (a display:none <video> still downloads its bytes) rather than to
 * hide them with CSS.
 */
export function useMediaQuery(query) {
  const get = () => (typeof window !== 'undefined' && window.matchMedia ? window.matchMedia(query).matches : false);
  const [matches, setMatches] = useState(get);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mql = window.matchMedia(query);
    const onChange = (e) => setMatches(e.matches);
    setMatches(mql.matches);
    if (mql.addEventListener) mql.addEventListener('change', onChange);
    else mql.addListener(onChange);
    return () => {
      if (mql.removeEventListener) mql.removeEventListener('change', onChange);
      else mql.removeListener(onChange);
    };
  }, [query]);

  return matches;
}

/** Phone breakpoint — matches the `@media (max-width: 720px)` rules in the styled-components. */
export function useIsMobile() {
  return useMediaQuery('(max-width: 720px)');
}

/** Tablet-and-below — where the desktop nav collapses and the tab bar shows. */
export function useIsCompact() {
  return useMediaQuery('(max-width: 960px)');
}
