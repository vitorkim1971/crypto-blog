import { createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ slug: string }> }
) {
    const { slug } = await params;
    const supabase = createAdminClient();

    // Fetch Claps
    // Total claps is the sum of clap_count for the post
    const { data: clapsData, error: clapsError } = await supabase
        .from('post_claps')
        .select('clap_count')
        .eq('post_slug', slug);

    if (clapsError) {
        console.error('Error fetching claps:', clapsError);
    }

    const clapCount = clapsData?.reduce((sum, item) => sum + item.clap_count, 0) || 0;

    // Fetch Comments Count
    const { count: commentCount, error: commentsError } = await supabase
        .from('comments')
        .select('*', { count: 'exact', head: true })
        .eq('post_slug', slug);

    if (commentsError) {
        console.error('Error fetching comments:', commentsError);
    }

    return NextResponse.json({
        clapCount,
        commentCount: commentCount || 0,
    });
}
