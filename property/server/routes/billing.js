const express = require('express');
const { pool } = require('../db');

const router = express.Router();

let stripe;
try {
  if (process.env.STRIPE_SECRET_KEY) {
    stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  }
} catch (e) {
  console.log('Stripe not configured');
}

router.post('/create-checkout', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  try {
    const { email, currency } = req.body;
    if (!email) return res.status(400).json({ error: 'Email required' });

    const priceId = currency === 'NGN'
      ? process.env.STRIPE_PRICE_ID_NGN
      : process.env.STRIPE_PRICE_ID_USD;

    if (!priceId) return res.status(503).json({ error: 'Price not configured for this currency' });

    let customerId;
    const existing = await pool.query(
      'SELECT stripe_customer_id FROM user_subscriptions WHERE email = $1',
      [email]
    );

    if (existing.rows.length > 0 && existing.rows[0].stripe_customer_id) {
      customerId = existing.rows[0].stripe_customer_id;
    } else {
      const customer = await stripe.customers.create({ email });
      customerId = customer.id;
      await pool.query(
        `INSERT INTO user_subscriptions (email, stripe_customer_id, tier)
         VALUES ($1, $2, 'free')
         ON CONFLICT (email) DO UPDATE SET stripe_customer_id = $2`,
        [email, customerId]
      );
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      mode: 'subscription',
      allow_promotion_codes: true,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-hub?billing=success`,
      cancel_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/my-hub?billing=cancelled`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Checkout error:', err);
    res.status(500).json({ error: 'Failed to create checkout session' });
  }
});

router.get('/verify-session', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  try {
    const { session_id } = req.query;
    if (!session_id) return res.status(400).json({ error: 'session_id required' });

    const session = await stripe.checkout.sessions.retrieve(session_id, {
      expand: ['customer'],
    });

    if (session.mode !== 'subscription' || session.status !== 'complete') {
      return res.json({ isPro: false, tier: 'free' });
    }

    const email = session.customer_email || session.customer?.email;
    if (!email) return res.json({ isPro: false, tier: 'free' });

    const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
    await pool.query(
      `INSERT INTO user_subscriptions (email, stripe_customer_id, tier)
       VALUES ($1, $2, 'pro')
       ON CONFLICT (email) DO UPDATE SET tier = 'pro', stripe_customer_id = EXCLUDED.stripe_customer_id`,
      [email, customerId]
    );

    res.json({ isPro: true, tier: 'pro', email });
  } catch (err) {
    console.error('Verify session error:', err);
    res.status(500).json({ error: 'Failed to verify session', isPro: false });
  }
});

router.get('/status', async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) return res.json({ isPro: false, tier: 'free' });

    const result = await pool.query(
      'SELECT tier, stripe_customer_id FROM user_subscriptions WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.json({ isPro: false, tier: 'free' });
    }

    const { tier, stripe_customer_id } = result.rows[0];

    if (tier === 'pro' && stripe && stripe_customer_id) {
      try {
        const subs = await stripe.subscriptions.list({
          customer: stripe_customer_id,
          status: 'active',
          limit: 1,
        });
        if (subs.data.length === 0) {
          await pool.query('UPDATE user_subscriptions SET tier = $1 WHERE email = $2', ['free', email]);
          return res.json({ isPro: false, tier: 'free' });
        }
      } catch {}
    }

    res.json({ isPro: tier === 'pro', tier });
  } catch (err) {
    console.error('Status error:', err);
    res.json({ isPro: false, tier: 'free' });
  }
});

router.post('/portal', async (req, res) => {
  if (!stripe) return res.status(503).json({ error: 'Stripe not configured' });

  try {
    const { email } = req.body;
    const result = await pool.query(
      'SELECT stripe_customer_id FROM user_subscriptions WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0 || !result.rows[0].stripe_customer_id) {
      return res.status(400).json({ error: 'No billing account found' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: result.rows[0].stripe_customer_id,
      return_url: `${req.headers.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/profile`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Portal error:', err);
    res.status(500).json({ error: 'Failed to create portal session' });
  }
});

/**
 * Stripe webhook handler. Must receive raw body (Buffer) for signature verification.
 * Mount this route BEFORE express.json() in the main app.
 */
async function handleStripeWebhook(req, res) {
  if (!stripe) return res.status(503).send();

  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    console.error('Webhook signature error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      if (session.metadata?.kind === 'property_passport') {
        const requestId = Number.parseInt(session.metadata.passport_request_id, 10);
        if (requestId) {
          await pool.query(
            `UPDATE passport_requests
                SET payment_status = 'paid',
                    status = CASE WHEN status IN ('submitted','scope_review','payment_due') THEN 'in_progress' ELSE status END,
                    timeline = timeline || jsonb_build_array(jsonb_build_object(
                      'id', 'payment-' || EXTRACT(EPOCH FROM NOW())::bigint,
                      'title', 'Protected payment received',
                      'detail', 'Payment confirmed and verification moved into active checks.',
                      'status', 'complete',
                      'at', NOW()
                    )),
                    updated_at = NOW()
              WHERE id = $1`,
            [requestId]
          );
        }
        break;
      }
      // Subscriptions use the existing billing flow; Property Passports use a one-time payment above.
      if (session.mode !== 'subscription') break;

      let email = session.customer_email;
      if (!email && session.customer) {
        const customer = await stripe.customers.retrieve(session.customer);
        email = customer.email;
      }
      if (!email) break;

      const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id;
      await pool.query(
        `INSERT INTO user_subscriptions (email, stripe_customer_id, tier, updated_at)
         VALUES ($1, $2, 'pro', NOW())
         ON CONFLICT (email) DO UPDATE SET tier = 'pro', stripe_customer_id = COALESCE($2, user_subscriptions.stripe_customer_id), updated_at = NOW()`,
        [email, customerId]
      );
      console.log('[webhook] Subscription recorded for', email);
      break;
    }
    case 'customer.subscription.deleted': {
      const sub = event.data.object;
      const customer = await stripe.customers.retrieve(sub.customer);
      if (customer.email) {
        await pool.query(
          'UPDATE user_subscriptions SET tier = $1 WHERE email = $2',
          ['free', customer.email]
        );
      }
      break;
    }
  }

  res.json({ received: true });
}

module.exports = router;
module.exports.handleStripeWebhook = handleStripeWebhook;
