import { useEffect, useState } from 'react';
import { api } from '../api';

/**
 * Which of the three portals the signed-in account actually uses, so the
 * portal switcher can tell "yours" apart from "you could start this".
 *
 *   owner  — 'active' with a property handed over, or a home they listed, else 'none'
 *   tenant — 'active' with a tenancy, 'applied' with only applications, else 'none'
 *   agent  — 'active' once verified, 'pending' while the application is in review, else 'none'
 *
 * Answered once per email and shared by every shell that mounts, so moving
 * between portal pages never re-asks. `null` while the first answer is loading.
 */
const cache = new Map();

export function portalAccess(roles, agent) {
  const status = agent?.membership?.verification_status;
  return {
    owner: roles?.owner > 0 ? 'active' : 'none',
    tenant: roles?.tenant > 0 ? 'active' : roles?.applicant > 0 ? 'applied' : 'none',
    agent: status === 'verified' ? 'active' : status === 'pending' ? 'pending' : 'none',
  };
}

function load(email) {
  if (!cache.has(email)) {
    cache.set(email, Promise.all([
      api.tenant.roles().catch(() => null),
      api.agent.me().catch(() => null),
    ]).then(([roles, agent]) => portalAccess(roles, agent)));
  }
  return cache.get(email);
}

export default function usePortalAccess(email) {
  const [access, setAccess] = useState(null);
  useEffect(() => {
    if (!email) return undefined;
    let live = true;
    load(email).then((a) => { if (live) setAccess(a); });
    return () => { live = false; };
  }, [email]);
  return access;
}
