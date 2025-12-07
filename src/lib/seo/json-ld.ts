/**
 * T017: JSON-LD 생성 헬퍼 함수
 * Feature: SEO 기본 기능 - Phase 4
 */

import { JsonLdBlogPosting, JsonLdPerson, JsonLdOrganization } from '@/lib/types/seo';
import { SITE_CONFIG, getOgImageUrl } from './metadata-helpers';

/**
 * T018, T019: BlogPosting 스키마 + Person (Author) 스키마
 */
export function createBlogPostingSchema({
  title,
  description,
  slug,
  publishedAt,
  updatedAt,
  coverImage,
  authorName,
  authorImage,
}: {
  title: string;
  description?: string;
  slug: string;
  publishedAt?: string;
  updatedAt?: string;
  coverImage?: string | null;
  authorName: string;
  authorImage?: string | null;
}): JsonLdBlogPosting {
  const url = `${SITE_CONFIG.url}/blog/${slug}`;

  // T021: 커버 이미지 없을 때 기본 이미지 사용
  const imageUrl = getOgImageUrl(coverImage);

  // T019: Person (Author) 스키마
  const author: JsonLdPerson = {
    '@type': 'Person',
    name: authorName,
    image: authorImage || undefined,
  };

  // Publisher 정보
  const publisher: JsonLdOrganization = {
    '@type': 'Organization',
    name: SITE_CONFIG.name,
    logo: {
      '@type': 'ImageObject',
      url: `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`,
    },
  };

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: title,
    image: imageUrl,
    datePublished: publishedAt || new Date().toISOString(),
    dateModified: updatedAt || publishedAt || new Date().toISOString(),
    author,
    publisher,
    description,
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': url,
    },
  };
}

/**
 * T020: JSON-LD를 <script> 태그용 문자열로 변환
 */
export function jsonLdToScriptString(data: JsonLdBlogPosting): string {
  return JSON.stringify(data, null, 2);
}
