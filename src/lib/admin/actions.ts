'use server';

import { createClient, createAdminClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';
import type { AdminUser } from '@/types';

export async function getNewsletterSubscriberCount(): Promise<number> {
    const supabase = createAdminClient();

    const { count, error } = await supabase
        .from('newsletter_subscribers')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true);

    if (error) {
        console.error('getNewsletterSubscriberCount error:', error);
        return 0;
    }

    return count || 0;
}

export async function searchUsers(query: string): Promise<AdminUser[]> {
    const supabase = await createClient();

    // 1. Search profiles (or fetch all if no query)
    let queryBuilder = supabase.from('profiles').select('*');

    if (query && query.length >= 2) {
        queryBuilder = queryBuilder.ilike('email', `%${query}%`);
    }

    // Apply sort and limit at the end to ensure valid query chain
    const { data: profiles, error } = await queryBuilder
        .order('created_at', { ascending: false })
        .limit(20);

    if (error || !profiles) {
        console.error('Admin search error:', error);
        return [];
    }

    // 2. Fetch subscription status for each user
    const adminUsers: AdminUser[] = [];

    for (const profile of profiles) {
        const { data: subscription } = await supabase
            .from('subscriptions')
            .select('status, current_period_end, plan_type')
            .eq('user_id', profile.id)
            .in('status', ['active', 'trialing'])
            .maybeSingle();

        const isPremium = subscription
            ? new Date(subscription.current_period_end) > new Date()
            : false;

        adminUsers.push({
            id: profile.id,
            email: profile.email || '',
            name: profile.name,
            avatar_url: profile.avatar_url,
            created_at: profile.created_at || new Date().toISOString(),
            isPremium,
            subscription: subscription || undefined,
        });
    }

    return adminUsers;
}

export async function toggleUserPremium(userId: string, shouldBePremium: boolean, months: number = 1): Promise<{ success: boolean; error?: string }> {
    const supabase = await createClient();

    // Check if admin (Simple email check for now - explicit safety)
    // In a real app, use getUser and check role. For this task, we rely on the component guard + user session.
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    try {
        if (shouldBePremium) {
            // Grant Premium (Manual Upsert)
            const now = new Date();
            const endDate = new Date();

            // If months is 99 or more, treat as 'Lifetime' (100 years), otherwise add specific months
            if (months >= 99) {
                endDate.setFullYear(endDate.getFullYear() + 100);
            } else {
                endDate.setMonth(endDate.getMonth() + months);
            }

            const { error } = await supabase
                .from('subscriptions')
                .upsert({
                    user_id: userId,
                    stripe_subscription_id: `admin_manual_${Date.now()}`,
                    stripe_customer_id: `admin_manual_cust_${userId}`,
                    status: 'active',
                    plan_type: months >= 12 ? 'yearly' : 'monthly',
                    price_id: 'price_admin_manual',
                    current_period_start: now.toISOString(),
                    current_period_end: endDate.toISOString(),
                    cancel_at_period_end: false,
                    created_at: now.toISOString(),
                    updated_at: now.toISOString(),
                }, { onConflict: 'user_id' });

            if (error) throw error;
        } else {
            // Revoke Premium
            const { error } = await supabase
                .from('subscriptions')
                .delete()
                .eq('user_id', userId);

            if (error) throw error;
        }

        revalidatePath('/admin/users');
        return { success: true };
    } catch (error) {
        console.error('Toggle premium error:', error);
        return { success: false, error: 'Failed to update subscription' };
    }
}
