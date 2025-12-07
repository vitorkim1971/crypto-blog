# Metadata Model: SEO 메타데이터 구조

**기능**: SEO 기본 기능
**작성일**: 2025-11-16
**상태**: 확정

## 개요

이 문서는 페이지별 메타데이터 구조를 정의합니다. Next.js Metadata API를 사용하여 동적으로 생성됩니다.

---

## Page Types & Metadata

### 1. 홈페이지 (`/`)

**Metadata Structure**:

```typescript
{
  title: "CryptoTitan - 암호화폐 투자 인사이트 블로그",
  description: "전문가의 암호화폐 분석, 시장 동향, 투자 전략을 제공하는 프리미엄 블로그입니다.",
  openGraph: {
    title: "CryptoTitan - 암호화폐 투자 인사이트 블로그",
    description: "전문가의 암호화폐 분석, 시장 동향, 투자 전략을 제공합니다.",
    type: "website",
    url: "https://cryptotitan.com",
    images: [
      {
        url: "https://cryptotitan.com/images/og-home.png",
        width: 1200,
        height: 630,
        alt: "CryptoTitan 홈",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@cryptotitan",
    creator: "@cryptotitan",
  },
  alternates: {
    canonical: "https://cryptotitan.com",
  },
}
```

---

### 2. 블로그 글 (`/blog/[slug]`)

**Metadata Structure**:

```typescript
{
  title: `${post.title} | CryptoTitan`,
  description: truncate(post.excerpt || post.title, 160),
  authors: [{ name: post.author.name }],
  openGraph: {
    title: post.title,
    description: truncate(post.excerpt || post.title, 160),
    type: "article",
    publishedTime: post.publishedAt,
    modifiedTime: post._updatedAt,
    authors: [post.author.name],
    section: post.category,
    tags: post.tags || [],
    images: [
      {
        url: getOgImageUrl(post.coverImage),
        width: 1200,
        height: 630,
        alt: post.title,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: truncate(post.title, 70),
    description: truncate(post.excerpt || post.title, 160),
    images: [getOgImageUrl(post.coverImage)],
  },
  alternates: {
    canonical: `https://cryptotitan.com/blog/${post.slug}`,
  },
}
```

**JSON-LD (BlogPosting)**:

```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "{{ post.title }}",
  "description": "{{ post.excerpt }}",
  "image": "{{ post.coverImage.url }}",
  "datePublished": "{{ post.publishedAt }}",
  "dateModified": "{{ post._updatedAt }}",
  "author": {
    "@type": "Person",
    "name": "{{ post.author.name }}",
    "url": "https://cryptotitan.com/author/{{ post.author.slug }}"
  },
  "publisher": {
    "@type": "Organization",
    "name": "CryptoTitan",
    "logo": {
      "@type": "ImageObject",
      "url": "https://cryptotitan.com/images/logo.png"
    }
  },
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://cryptotitan.com/blog/{{ post.slug }}"
  },
  "keywords": ["{{ post.tags.join('", "') }}"]
}
```

---

### 3. 카테고리 페이지 (`/category/[category]`)

**Metadata Structure**:

```typescript
{
  title: `${categoryName} | CryptoTitan`,
  description: `${categoryName} 관련 최신 암호화폐 분석과 투자 인사이트를 확인하세요.`,
  openGraph: {
    title: `${categoryName} | CryptoTitan`,
    description: `${categoryName} 관련 최신 암호화폐 분석과 투자 인사이트를 확인하세요.`,
    type: "website",
    url: `https://cryptotitan.com/category/${encodeURIComponent(categoryName)}`,
    images: [
      {
        url: getCategoryOgImage(categoryName),
        width: 1200,
        height: 630,
        alt: `${categoryName} 카테고리`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
  },
  alternates: {
    canonical: `https://cryptotitan.com/category/${encodeURIComponent(categoryName)}`,
  },
}
```

---

### 4. 저자 페이지 (`/author/[slug]`)

**Metadata Structure**:

```typescript
{
  title: `${author.name} | CryptoTitan`,
  description: `${author.name}의 암호화폐 콘텐츠를 확인하세요. ${author.bio || ''}`,
  openGraph: {
    title: `${author.name} | CryptoTitan`,
    description: author.bio || `${author.name}의 암호화폐 콘텐츠`,
    type: "profile",
    url: `https://cryptotitan.com/author/${author.slug}`,
    images: [
      {
        url: author.avatar || "https://cryptotitan.com/images/avatar-default.png",
        width: 400,
        height: 400,
        alt: author.name,
      },
    ],
  },
  twitter: {
    card: "summary",
  },
  alternates: {
    canonical: `https://cryptotitan.com/author/${author.slug}`,
  },
}
```

**JSON-LD (Person)**:

```json
{
  "@context": "https://schema.org",
  "@type": "Person",
  "name": "{{ author.name }}",
  "description": "{{ author.bio }}",
  "image": "{{ author.avatar }}",
  "url": "https://cryptotitan.com/author/{{ author.slug }}",
  "sameAs": [
    "{{ author.twitter }}",
    "{{ author.linkedin }}"
  ]
}
```

---

## Helper Functions

### 1. Text Truncation

```typescript
// lib/seo/truncate.ts
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  // 단어 경계에서 자르기
  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}
```

### 2. OG Image URL Generation

```typescript
// lib/seo/og-image.ts
import { SanityImageSource } from '@sanity/image-url/lib/types/types';
import { urlFor } from '@/lib/sanity/image';

export function getOgImageUrl(source: SanityImageSource | undefined): string {
  if (!source) {
    return 'https://cryptotitan.com/images/og-default.png';
  }

  return urlFor(source)
    .width(1200)
    .height(630)
    .fit('crop')
    .auto('format')
    .quality(85)
    .url();
}

export function getCategoryOgImage(category: string): string {
  const categoryImages: Record<string, string> = {
    '비트코인': '/images/og-bitcoin.png',
    '이더리움': '/images/og-ethereum.png',
    'DeFi': '/images/og-defi.png',
    'NFT': '/images/og-nft.png',
  };

  return categoryImages[category]
    ? `https://cryptotitan.com${categoryImages[category]}`
    : 'https://cryptotitan.com/images/og-default.png';
}
```

### 3. JSON-LD Generator

```typescript
// lib/seo/json-ld.ts
import { BlogPosting, Person, WithContext } from 'schema-dts';
import { Post, Author } from '@/lib/types';

export function generateBlogPostingJsonLd(post: Post): WithContext<BlogPosting> {
  return {
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
    },
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
      '@id': `https://cryptotitan.com/blog/${post.slug}`,
    },
    keywords: post.tags?.join(', ') || '',
  };
}

