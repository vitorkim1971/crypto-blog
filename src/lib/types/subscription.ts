/**
 * T008: Subscription type definitions
 * Feature: Premium Content Protection
 */

export type SubscriptionStatus =
  | 'active'
  | 'canceled'
  | 'past_due'
  | 'trialing'
  | 'incomplete'
  | 'incomplete_expired'
  | 'unpaid'

export type PlanType = 'monthly' | 'yearly'

export interface Subscription {
  id: string
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  plan_type: PlanType
  price_id: string
  current_period_start: string
  current_period_end: string
  cancel_at_period_end: boolean
  canceled_at: string | null
  created_at: string
  updated_at: string
}

export interface SubscriptionCheckResult {
  isSubscribed: boolean
  subscription: Subscription | null
  isPremium: boolean
}

export interface CreateSubscriptionInput {
  user_id: string
  stripe_subscription_id: string
  stripe_customer_id: string
  status: SubscriptionStatus
  plan_type: PlanType
  price_id: string
  current_period_start: Date
  current_period_end: Date
  cancel_at_period_end?: boolean
}

export interface UpdateSubscriptionInput {
  status?: SubscriptionStatus
  plan_type?: PlanType
  current_period_end?: Date
  cancel_at_period_end?: boolean
  canceled_at?: Date | null
}
