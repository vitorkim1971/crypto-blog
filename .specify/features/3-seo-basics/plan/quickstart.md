# Quickstart: SEO 기본 기능

**목표**: 로컬 개발 환경에서 SEO 메타 태그, Sitemap, JSON-LD를 설정하고 검증합니다.

**소요 시간**: ~30분

---

## Prerequisites

- ✅ Next.js 14 프로젝트 실행 중
- ✅ Sanity CMS에 최소 1개 이상의 블로그 글 발행
- ✅ Google 계정 (Search Console용)
- ✅ 도메인 (프로덕션 검증용, 로컬은 localhost 사용)

---

## Step 1: 기본 OG 이미지 준비 (5분)

### 1.1 OG 이미지 디자인

**요구사항**:
- 크기: 1200 x 630px
- 형식: PNG 또는 JPEG
- 파일 크기: < 100KB

**Figma 템플릿** (권장):
1. [Figma](https://figma.com) 접속
2. 새 디자인: 1200 x 630px
3. 배경: 브랜드 색상
4. 로고 + 텍스트: "CryptoTitan - 암호화폐 투자 인사이트"
5. Export → PNG → 85% Quality

**온라인 생성기** (빠른 방법):
- [OG Image Generator](https://og-image.vercel.app/)
- 텍스트 입력: "CryptoTitan"
- 다운로드

### 1.2 이미지 파일 저장

```bash
# public/images/ 디렉토리 생성
mkdir -p public/images

# 이미지 파일 저장
# - og-default.png (기본 OG 이미지)
# - og-home.png (홈페이지용)
# - logo.png (JSON-LD Publisher Logo, 512x512)
```

**파일 구조**:
```
public/
└── images/
    ├── og-default.png    (1200x630)
    ├── og-home.png       (1200x630)
    ├── og-bitcoin.png    (1200x630, 선택)
    ├── og-ethereum.png   (1200x630, 선택)
    └── logo.png          (512x512)
```

---

## Step 2: 패키지 설치 (2분)

```bash
npm install schema-dts
```

**schema-dts**:
- JSON-LD 스키마 TypeScript 타입
- 타입 안전성 보장
- 자동완성 지원

---

## Step 3: Helper 함수 생성 (5분)

### 3.1 OG 이미지 URL 생성

```bash
# lib/seo/ 디렉토리 생성
mkdir -p lib/seo
```

파일 생성: `lib/seo/og-image.ts`

```typescript
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
```

### 3.2 텍스트 Truncation

파일 생성: `lib/seo/truncate.ts`

```typescript
export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;

  const truncated = text.slice(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');

  return lastSpace > 0
    ? truncated.slice(0, lastSpace) + '...'
    : truncated + '...';
}
```

### 3.3 JSON-LD Generator

파일 생성: `lib/seo/json-ld.ts`

```typescript
import { BlogPosting, WithContext } from 'schema-dts';

export function generateBlogPostingJsonLd(post: any): WithContext<BlogPosting> {
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
  };
}
```

---

## Step 4: Sitemap & Robots.txt 생성 (5분)

### 4.1 Sitemap

파일 생성: `app/sitemap.ts`

```typescript
import { MetadataRoute } from 'next';
import { client } from '@/lib/sanity/client';

export const revalidate = 3600; // 1시간

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptotitan.com';

  // 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ];

  // 블로그 글
  const posts = await client.fetch(
    `*[_type == "post" && !(_id in path("drafts.**"))] {
      slug,
      _updatedAt,
      isPremium
    }`
  );

  const blogPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/blog/${post.slug.current}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly' as const,
    priority: post.isPremium ? 0.9 : 0.7,
  }));

  return [...staticPages, ...blogPages];
}
```

### 4.2 Robots.txt

파일 생성: `app/robots.ts`

```typescript
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/api/', '/login', '/signup', '/admin/'],
      },
    ],
    sitemap: 'https://cryptotitan.com/sitemap.xml',
  };
}
```

---

## Step 5: 블로그 글 페이지 메타 태그 적용 (5분)

파일 수정: `app/blog/[slug]/page.tsx`

```typescript
import { Metadata } from 'next';
import { getPost } from '@/lib/sanity/queries';
import { getOgImageUrl } from '@/lib/seo/og-image';
import { truncate } from '@/lib/seo/truncate';
import { generateBlogPostingJsonLd } from '@/lib/seo/json-ld';

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const post = await getPost(params.slug);

  if (!post) {
    return { title: '게시글을 찾을 수 없습니다 | CryptoTitan' };
  }

  const ogImage = getOgImageUrl(post.coverImage);

  return {
    title: `${post.title} | CryptoTitan`,
    description: truncate(post.excerpt || post.title, 160),
    openGraph: {
      title: post.title,
      description: truncate(post.excerpt || post.title, 160),
      type: 'article',
      publishedTime: post.publishedAt,
      images: [{ url: ogImage, width: 1200, height: 630, alt: post.title }],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: truncate(post.excerpt || post.title, 160),
      images: [ogImage],
    },
    alternates: {
      canonical: `https://cryptotitan.com/blog/${params.slug}`,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const post = await getPost(params.slug);

  if (!post) {
    return <div>게시글을 찾을 수 없습니다.</div>;
  }

  const jsonLd = generateBlogPostingJsonLd(post);

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 게시글 내용 */}
      <article>
        <h1>{post.title}</h1>
        {/* ... */}
      </article>
    </>
  );
}
```

---

## Step 6: 로컬 테스트 (5분)

### 6.1 개발 서버 시작

```bash
npm run dev
```

### 6.2 Sitemap 확인

브라우저에서 접속:
```
http://localhost:3001/sitemap.xml
```

**예상 결과**:
```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>http://localhost:3001</loc>
    <lastmod>2025-11-16T...</lastmod>
    <changefreq>daily</changefreq>
    <priority>1</priority>
  </url>
  <url>
    <loc>http://localhost:3001/blog/my-first-post</loc>
    <lastmod>2025-11-15T...</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>