export function generatePersonJsonLd(author: Author): WithContext<Person> {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: author.name,
    description: author.bio,
    image: author.avatar || 'https://cryptotitan.com/images/avatar-default.png',
    url: `https://cryptotitan.com/author/${author.slug}`,
    sameAs: [author.twitter, author.linkedin].filter(Boolean),
  };
}
```

---

## Metadata Validation Rules

### Title Rules

| 페이지 타입 | 최소 길이 | 최대 길이 | 형식 |
|-------------|-----------|-----------|------|
| 홈페이지 | 10자 | 60자 | `{브랜드명} - {설명}` |
| 블로그 글 | 10자 | 60자 | `{제목} \| {브랜드명}` |
| 카테고리 | 5자 | 60자 | `{카테고리} \| {브랜드명}` |

**Validation Function**:

```typescript
// lib/seo/validate.ts
export function validateTitle(title: string): string {
  if (title.length > 60) {
    return truncate(title, 60);
  }
  if (title.length < 10) {
    console.warn(`Title too short: ${title}`);
  }
  return title;
}
```

### Description Rules

| 항목 | 최소 길이 | 최대 길이 |
|------|-----------|-----------|
| description | 50자 | 160자 |
| OG description | 50자 | 160자 |
| Twitter description | 50자 | 160자 |

### OG Image Rules

| 항목 | 값 |
|------|-----|
| 최소 크기 | 600 x 315px |
| 권장 크기 | 1200 x 630px |
| Aspect Ratio | 1.91:1 |
| 최대 파일 크기 | 8MB (권장 < 100KB) |
| 형식 | WebP, JPEG, PNG |

---

## TypeScript Types

```typescript
// lib/types/seo.ts
import { Metadata } from 'next';

export interface SEOConfig {
  title: string;
  description: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'profile';
  publishedTime?: string;
  modifiedTime?: string;
  author?: string;
  section?: string;
  tags?: string[];
}

export function generateMetadata(config: SEOConfig): Metadata {
  const {
    title,
    description,
    image = 'https://cryptotitan.com/images/og-default.png',
    url,
    type = 'website',
    publishedTime,
    modifiedTime,
    author,
    section,
    tags,
  } = config;

  return {
    title,
    description: truncate(description, 160),
    openGraph: {
      title,
      description: truncate(description, 160),
      type,
      url,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: title,
        },
      ],
      ...(type === 'article' && {
        publishedTime,
        modifiedTime,
        authors: author ? [author] : undefined,
        section,
        tags,
      }),
    },
    twitter: {
      card: 'summary_large_image',
      title: truncate(title, 70),
      description: truncate(description, 160),
      images: [image],
    },
    alternates: {
      canonical: url,
    },
  };
}
```

---

## Default OG Images

**필수 이미지 파일** (저장 위치: `public/images/`):

| 파일명 | 크기 | 용도 |
|--------|------|------|
| `og-default.png` | 1200x630 | 기본 OG 이미지 |
| `og-home.png` | 1200x630 | 홈페이지 |
| `og-bitcoin.png` | 1200x630 | 비트코인 카테고리 |
| `og-ethereum.png` | 1200x630 | 이더리움 카테고리 |
| `og-defi.png` | 1200x630 | DeFi 카테고리 |
| `og-nft.png` | 1200x630 | NFT 카테고리 |
| `logo.png` | 512x512 | JSON-LD Publisher Logo |
| `avatar-default.png` | 400x400 | 기본 저자 아바타 |

---

## Testing Checklist

### Manual Testing

- [ ] 홈페이지 메타 태그 확인 (브라우저 소스 보기)
- [ ] 블로그 글 메타 태그 확인
- [ ] OG 이미지 표시 확인 (Facebook Debugger)
- [ ] Twitter Card 표시 확인 (Twitter Card Validator)
- [ ] JSON-LD 검증 (Rich Results Test)

### Automated Testing

```typescript
// __tests__/seo/metadata.test.ts
import { generateMetadata } from '@/lib/types/seo';

describe('SEO Metadata', () => {
  it('should truncate long descriptions', () => {
    const config = {
      title: 'Test',
      description: 'A'.repeat(200),
    };

    const metadata = generateMetadata(config);
    expect(metadata.description?.length).toBeLessThanOrEqual(163); // 160 + '...'
  });

  it('should generate valid OG image URL', () => {
    const url = getOgImageUrl(mockImage);
    expect(url).toContain('w=1200');
    expect(url).toContain('h=630');
  });
});
```

---

## Related Documents

- [Implementation Plan](./plan.md)
- [Research: Next.js Metadata API](./research/research.md)
- [Sitemap Contract](./contracts/sitemap-api.md)
- [Quickstart Guide](./quickstart.md)

---

**작성 완료**: 2025-11-16
**검토자**: Implementation Planning
