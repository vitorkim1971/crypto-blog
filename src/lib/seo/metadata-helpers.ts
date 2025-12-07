/**
 * T003: Metadata 헬퍼 함수
 * Feature: SEO 기본 기능
 */

import { Metadata } from 'next';
import { PageMetadata, BlogPostMetadata } from '@/lib/types/seo';

/**
 * 사이트 기본 설정
 */
export const SITE_CONFIG = {
  name: "Victor's Alpha",
  title: "Victor's Alpha - 암호화폐 투자 인사이트",
  description: '실패와 성공에서 배우는 암호화폐 투자 전략. DeFi, NFT, 시장 분석까지',
  url: process.env.NEXT_PUBLIC_SITE_URL || 'https://victorsalpha.com',
  ogImage: '/images/og-default.svg', // T001: OG 기본 이미지
  locale: 'ko_KR',
  twitterCreator: '@victorsalpha',
} as const;

/**
 * T008: 텍스트 길이 제한 (title 60자, description 160자)
 */
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
}

/**
 * T007: Sanity 이미지 OG 이미지 URL 생성 (1200x630)
 * @param imageUrl - Sanity 이미지 URL
 * @returns OG 이미지 최적화된 URL
 */
export function getOgImageUrl(imageUrl?: string | null): string {
  if (!imageUrl) {
    return `${SITE_CONFIG.url}${SITE_CONFIG.ogImage}`;
  }

  // Sanity 이미지 URL에 크기 파라미터 추가
  if (imageUrl.includes('cdn.sanity.io')) {
    const url = new URL(imageUrl);
    url.searchParams.set('w', '1200');
    url.searchParams.set('h', '630');
    url.searchParams.set('fit', 'crop');
    url.searchParams.set('auto', 'format');
    return url.toString();
  }

  return imageUrl;
}

/**
 * T009: Canonical URL 생성
 */
export function getCanonicalUrl(path: string): string {
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  return `${SITE_CONFIG.url}${cleanPath}`;
}

/**
 * 기본 페이지 메타데이터 생성
 */
export function createPageMetadata({
  title,
  description,
  path = '',
  image,
  noIndex = false,
}: {
  title: string;
  description: string;
  path?: string;
  image?: string;
  noIndex?: boolean;
}): Metadata {
  const fullTitle = title === SITE_CONFIG.title ? title : `${title} | ${SITE_CONFIG.name}`;
  const ogImage = getOgImageUrl(image);
  const canonical = getCanonicalUrl(path);

  return {
    title: truncate(fullTitle, 60),
    description: truncate(description, 160),
    alternates: {
      canonical,
    },
    openGraph: {
      title: truncate(title, 60),
      description: truncate(description, 160),
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: SITE_CONFIG.locale,
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title: truncate(title, 60),
      description: truncate(description, 160),
      images: [ogImage],
      creator: SITE_CONFIG.twitterCreator,
    },
    ...(noIndex && { robots: { index: false, follow: false } }),
  };
}

/**
 * 블로그 포스트 메타데이터 생성
 */
export function createBlogPostMetadata({
  title,
  description,
  slug,
  image,
  publishedAt,
  updatedAt,
  author,
  tags,
}: {
  title: string;
  description: string;
  slug: string;
  image?: string;
  publishedAt?: string;
  updatedAt?: string;
  author?: { name: string };
  tags?: string[];
}): Metadata {
  const path = `/blog/${slug}`;
  const ogImage = getOgImageUrl(image);
  const canonical = getCanonicalUrl(path);

  return {
    title: truncate(title, 60),
    description: truncate(description, 160),
    keywords: tags,
    authors: author ? [{ name: author.name }] : undefined,
    alternates: {
      canonical,
    },
    openGraph: {
      title: truncate(title, 60),
      description: truncate(description, 160),
      url: canonical,
      siteName: SITE_CONFIG.name,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      locale: SITE_CONFIG.locale,
      type: 'article',
      publishedTime: publishedAt,
      modifiedTime: updatedAt,
      authors: author ? [author.name] : undefined,
      tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: truncate(title, 60),
      description: truncate(description, 160),
      images: [ogImage],
      creator: SITE_CONFIG.twitterCreator,
    },
  };
}

/**
 * 카테고리 페이지 메타데이터 생성
 */
export function createCategoryMetadata({
  category,
  description,
  postCount,
}: {
  category: string;
  description?: string;
  postCount?: number;
}): Metadata {
  const title = `${category} 카테고리`;
  const desc =
    description ||
    `${category}에 관한 암호화폐 투자 인사이트와 전략${postCount ? ` (${postCount}개의 글)` : ''}`;

  return createPageMetadata({
    title,
    description: desc,
    path: `/category/${category}`,
  });
}
