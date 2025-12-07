/**
 * T026-T028: Subscription status check helpers
 * Feature: Premium Content Protection
 */

import { createClient } from '@/lib/supabase/server';
import type { Subscription, SubscriptionCheckResult } from '@/lib/types/subscription';

/**
 * T026: Check if user has active subscription
 */
export async function checkSubscription(userId: string): Promise<SubscriptionCheckResult> {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .in('status', ['active', 'trialing'])
      .maybeSingle();

    if (error) {
      console.error('[checkSubscription] Error:', error);
      return {
        isSubscribed: false,
        subscription: null,
        isPremium: false,
      };
    }

    const isPremium = subscription
      ? new Date(subscription.current_period_end) > new Date()
      : false;

    return {
      isSubscribed: !!subscription,
      subscription: subscription as Subscription | null,
      isPremium,
    };
  } catch (error) {
    console.error('[checkSubscription] Unexpected error:', error);
    return {
      isSubscribed: false,
      subscription: null,
      isPremium: false,
    };
  }
}

/**
 * T027: Get detailed subscription information
 */
export async function getSubscriptionDetails(
  userId: string
): Promise<Subscription | null> {
  try {
    const supabase = await createClient();

    const { data: subscription, error } = await supabase
      .from('subscriptions')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    if (error) {
      console.error('[getSubscriptionDetails] Error:', error);
      return null;
    }

    return subscription as Subscription | null;
  } catch (error) {
    console.error('[getSubscriptionDetails] Unexpected error:', error);
    return null;
  }
}

/**
 * T028: Check if user has premium access
 */
export async function hasPremiumAccess(userId: string): Promise<boolean> {
  const result = await checkSubscription(userId);
  return result.isPremium;
}

export function isSubscriptionExpiringSoon(subscription: Subscription): boolean {
  const expiryDate = new Date(subscription.current_period_end);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
}

export function getDaysUntilExpiry(subscription: Subscription): number {
  const expiryDate = new Date(subscription.current_period_end);
  const now = new Date();
  const daysUntilExpiry = Math.ceil(
    (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );
  return Math.max(0, daysUntilExpiry);
}
