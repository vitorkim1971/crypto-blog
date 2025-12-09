import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/server';

export async function GET() {
    try {
        const supabase = createAdminClient();

        const { count, error } = await supabase
            .from('newsletter_subscribers')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        if (error) {
            return NextResponse.json({ error: error.message, count: 0 }, { status: 500 });
        }

        return NextResponse.json({ count: count || 0 });
    } catch (error) {
        console.error('Newsletter count API error:', error);
        return NextResponse.json({ error: 'Failed to fetch count', count: 0 }, { status: 500 });
    }
}
