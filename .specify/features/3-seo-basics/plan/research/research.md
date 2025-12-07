# 기술 연구: SEO 기본 기능

**작성일**: 2025-11-16
**상태**: 완료

## 개요

이 문서는 Next.js 14 App Router 환경에서 SEO 최적화를 위한 기술적 결정사항을 연구합니다.

---

## Research 1: Next.js Metadata API 패턴

### 연구 질문
Next.js 14 App Router에서 동적 메타 태그를 생성하는 최적 패턴은?

### 결정: generateMetadata 사용

**Next.js Metadata API 종류**:

| 방법 | 사용 사례 | 장점 | 단점 |
|------|-----------|------|------|
| Static `metadata` 객체 | 정적 페이지 | 간단, 빠름 | 동적 데이터 불가 |
| `generateMetadata()` | 동적 페이지 | 데이터 기반 생성 | 약간 느림 |
| 파일 기반 (`opengraph-image.tsx`) | OG 이미지 동적 생성 | 자동 최적화 | 복잡한 설정 |

**결정**: `generateMetadata()` 함수 사용

### 구현 패턴

**1. 블로그 글 페이지**

```typescript
// app/blog/[slug]/page.tsx
import { Metadata } from 'next';
import { getPost } from '@/lib/sanity/queries';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return {
      title: '게시글을 찾을 수 없습니다 | CryptoTitan',
    };
  }

  const ogImage = post.coverImage
    ? post.coverImage.url + '?w=1200&h=630&fit=crop'
    : 'https://cryptotitan.com/images/og-default.png';

  return {
    title: `${post.title} | CryptoTitan`,
    description: post.excerpt || post.title.slice(0, 160),
    openGraph: {
      title: post.title,
      description: post.excerpt || post.title,
      type: 'article',
      publishedTime: post.publishedAt,
      authors: [post.author.name],
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt || post.title,
      images: [ogImage],
    },
    alternates: {
      canonical: `https://cryptotitan.com/blog/${params.slug}`,
    },
  };
}
```

**2. 홈페이지 (Static Metadata)**

```typescript
// app/page.tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'CryptoTitan - 암호화폐 투자 인사이트 블로그',
  description:
    '전문가의 암호화폐 분석, 시장 동향, 투자 전략을 제공하는 프리미엄 블로그입니다.',
  openGraph: {
    title: 'CryptoTitan - 암호화폐 투자 인사이트 블로그',
    description: '전문가의 암호화폐 분석, 시장 동향, 투자 전략을 제공합니다.',
    type: 'website',
    url: 'https://cryptotitan.com',
    images: [
      {
        url: 'https://cryptotitan.com/images/og-home.png',
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
  },
};
```

**3. 카테고리 페이지**

```typescript
// app/category/[category]/page.tsx
export async function generateMetadata({
  params,
}: {
  params: { category: string };
}): Promise<Metadata> {
  const categoryName = decodeURIComponent(params.category);

  return {
    title: `${categoryName} | CryptoTitan`,
    description: `${categoryName} 관련 암호화폐 콘텐츠를 확인하세요.`,
    alternates: {
      canonical: `https://cryptotitan.com/category/${params.category}`,
    },
  };
}
```

---

## Research 2: Sanity 이미지 최적화 (OG 이미지)

### 연구 질문
Sanity 이미지를 OG 이미지로 사용할 때 최적화 방법은?

### 결정: Sanity Image API + Query Parameters

**OG 이미지 요구사항**:
- 크기: 1200 x 630px
- 형식: WebP (fallback: JPEG)
- 파일 크기: < 100KB
- Aspect ratio: 1.91:1

**Sanity Image URL 생성**:

```typescript
// lib/sanity/image.ts
import imageUrlBuilder from '@sanity/image-url';
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { client } from './client';

const builder = imageUrlBuilder(client);

export function urlFor(source: SanityImageSource) {
  return builder.image(source);
}

// OG 이미지 전용
export function getOgImageUrl(source: SanityImageSource | undefined): string {
  if (!source) {
    return 'https://cryptotitan.com/images/og-default.png';
  }

  return urlFor(source)
    .width(1200)
    .height(630)
    .fit('crop')
    .auto('format') // WebP 자동 변환
    .quality(85)
    .url();
}
```

**사용 예시**:

```typescript
const ogImage = getOgImageUrl(post.coverImage);

// 결과 URL:
// https://cdn.sanity.io/images/project-id/production/
//   image-id.jpg?w=1200&h=630&fit=crop&auto=format&q=85
```

**Fallback 전략**:

```typescript
// lib/seo/og-image.ts
export function getOgImage(post: Post): string {
  // 1. 커버 이미지 있으면 사용
  if (post.coverImage) {
    return getOgImageUrl(post.coverImage);
  }

  // 2. 카테고리별 기본 이미지
  const categoryImages: Record<string, string> = {
    비트코인: '/images/og-bitcoin.png',
    이더리움: '/images/og-ethereum.png',
    'DeFi': '/images/og-defi.png',
  };

  if (post.category && categoryImages[post.category]) {
    return `https://cryptotitan.com${categoryImages[post.category]}`;
  }

  // 3. 전체 기본 이미지
  return 'https://cryptotitan.com/images/og-default.png';
}
```

---

## Research 3: Dynamic Sitemap 성능 최적화

### 연구 질문
Sitemap을 동적으로 생성할 때 성능을 어떻게 최적화하는가?

### 결정: Next.js 내장 Sitemap + ISR 캐싱

**Next.js Sitemap API**:

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPosts } from '@/lib/sanity/queries';

export const revalidate = 3600; // 1시간마다 재검증

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptotitan.com';

  // 1. 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
  ];

  // 2. 블로그 글 (Sanity에서 가져오기)
  const posts = await getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: post.isPremium ? 0.9 : 0.7, // 프리미엄 글 우선순위 높음
  }));

  // 3. 카테고리 페이지
  const categories = [...new Set(posts.map((p) => p.category))];
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${encodeURIComponent(category)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.6,
  }));

  return [...staticPages, ...blogPages, ...categoryPages];
}
```

**성능 최적화 전략**:

| 전략 | 구현 | 효과 |
|------|------|------|
| ISR 캐싱 | `revalidate: 3600` | 1시간 동안 캐시 사용 |
| Sanity Projection | 필요한 필드만 쿼리 | DB 쿼리 시간 감소 |
| Edge CDN | Vercel 자동 처리 | 전세계 빠른 응답 |

**Sanity 쿼리 최적화**:

```typescript
// lib/sanity/queries.ts
import { client } from './client';

export async function getAllPostsForSitemap() {
  return client.fetch(
    `*[_type == "post" && !(_id in path("drafts.**"))] | order(_updatedAt desc) {
      slug,
      _updatedAt,
      category,
      isPremium
    }`
  );
}
```

**예상 성능**:
- 초회 생성: ~500ms (100개 게시글 기준)
- 캐시 히트: ~50ms (Edge CDN)
- 재검증: 1시간마다

---

## Research 4: JSON-LD 구조화된 데이터

### 연구 질문
블로그 글에 적용할 JSON-LD 스키마는 무엇인가?

### 결정: BlogPosting + Person Schema

**Schema.org 타입**:
- **BlogPosting**: 블로그 게시글
- **Person**: 저자 정보

**구현 패턴**:

```typescript
// app/blog/[slug]/page.tsx
import { BlogPosting, Person, WithContext } from 'schema-dts';

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  const jsonLd: WithContext<BlogPosting> = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage?.url || 'https://cryptotitan.com/images/og-default.png',
    datePublished: post.publishedAt,
    dateModified: post._updatedAt,
    author: {
      '@type': 'Person',
      name: post.author.name,
      url: `https://cryptotitan.com/author/${post.author.slug}`,
    } as Person,
    publisher: {
      '@type': 'Organization',
      name: 'CryptoTitan',
      logo: {
        '@type': 'ImageObject',
        url: 'https://cryptotitan.com/images/logo.png',
      },
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://cryptotitan.com/blog/${params.slug}`,
    },
  };

  return (
    <>
      {/* JSON-LD 삽입 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 페이지 컨텐츠 */}
      <article>
        <h1>{post.title}</h1>
        {/* ... */}
      </article>
    </>
  );
}
```

**TypeScript 타입 안전성**:

```bash
npm install schema-dts
```

```typescript
import { WithContext, BlogPosting } from 'schema-dts';

