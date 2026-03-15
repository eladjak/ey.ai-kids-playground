import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

/**
 * Verify Polar webhook signature.
 * Polar signs webhooks with HMAC-SHA256 using the webhook secret.
 */
function verifySignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(payload);
  const expected = hmac.digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expected)
  );
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Verify webhook signature
  const signature = req.headers['webhook-signature'] || req.headers['x-polar-signature'];
  const webhookSecret = process.env.POLAR_WEBHOOK_SECRET;

  if (webhookSecret && signature) {
    const rawBody = typeof req.body === 'string' ? req.body : JSON.stringify(req.body);
    try {
      const isValid = verifySignature(rawBody, signature, webhookSecret);
      if (!isValid) {
        return res.status(401).json({ error: 'Invalid signature' });
      }
    } catch {
      return res.status(401).json({ error: 'Signature verification failed' });
    }
  }

  const event = req.body;
  const eventType = event.type || event.event;

  try {
    switch (eventType) {
      case 'subscription.created':
      case 'subscription.updated':
      case 'subscription.active': {
        const sub = event.data;
        const customerEmail = sub.customer?.email || sub.user?.email;
        const productId = sub.product?.id || sub.product_id;
        const planId = getPlanFromProductId(productId);

        if (customerEmail) {
          await supabase.from('subscriptions').upsert(
            {
              user_email: customerEmail,
              polar_customer_id: sub.customer?.id || sub.user_id,
              polar_subscription_id: sub.id,
              plan: planId,
              status: sub.status || 'active',
              current_period_end: sub.current_period_end || sub.ended_at,
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'user_email' }
          );
        }
        break;
      }

      case 'subscription.canceled':
      case 'subscription.revoked': {
        const sub = event.data;
        const customerEmail = sub.customer?.email || sub.user?.email;

        if (customerEmail) {
          await supabase
            .from('subscriptions')
            .update({
              status: 'canceled',
              plan: 'free',
              updated_at: new Date().toISOString(),
            })
            .eq('user_email', customerEmail);
        }
        break;
      }

      default:
        // Unhandled event type — acknowledge receipt
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Webhook processing error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}

function getPlanFromProductId(productId) {
  const premiumId = process.env.VITE_POLAR_PRODUCT_PREMIUM;
  const familyId = process.env.VITE_POLAR_PRODUCT_FAMILY;

  if (productId === premiumId) return 'premium';
  if (productId === familyId) return 'family';
  return 'free';
}
