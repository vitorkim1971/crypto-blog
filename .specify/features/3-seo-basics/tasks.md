# 구현 태스크: SEO 기본 기능

**Feature**: SEO 기본
**생성일**: 2025-11-16
**상태**: 준비됨

---

## 개요

이 문서는 검색 엔진 최적화(SEO) 기본 기능 구현을 위한 세부 태스크 목록입니다.

---

## Implementation Strategy

### MVP Scope (User Story 1 + 2)
최소 기능 제품은 **US1 (메타 태그)** + **US2 (Sitemap)**로 구성됩니다. 이 두 Story만으로도 기본 SEO는 충족됩니다.

### Incremental Delivery
- **Sprint 1**: Setup + US1 + US2 (메타 태그 + Sitemap)
- **Sprint 2**: US3 + US4 (JSON-LD + Robots.txt)

---

## Phases & Tasks

### Phase 1: Setup (프로젝트 초기화)

**목표**: SEO 타입 정의, 기본 OG 이미지 준비

**독립 테스트 기준**:
- ✅ 기본 OG 이미지 (`/public/images/og-default.png`) 존재

#### Tasks

- [ ] T001 [P] 기본 OG 이미지 생성 (public/images/og-default.png, 1200x630px)
- [ ] T002 [P] SEO 타입 정의 (lib/types/seo.ts)
- [ ] T003 [P] Metadata 헬퍼 함수 (lib/seo/metadata-helpers.ts)

**완료 조건**: 기본 이미지 및 타입 준비 완료

---

### Phase 2: US1 - 페이지별 메타 태그 생성

**User Story**: "모든 페이지가 고유한 메타 태그와 OG 태그를 가진다"

**독립 테스트 기준**:
- ✅ 홈페이지 `<title>`: "CryptoTitan - 암호화폐 투자 인사이트 블로그"
- ✅ 블로그 글 `<title>`: "{제목} | CryptoTitan"
- ✅ OG 이미지 표시 (소셜 공유 시)

#### Tasks

- [ ] T004 [P] [US1] 홈페이지 메타 데이터 (app/page.tsx - metadata 객체)
- [ ] T005 [P] [US1] 블로그 글 동적 메타 데이터 (app/blog/[slug]/page.tsx - generateMetadata)
- [ ] T006 [P] [US1] 카테고리 페이지 메타 데이터 (app/category/[slug]/page.tsx - generateMetadata)
- [ ] T007 [US1] getOgImageUrl 헬퍼 함수 (Sanity 이미지 최적화, 1200x630)
- [ ] T008 [US1] truncate 헬퍼 함수 (title 60자, description 160자)
- [ ] T009 [US1] Canonical URL 설정 (모든 페이지)
- [ ] T010 [US1] Twitter Card 메타 태그 추가 (summary_large_image)

**완료 조건**:
- 모든 페이지에서 소스 보기 → `<title>`, `<meta name="description">`, OG 태그 존재
- 소셜 공유 시 리치 프리뷰 표시

**병렬 실행 가능**: T004, T005, T006 (독립 파일)

---

### Phase 3: US2 - Sitemap.xml 생성

**User Story**: "검색 엔진이 모든 페이지를 발견하고 색인화할 수 있다"

**독립 테스트 기준**:
- ✅ `/sitemap.xml` 접근 → XML 형식으로 URL 목록 표시
- ✅ Sitemap에 홈, 카테고리, 블로그 글 모두 포함

#### Tasks

- [ ] T011 [US2] Sitemap Route 생성 (app/sitemap.ts)
- [ ] T012 [US2] Sanity 쿼리 (모든 공개 게시글 조회)
- [ ] T013 [US2] 홈페이지 URL 추가 (priority: 1.0)
- [ ] T014 [US2] 카테고리 페이지 URL 추가 (priority: 0.8)
- [ ] T015 [US2] 블로그 글 URL 추가 (priority: 0.7, lastmod: _updatedAt)
- [ ] T016 [US2] ISR 캐싱 설정 (revalidate: 3600초)