</urlset>
```

### 6.3 Robots.txt 확인

```
http://localhost:3001/robots.txt
```

**예상 결과**:
```
User-agent: *
Allow: /
Disallow: /api/
Disallow: /login
Disallow: /signup
Disallow: /admin/

Sitemap: https://cryptotitan.com/sitemap.xml
```

### 6.4 메타 태그 확인

블로그 글 페이지 접속 → 브라우저 소스 보기 (Ctrl+U)

**예상 결과**:
```html
<head>
  <title>My First Post | CryptoTitan</title>
  <meta name="description" content="This is my first blog post about...">
  <meta property="og:title" content="My First Post">
  <meta property="og:description" content="This is my first blog post...">
  <meta property="og:image" content="https://cdn.sanity.io/...">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="canonical" href="https://cryptotitan.com/blog/my-first-post">
  <script type="application/ld+json">
    {"@context":"https://schema.org","@type":"BlogPosting",...}
  </script>
</head>
```

---

## Step 7: 프로덕션 검증 (배포 후)

### 7.1 Google Search Console 설정

1. [Google Search Console](https://search.google.com/search-console) 접속
2. **속성 추가** 클릭
3. **URL 접두어** 선택: `https://cryptotitan.com`
4. 소유권 확인:
   - HTML 파일 업로드 또는
   - DNS TXT 레코드 추가
5. **확인** 클릭

### 7.2 Sitemap 제출

1. Search Console → **Sitemaps** 메뉴
2. **새 Sitemap 추가**
3. URL 입력: `https://cryptotitan.com/sitemap.xml`
4. **제출** 클릭

**예상 결과** (24시간 후):
- 상태: 성공
- 발견된 URL: XX개
- 색인 생성됨: XX개

### 7.3 Rich Results Test

