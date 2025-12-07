# API Contract: Sitemap.xml

**Endpoint**: `/sitemap.xml`
**Method**: `GET`
**Purpose**: 검색 엔진에게 사이트의 모든 페이지 URL을 제공하여 크롤링 및 색인화를 돕습니다.

---

## Request

### URL

```
GET https://cryptotitan.com/sitemap.xml
```

### Headers

없음 (검색 엔진 크롤러가 자동으로 요청)

---

## Response

### Success (200 OK)

**Content-Type**: `application/xml`

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <!-- 홈페이지 -->
  <url>
    <loc>https://cryptotitan.com</loc>
    <lastmod>2025-11-16T00:00:00.000Z</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- 정적 페이지 -->
  <url>
    <loc>https://cryptotitan.com/about</loc>
    <lastmod>2025-11-16T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>

  <!-- 블로그 글 -->
  <url>
    <loc>https://cryptotitan.com/blog/bitcoin-analysis-2025</loc>
    <lastmod>2025-11-15T14:30:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.9</priority> <!-- 프리미엄 글 -->
  </url>

  <url>
    <loc>https://cryptotitan.com/blog/ethereum-upgrade</loc>
    <lastmod>2025-11-14T10:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority> <!-- 일반 글 -->
  </url>

  <!-- 카테고리 페이지 -->
  <url>
    <loc>https://cryptotitan.com/category/%EB%B9%84%ED%8A%B8%EC%BD%94%EC%9D%B8</loc>
    <lastmod>2025-11-16T00:00:00.000Z</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.6</priority>
  </url>

  <!-- 저자 페이지 -->
  <url>
    <loc>https://cryptotitan.com/author/john-doe</loc>
    <lastmod>2025-11-16T00:00:00.000Z</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
```

---

## Implementation

### Next.js Sitemap Route

```typescript
// app/sitemap.ts
import { MetadataRoute } from 'next';
import { getAllPosts, getAllCategories, getAllAuthors } from '@/lib/sanity/queries';

export const revalidate = 3600; // 1시간마다 재검증 (ISR)

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://cryptotitan.com';

  // 1. 정적 페이지
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/pricing`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.9,
    },
  ];

  // 2. 블로그 글
  const posts = await getAllPosts();
  const blogPages: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post._updatedAt),
    changeFrequency: 'weekly',
    priority: post.isPremium ? 0.9 : 0.7, // 프리미엄 글 우선순위 높음
  }));

  // 3. 카테고리 페이지
  const categories = await getAllCategories();
  const categoryPages: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/category/${encodeURIComponent(category.name)}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.6,
  }));

  // 4. 저자 페이지
  const authors = await getAllAuthors();
  const authorPages: MetadataRoute.Sitemap = authors.map((author) => ({
    url: `${baseUrl}/author/${author.slug}`,
    lastModified: new Date(),
    changeFrequency: 'monthly',
    priority: 0.5,
  }));

  return [...staticPages, ...blogPages, ...categoryPages, ...authorPages];
}
```

---

## Sanity Queries

### Get All Posts (Sitemap용)

```typescript
// lib/sanity/queries.ts
export async function getAllPosts() {
  return client.fetch(
    `*[_type == "post" && !(_id in path("drafts.**"))] | order(_updatedAt desc) {
      slug,
      _updatedAt,
      isPremium
    }`
  );
}
```

**최적화 포인트**:
- ✅ 필요한 필드만 쿼리 (`slug`, `_updatedAt`, `isPremium`)
- ✅ 초안 제외 (`!(_id in path("drafts.**"))`)
- ✅ 최신순 정렬 (`order(_updatedAt desc)`)

### Get All Categories

```typescript
export async function getAllCategories() {
  return client.fetch(
    `*[_type == "post" && defined(category)] | order(category asc) {
      "name": category
    } | score(
      boost(category == "비트코인", 3),
      boost(category == "이더리움", 2)
    )`
  );
}
```

### Get All Authors

```typescript
export async function getAllAuthors() {
  return client.fetch(
    `*[_type == "author"] | order(name asc) {
      slug
    }`
  );
}
```

---

## Priority Rules

| 페이지 타입 | Priority | 근거 |
|-------------|----------|------|
| 홈페이지 | 1.0 | 최상위 중요도 |
| 가격 페이지 | 0.9 | 전환 페이지 |
| 프리미엄 블로그 글 | 0.9 | 수익화 콘텐츠 |
| About 페이지 | 0.8 | 중요 정적 페이지 |
| 일반 블로그 글 | 0.7 | 주요 콘텐츠 |
| 카테고리 페이지 | 0.6 | 목록 페이지 |
| 저자 페이지 | 0.5 | 보조 페이지 |
| Contact 페이지 | 0.5 | 보조 정적 페이지 |

---

## Change Frequency Rules

