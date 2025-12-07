/**
 * T022: Stripe Subscription Deleted Handler
 * Feature: Premium Content Protection - Phase 4 (US2)
 *
 * Handles customer.subscription.deleted webhook event
 */

import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';

export async function handleSubscriptionDeleted(
  event: Stripe.CustomerSubscriptionDeletedEvent
): Promise<void> {
  const subscription = event.data.object;

  // T024: Update subscription status to 'canceled' in Supabase
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error marking subscription as canceled:', error);
    throw new Error(`Failed to mark subscription as canceled: ${error.message}`);
  }

  console.log('Subscription deleted/canceled:', {
    subscriptionId: subscription.id,
  });
}