1. [Rich Results Test](https://search.google.com/test/rich-results) 접속
2. URL 입력: `https://cryptotitan.com/blog/my-first-post`
3. **URL 테스트** 클릭

**예상 결과**:
```
✅ Page is eligible for rich results
- BlogPosting schema detected
- Article metadata valid
- Author information valid
```

### 7.4 Facebook Debugger

1. [Facebook Sharing Debugger](https://developers.facebook.com/tools/debug/) 접속
2. URL 입력: `https://cryptotitan.com/blog/my-first-post`
3. **디버그** 클릭

**예상 결과**:
- ✅ OG 이미지 표시 (1200x630)
- ✅ 제목 정확
- ✅ 설명 정확

### 7.5 Twitter Card Validator

1. [Twitter Card Validator](https://cards-dev.twitter.com/validator) 접속
2. URL 입력: `https://cryptotitan.com/blog/my-first-post`
3. **Preview card** 클릭

**예상 결과**:
- ✅ Large Image Card
- ✅ 이미지 표시
- ✅ 제목 + 설명 표시

---

## Troubleshooting

### 문제 1: Sitemap이 비어있음

**증상**: `/sitemap.xml` 접속 시 URL이 하나도 없음

**해결**:
1. Sanity에 발행된 게시글이 있는지 확인
2. Sanity 쿼리 확인:
```typescript
const posts = await client.fetch(
  `*[_type == "post" && !(_id in path("drafts.**"))]`
);
console.log('Posts:', posts.length);
```
3. `slug.current` 필드 확인 (`slug` vs `slug.current`)

### 문제 2: OG 이미지가 표시되지 않음

**증상**: Facebook/Twitter에서 기본 이미지만 표시

**해결**:
1. OG 이미지 URL 확인 (절대 경로여야 함):
```typescript
console.log('OG Image URL:', ogImage);
// ✅ https://cryptotitan.com/images/og-default.png
// ❌ /images/og-default.png (상대 경로)
```

2. 이미지 크기 확인:
```bash
# 이미지 크기 확인
file public/images/og-default.png
# 출력: PNG image data, 1200 x 630, 8-bit/color RGB
```

3. Facebook 캐시 초기화:
   - Facebook Debugger에서 **새로 스크랩** 버튼 클릭

### 문제 3: JSON-LD 검증 실패

**증상**: Rich Results Test에서 "Invalid schema" 오류

**해결**:
1. JSON-LD 구문 확인:
```typescript
const jsonLd = generateBlogPostingJsonLd(post);
console.log(JSON.stringify(jsonLd, null, 2));
```

2. 필수 필드 확인:
   - `headline` (필수)
   - `datePublished` (필수)
   - `author.name` (필수)
   - `publisher.name` (필수)
   - `image` (필수)

3. [Schema.org Validator](https://validator.schema.org/) 사용

### 문제 4: Google Search Console에서 "발견됨 - 색인 생성되지 않음"

**원인**: 페이지 우선순위가 낮거나 크롤링 대기 중

**해결**:
1. URL 검사 도구 사용:
   - Search Console → **URL 검사**
   - URL 입력 → **색인 생성 요청**
2. 내부 링크 추가 (홈페이지에서 해당 글로 링크)
3. 기다리기 (최대 1주일 소요)

---

## Next Steps

✅ SEO 기본 설정 완료!

**다음 작업**:
1. `/speckit.tasks` 실행하여 구현 작업 세분화
2. 모든 페이지에 메타 태그 적용
3. Google Search Console 정기 모니터링
4. SEO 성능 측정 (Google Analytics 연동)

---

## Useful Commands

```bash
# 개발 서버 시작
npm run dev

# Sitemap 확인
curl http://localhost:3001/sitemap.xml

# Robots.txt 확인
curl http://localhost:3001/robots.txt

# 빌드 확인
npm run build
npm run start
```

---

## Resources

- [Next.js Metadata API](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Vocabulary](https://schema.org/docs/schemas.html)
- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards Guide](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)

---

**환경 설정 완료 시간**: 2025-11-16 (예상)
**작성자**: Implementation Planning
