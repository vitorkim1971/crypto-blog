# API Contract: Robots.txt

**Endpoint**: `/robots.txt`
**Method**: `GET`
**Purpose**: 검색 엔진 크롤러에게 크롤링 규칙과 sitemap 위치를 알려줍니다.

---

## Request

### URL

```
GET https://cryptotitan.com/robots.txt
```

### Headers

없음 (검색 엔진 크롤러가 자동으로 요청)

---

## Response

### Success (200 OK)

**Content-Type**: `text/plain`

```txt
# CryptoTitan Robots.txt
# Last Updated: 2025-11-16

# 기본 규칙: 모든 크롤러 허용
User-agent: *
Allow: /

# API 엔드포인트 차단
Disallow: /api/

# 인증 관련 페이지 차단
Disallow: /login
Disallow: /signup
Disallow: /reset-password
Disallow: /forgot-password

# 관리자 페이지 차단
Disallow: /admin/
Disallow: /dashboard/

# 검색 결과 페이지 차단 (중복 콘텐츠 방지)
Disallow: /search?*

# Sitemap 위치
Sitemap: https://cryptotitan.com/sitemap.xml

# Google 크롤러 전용 규칙
User-agent: Googlebot
Allow: /
Crawl-delay: 0

# Naver 크롤러 전용 규칙
User-agent: Yeti
Allow: /
Crawl-delay: 0

# 악성 봇 차단
User-agent: SemrushBot
Disallow: /

User-agent: AhrefsBot
Disallow: /

User-agent: MJ12bot
Disallow: /
```

---

## Implementation

### Next.js Robots Route

```typescript
// app/robots.ts
import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://cryptotitan.com';

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/login',
          '/signup',
          '/reset-password',
          '/forgot-password',
          '/admin/',
          '/dashboard/',
          '/search?*',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        crawlDelay: 0,
      },
      {
        userAgent: 'Yeti', // Naver
        allow: '/',
        crawlDelay: 0,
      },
      {
        userAgent: ['SemrushBot', 'AhrefsBot', 'MJ12bot'],
        disallow: '/',
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## Rules Explanation

### Allow Rules

| 규칙 | 대상 | 이유 |
|------|------|------|
| `Allow: /` | 모든 페이지 | 기본적으로 모든 공개 페이지 크롤링 허용 |

### Disallow Rules

| 규칙 | 대상 | 이유 |
|------|------|------|
| `Disallow: /api/` | API 엔드포인트 | 검색 결과에 표시할 필요 없음 |
| `Disallow: /login` | 로그인 페이지 | 사용자 전용, 검색 결과 불필요 |
| `Disallow: /signup` | 회원가입 페이지 | 사용자 전용, 검색 결과 불필요 |
| `Disallow: /admin/` | 관리자 페이지 | 보안상 크롤링 차단 |
| `Disallow: /dashboard/` | 사용자 대시보드 | 개인 페이지, 크롤링 불필요 |
| `Disallow: /search?*` | 검색 결과 페이지 | 동적 페이지, 중복 콘텐츠 방지 |

### Bot-Specific Rules

| User Agent | 정책 | 이유 |
|------------|------|------|
| `Googlebot` | 모두 허용, Crawl-delay 0 | 주요 검색 엔진, 빠른 색인 필요 |
| `Yeti` (Naver) | 모두 허용, Crawl-delay 0 | 한국 주요 검색 엔진 |
| `SemrushBot` | 모두 차단 | SEO 도구 봇, 트래픽만 소모 |
| `AhrefsBot` | 모두 차단 | SEO 도구 봇, 트래픽만 소모 |
| `MJ12bot` | 모두 차단 | 악성 봇 |

---

## Testing

### Manual Testing

**브라우저에서 직접 접근**:
```
https://cryptotitan.com/robots.txt
```

**예상 결과**:
```
User-agent: *
Allow: /
Disallow: /api/
...
Sitemap: https://cryptotitan.com/sitemap.xml
```

### Validation Tools

1. **Google Search Console**
   - Settings → robots.txt Tester
   - URL: `https://cryptotitan.com/robots.txt`
   - 테스트할 URL 입력 (예: `/blog/test-post`)
   - 결과: Allowed

