import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { SITE_URL, DEFAULT_IMAGE, metaForPath } from '../config/seo';

function setMeta(selector, attrs) {
  let node = document.head.querySelector(selector);
  if (!node) {
    node = document.createElement('meta');
    document.head.appendChild(node);
  }
  Object.entries(attrs).forEach(([key, value]) => node.setAttribute(key, value));
}

export default function Seo() {
  const { pathname } = useLocation();

  useEffect(() => {
    const { title, description, noIndex: privatePage, canonicalPath } = metaForPath(pathname);
    const canonicalUrl = `${SITE_URL}${canonicalPath}`;

    document.title = title;
    setMeta('meta[name="description"]', { name: 'description', content: description });
    setMeta('meta[name="robots"]', { name: 'robots', content: privatePage ? 'noindex, nofollow' : 'index, follow' });
    setMeta('meta[property="og:title"]', { property: 'og:title', content: title });
    setMeta('meta[property="og:description"]', { property: 'og:description', content: description });
    setMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl });
    setMeta('meta[property="og:image"]', { property: 'og:image', content: DEFAULT_IMAGE });
    setMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: title });
    setMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: description });
    setMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: DEFAULT_IMAGE });

    let canonical = document.head.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', canonicalUrl);

    // Nigeria-first: one English-for-Nigeria version of every page. When a
    // second market opens, add its alternate here (and x-default stays global).
    [['en-NG', canonicalUrl], ['x-default', canonicalUrl]].forEach(([lang, href]) => {
      let alt = document.head.querySelector(`link[rel="alternate"][hreflang="${lang}"]`);
      if (!alt) {
        alt = document.createElement('link');
        alt.setAttribute('rel', 'alternate');
        alt.setAttribute('hreflang', lang);
        document.head.appendChild(alt);
      }
      alt.setAttribute('href', href);
    });
  }, [pathname]);

  return null;
}
