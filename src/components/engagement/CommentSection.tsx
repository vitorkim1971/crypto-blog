'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useAuth } from '@/hooks/useAuth';
import { formatDistanceToNow } from 'date-fns';
import { ko } from 'date-fns/locale';

interface Author {
  id: string;
  name: string | null;
  avatar_url: string | null;
}

interface Comment {
  id: string;
  content: string;
  parent_id: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  author: Author;
  likeCount: number;
  isLiked: boolean;
  replies: Comment[];
}

interface CommentSectionProps {
  slug: string;
}

export default function CommentSection({ slug }: CommentSectionProps) {
  const { user, profile, isLoading: authLoading } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  const fetchComments = useCallback(async () => {
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        cache: 'no-store',
        headers: {
          'Pragma': 'no-cache',
          'Cache-Control': 'no-cache'
        }
      });
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
        setTotalCount(data.totalCount);
      }
    } catch (error) {
      console.error('Failed to fetch comments:', error);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: newComment }),
      });

      if (res.ok) {
        setNewComment('');
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit comment:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (parentId: string) => {
    if (!user || !replyContent.trim()) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${slug}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: replyContent, parentId }),
      });

      if (res.ok) {
        setReplyContent('');
        setReplyTo(null);
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to submit reply:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string) => {
    if (!user) {
      alert('좋아요를 누르려면 로그인이 필요합니다');
      return;
    }

    try {
      const res = await fetch(`/api/comments/${commentId}/like`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchComments();
      }
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const renderComment = (comment: Comment, isReply = false) => (
    <div
      key={comment.id}
      className={`${isReply ? 'ml-10 pt-4' : 'py-6 border-b border-gray-100 last:border-0'}`}
    >
      <div className="flex gap-3">
        {/* Avatar */}
        {comment.author?.avatar_url ? (
          <div className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} relative flex-shrink-0 rounded-full overflow-hidden`}>
            <Image
              src={comment.author.avatar_url}
              alt={comment.author.name || ''}
              fill
              className="object-cover"
              sizes={isReply ? "28px" : "36px"}
            />
          </div>
        ) : (
          <div
            className={`${isReply ? 'w-7 h-7' : 'w-9 h-9'} bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0`}
          >
            <span className={`${isReply ? 'text-xs' : 'text-sm'} font-medium text-gray-500`}>
              {comment.author?.name?.charAt(0) || '?'}
            </span>
          </div>
        )}

        <div className="flex-1 min-w-0">
          {/* Author & Time */}
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm font-medium text-gray-900">
              {comment.author?.name || '익명'}
            </span>
            <span className="text-xs text-gray-400">
              {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true, locale: ko })}
            </span>
          </div>

          {/* Content */}
          <p className="text-gray-700 text-sm leading-relaxed whitespace-pre-wrap [word-break:keep-all]">
            {comment.content}
          </p>

          {/* Actions */}
          <div className="flex items-center gap-4 mt-2">
            <button
              onClick={() => handleLike(comment.id)}
              className={`flex items-center gap-1 text-xs transition-colors ${comment.isLiked ? 'text-red-500' : 'text-gray-400 hover:text-gray-600'
                }`}
            >
              <svg
                className="w-4 h-4"
                fill={comment.isLiked ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
                />
              </svg>
              {comment.likeCount > 0 && <span>{comment.likeCount}</span>}
            </button>

            {!isReply && user && (
              <button
                onClick={() => setReplyTo(replyTo === comment.id ? null : comment.id)}
                className="text-xs text-gray-400 hover:text-gray-600 transition-colors"
              >
                답글
              </button>
            )}
          </div>

          {/* Reply Form */}
          {replyTo === comment.id && (
            <div className="mt-3">
              <textarea
                value={replyContent}
                onChange={(e) => setReplyContent(e.target.value)}
                placeholder="답글을 입력하세요..."
                className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                rows={2}
              />
              <div className="flex justify-end gap-2 mt-2">
                <button
                  onClick={() => {
                    setReplyTo(null);
                    setReplyContent('');
                  }}
                  className="px-3 py-1.5 text-xs text-gray-600 hover:text-gray-900 transition-colors"
                >
                  취소
                </button>
                <button
                  onClick={() => handleReply(comment.id)}
                  disabled={!replyContent.trim() || isSubmitting}
                  className="px-3 py-1.5 text-xs bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '등록 중...' : '답글 등록'}
                </button>
              </div>
            </div>
          )}

          {/* Replies */}
          {comment.replies && comment.replies.length > 0 && (
            <div className="mt-3">
              {comment.replies.map((reply) => renderComment(reply, true))}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (isLoading || authLoading) {
    return (
      <div className="py-8">
        <div className="h-6 w-32 bg-gray-100 rounded animate-pulse mb-6" />
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-3">
              <div className="w-9 h-9 bg-gray-100 rounded-full animate-pulse" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-24 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-8">
      {/* Header */}
      <h3 className="text-xl font-bold text-gray-900 mb-6">
        댓글 {totalCount > 0 && <span className="text-gray-400">({totalCount})</span>}
      </h3>

      {/* Comment Form */}
      {user ? (
        <form onSubmit={handleSubmit} className="mb-8">
          <div className="flex gap-3">
            {profile?.avatar_url ? (
              <div className="w-9 h-9 relative flex-shrink-0 rounded-full overflow-hidden">
                <Image
                  src={profile.avatar_url}
                  alt={profile.name || ''}
                  fill
                  className="object-cover"
                  sizes="36px"
                />
              </div>
            ) : (
              <div className="w-9 h-9 bg-gray-200 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-medium text-gray-500">
                  {profile?.name?.charAt(0) || user.email?.charAt(0) || '?'}
                </span>
              </div>
            )}
            <div className="flex-1">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className="w-full px-4 py-3 border border-gray-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent transition-shadow text-gray-900 dark:text-gray-100 bg-white dark:bg-gray-800"
                rows={3}
              />
              <div className="flex justify-end mt-2">
                <button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  className="px-4 py-2 text-sm bg-gray-900 text-white rounded-full hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isSubmitting ? '등록 중...' : '댓글 등록'}
                </button>
              </div>
            </div>
          </div>
        </form>
      ) : (
        <div className="mb-8 p-4 bg-gray-50 rounded-lg text-center">
          <p className="text-sm text-gray-600">
            댓글을 작성하려면{' '}
            <a href="/auth/signin" className="text-gray-900 font-medium hover:underline">
              로그인
            </a>
            이 필요합니다
          </p>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {comments.map((comment) => renderComment(comment))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500">아직 댓글이 없습니다. 첫 번째 댓글을 남겨보세요!</p>
        </div>
      )}
    </div>
  );
}
