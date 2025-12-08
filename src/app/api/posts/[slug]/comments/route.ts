import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth/config';

export const dynamic = 'force-dynamic';

// GET: 포스트의 댓글 목록 가져오기
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  // 댓글과 작성자 정보 함께 가져오기 (Public data - use anon client)
  // But for safety and consistency with NextAuth ID, we'll use Admin client for user-specific checks.

  // Note: We use createAdminClient for everything here to simplify RLS bypass for NextAuth users.
  // Ideally, we should use anon client for public reads, but for 'comment_likes' check which uses user_id, 
  // admin client is safer given the hybrid auth.
  const supabase = createAdminClient();

  // 댓글과 작성자 정보 함께 가져오기
  const { data: comments, error } = await supabase
    .from('comments')
    .select(`
      id,
      content,
      parent_id,
      created_at,
      updated_at,
      user_id,
      profiles!inner(id, name, avatar_url)
    `)
    .eq('post_slug', slug)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // 각 댓글의 좋아요 수 가져오기
  const commentsWithLikes = await Promise.all(
    (comments || []).map(async (comment) => {
      const { count } = await supabase
        .from('comment_likes')
        .select('*', { count: 'exact', head: true })
        .eq('comment_id', comment.id);

      // 현재 사용자의 좋아요 여부
      let isLiked = false;

      if (session?.user?.id) {
        const { data: like } = await supabase
          .from('comment_likes')
          .select('id')
          .eq('comment_id', comment.id)
          .eq('user_id', session.user.id)
          .single();
        isLiked = !!like;
      }

      return {
        ...comment,
        likeCount: count || 0,
        isLiked,
        author: comment.profiles,
      };
    })
  );

  // 댓글을 트리 구조로 변환 (대댓글 지원)
  const rootComments = commentsWithLikes.filter((c) => !c.parent_id);
  const commentMap = new Map(commentsWithLikes.map((c) => [c.id, { ...c, replies: [] as typeof commentsWithLikes }]));

  commentsWithLikes.forEach((comment) => {
    if (comment.parent_id) {
      const parent = commentMap.get(comment.parent_id);
      if (parent) {
        parent.replies.push(commentMap.get(comment.id)!);
      }
    }
  });

  const treeComments = rootComments.map((c) => commentMap.get(c.id));

  return NextResponse.json({
    comments: treeComments,
    totalCount: comments?.length || 0,
  });
}

// POST: 댓글 작성
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: '로그인이 필요합니다' }, { status: 401 });
  }

  const supabase = createAdminClient();

  const body = await request.json();
  const { content, parentId } = body;

  if (!content || content.trim().length === 0) {
    return NextResponse.json({ error: '댓글 내용을 입력해주세요' }, { status: 400 });
  }

  if (content.length > 1000) {
    return NextResponse.json({ error: '댓글은 1000자를 초과할 수 없습니다' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('comments')
    .insert({
      post_slug: slug,
      user_id: session.user.id,
      content: content.trim(),
      parent_id: parentId || null,
    })
    .select(`
      id,
      content,
      parent_id,
      created_at,
      updated_at,
      user_id,
      profiles!inner(id, name, avatar_url)
    `)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const newComment = {
    ...data,
    likeCount: 0,
    isLiked: false,
    author: data.profiles,
    replies: [],
  };

  return NextResponse.json({
    comment: newComment,
  });
}
