import { authClient } from '@/lib/auth/client';
import { signOutAndRedirect } from '@/lib/auth/sign-out';

/**
 * Sign-in is EasyMoveZone's own Neon Auth (lib/auth/client, served at
 * /api/auth). Signing in and creating an account happen on the /auth page;
 * this module only reads the session and signs out.
 */
export const auth = {
  async getSession() {
    try {
      const { data } = await authClient.getSession();
      if (!data?.session) return null;
      return { session: { ...data.session, user: data.user }, user: data.user };
    } catch {
      return null;
    }
  },

  async signUpWithEmail(email, password, name) {
    const { data, error } = await authClient.signUp.email({ email, password, name });
    if (error) throw new Error(error.message || 'Sign up failed');
    return data;
  },

  async signInWithEmail(email, password) {
    const { data, error } = await authClient.signIn.email({ email, password });
    if (error) throw new Error(error.message || 'Sign in failed');
    return data;
  },

  async signInWithGoogle() {
    window.location.assign(`/auth?redirect=${encodeURIComponent(window.location.pathname + window.location.search)}`);
  },

  async signOut() {
    try {
      await signOutAndRedirect();
    } catch {
      window.location.replace('/');
    }
  },
};

/**
 * Where a "Sign in" link should go: EasyMoveZone's /auth page, returning to
 * `from` (a react-router location or path) afterwards.
 */
export function siteAuthUrl({ from, signup = false } = {}) {
  const path = typeof from === 'string' ? from : from ? `${from.pathname || '/'}${from.search || ''}${from.hash || ''}` : '/listings';
  const params = new URLSearchParams({ redirect: path });
  if (signup) params.set('mode', 'signup');
  return `/auth?${params.toString()}`;
}
