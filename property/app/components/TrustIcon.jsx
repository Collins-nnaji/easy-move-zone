import React from 'react';

const paths = {
  shield: <><path d="M12 3 5 6v5c0 4.6 2.8 8 7 10 4.2-2 7-5.4 7-10V6l-7-3Z" /><path d="m9 12 2 2 4-5" /></>,
  file: <><path d="M7 3h7l4 4v14H7V3Z" /><path d="M14 3v5h5M10 13h5M10 17h5" /></>,
  pin: <><path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z" /><circle cx="12" cy="10" r="2.5" /></>,
  value: <><circle cx="12" cy="12" r="9" /><path d="M15 8.5c-.7-.6-1.6-.9-2.7-.9-1.5 0-2.5.7-2.5 1.8 0 2.8 5.1 1.3 5.1 4.4 0 1.2-1.1 2-2.7 2-1.2 0-2.3-.4-3.1-1.1M12 5.5v13" /></>,
  camera: <><path d="M4 8h3l1.5-2h7L17 8h3v11H4V8Z" /><circle cx="12" cy="13" r="3.5" /></>,
  road: <><path d="m9 21 2-18M15 21 13 3M12 6v3M12 12v3M12 18v3" /></>,
  home: <><path d="m3 11 9-8 9 8" /><path d="M5 10v11h14V10M9 21v-7h6v7" /></>,
  building: <><path d="M5 21V4h10v17M15 9h4v12M2 21h20" /><path d="M8 8h4M8 12h4M8 16h4" /></>,
  check: <path d="m5 12 4 4L19 6" />,
  timeline: <><path d="M5 5h14M5 12h14M5 19h14" /><circle cx="8" cy="5" r="2" /><circle cx="14" cy="12" r="2" /><circle cx="10" cy="19" r="2" /></>,
  upload: <><path d="M12 16V4m0 0L7 9m5-5 5 5" /><path d="M5 15v5h14v-5" /></>,
  user: <><circle cx="12" cy="8" r="4" /><path d="M4 21c.8-4.1 3.5-6 8-6s7.2 1.9 8 6" /></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5" /></>,
  search: <><circle cx="11" cy="11" r="7" /><path d="m16 16 5 5" /></>,
  chart: <><path d="M4 20V10M10 20V4M16 20v-7M22 20H2" /></>,
  build: <><path d="M4 21V9l8-5 8 5v12M2 21h20M8 21v-6h8v6" /><path d="M7 10h2m6 0h2" /></>,
  key: <><circle cx="8" cy="15" r="4" /><path d="m11 12 8-8m-3 3 3 3" /></>,
  support: <><path d="M4 13a8 8 0 0 1 16 0v5h-4v-5h4M4 13h4v5H4v-5ZM16 20c-1 1-2.3 1.5-4 1.5" /></>,
};

export default function TrustIcon({ name, size = 22, strokeWidth = 1.8, ...props }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.shield}
    </svg>
  );
}
