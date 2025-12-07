/**
 * T011-T016: Sitemap.xml 생성
 * Feature: SEO 기본 기능 - Phase 3
 */

import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/sanity/queries';
import { SITE_CONFIG } from '@/lib/seo/metadata-helpers';
import { CATEGORIES } from '@/types';

export const revalidate = 3600; // T016: ISR 캐싱 설정 (1시간)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = SITE_CONFIG.url;

  // T013: 홈페이지 URL (priority: 1.0)
  const homeEntry: MetadataRoute.Sitemap[number] = {
    url: baseUrl,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 1.0,
  };

  // T014: 카테고리 페이지 URL (priority: 0.8)
  const categoryEntries: MetadataRoute.Sitemap = CATEGORIES.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  // T012: Sanity 쿼리 - 모든 공개 게시글 조회
  // T015: 블로그 글 URL (priority: 0.7, lastmod: _updatedAt)
  const posts = await getAllPosts();
  const postEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  return [homeEntry, ...categoryEntries, ...postEntries];
}
