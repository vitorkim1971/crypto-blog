import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Image from 'next/image';
import { getPostBySlug, getAllPosts, getRelatedPosts } from '@/lib/sanity/queries';
import { PortableText } from '@portabletext/react';
import { portableTextComponents } from '@/components/blog/PortableTextComponents';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import { checkSubscription } from '@/lib/subscription/check';
import { createBlogPostMetadata } from '@/lib/seo/metadata-helpers';
import { createBlogPostingSchema, jsonLdToScriptString } from '@/lib/seo/json-ld';
import Paywall from '@/components/premium/Paywall';
import PremiumBadge from '@/components/premium/PremiumBadge';
import { createClient } from '@/lib/supabase/server';
import { PostEngagement, CommentSection, RelatedPosts } from '@/components/engagement';

export async function generateStaticParams() {
  const posts = await getAllPosts();
  return posts.map((post) => ({
    slug: post.slug,
  }));
}

/**
 * T005: 블로그 글 동적 메타 데이터
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug, false); // 메타데이터만 가져오기

  if (!post) {
    return {
      title: '페이지를 찾을 수 없습니다',
    };
  }

  return createBlogPostMetadata({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    image: post.coverImageUrl,
    publishedAt: post.publishedAt,
    updatedAt: post._updatedAt,
    author: post.author,
    tags: post.tags,
  });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // T030: Check subscription status - Get user from session
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let userHasPremium = false;
  if (user) {
    const { isPremium } = await checkSubscription(user.id);
    userHasPremium = isPremium;
  }

  // First fetch post metadata to check if it's premium
  const postMetadata = await getPostBySlug(slug, false); // Don't fetch content yet

  if (!postMetadata) {
    notFound();
  }

  // T031: Determine access - non-premium posts are always accessible
  // Premium posts require active subscription
  const hasAccess = !postMetadata.isPremium || userHasPremium;

  // T029: Fetch post with conditional content based on access
  const post = await getPostBySlug(slug, hasAccess);

  if (!post) {
    notFound();
  }

  // T031: isPremium check - show paywall for premium posts without access
  const shouldShowPaywall = post.isPremium && !hasAccess;

  // 관련 글 가져오기
  const relatedPosts = await getRelatedPosts(
    slug,
    post.category?.slug || '',
    post.tags || [],
    3
  );

  // T018, T019, T020, T021: JSON-LD 스키마 생성
  const jsonLd = createBlogPostingSchema({
    title: post.title,
    description: post.excerpt,
    slug: post.slug,
    publishedAt: post.publishedAt,
    updatedAt: post._updatedAt,
    coverImage: post.coverImageUrl,
    authorName: post.author.name,
    authorImage: post.author.avatar,
  });

  return (
    <>
      {/* T020: JSON-LD 스크립트 태그 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdToScriptString(jsonLd) }}
      />

      <article className="min-h-screen bg-white">
        {/* T015, T016: Medium-style hero - clean layout */}
        {post.coverImageUrl && (
          <div className="w-full mb-12">
            {post.coverImage?.metadata?.dimensions ? (
              <Image
                src={post.coverImageUrl}
                alt={post.title}
                width={post.coverImage.metadata.dimensions.width}
                height={post.coverImage.metadata.dimensions.height}
                className="w-full h-auto rounded-lg"
                priority
              />
            ) : (
              <div className="relative h-[60vh] min-h-[400px] w-full">
                <Image
                  src={post.coverImageUrl}
                  alt={post.title}
                  fill
                  className="object-cover"
                  priority
                />
              </div>
            )}
          </div>
        )}

        {/* Content Container */}
        <div className="container mx-auto px-6 max-w-3xl py-12">
          {/* T016: Title with Serif font - Medium style */}
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 leading-tight">
            {post.title}
          </h1>

          {/* T017: Premium badge */}
          {post.isPremium && (
            <div className="mb-6">
              <PremiumBadge size="md" variant="outline" />
            </div>
          )}

          <p className="text-xl text-gray-600 mb-8 leading-relaxed">
            {post.excerpt}
          </p>

          {/* T018: Meta with border */}
          <div className="flex items-center gap-4 pb-8 mb-8 border-b border-gray-200">
            {post.author.avatar && (
              <Image
                src={post.author.avatar}
                alt={post.author.name}
                width={48}
                height={48}
                className="rounded-full"
              />
            )}
            <div>
              <p className="font-medium text-gray-900">{post.author.name}</p>
              <p className="text-sm text-gray-600">
                {format(new Date(post.publishedAt), 'PPP', { locale: ko })} ·{' '}
                {post.readingTime}분 읽기
              </p>
            </div>
          </div>

          {/* Article Content */}
          {/* T032: Conditional rendering - full content or paywall */}
          {shouldShowPaywall ? (
            // T038: Paywall component for premium content
            <Paywall variant="subscription_required" />
          ) : (
            // Full content for accessible posts
            <div className="max-w-none">
              {post.content && (
                <PortableText
                  value={post.content}
                  components={portableTextComponents}
                />
              )}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="mt-12 pt-8 border-t border-gray-200">
              <div className="flex flex-wrap gap-2">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-full text-sm"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Engagement: Claps, Bookmark, Share */}
          <PostEngagement
            slug={slug}
            url={`/blog/${slug}`}
            title={post.title}
            className="mt-10"
          />

          {/* Comments Section */}
          <CommentSection slug={slug} />

          {/* Related Posts */}
          <RelatedPosts posts={relatedPosts} />
        </div>
      </article>
    </>
  );
}