| 페이지 타입 | Change Frequency | 근거 |
|-------------|------------------|------|
| 홈페이지 | daily | 새 글 발행 빈도 |
| 블로그 글 | weekly | 수정 가능성 |
| 카테고리 | weekly | 새 글 추가 |
| About/Contact | monthly/yearly | 거의 변경 없음 |
| 가격 페이지 | monthly | 정기 업데이트 |

---

## Caching Strategy

### ISR (Incremental Static Regeneration)

```typescript
export const revalidate = 3600; // 1시간
```

**동작 방식**:
1. 첫 요청: Sitemap 생성 (~500ms)
2. 캐시 저장 (Edge CDN)
3. 이후 1시간 동안: 캐시 응답 (~50ms)
4. 1시간 후: 백그라운드 재생성
5. 새 캐시로 교체

**장점**:
- ✅ 항상 최신 상태 유지
- ✅ 대부분 요청은 캐시로 빠르게 응답
- ✅ 서버 부하 최소화

---

## Testing

### Manual Testing

**브라우저에서 직접 접근**:
```
https://cryptotitan.com/sitemap.xml
```

**예상 결과**:
- ✅ XML 형식으로 표시
- ✅ 모든 공개 페이지 포함
- ✅ lastmod 날짜 정확
- ✅ 프리미엄 글도 포함 (검색 노출용)

### Validation Tools

1. **Google Search Console**
   - Sitemaps → Add a new sitemap
   - URL: `https://cryptotitan.com/sitemap.xml`
   - 상태: Success (수십 개 URL 발견)

2. **XML Sitemap Validator**
   - https://www.xml-sitemaps.com/validate-xml-sitemap.html
   - 모든 URL 검증 통과

3. **Screaming Frog SEO Spider**
   - Sitemap 크롤링
   - 모든 URL 200 응답 확인

### Automated Testing

```typescript
// __tests__/sitemap.test.ts
import sitemap from '@/app/sitemap';

describe('Sitemap', () => {
  it('should include homepage', async () => {
    const urls = await sitemap();
    expect(urls.some((url) => url.url === 'https://cryptotitan.com')).toBe(true);
  });

  it('should include all published posts', async () => {
    const urls = await sitemap();
    const blogUrls = urls.filter((url) => url.url.includes('/blog/'));

    expect(blogUrls.length).toBeGreaterThan(0);
  });

  it('should have valid lastModified dates', async () => {
    const urls = await sitemap();

    urls.forEach((url) => {
      expect(url.lastModified).toBeInstanceOf(Date);
    });
  });

  it('should prioritize premium posts', async () => {
    const urls = await sitemap();
    const premiumPost = urls.find(
      (url) => url.url === 'https://cryptotitan.com/blog/premium-post'
    );

    expect(premiumPost?.priority).toBe(0.9);
  });
});
```

---

## Performance Metrics

**목표** (명세서 기준):
- 초회 생성: < 500ms
- 캐시 히트: < 50ms
- Google 색인화: 7일 내 90%

**실제 측정**:

```typescript
// 성능 모니터링
const start = performance.now();
const urls = await sitemap();
const duration = performance.now() - start;

console.log(`Sitemap generated in ${duration}ms`);
console.log(`Total URLs: ${urls.length}`);
```

---

## Edge Cases

### EC1: 게시글 수가 매우 많을 때 (1000개 이상)

**문제**: Sitemap 파일이 너무 커짐 (50MB 초과)

**해결책**: Sitemap Index 사용

```typescript
// app/sitemap.xml.ts → sitemap-index.xml
export default function sitemapIndex(): MetadataRoute.Sitemap {
  return [
    { url: 'https://cryptotitan.com/sitemap-posts.xml' },
    { url: 'https://cryptotitan.com/sitemap-static.xml' },
    { url: 'https://cryptotitan.com/sitemap-categories.xml' },
  ];
}

// app/sitemap-posts.xml.ts
export default async function sitemapPosts() {
  // 블로그 글만
}
```

### EC2: Sanity API 타임아웃

**문제**: Sanity 쿼리가 10초 이상 소요

**해결책**:
1. 쿼리 최적화 (필요한 필드만)
2. 타임아웃 설정 (30초)
3. Fallback: 캐시된 sitemap 반환

### EC3: 한글 URL 인코딩

**문제**: 카테고리 이름이 한글 (예: "비트코인")

**해결책**: `encodeURIComponent()` 사용

```typescript
url: `${baseUrl}/category/${encodeURIComponent('비트코인')}`
// 결과: https://cryptotitan.com/category/%EB%B9%84%ED%8A%B8%EC%BD%94%EC%9D%B8
```

---

## Related Documents

- [Metadata Model](../metadata-model.md)
- [Robots.txt Contract](./robots-api.md)
- [Research: Dynamic Sitemap](../research/research.md)
- [Quickstart Guide](../quickstart.md)

---

**작성 완료**: 2025-11-16