2. **Robots.txt Checker**
   - https://support.google.com/webmasters/answer/6062608
   - 모든 규칙 검증

### Automated Testing

```typescript
// __tests__/robots.test.ts
import robots from '@/app/robots';

describe('Robots.txt', () => {
  it('should allow all public pages', () => {
    const rules = robots();

    const allRule = rules.rules.find((r) => r.userAgent === '*');
    expect(allRule?.allow).toBe('/');
  });

  it('should disallow API routes', () => {
    const rules = robots();

    const allRule = rules.rules.find((r) => r.userAgent === '*');
    expect(allRule?.disallow).toContain('/api/');
  });

  it('should include sitemap URL', () => {
    const rules = robots();

    expect(rules.sitemap).toBe('https://cryptotitan.com/sitemap.xml');
  });

  it('should block SEO tool bots', () => {
    const rules = robots();

    const semrushRule = rules.rules.find((r) =>
      Array.isArray(r.userAgent)
        ? r.userAgent.includes('SemrushBot')
        : r.userAgent === 'SemrushBot'
    );

    expect(semrushRule?.disallow).toBe('/');
  });
});
```

---

## Crawl Budget Optimization

### Crawl-delay

```
Crawl-delay: 0
```

**의미**:
- 크롤러가 페이지 간 0초 대기 (즉시 크롤링)
- 서버 부하가 낮은 경우 권장
- Vercel Edge 환경에서는 문제없음

**대안** (서버 부하 우려 시):
```
Crawl-delay: 1  # 1초 대기
```

### Sitemap Priority

```
Sitemap: https://cryptotitan.com/sitemap.xml
```

**중요성**:
- 크롤러가 모든 페이지를 효율적으로 발견
- 신규 게시글 빠르게 색인화
- 변경된 페이지 빠르게 재색인화

---

## Security Considerations

### 1. 보안 페이지 차단

**차단해야 할 페이지**:
- `/admin/` - 관리자 페이지
- `/dashboard/` - 사용자 대시보드
- `/login`, `/signup` - 인증 페이지
- `/api/` - API 엔드포인트

**주의**:
- `robots.txt`는 보안 메커니즘이 아님
- 실제 보안은 인증/권한 체크로 구현
- `robots.txt` 차단 = 검색 결과 미노출용

### 2. Sensitive Information

**절대 포함하지 말 것**:
- ❌ 비밀 URL (`Disallow: /secret-admin-panel`)
- ❌ API 키
- ❌ 내부 디렉토리 구조 상세

**이유**:
- `robots.txt`는 공개 파일
- 악의적 사용자가 읽고 공격에 활용 가능

---

## Advanced Features

### User-Agent Wildcard

```
User-agent: *bot
Disallow: /
```

**의미**: 모든 봇 (`*bot`으로 끝나는) 차단

### Conditional Rules

```
User-agent: Googlebot-Image
Disallow: /images/private/
```

**의미**: Google 이미지 봇만 특정 디렉토리 차단

---

## Performance Impact

**파일 크기**: ~500 bytes
**응답 시간**: < 10ms (정적 파일)
**캐싱**: Edge CDN에서 무제한 캐싱

**측정**:
```bash
curl -w "%{time_total}\n" -o /dev/null -s https://cryptotitan.com/robots.txt
# 출력: 0.008  (8ms)
```

---

## Related Documents

- [Sitemap Contract](./sitemap-api.md)
- [Metadata Model](../metadata-model.md)
- [Research: SEO Best Practices](../research/research.md)
- [Quickstart Guide](../quickstart.md)

---

**작성 완료**: 2025-11-16