**완료 조건**:
- `/sitemap.xml` 접근 시 모든 URL 표시
- Google Search Console에 제출 가능

---

### Phase 4: US3 - JSON-LD 구조화된 데이터

**User Story**: "검색 엔진이 블로그 글의 구조화된 정보를 이해한다"

**독립 테스트 기준**:
- ✅ Rich Results Test에서 "BlogPosting" 스키마 인식
- ✅ 게시글에 저자, 발행일, 이미지 메타데이터 포함

#### Tasks

- [ ] T017 [P] [US3] JSON-LD 생성 헬퍼 함수 (lib/seo/json-ld.ts)
- [ ] T018 [US3] BlogPosting 스키마 생성 (app/blog/[slug]/page.tsx)
- [ ] T019 [US3] Person (Author) 스키마 추가
- [ ] T020 [US3] `<script type="application/ld+json">` 태그 삽입
- [ ] T021 [US3] 커버 이미지 없을 때 기본 이미지 사용

**완료 조건**:
- Rich Results Test 통과
- Google Search Console에서 구조화된 데이터 인식

**병렬 실행 가능**: T017 (독립 파일)

---

### Phase 5: US4 - Robots.txt 생성

**User Story**: "검색 엔진이 크롤링 규칙을 올바르게 따른다"

**독립 테스트 기준**:
- ✅ `/robots.txt` 접근 → 크롤링 규칙 표시
- ✅ Sitemap URL 포함

#### Tasks

- [ ] T022 [US4] Robots.txt Route 생성 (app/robots.ts)
- [ ] T023 [US4] User-agent: * 설정
- [ ] T024 [US4] Disallow: /api/ 추가
- [ ] T025 [US4] Sitemap URL 추가

**완료 조건**:
- `/robots.txt` 접근 시 올바른 규칙 표시

---

### Phase 6: Polish & Cross-Cutting Concerns

**목표**: 이미지 alt 텍스트, 성능 최적화, 검증

**독립 테스트 기준**:
- ✅ 모든 이미지에 alt 텍스트 존재
- ✅ Lighthouse SEO 스코어 90점 이상

#### Tasks

- [ ] T026 [P] 이미지 alt 텍스트 자동화 (Sanity 필드 활용)
- [ ] T027 [P] Lighthouse SEO 테스트 (홈, 블로그 글)
- [ ] T028 [P] Google Search Console 제출 가이드 (quickstart.md)
- [ ] T029 [P] Rich Results Test 자동화 (CI/CD)

**완료 조건**:
- Lighthouse SEO 스코어 90점 이상
- Google Search Console에서 에러 없음

**병렬 실행 가능**: T026 ~ T029 (독립 작업)

---

## Dependencies Graph

### User Story 완료 순서

```
Setup (Phase 1)
  ↓
US1 (Phase 2) ←─┐
  ↓             │ (병렬 가능)
US2 (Phase 3) ←─┘
  ↓
US3 (Phase 4) ← US1 완료 후 (메타데이터 재사용)
  ↓
US4 (Phase 5) ← 독립적
  ↓
Polish (Phase 6) ← 모든 US 완료 후
```

---

## Summary

- **총 태스크 수**: 29개
- **MVP 태스크 수**: 19개 (Phase 1~3)
- **병렬 실행 가능**: 12개 태스크 ([P] 마커)
- **User Story별 태스크 수**:
  - Setup: 3개
  - US1: 7개
  - US2: 6개
  - US3: 5개
  - US4: 4개
  - Polish: 4개

---

## Next Steps

1. ✅ **MVP Sprint 계획**: Setup + US1 + US2 (1주)
2. ⏳ **Phase 1 시작**: 기본 OG 이미지 생성부터
3. 📋 **SEO 검증**: Rich Results Test, Lighthouse

---

**생성일**: 2025-11-16
**작성자**: `/speckit.tasks` Automation
