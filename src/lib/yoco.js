/**
 * src/lib/yoco.js
 * Yoco Checkout API helpers — client-side only.
 *
 * Security model:
 * - Public key (pk_live_...) is safe here — used for display only
 * - All actual checkout creation goes through Supabase Edge Function
 *   which holds the secret key (sk_live_...) server-side
 * - Webhook verification also happens server-side only
 *
 * Flow:
 *  1. Client calls initiateCheckout(tier, billingCycle)
 *  2. Edge Function creates Yoco checkout session → returns redirectUrl
 *  3. Client redirects user to Yoco hosted payment page
 *  4. Yoco fires webhook → Edge Function verifies + updates Supabase
 */

// ─── Tier Config ──────────────────────────────────────────────────────────────

export const SUBSCRIPTION_TIERS = {
  sista: {
    name:         'Sista',
    monthlyZAR:   99,
    annualZAR:    990,   // 10 months price for 12 months
    monthlyAmountCents: 9900,
    annualAmountCents:  99000,
    color:        'primary',
    features: [
      'Unlimited wellness content',
      'Unlimited bookmarks',
      'Wellness Score tracking',
      'Community access (Phase 2)',
    ],
  },
  sista_plus: {
    name:         'Sista+',
    monthlyZAR:   199,
    annualZAR:    1990,
    monthlyAmountCents: 19900,
    annualAmountCents:  199000,
    color:        'secondary',
    popular:      true,
    features: [
      'Everything in Sista',
      'Premium & exclusive content',
      'Live wellness sessions',
      'Direct messaging (Phase 2)',
      '5 marketplace listings (Phase 3)',
    ],
  },
  sista_pro: {
    name:         'Sista Pro',
    monthlyZAR:   349,
    annualZAR:    3490,
    monthlyAmountCents: 34900,
    annualAmountCents:  349000,
    color:        'primary',
    features: [
      'Everything in Sista+',
      'Unlimited marketplace listings',
      'Priority support',
      '15% Happy Splurge discount',
      'Early feature access',
    ],
  },
};

// ─── Checkout Initiation ──────────────────────────────────────────────────────

/**
 * Initiate a Yoco checkout via Supabase Edge Function.
 * Redirects the user to Yoco's hosted payment page.
 *
 * @param {string} tier        - 'sista' | 'sista_plus' | 'sista_pro'
 * @param {'monthly'|'annual'} billingCycle
 * @returns {Promise<void>}    - Redirects browser; does not return normally
 */
export async function initiateCheckout(tier, billingCycle = 'monthly') {
  const config = SUBSCRIPTION_TIERS[tier];
  if (!config) throw new Error(`Unknown tier: ${tier}`);

  const amountCents =
    billingCycle === 'annual'
      ? config.annualAmountCents
      : config.monthlyAmountCents;

  const { supabase } = await import('./supabase.js');
  const { data: { session } } = await supabase.auth.getSession();

  if (!session) throw new Error('Must be logged in to subscribe');

  const edgeFunctionUrl = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/create-yoco-checkout`;

  const res = await fetch(edgeFunctionUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${session.access_token}`,
    },
    body: JSON.stringify({
      tier,
      billingCycle,
      amountCents,
      currency: 'ZAR',
      successUrl: `${import.meta.env.VITE_APP_URL}/profile?payment=success`,
      cancelUrl:  `${import.meta.env.VITE_APP_URL}/upgrade?payment=cancelled`,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(`Checkout failed: ${err.message}`);
  }

  const { redirectUrl } = await res.json();
  if (!redirectUrl) throw new Error('No redirectUrl returned from checkout');

  // Redirect to Yoco hosted payment page
  window.location.href = redirectUrl;
}

// ─── Feature Access Helpers ───────────────────────────────────────────────────

const TIER_LEVELS = { free: 0, sista: 1, sista_plus: 2, sista_pro: 3 };

/**
 * Check if a tier has access to a required tier's features.
 * @param {string} userTier     - User's current tier
 * @param {string} requiredTier - Minimum tier required
 * @returns {boolean}
 */
export function canAccess(userTier, requiredTier) {
  return (TIER_LEVELS[userTier] ?? 0) >= (TIER_LEVELS[requiredTier] ?? 0);
}

/** Format ZAR amount: 9900 → 'R99' */
export function formatZAR(amountCents) {
  return `R${(amountCents / 100).toLocaleString('en-ZA')}`;
}
