# 구현 태스크: 모바일 UX 개선

**Feature**: 모바일 UX
**생성일**: 2025-11-16
**상태**: 준비됨

---

## 개요

이 문서는 모바일 사용자 경험 개선 (드로어, 스켈레톤, 에러 페이지) 구현을 위한 세부 태스크 목록입니다.

---

## Implementation Strategy

### MVP Scope (User Story 1 + 2)
최소 기능 제품은 **US1 (모바일 드로어)** + **US2 (로딩 스켈레톤)**로 구성됩니다.

### Incremental Delivery
- **Sprint 1**: US1 (모바일 드로어)
- **Sprint 2**: US2 (로딩 스켈레톤) + US3 (에러 페이지)

---

## Phases & Tasks

### Phase 1: Setup (컴포넌트 스펙 확인)

**목표**: 터치 타겟 가이드라인 확인, 유틸리티 클래스 정의

**독립 테스트 기준**:
- ✅ Tailwind에 터치 타겟 유틸리티 클래스 추가

#### Tasks

- [ ] T001 터치 타겟 유틸리티 클래스 정의 (globals.css)
- [ ] T002 [P] 애니메이션 유틸리티 클래스 정의 (globals.css)

**완료 조건**: 유틸리티 클래스 적용 가능

---

### Phase 2: US1 - 모바일 드로어

**User Story**: "모바일 사용자가 햄버거 메뉴로 카테고리에 접근할 수 있다"

**독립 테스트 기준**:
- ✅ 모바일(<768px)에서 햄버거 버튼 표시
- ✅ 버튼 클릭 → 드로어 슬라이드 인
- ✅ 오버레이 클릭 → 드로어 닫힘

#### Tasks

- [ ] T003 [P] [US1] MobileDrawer 컴포넌트 생성 (components/mobile/MobileDrawer.tsx)
- [ ] T004 [US1] 햄버거 버튼 추가 (md:hidden)
- [ ] T005 [US1] 배경 오버레이 추가 (bg-black/50)
- [ ] T006 [US1] 드로어 슬라이드 애니메이션 (translate-x, 300ms)
- [ ] T007 [US1] 네비게이션 링크 (카테고리 목록)
- [ ] T008 [US1] 액션 버튼 (로그인, 구독)
- [ ] T009 [US1] X 버튼으로 닫기
- [ ] T010 [US1] 오버레이 클릭으로 닫기
- [ ] T011 [US1] ESC 키로 닫기 (useEffect)
- [ ] T012 [US1] Header에서 MobileDrawer 연결

**완료 조건**:
- 모바일에서 드로어가 정상 작동
- 터치 타겟 48px 이상

**병렬 실행 가능**: T003 (독립 컴포넌트)

---

### Phase 3: US2 - 로딩 스켈레톤

**User Story**: "페이지 로딩 중 스켈레톤을 표시하여 체감 성능을 개선한다"

**독립 테스트 기준**:
- ✅ 홈페이지 로딩 시 PostCard 스켈레톤 6개 표시
- ✅ 블로그 글 로딩 시 BlogPost 스켈레톤 표시

#### Tasks

- [ ] T013 [P] [US2] BlogPostSkeleton 컴포넌트 (components/skeletons/BlogPostSkeleton.tsx)
- [ ] T014 [P] [US2] PostCardSkeleton 컴포넌트 (components/skeletons/PostCardSkeleton.tsx)
- [ ] T015 [P] [US2] HomePageSkeleton 컴포넌트 (components/skeletons/HomePageSkeleton.tsx)
- [ ] T016 [US2] useSkeletonCount Hook (반응형 개수: 3/4/6)
- [ ] T017 [US2] Pulse 애니메이션 (animate-pulse)
- [ ] T018 [US2] 홈페이지에서 스켈레톤 연결 (app/page.tsx)
- [ ] T019 [US2] 블로그 글 페이지에서 스켈레톤 연결 (app/blog/[slug]/page.tsx)

**완료 조건**:
- 로딩 중 스켈레톤 표시
- 반응형 개수 적용

**병렬 실행 가능**: T013, T014, T015 (독립 컴포넌트)

---

### Phase 4: US3 - 에러 페이지

**User Story**: "사용자가 에러 발생 시 명확한 안내를 받는다"

**독립 테스트 기준**:
- ✅ `/not-found` 접근 → 404 페이지 표시
- ✅ 에러 발생 → Error Boundary 표시

#### Tasks

- [ ] T020 [P] [US3] NotFound 페이지 (app/not-found.tsx)
- [ ] T021 [P] [US3] Error Boundary 페이지 (app/error.tsx)
- [ ] T022 [P] [US3] ErrorMessage 컴포넌트 (components/ErrorMessage.tsx)
- [ ] T023 [US3] 404 페이지 디자인 (아이콘, 제목, 설명, CTA)
- [ ] T024 [US3] 500 페이지 디자인 (재시도 버튼)
- [ ] T025 [US3] ErrorMessage 재사용 (API 에러)

**완료 조건**:
- 404/500 페이지가 친절한 메시지 표시
- "홈으로 돌아가기" 버튼 작동

**병렬 실행 가능**: T020, T021, T022 (독립 페이지/컴포넌트)

---

### Phase 5: Polish & Cross-Cutting Concerns

**목표**: 접근성, 성능 최적화

**독립 테스트 기준**:
- ✅ 모든 터치 타겟 48px 이상
- ✅ 드로어 애니메이션 60fps

#### Tasks

- [ ] T026 [P] 터치 타겟 검증 (모든 버튼)
- [ ] T027 [P] 애니메이션 성능 최적화 (GPU 가속)
- [ ] T028 [P] 접근성 검증 (aria-label)

**완료 조건**: 모바일 UX QA 통과

**병렬 실행 가능**: T026 ~ T028 (독립 작업)

---

## Summary

- **총 태스크 수**: 28개
- **MVP 태스크 수**: 19개 (Phase 1~3)
- **병렬 실행 가능**: 12개 태스크 ([P] 마커)

---

**생성일**: 2025-11-16
**작성자**: `/speckit.tasks` Automation
