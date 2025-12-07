# 기능 명세서: SEO 기본 기능

**작성일**: 2025-11-15
**상태**: 초안
**우선순위**: 중요 (출시 전 필수)
**관련 헌장 원칙**: 원칙 8 (SEO 및 검색 가능성)

## 개요

### 목적
검색 엔진에서 콘텐츠를 효과적으로 발견하고 색인화할 수 있도록 하여 유기적 트래픽을 확보합니다. SEO는 저비용 고객 획득의 핵심 채널입니다.

### 배경
현재 메타 태그, sitemap.xml, 구조화된 데이터가 전혀 없어 검색 엔진이 콘텐츠를 제대로 이해하거나 순위를 매길 수 없습니다.

### 범위

**포함사항:**
- 동적 메타 태그 생성 (title, description, OG tags)
- sitemap.xml 자동 생성 및 갱신
- JSON-LD 구조화된 데이터 (Article, Person)
- robots.txt 구성
- Canonical URL 설정
- 이미지 alt 텍스트 자동화

**제외사항:**
- 콘텐츠 SEO 최적화 (키워드 밀도, 제목 구조 등은 작성자 책임)
- 백링크 전략
- 기술적 성능 최적화 (별도 기능)

## 기능 요구사항

### FR1: 페이지별 메타 태그
모든 페이지가 고유한 메타 태그를 가져야 함:
- **홈페이지**: "CryptoTitan - 암호화폐 투자 인사이트 블로그"
- **블로그 글**: `{글 제목} | CryptoTitan`
- **카테고리**: `{카테고리명} | CryptoTitan`

**description**: 페이지별 150-160자 설명 (excerpt 활용)

### FR2: Open Graph & Twitter Cards
소셜 공유 시 리치 프리뷰 표시:
```html
<meta property="og:title" content="..." />
<meta property="og:description" content="..." />
<meta property="og:image" content="..." />
<meta property="og:type" content="article" />
<meta name="twitter:card" content="summary_large_image" />
```

### FR3: Sitemap.xml 생성
- `/sitemap.xml` 경로에서 접근 가능
- 모든 공개 페이지 포함 (홈, 카테고리, 블로그 글)
- 프리미엄 글도 포함 (검색 노출용, 접근은 차단)
- 게시글 `lastmod`는 `_updatedAt` 사용
- **생성 전략**: 동적 생성 (매 요청마다 Sanity 쿼리)
  - 장점: 항상 최신 상태 유지
  - 성능: Next.js 캐싱으로 완화 (revalidate: 3600초)
  - 구현: `app/sitemap.ts` 파일로 동적 라우트 생성

### FR4: JSON-LD 구조화된 데이터
블로그 글 페이지에 Article schema 삽입:
```json
{
  "@context": "https://schema.org",
  "@type": "BlogPosting",
  "headline": "게시글 제목",
  "author": {
    "@type": "Person",
    "name": "저자명"
  },
  "datePublished": "2025-11-15",
  "image": "커버 이미지 URL"
}
```

### FR5: Canonical URL
모든 페이지에 canonical 링크 추가하여 중복 콘텐츠 방지

### FR6: Robots.txt
```
User-agent: *
Allow: /
Disallow: /api/
Sitemap: https://cryptotitan.com/sitemap.xml
```

## 성공 기준

### 정량적 지표
1. Google Search Console에 sitemap 제출 후 7일 내 90% 이상 색인화
2. 게시글의 Rich Results Test 통과율 100%
3. 소셜 공유 시 OG 이미지 표시율 100%

### 정성적 지표
1. 검색 엔진이 게시글 제목, 저자, 발행일을 정확히 인식
2. 소셜 미디어 공유 시 매력적인 미리보기 카드 표시

## 테스트 시나리오

### 수용 테스트 1: 메타 태그 검증
1. 블로그 글 페이지 소스 보기
2. **기대 결과**: `<title>`, `<meta name="description">`, OG 태그 모두 존재

### 수용 테스트 2: Sitemap 접근
1. `/sitemap.xml` 브라우저 접근
2. **기대 결과**: XML 형식으로 모든 페이지 URL 나열

### 수용 테스트 3: 구조화된 데이터 검증
1. [Rich Results Test](https://search.google.com/test/rich-results)에 URL 입력
2. **기대 결과**: "Page is eligible for rich results" 메시지

## 엣지 케이스

### EC1: 커버 이미지 없는 게시글
- **처리**: 기본 OG 이미지 사용 (`/images/og-default.png`)

### EC2: 긴 제목/설명
- **처리**: title 60자, description 160자로 자동 truncate

### EC3: 프리미엄 게시글 색인
- **처리**: Sitemap에 포함하되 `<meta name="robots" content="noindex">` 추가하지 않음 (제목/설명으로 유입 유도)

## 위험 요소

### 높은 위험
- **Sitemap 색인 지연**: Google이 sitemap 발견하는데 시간 소요
  - **완화**: Google Search Console에 수동 제출, URL 검사 도구 사용

- **OG 이미지 최적화 부족**: 큰 이미지로 로딩 느림
  - **완화**: Sanity 이미지 최적화 (1200x630px, 100KB 이하, WebP 형식)

### 중간 위험
- **구조화된 데이터 검증 실패**: JSON-LD 문법 오류
  - **완화**: Rich Results Test로 사전 검증, 자동화된 테스트 추가

- **메타 태그 중복**: 동적 생성 시 실수로 중복 태그
  - **완화**: Next.js Metadata API 사용 (자동 중복 제거)

## 가정사항
1. Next.js Metadata API 사용 (`generateMetadata`)
2. Sanity에서 발행된 게시글만 sitemap에 포함
3. 주요 타겟 검색 엔진: Google, Naver

## 관련 문서
- [CryptoTitan 헌장 - 원칙 8](../../memory/constitution.md#원칙-8-seo-및-검색-가능성)
- [Next.js Metadata 문서](https://nextjs.org/docs/app/building-your-application/optimizing/metadata)

---

**다음 단계**: `/speckit.plan`으로 SEO 구현 계획 수립
