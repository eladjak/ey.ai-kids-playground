/**
 * Creem checkout integration for Sipurai subscriptions.
 *
 * Calls our own serverless endpoint (/api/payments/checkout) which
 * proxies to Creem and keeps the API key server-side.
 */

export const PLANS = {
  free: {
    id: 'free',
    name: { en: 'Free', he: 'חינמי' },
    price: { en: '$0/mo', he: '₪0' },
    priceMonthly: 0,
    features: {
      en: [
        '2 books per month',
        'Up to 5 pages per book',
        '3 art styles',
        '10 built-in characters',
        'Community reading',
      ],
      he: [
        '2 ספרים בחודש',
        'עד 5 עמודים לספר',
        '3 סגנונות איור',
        '10 דמויות מובנות',
        'קריאה בקהילה',
      ],
    },
  },
  lite: {
    id: 'lite',
    creemProductId: 'prod_2Ij1cdrPJ7LBFk10GTaaLr',
    name: { en: 'Lite', he: 'לייט' },
    price: { en: '$3.90/mo', he: '$3.90/חודש' },
    priceMonthly: 3.9,
    features: {
      en: [
        '5 books per month',
        'Up to 10 pages per book',
        'All art styles',
        '3 custom characters',
        'PDF export',
        'Community sharing',
      ],
      he: [
        '5 ספרים בחודש',
        'עד 10 עמודים לספר',
        'כל סגנונות האיור',
        '3 דמויות מותאמות',
        'ייצוא PDF',
        'שיתוף בקהילה',
      ],
    },
  },
  premium: {
    id: 'premium',
    creemProductId: 'prod_2pdZoAylJ4858chxMtzspo',
    name: { en: 'Premium', he: 'פרימיום' },
    price: { en: '$7.90/mo', he: '$7.90/חודש' },
    priceMonthly: 7.9,
    popular: true,
    features: {
      en: [
        'Unlimited books',
        'Up to 20 pages per book',
        'All art styles',
        'Custom AI characters',
        'PDF export',
        'Priority AI generation',
        'Full gamification',
      ],
      he: [
        'ספרים ללא הגבלה',
        'עד 20 עמודים לספר',
        'כל סגנונות האיור',
        'דמויות AI מותאמות',
        'ייצוא PDF',
        'יצירת AI מהירה',
        'משחוק מלא',
      ],
    },
  },
  family: {
    id: 'family',
    creemProductId: 'prod_2fjogi8mJb5Y99lCxX4urX',
    name: { en: 'Family', he: 'משפחתי' },
    price: { en: '$9.90/mo', he: '$9.90/חודש' },
    priceMonthly: 9.9,
    features: {
      en: [
        'Everything in Premium',
        'Up to 4 child profiles',
        'Parental controls',
        'Shared family library',
        'Community sharing',
        'Print-ready export',
        'Collaborative creation',
      ],
      he: [
        'הכל מפרימיום',
        'עד 4 פרופילי ילדים',
        'בקרת הורים',
        'ספריית משפחה משותפת',
        'שיתוף בקהילה',
        'ייצוא להדפסה',
        'יצירה שיתופית',
      ],
    },
  },
};

/**
 * Open Creem checkout for the given plan by calling our serverless proxy.
 * Redirects the user to the hosted Creem checkout page on success.
 *
 * @param {'lite'|'premium'|'family'} planId
 * @param {string} [userEmail] - Pre-fill email in Creem checkout
 */
export async function openCheckout(planId, userEmail) {
  const plan = PLANS[planId];
  if (!plan?.creemProductId) {
    console.warn('[creem] Unknown planId or no product ID:', planId);
    return;
  }

  const successUrl = `${window.location.origin}/settings?checkout=success&plan=${planId}`;
  const cancelUrl = `${window.location.origin}/settings`;

  try {
    const response = await fetch('/api/payments/checkout', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        productId: plan.creemProductId,
        customerEmail: userEmail || undefined,
        successUrl,
        cancelUrl,
      }),
    });

    if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error('[creem] Checkout error:', err);
      throw new Error(err.error || 'Failed to create checkout');
    }

    const { checkout_url } = await response.json();
    if (checkout_url) {
      window.location.href = checkout_url;
    }
  } catch (err) {
    console.error('[creem] openCheckout failed:', err);
    throw err;
  }
}

/**
 * Get the user's current plan from their metadata / Supabase row.
 * @param {object|null} user
 * @returns {'free'|'lite'|'premium'|'family'}
 */
export function getUserPlan(user) {
  return user?.subscription_tier || 'free';
}
