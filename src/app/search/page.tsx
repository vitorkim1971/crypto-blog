import { Metadata } from 'next';
import { searchPosts } from '@/lib/sanity/queries';
import PostCard from '@/components/blog/PostCard';
import { createPageMetadata } from '@/lib/seo/metadata-helpers';

interface SearchPageProps {
    searchParams: Promise<{ q?: string }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
    const { q } = await searchParams;
    const query = q || '';
    return createPageMetadata({
        title: query ? `'${query}' 검색 결과` : '검색',
        description: `Victor's Alpha에서 '${query}'에 대한 검색 결과입니다.`,
        path: `/search?q=${encodeURIComponent(query)}`,
        noIndex: true,
    });
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
    const { q } = await searchParams;
    const query = q || '';
    const posts = query ? await searchPosts(query) : [];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-[1336px] mx-auto px-4 md:px-6 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
                        {query ? (
                            <>
                                &apos;<span className="text-blue-600 dark:text-blue-400">{query}</span>&apos; 검색 결과
                            </>
                        ) : (
                            '검색'
                        )}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {query
                            ? `총 ${posts.length}개의 글을 찾았습니다.`
                            : '검색어를 입력하여 원하는 글을 찾아보세요.'}
                    </p>
                </div>

                {/* Results - Vertical Layout (grid-cols-1) */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    query && (
                        <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                            <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                                검색 결과가 없습니다
                            </h3>
                            <p className="text-gray-500 dark:text-gray-400">
                                다른 키워드로 검색해보거나,<br />
                                철자가 정확한지 확인해 주세요.
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
