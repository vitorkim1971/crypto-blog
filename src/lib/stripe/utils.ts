/**
 * T012: Stripe data transformation utilities
 * Feature: Premium Content Protection
 */

import Stripe from 'stripe'
import { PlanType, SubscriptionStatus, CreateSubscriptionInput } from '@/lib/types/subscription'

/**
 * Convert Stripe subscription to our Subscription type
 */
export function stripeSubscriptionToInput(
  subscription: Stripe.Subscription,
  userId: string
): CreateSubscriptionInput {
  // Determine plan type from price
  const priceId = typeof subscription.items.data[0].price === 'string'
    ? subscription.items.data[0].price
    : subscription.items.data[0].price.id

  const planType: PlanType = determinePlanType(subscription)

  return {
    user_id: userId,
    stripe_subscription_id: subscription.id,
    stripe_customer_id: typeof subscription.customer === 'string'
      ? subscription.customer
      : subscription.customer.id,
    status: subscription.status as SubscriptionStatus,
    plan_type: planType,
    price_id: priceId,
    current_period_start: new Date((subscription as any).current_period_start * 1000),
    current_period_end: new Date((subscription as any).current_period_end * 1000),
    cancel_at_period_end: subscription.cancel_at_period_end || false,
  }
}

/**
 * Determine plan type from Stripe subscription
 */
export function determinePlanType(subscription: Stripe.Subscription): PlanType {
  const price = subscription.items.data[0].price
  const interval = typeof price === 'string' ? null : price.recurring?.interval

  if (interval === 'year') {
    return 'yearly'
  }

  return 'monthly'
}

/**
 * Check if subscription is active
 */
export function isSubscriptionActive(status: SubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing'
}

/**
 * Check if subscription is active and not expired
 */
export function isSubscriptionValid(
  status: SubscriptionStatus,
  currentPeriodEnd: string | Date
): boolean {
  if (!isSubscriptionActive(status)) {
    return false
  }

  const endDate = typeof currentPeriodEnd === 'string'
    ? new Date(currentPeriodEnd)
    : currentPeriodEnd

  return endDate.getTime() > Date.now()
}

/**
 * Format subscription status for display
 */
export function formatSubscriptionStatus(status: SubscriptionStatus): string {
  const statusMap: Record<SubscriptionStatus, string> = {
    active: '활성',
    canceled: '취소됨',
    past_due: '결제 지연',
    trialing: '체험 중',
    incomplete: '미완료',
    incomplete_expired: '만료됨',
    unpaid: '미결제',
  }

  return statusMap[status] || status
}

/**
 * Format plan type for display
 */
export function formatPlanType(planType: PlanType): string {
  return planType === 'yearly' ? '연간' : '월간'
}
