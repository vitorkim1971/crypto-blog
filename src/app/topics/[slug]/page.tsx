import { Metadata } from 'next';
import { searchPosts } from '@/lib/sanity/queries';
import PostCard from '@/components/blog/PostCard'; // Reuse PostCard
import { createPageMetadata } from '@/lib/seo/metadata-helpers';
import { notFound } from 'next/navigation';

interface TopicPageProps {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: TopicPageProps): Promise<Metadata> {
    const { slug } = await params;
    const topic = decodeURIComponent(slug);

    return createPageMetadata({
        title: `'${topic}' 관련 글`,
        description: `Victor's Alpha에서 '${topic}' 태그가 포함된 모든 글을 모아보세요.`,
        path: `/topics/${slug}`,
    });
}

export default async function TopicPage({ params }: TopicPageProps) {
    const { slug } = await params;
    const topic = decodeURIComponent(slug);

    // Reusing searchPosts query which likely filters by title or tags
    // Ideally we should have a specific getPostsByTag query, but searchPosts might suffice if it searches tags
    // If searchPosts is strictly title search, we need a new query. 
    // checking queries.ts next to confirm. 
    // For now assuming searchPosts works or I will create getPostsByTag.
    const posts = await searchPosts(topic);

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors">
            <div className="max-w-[1336px] mx-auto px-4 md:px-6 py-12">
                {/* Header */}
                <div className="mb-12 text-center">
                    <div className="inline-block px-4 py-1.5 mb-4 rounded-full bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 text-sm font-bold tracking-wide uppercase">
                        Topic
                    </div>
                    <h1 className="text-3xl md:text-4xl font-serif font-bold text-gray-900 dark:text-gray-100 mb-4">
                        #{topic}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        {posts.length > 0
                            ? `총 ${posts.length}개의 관련 글이 있습니다.`
                            : '이 토픽으로 작성된 글이 없습니다.'}
                    </p>
                </div>

                {/* Results List - Vertical Layout */}
                {posts.length > 0 ? (
                    <div className="grid grid-cols-1 gap-6 max-w-3xl mx-auto">
                        {posts.map((post) => (
                            <PostCard key={post.id} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800">
                        <div className="w-16 h-16 mx-auto mb-6 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center text-gray-400">
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">
                            작성된 글이 없습니다
                        </h3>
                        <p className="text-gray-500 dark:text-gray-400">
                            아직 이 토픽으로 등록된 포스트가 없습니다.<br />
                            다른 토픽을 선택해보세요.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
