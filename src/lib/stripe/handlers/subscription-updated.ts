/**
 * T021: Stripe Subscription Updated Handler
 * Feature: Premium Content Protection - Phase 4 (US2)
 *
 * Handles customer.subscription.updated webhook event
 */

import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';
import { SubscriptionStatus, PlanType } from '@/lib/types/subscription';
import { determinePlanType } from '@/lib/stripe/utils';

export async function handleSubscriptionUpdated(
  event: Stripe.CustomerSubscriptionUpdatedEvent
): Promise<void> {
  const subscription = event.data.object;

  // Get the user_id from subscription metadata
  // (This should be set when creating the subscription or during checkout)
  const userId = subscription.metadata?.user_id;
  if (!userId) {
    // Try to find the subscription in our database by stripe_subscription_id
    const supabase = createAdminClient();
    const { data: existingSubscription } = await supabase
      .from('subscriptions')
      .select('user_id')
      .eq('stripe_subscription_id', subscription.id)
      .single();

    if (!existingSubscription) {
      console.error('No user_id found for subscription:', subscription.id);
      throw new Error(`No user_id found for subscription ${subscription.id}`);
    }
  }

  // Extract subscription data
  const priceId =
    typeof subscription.items.data[0].price === 'string'
      ? subscription.items.data[0].price
      : subscription.items.data[0].price.id;

  const planType: PlanType = determinePlanType(subscription);
  const customerId =
    typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id;

  // T024: Update subscription in Supabase
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: subscription.status as SubscriptionStatus,
      plan_type: planType,
      price_id: priceId,
      current_period_start: new Date((subscription as any).current_period_start * 1000).toISOString(),
      current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end || false,
      stripe_customer_id: customerId,
    })
    .eq('stripe_subscription_id', subscription.id);

  if (error) {
    console.error('Error updating subscription:', error);
    throw new Error(`Failed to update subscription: ${error.message}`);
  }

  console.log('Subscription updated:', {
    subscriptionId: subscription.id,
    status: subscription.status,
    planType,
  });
}
