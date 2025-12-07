import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/common/Pagination';
import { getPostsByCategory } from '@/lib/sanity/queries';
import { CATEGORIES } from '@/types';
import { createCategoryMetadata } from '@/lib/seo/metadata-helpers';

const POSTS_PER_PAGE = 10;

export async function generateStaticParams() {
  return CATEGORIES.map((category) => ({
    category: category.slug,
  }));
}

// T006: 카테고리 페이지 메타데이터
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string }>;
}): Promise<Metadata> {
  const { category: categorySlug } = await params;
  const category = CATEGORIES.find((cat) => cat.slug === categorySlug);

  if (!category) {
    return {
      title: '카테고리를 찾을 수 없습니다',
      description: '요청하신 카테고리를 찾을 수 없습니다.',
    };
  }

  const { total } = await getPostsByCategory(categorySlug, 1, 1);

  return createCategoryMetadata({
    category: category.name,
    description: category.description,
    postCount: total,
  });
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category: categorySlug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || '1', 10));
  const category = CATEGORIES.find((cat) => cat.slug === categorySlug);

  if (!category) {
    notFound();
  }

  const { posts, total } = await getPostsByCategory(categorySlug, currentPage, POSTS_PER_PAGE);
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white">
      {/* Medium style layout */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Category Header */}
        <div className="mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {category.name}
          </h1>
          <p className="text-lg text-gray-500">
            {category.description}
            {total > 0 && (
              <span className="ml-2 text-gray-400">· {total}개의 글</span>
            )}
          </p>
        </div>

        {/* Subcategory Tabs - Pill style */}
        {category.subCategories && category.subCategories.length > 0 && (
          <div className="mb-10 flex flex-wrap gap-2 pb-6 border-b border-gray-100">
            <span className="px-4 py-2 text-sm rounded-full bg-gray-900 text-white">
              전체
            </span>
            {category.subCategories.map((sub) => (
              <Link
                key={sub.slug}
                href={`/${category.slug}/${sub.slug}`}
                className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
              >
                {sub.name}
              </Link>
            ))}
          </div>
        )}

        {posts.length > 0 ? (
          <>
            {/* Medium style post list */}
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} variant="default" />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/${category.slug}`}
            />
          </>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">아직 글이 없습니다</h3>
            <p className="text-gray-500">
              곧 새로운 콘텐츠가 업데이트될 예정입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
