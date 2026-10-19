import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Loader from '../components/Loader';

/*
 * Moving logistics inside the property site: one short page whose cards open
 * full-page panels (each with its own URL), plus Paystack's checkout return
 * and the moving legal pages. The pages are
 * EasyMoveZone's moving components (components/moving, components/marketplace),
 * rendered here so they share the site's navbar, footer and phone tab bar.
 */
const MovingPage = lazy(() => import('@/components/moving/MovingPage').then((m) => ({ default: m.MovingPage })));
const Checkout = lazy(() => import('@/components/marketplace/Checkout').then((m) => ({ default: m.Checkout })));
const MovingTerms = lazy(() => import('@/components/moving/legal/MovingTerms'));
const MovingPrivacy = lazy(() => import('@/components/moving/legal/MovingPrivacy'));
const MovingCookies = lazy(() => import('@/components/moving/legal/MovingCookies'));

export default function MovingRoutes() {
  return (
    <Suspense fallback={<Loader />}>
      <Routes>
        <Route index element={<MovingPage />} />
        <Route path="checkout" element={<div className="logistics-container" style={{ paddingBlock: '2rem' }}><Checkout /></div>} />
        <Route path="terms" element={<MovingTerms />} />
        <Route path="privacy" element={<MovingPrivacy />} />
        <Route path="cookies" element={<MovingCookies />} />
        {/* /moving/book, /prices, /track, /crew, /how, /areas, /care, /help open as a panel over the page. */}
        <Route path=":panel" element={<MovingPage />} />
        <Route path="*" element={<Navigate to="/moving" replace />} />
      </Routes>
    </Suspense>
  );
}
