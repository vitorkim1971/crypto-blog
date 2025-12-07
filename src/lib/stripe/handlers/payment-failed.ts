/**
 * T023: Stripe Payment Failed Handler
 * Feature: Premium Content Protection - Phase 4 (US2)
 *
 * Handles invoice.payment_failed webhook event
 */

import Stripe from 'stripe';
import { createAdminClient } from '@/lib/supabase/server';

export async function handlePaymentFailed(
  event: Stripe.InvoicePaymentFailedEvent
): Promise<void> {
  const invoice = event.data.object;

  // Get the subscription ID from the invoice
  const subscriptionId = (invoice as any).subscription;
  if (!subscriptionId || typeof subscriptionId !== 'string') {
    console.log('No subscription associated with failed payment');
    return;
  }

  // T024: Update subscription status to 'past_due' in Supabase
  const supabase = createAdminClient();
  const { error } = await supabase
    .from('subscriptions')
    .update({
      status: 'past_due',
    })
    .eq('stripe_subscription_id', subscriptionId);

  if (error) {
    console.error('Error updating subscription to past_due:', error);
    throw new Error(`Failed to update subscription to past_due: ${error.message}`);
  }

  console.log('Payment failed - subscription marked as past_due:', {
    subscriptionId,
    invoiceId: invoice.id,
  });
}
