import React, { Suspense, lazy } from 'react';
import Loader from './Loader';

/*
 * The moving side of the admin. These are EasyMoveZone's own moving admin
 * screens (Next.js components under components/), shown as sections of the
 * one admin at /admin. Each calls its own /api/admin/* or /api/marketplace
 * endpoint, which checks the admin_users allowlist itself.
 */
const MoveManager = lazy(() => import('@/components/moving/MoveManager').then((m) => ({ default: m.MoveManager })));
const WorkersManager = lazy(() => import('@/components/admin/WorkersManager').then((m) => ({ default: m.WorkersManager })));
const EnquiryManager = lazy(() => import('@/components/moving/EnquiryManager').then((m) => ({ default: m.EnquiryManager })));
const Operations = lazy(() => import('@/components/marketplace/Operations').then((m) => ({ default: m.Operations })));
const AdminUsersClient = lazy(() => import('@/components/admin/AdminUsersClient').then((m) => ({ default: m.AdminUsersClient })));

export const MOVING_SECTIONS = {
  moves: { title: 'Moves', Component: MoveManager },
  crews: { title: 'Crew & vehicles', Component: WorkersManager },
  'moving-enquiries': { title: 'Moving enquiries', Component: EnquiryManager },
  'moving-ops': { title: 'Moving marketplace operations', Component: Operations },
  accounts: { title: 'Accounts', Component: AdminUsersClient, dark: true },
};

export default function MovingAdminSection({ section }) {
  const entry = MOVING_SECTIONS[section];
  if (!entry) return null;
  const { Component, dark } = entry;
  return (
    <div className={dark ? 'rounded-2xl bg-[#0b0f17] text-white' : undefined}>
      <Suspense fallback={<Loader />}>
        <Component />
      </Suspense>
    </div>
  );
}
