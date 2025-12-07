# 구현 계획: SEO 기본 기능

**기능**: SEO 기본 기능
**작성일**: 2025-11-16
**상태**: 초안
**우선순위**: 중요 (출시 전 필수)

## 개요

이 문서는 검색 엔진 최적화(SEO) 기본 기능의 기술적 구현 계획을 정의합니다. 메타 태그, sitemap, 구조화된 데이터를 통해 유기적 트래픽을 확보합니다.

## Technical Context

### 현재 스택
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **CMS**: Sanity (Headless CMS)
- **SEO**: Next.js Metadata API, sitemap.ts, robots.ts
- **이미지 최적화**: Sanity Image API
- **Hosting**: Vercel

### 주요 기술 결정 사항

1. **메타 태그 생성**: Static vs Dynamic
   - **결정**: ✅ `generateMetadata` (Dynamic)
   - **이유**: 명세서에서 결정됨, 페이지별 고유 메타 필요

2. **Sitemap 생성**: Static vs Dynamic
   - **결정**: ✅ Dynamic (`app/sitemap.ts`)
   - **이유**: 명세서에서 결정됨, 항상 최신 상태 유지

3. **OG 이미지**: Sanity vs 동적 생성
   - **결정**: NEEDS CLARIFICATION - 연구 필요
   - **고려사항**: 커버 이미지 없을 때 fallback 전략

4. **구조화된 데이터 삽입**: JSON-LD vs Microdata
   - **결정**: ✅ JSON-LD
   - **이유**: 명세서에서 결정됨, Google 권장

## Constitution Check

### 관련 원칙
- ✅ **원칙 8: SEO 및 검색 가능성** (직접 구현)

### 원칙 준수 검증

#### 원칙 8: SEO
- ✅ 모든 공개 페이지 메타 태그 생성
- ✅ Sitemap.xml 제공
- ✅ 구조화된 데이터 (JSON-LD)
- ✅ Canonical URL 설정
- ✅ Robots.txt 구성

### Gate 평가

**Gate 1: SEO 요구사항** 🔴 FAIL
- ❌ 문제: 현재 메타 태그, sitemap 없음
- ✅ 해결책: 이 기능 구현으로 해결

**Gate 2: 성능 요구사항** 🟡 PARTIAL
- ⚠️ 문제: Sitemap 동적 생성 시 성능 고려 필요
- 📋 TODO: Phase 0 연구에서 캐싱 전략 결정

**Gate 3: 헌장 준수** 🟢 PASS
- ✅ 원칙 8 완전 준수
- ✅ 위반 사항 없음

## Implementation Phases

### Phase 0: Research & Technology Decisions

**목표**: OG 이미지 fallback 전략 및 Sitemap 캐싱 결정

**연구 태스크**:
1. Next.js Metadata API 패턴 (App Router)
2. Sanity 이미지 최적화 (OG 이미지용)
3. Dynamic Sitemap 성능 최적화
4. JSON-LD 구조화된 데이터 모범 사례

**결과물**: `research.md`

### Phase 1: Design & Contracts

**목표**: 메타데이터 구조, API 계약, 빠른 시작 가이드

**태스크**:
1. 메타데이터 모델 설계 (`metadata-model.md`)
   - 페이지별 메타 태그 구조
   - OG 이미지 URL 생성 규칙
   - JSON-LD 스키마

2. API 계약 생성 (`contracts/`)
   - Sitemap API (동적 생성)
   - Robots.txt 정의

3. 빠른 시작 가이드 (`quickstart.md`)
   - Google Search Console 설정
   - Rich Results Test 검증
   - OG 이미지 디버깅

**결과물**: `metadata-model.md`, `/contracts/*`, `quickstart.md`

### Phase 2: Implementation Tasks

**다음 단계**: `/speckit.tasks` 실행

## Dependencies

### 외부 종속성
- ✅ Sanity CMS 프로젝트
- ⚠️ Google Search Console 계정
- ⚠️ 기본 OG 이미지 파일 (`/public/images/og-default.png`)

### 내부 종속성
- 🟡 **권장**: Medium 디자인 (메타 태그 UI 확인용)
- ⚪ **선택**: 블로그 글 작성 (테스트용)

## Risk Assessment

### 높은 위험
1. **Sitemap 색인 지연**
   - 완화: Google Search Console 수동 제출

2. **OG 이미지 최적화 부족**
   - 완화: Sanity 이미지 최적화 (1200x630, WebP)

### 중간 위험
1. **구조화된 데이터 검증 실패**
   - 완화: Rich Results Test 사전 검증

2. **메타 태그 중복**
   - 완화: Next.js Metadata API 사용 (자동 중복 제거)

## Success Criteria

### Phase 0 완료 조건
- ✅ OG 이미지 fallback 전략 결정
- ✅ Sitemap 캐싱 전략 결정
- ✅ JSON-LD 스키마 정의

### Phase 1 완료 조건
- ✅ `metadata-model.md` 작성
- ✅ API 계약 정의
- ✅ `quickstart.md` 작성

---

## Planning Summary

### ✅ Phase 0 & 1 완료 (2025-11-16)

**생성된 산출물**:
1. ✅ [`plan.md`](plan.md) - 메인 구현 계획
2. ✅ [`research/research.md`](research/research.md) - 기술 연구 및 결정 (4개 항목)
3. ✅ [`metadata-model.md`](metadata-model.md) - 페이지별 메타데이터 구조
4. ✅ [`contracts/sitemap-api.md`](contracts/sitemap-api.md) - Sitemap.xml API 계약
5. ✅ [`contracts/robots-api.md`](contracts/robots-api.md) - Robots.txt 정의
6. ✅ [`quickstart.md`](quickstart.md) - SEO 설정 빠른 시작 가이드 (30분)

### 핵심 기술 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| 메타 태그 | `generateMetadata()` | 동적 데이터 기반 생성 |
| OG 이미지 | Sanity Image API + 3-tier Fallback | 자동 최적화, 안전한 fallback |
| Sitemap | `app/sitemap.ts` + ISR (1시간) | 항상 최신, 성능 최적화 |
| JSON-LD | `schema-dts` + BlogPosting | 타입 안전성, Google 권장 |
| Robots.txt | `app/robots.ts` | Next.js 내장 API |

### Architecture Decision

```
SEO 메타데이터 생성
├── Static Pages → metadata 객체
└── Dynamic Pages → generateMetadata()
    ├── Sanity 데이터 쿼리
    ├── OG 이미지 URL 생성 (Fallback 3단계)
    ├── 텍스트 Truncation (160자)
    └── JSON-LD 삽입

Sitemap 생성 (ISR 1시간)
├── 정적 페이지 (Priority 1.0)
├── 블로그 글 (Priority 0.7~0.9)
├── 카테고리 (Priority 0.6)
└── 저자 (Priority 0.5)
```

**다음 단계**: `/speckit.tasks` 실행 → 구현 작업을 세부 태스크로 분할