// 타입 체크로 스키마 오류 방지
const jsonLd: WithContext<BlogPosting> = { ... };
```

**검증**:
1. [Google Rich Results Test](https://search.google.com/test/rich-results)
2. [Schema Markup Validator](https://validator.schema.org/)

---

## 최종 기술 스택 결정

### Architecture Overview

```
┌────────────────────┐
│  Next.js Page      │
│  (Server Component)│
└─────────┬──────────┘
          │
    ┌─────▼─────────┐
    │ generateMetadata│
    │ (동적 생성)     │
    └─────┬──────────┘
          │
          ├─► <meta> tags (title, description, OG)
          ├─► <link rel="canonical">
          └─► JSON-LD <script>

┌────────────────────┐
│  Sitemap Request   │
│  /sitemap.xml      │
└─────────┬──────────┘
          │
    ┌─────▼─────────┐
    │ app/sitemap.ts │
    │ (ISR 1시간)     │
    └─────┬──────────┘
          │
    ┌─────▼─────────┐
    │ Sanity Query   │
    │ (slug, updatedAt│
    └─────┬──────────┘
          │
    ┌─────▼─────────┐
    │  XML Output    │
    │  (Edge CDN)    │
    └────────────────┘
```

### 선택된 기술

| 항목 | 결정 | 근거 |
|------|------|------|
| 메타 태그 | `generateMetadata()` | 동적 데이터 기반 생성 |
| OG 이미지 | Sanity Image API + Fallback | 자동 최적화, 다층 fallback |
| Sitemap | `app/sitemap.ts` + ISR | 항상 최신, 성능 최적화 |
| JSON-LD | `schema-dts` + BlogPosting | 타입 안전성, Google 권장 |

### 성능 목표
- Sitemap 생성: < 500ms (초회)
- Sitemap 캐시 히트: < 50ms
- OG 이미지 로딩: < 200ms (WebP)
- 재검증 주기: 1시간

---

## 다음 단계

✅ 모든 기술 결정 완료
📋 **Phase 1**: 메타데이터 모델 및 API 계약 설계
