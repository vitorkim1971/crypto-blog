import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';

// GET: 북마크 상태 확인
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ isBookmarked: false });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  const { data } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_slug', slug)
    .eq('user_id', session.user.id)
    .single();

  return NextResponse.json({ isBookmarked: !!data });
}

// POST: 북마크 토글
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const cookieStore = await cookies();
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
      },
    }
  );

  // 기존 북마크 확인
  const { data: existing } = await supabase
    .from('bookmarks')
    .select('id')
    .eq('post_slug', slug)
    .eq('user_id', session.user.id)
    .single();

  if (existing) {
    // 북마크 삭제
    const { error } = await supabase
      .from('bookmarks')
      .delete()
      .eq('id', existing.id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ isBookmarked: false });
  } else {
    // 북마크 추가
    const { error } = await supabase
      .from('bookmarks')
      .insert({
        post_slug: slug,
        user_id: session.user.id,
      });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ isBookmarked: true });
  }
}
