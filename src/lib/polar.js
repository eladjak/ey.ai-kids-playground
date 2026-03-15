/**
 * Polar checkout integration for Sipurai subscriptions.
 *
 * Uses Polar's hosted checkout via redirect — no SDK needed.
 * Product IDs are stored in env vars (VITE_POLAR_PRODUCT_*).
 */

export const PLANS = {
  free: {
    id: 'free',
    name: { en: 'Free', he: 'חינמי' },
    price: { en: '$0', he: '₪0' },
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
  premium: {
    id: 'premium',
    polarProductId: import.meta.env.VITE_POLAR_PRODUCT_PREMIUM,
    name: { en: 'Premium', he: 'פרימיום' },
    price: { en: '₪34.90/mo', he: '₪34.90/חודש' },
    priceMonthly: 34.9,
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
    polarProductId: import.meta.env.VITE_POLAR_PRODUCT_FAMILY,
    name: { en: 'Family', he: 'משפחתי' },
    price: { en: '₪54.90/mo', he: '₪54.90/חודש' },
    priceMonthly: 54.9,
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
 * Redirect user to Polar checkout for a given plan.
 * @param {'premium'|'family'} planId
 * @param {string} [userEmail] - Pre-fill email in checkout
 */
export function openCheckout(planId, userEmail) {
  const plan = PLANS[planId];
  if (!plan?.polarProductId) return;

  const successUrl = `${window.location.origin}/Settings?checkout=success&plan=${planId}`;
  const params = new URLSearchParams({
    productId: plan.polarProductId,
    successUrl,
  });
  if (userEmail) {
    params.set('customerEmail', userEmail);
  }

  window.location.href = `https://checkout.polar.sh/?${params.toString()}`;
}

/**
 * Get the user's current plan from their metadata.
 * @param {object|null} user
 * @returns {'free'|'premium'|'family'}
 */
export function getUserPlan(user) {
  return user?.subscription_tier || 'free';
}
