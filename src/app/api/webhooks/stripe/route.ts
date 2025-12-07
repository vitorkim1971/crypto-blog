/**
 * T017-T019, T025: Stripe Webhook API Route
 * Feature: Premium Content Protection - Phase 4 (US2)
 *
 * Handles Stripe webhook events and syncs subscription data to Supabase
 */

import { NextRequest, NextResponse } from 'next/server';
import Stripe from 'stripe';
import { stripe, getStripeWebhookSecret } from '@/lib/stripe/client';
import { handleCheckoutCompleted } from '@/lib/stripe/handlers/checkout';
import { handleSubscriptionUpdated } from '@/lib/stripe/handlers/subscription-updated';
import { handleSubscriptionDeleted } from '@/lib/stripe/handlers/subscription-deleted';
import { handlePaymentFailed } from '@/lib/stripe/handlers/payment-failed';

/**
 * Read raw body from request stream
 * Note: Next.js App Router automatically provides raw body access
 */
async function getRawBody(request: NextRequest): Promise<string> {
  const chunks: Uint8Array[] = [];
  const reader = request.body?.getReader();

  if (!reader) {
    throw new Error('No request body');
  }

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  const buffer = Buffer.concat(chunks);
  return buffer.toString('utf-8');
}

/**
 * T018: Verify Stripe webhook signature
 */
function verifyWebhookSignature(
  rawBody: string,
  signature: string
): Stripe.Event {
  const webhookSecret = getStripeWebhookSecret();

  try {
    return stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (error) {
    console.error('Webhook signature verification failed:', error);
    throw new Error('Invalid webhook signature');
  }
}

/**
 * T019: Route events to appropriate handlers
 * T025: Error handling and response
 */
export async function POST(request: NextRequest) {
  try {
    // Get raw body and signature header
    const rawBody = await getRawBody(request);
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // T018: Verify webhook signature
    let event: Stripe.Event;
    try {
      event = verifyWebhookSignature(rawBody, signature);
    } catch (error) {
      return NextResponse.json(
        { error: 'Webhook signature verification failed' },
        { status: 400 }
      );
    }

    console.log('Received webhook event:', {
      type: event.type,
      id: event.id,
    });

    // T019: Route event to appropriate handler
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event);
        break;

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event);
        break;

      default:
        // Log unhandled event types for monitoring
        console.log('Unhandled webhook event type:', event.type);
    }

    // T025: Return 200 response to acknowledge receipt
    return NextResponse.json({
      received: true,
      eventType: event.type,
    });
  } catch (error) {
    // T025: Error handling
    console.error('Webhook handler error:', error);

    // Return 200 even on error to prevent Stripe from retrying
    // Log the error for investigation
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Internal server error',
        received: true,
      },
      { status: 200 }
    );
  }
}
