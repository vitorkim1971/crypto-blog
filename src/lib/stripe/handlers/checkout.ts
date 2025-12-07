/**
 * T020: Stripe Checkout Completed Handler
 * Feature: Premium Content Protection - Phase 4 (US2)
 *
 * Handles checkout.session.completed webhook event
 */

import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { stripeSubscriptionToInput } from '@/lib/stripe/utils';
import { TablesInsert } from '@/lib/types/database';

export async function handleCheckoutCompleted(
  event: Stripe.CheckoutSessionCompletedEvent
): Promise<void> {
  const session = event.data.object;

  // Only process subscription checkouts (not one-time payments)
  if (session.mode !== 'subscription') {
    console.log('Skipping non-subscription checkout session:', session.id);
    return;
  }

  // Get the subscription ID from the session
  const subscriptionId = session.subscription;
  if (!subscriptionId || typeof subscriptionId !== 'string') {
    throw new Error('No subscription ID found in checkout session');
  }

  // Get the customer ID
  const customerId = session.customer;
  if (!customerId || typeof customerId !== 'string') {
    throw new Error('No customer ID found in checkout session');
  }

  // Get user_id from session metadata (must be set when creating checkout session)
  const userId = session.metadata?.user_id;
  if (!userId) {
    throw new Error('No user_id found in checkout session metadata');
  }

  // Fetch the full subscription object from Stripe
  const stripe = (await import('@/lib/stripe/client')).stripe;
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Convert Stripe subscription to our database format
  const subscriptionInput = stripeSubscriptionToInput(subscription, userId);

  // T024: Upsert subscription to Supabase
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('subscriptions')
    .upsert(
      {
        ...subscriptionInput,
        current_period_start: subscriptionInput.current_period_start.toISOString(),
        current_period_end: subscriptionInput.current_period_end.toISOString(),
      } as TablesInsert<'subscriptions'>,
      {
        onConflict: 'stripe_subscription_id',
      }
    );

  if (error) {
    console.error('Error upserting subscription:', error);
    throw new Error(`Failed to upsert subscription: ${error.message}`);
  }

  console.log('Checkout completed - subscription created:', {
    userId,
    subscriptionId,
    planType: subscriptionInput.plan_type,
  });
}
