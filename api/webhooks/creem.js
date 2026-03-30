/**
 * Vercel Serverless Function — Creem webhook handler.
 *
 * Creem sends webhook events when subscription state changes.
 * We upsert the user's subscription in Supabase on relevant events.
 *
 * Signature verification via CREEM_WEBHOOK_SECRET is MANDATORY.
 */

import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verify Creem webhook HMAC-SHA256 signature.
 * Creem signs the raw body with the webhook secret.
 */
function verifySignature(rawBody, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(rawBody);
  const expected = hmac.digest('hex');
  try {
    return crypto.timingSafeEqual(
      Buffer.from(signature, 'hex'),
      Buffer.from(expected, 'hex')
    );
  } catch {
    return false;
  }
}

/**
 * Map a Creem product ID to an internal plan name.
 */
function getPlanFromProductId(productId) {
  if (productId === 'prod_2Ij1cdrPJ7LBFk10GTaaLr') return 'lite';
  if (productId === 'prod_2pdZoAylJ4858chxMtzspo') return 'premium';
  if (productId === 'prod_2fjogi8mJb5Y99lCxX4urX') return 'family';
  return 'free';
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Mandatory signature verification — reject if secret is not configured
  const webhookSecret = process.env.CREEM_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[creem-webhook] CREEM_WEBHOOK_SECRET not configured — rejecting request');
    return res.status(500).json({ error: 'Webhook secret not configured' });
  }

  const signature = req.headers['x-creem-signature'];
  if (!signature) {
    console.warn('[creem-webhook] Missing x-creem-signature header');
    return res.status(401).json({ error: 'Missing signature' });
  }

  const rawBody =
    typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
  const isValid = verifySignature(rawBody, signature, webhookSecret);
  if (!isValid) {
    console.warn('[creem-webhook] Invalid signature');
    return res.status(401).json({ error: 'Invalid signature' });
  }

  const event = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
  const eventType = event?.type || event?.event_type;

  console.info('[creem-webhook] Received event:', eventType);

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.active':
      case 'subscription.updated': {
        const sub = event.data || event.subscription || event;
        const customerEmail =
          sub.customer?.email ||
          sub.user?.email ||
          event.customer?.email;
        const productId =
          sub.product?.id ||
          sub.product_id ||
          event.product_id;
        const planId = getPlanFromProductId(productId);

        if (customerEmail) {
          const { error } = await supabase.from('subscriptions').upsert(
            {
              user_email: customerEmail,
              creem_customer_id: sub.customer?.id || sub.customer_id,
              creem_subscription_id: sub.id,
              plan: planId,
              status: sub.status || 'active',
              current_period_end:
                sub.current_period_end ||
                sub.ended_at ||
                null,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_email' }
          );
          if (error) {
            console.error('[creem-webhook] Supabase upsert error:', error.message);
          }
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.cancelled':
      case 'subscription.expired':
      case 'subscription.revoked': {
        const sub = event.data || event.subscription || event;
        const customerEmail =
          sub.customer?.email ||
          sub.user?.email ||
          event.customer?.email;

        if (customerEmail) {
          const { error } = await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('user_email', customerEmail);
          if (error) {
            console.error('[creem-webhook] Supabase update error:', error.message);
          }
        }
        break;
      }

      default:
        // Unhandled event — acknowledge receipt silently
        console.info('[creem-webhook] Unhandled event type:', eventType);
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[creem-webhook] Processing error:', {
      message: error.message,
      eventType,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    });
    return res.status(500).json({ error: 'Internal server error' });
  }
}
