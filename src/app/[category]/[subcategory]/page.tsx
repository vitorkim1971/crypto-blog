import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import Link from 'next/link';
import PostCard from '@/components/blog/PostCard';
import Pagination from '@/components/common/Pagination';
import { getPostsBySubcategory } from '@/lib/sanity/queries';
import { CATEGORIES } from '@/types';

const POSTS_PER_PAGE = 10;

// Generate static params for all category/subcategory combinations
export async function generateStaticParams() {
  const params: { category: string; subcategory: string }[] = [];

  CATEGORIES.forEach((category) => {
    category.subCategories?.forEach((sub) => {
      params.push({
        category: category.slug,
        subcategory: sub.slug,
      });
    });
  });

  return params;
}

// Generate metadata for subcategory pages
export async function generateMetadata({
  params,
}: {
  params: Promise<{ category: string; subcategory: string }>;
}): Promise<Metadata> {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;

  const category = CATEGORIES.find((cat) => cat.slug === categorySlug);
  const subcategory = category?.subCategories?.find((sub) => sub.slug === subcategorySlug);

  if (!category || !subcategory) {
    return {
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 페이지를 찾을 수 없습니다.',
    };
  }

  const { total } = await getPostsBySubcategory(categorySlug, subcategorySlug, 1, 1);

  return {
    title: `${subcategory.name} | ${category.name} | Victor's Alpha`,
    description: `${category.name}의 ${subcategory.name} 관련 글 ${total}개`,
    openGraph: {
      title: `${subcategory.name} - ${category.name}`,
      description: `${category.name}의 ${subcategory.name} 관련 글 ${total}개`,
    },
  };
}

export default async function SubcategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ category: string; subcategory: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  const { category: categorySlug, subcategory: subcategorySlug } = await params;
  const { page } = await searchParams;
  const currentPage = Math.max(1, parseInt(page || '1', 10));

  const category = CATEGORIES.find((cat) => cat.slug === categorySlug);
  const subcategory = category?.subCategories?.find((sub) => sub.slug === subcategorySlug);

  if (!category || !subcategory) {
    notFound();
  }

  const { posts, total } = await getPostsBySubcategory(
    categorySlug,
    subcategorySlug,
    currentPage,
    POSTS_PER_PAGE
  );
  const totalPages = Math.ceil(total / POSTS_PER_PAGE);

  return (
    <div className="min-h-screen bg-white">
      {/* Medium style layout */}
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Subcategory Header */}
        <div className="mb-10">
          {/* Breadcrumb - Simplified */}
          <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
            <Link href={`/${category.slug}`} className="hover:text-gray-900 transition-colors">
              {category.name}
            </Link>
            <span>/</span>
            <span className="text-gray-900">{subcategory.name}</span>
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            {subcategory.name}
          </h1>
          <p className="text-lg text-gray-500">
            {category.description}
            {total > 0 && (
              <span className="ml-2 text-gray-400">· {total}개의 글</span>
            )}
          </p>
        </div>

        {/* Subcategory Tabs - Pill style */}
        <div className="mb-10 flex flex-wrap gap-2 pb-6 border-b border-gray-100">
          <Link
            href={`/${category.slug}`}
            className="px-4 py-2 text-sm rounded-full bg-gray-100 text-gray-600 hover:bg-gray-200 transition-colors"
          >
            전체
          </Link>
          {category.subCategories?.map((sub) => (
            <Link
              key={sub.slug}
              href={`/${category.slug}/${sub.slug}`}
              className={`px-4 py-2 text-sm rounded-full transition-colors ${sub.slug === subcategorySlug
                  ? 'bg-gray-900 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
            >
              {sub.name}
            </Link>
          ))}
        </div>

        {/* Posts List */}
        {posts.length > 0 ? (
          <>
            <div>
              {posts.map((post) => (
                <PostCard key={post.id} post={post} variant="default" />
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              basePath={`/${category.slug}/${subcategory.slug}`}
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
