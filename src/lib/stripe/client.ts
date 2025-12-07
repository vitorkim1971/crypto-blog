/**
 * T010: Stripe client initialization helper
 * Feature: Premium Content Protection
 *
 * NOTE: Stripe is optional - will be replaced with crypto payments
 */

import Stripe from 'stripe';

// Make Stripe optional until crypto payment is implemented
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY || 'sk_test_placeholder';

export const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-10-29.clover',
  typescript: true,
});

// Helper to check if Stripe is configured
export const isStripeConfigured = !!process.env.STRIPE_SECRET_KEY;

export const STRIPE_PLANS = {
  monthly: {
    name: 'Premium Monthly',
    priceId: process.env.STRIPE_PRICE_ID_MONTHLY!,
    price: 1.99,
    interval: 'month' as const,
  },
  yearly: {
    name: 'Premium Yearly',
    priceId: process.env.STRIPE_PRICE_ID_YEARLY!,
    price: 19.99,
    interval: 'year' as const,
  },
};

/**
 * Get Stripe webhook secret
 */
export function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    throw new Error('STRIPE_WEBHOOK_SECRET is not set in environment variables');
  }
  return secret;
}

/**
 * Get Stripe price IDs
 */
export function getStripePriceIds() {
  return {
    monthly: process.env.STRIPE_PRICE_ID_MONTHLY || '',
    yearly: process.env.STRIPE_PRICE_ID_YEARLY || '',
  };
}
