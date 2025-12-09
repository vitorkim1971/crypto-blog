import { createAdminClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET: 특정 포스트의 박수 정보 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // Use Admin Client to bypass RLS for public stats and user specific checks
  const supabase = createAdminClient();

  // 전체 박수 수
  const { data: clapsData, error: clapsError } = await supabase
    .from('post_claps')
    .select('clap_count')
    .eq('post_slug', slug);

  if (clapsError) {
    return NextResponse.json({ error: clapsError.message }, { status: 500 });
  }

  const totalClaps = clapsData?.reduce((sum, item) => sum + item.clap_count, 0) || 0;

  // 현재 사용자의 박수 수
  let userClaps = 0;

  if (session?.user?.id) {
    // Check if ID is valid UUID to avoid DB error
    const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id);

    if (isValidUUID) {
      const { data: userClapsData } = await supabase
        .from('post_claps')
        .select('clap_count')
        .eq('post_slug', slug)
        .eq('user_id', session.user.id)
        .single();

      userClaps = userClapsData?.clap_count || 0;
    }
  }

  return NextResponse.json({
    totalClaps,
    userClaps,
    hasClapped: userClaps > 0,
  });
}

// POST: 박수 추가 (Medium 스타일: 최대 50개까지)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  // Validate UUID to prevent DB error (Postgres will reject non-UUID)
  const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session.user.id);
  if (!isValidUUID) {
    return NextResponse.json({ error: '유효하지 않은 사용자 ID입니다.' }, { status: 400 });
  }

  const supabase = createAdminClient();
  const body = await request.json();
  const addClaps = Math.min(body.claps || 1, 10); // 한 번에 최대 10개

  // 기존 박수 확인
  const { data: existingClap } = await supabase
    .from('post_claps')
    .select('id, clap_count')
    .eq('post_slug', slug)
    .eq('user_id', session.user.id)
    .single();

  if (existingClap) {
    // 기존 박수 업데이트 (최대 50개)
    const newCount = Math.min(existingClap.clap_count + addClaps, 50);

    const { data, error } = await supabase
      .from('post_claps')
      .update({ clap_count: newCount })
      .eq('id', existingClap.id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      userClaps: data.clap_count,
      added: newCount - existingClap.clap_count,
    });
  } else {
    // 새로운 박수 생성
    const { data, error } = await supabase
      .from('post_claps')
      .insert({
        post_slug: slug,
        user_id: session.user.id,
        clap_count: addClaps,
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      userClaps: data.clap_count,
      added: data.clap_count,
    });
  }
}
