# 구현 태스크: Medium 스타일 디자인 완성

**Feature**: Medium 스타일 디자인
**생성일**: 2025-11-16
**상태**: 준비됨

---

## 개요

이 문서는 블로그 전체를 Medium의 미니멀한 디자인으로 통일하는 스타일링 작업의 세부 태스크 목록입니다.

---

## Implementation Strategy

### MVP Scope (All User Stories)
디자인은 전체가 일관되어야 하므로 모든 컴포넌트를 한 번에 작업합니다.

### Incremental Delivery
- **Sprint 1**: 디자인 토큰 + Header/Footer (일관된 껍데기)
- **Sprint 2**: 블로그 글 + 카테고리 페이지 (콘텐츠 영역)

---

## Phases & Tasks

### Phase 1: Setup (디자인 토큰 설정)

**목표**: Tailwind 설정, 폰트 로드, 색상 팔레트 정의

**독립 테스트 기준**:
- ✅ Tailwind 설정에 custom colors, fonts 반영
- ✅ Merriweather(serif), Inter(sans) 폰트 로드

#### Tasks

- [ ] T001 Tailwind Config 업데이트 (tailwind.config.js)
- [ ] T002 Medium 색상 팔레트 추가 (검정, 회색, 흰색)
- [ ] T003 폰트 패밀리 설정 (font-serif, font-sans)
- [ ] T004 Next.js Font 로드 (app/layout.tsx - Merriweather, Inter)
- [ ] T005 [P] 재사용 유틸리티 클래스 정의 (globals.css)

**완료 조건**: `npm run dev` 실행 시 폰트 및 색상 적용 확인

---

### Phase 2: US1 - Header 컴포넌트 재설계

**User Story**: "Header가 Medium 스타일 미니멀 디자인을 따른다"

**독립 테스트 기준**:
- ✅ 로고가 검정 세리프 폰트로 표시
- ✅ 배경이 단색 흰색 (그라디언트 제거)
- ✅ 구독 버튼이 `rounded-full` 검정 pill 형태

#### Tasks

- [ ] T006 [US1] Header 배경 단색 변경 (components/Header.tsx - bg-white)
- [ ] T007 [US1] 로고 세리프 폰트 적용 (font-serif, text-black)
- [ ] T008 [US1] 링크 호버 밑줄 효과 (hover:underline)
- [ ] T009 [US1] 구독 버튼 rounded-full + bg-black
- [ ] T010 [US1] 로그인 텍스트 링크로 변경 (버튼 제거)

**완료 조건**: Header가 디자인 스펙과 일치

---

### Phase 3: US2 - Footer 컴포넌트 재설계

**User Story**: "Footer가 Medium 스타일 미니멀 디자인을 따른다"

**독립 테스트 기준**:
- ✅ 배경이 흰색 (어두운 배경 제거)
- ✅ 레이아웃이 1열 플렉스

#### Tasks

- [ ] T011 [US2] Footer 배경 흰색 변경 (components/Footer.tsx)
- [ ] T012 [US2] 상단 테두리 추가 (border-t border-gray-300)
- [ ] T013 [US2] 레이아웃 플렉스로 변경 (Grid → Flex)
- [ ] T014 [US2] 불필요한 섹션 제거 (간소화)

**완료 조건**: Footer가 디자인 스펙과 일치

---

### Phase 4: US3 - 블로그 상세 페이지 재설계

**User Story**: "블로그 글이 Medium 스타일 타이포그래피를 따른다"

**독립 테스트 기준**:
- ✅ 제목이 Serif 폰트 `text-5xl`
- ✅ 커버 없을 때 배경 제거 (그라디언트 없음)
- ✅ Premium 배지가 심플한 텍스트 + ⭐

#### Tasks

- [ ] T015 [US3] 커버 없을 때 배경 제거 (app/blog/[slug]/page.tsx)
- [ ] T016 [US3] 제목 Serif 폰트 + text-5xl (app/blog/[slug]/page.tsx)
- [ ] T017 [US3] Premium 배지 심플화 (components/PremiumBadge.tsx)
- [ ] T018 [US3] 메타 정보 구분선 추가 (border-b)

**완료 조건**: 블로그 글이 디자인 스펙과 일치

---

### Phase 5: US4 - 카테고리 페이지 재설계

**User Story**: "카테고리 페이지가 Grid → List 레이아웃으로 변경된다"

**독립 테스트 기준**:
- ✅ 배경이 흰색 (회색 배경 제거)
- ✅ 레이아웃이 List (Grid 제거)
- ✅ 카드 간 구분선 표시

#### Tasks

- [ ] T019 [US4] 배경 흰색 변경 (app/category/[slug]/page.tsx)
- [ ] T020 [US4] Grid → List 레이아웃 (space-y-8)
- [ ] T021 [US4] 카드 간 구분선 추가 (border-b)
- [ ] T022 [P] [US4] PostCard horizontal variant 생성 (components/PostCard.tsx)

**완료 조건**: 카테고리 페이지가 디자인 스펙과 일치

**병렬 실행 가능**: T022 (독립 컴포넌트)

---

### Phase 6: Polish & Cross-Cutting Concerns

**목표**: 디자인 일관성 검증, 반응형 테스트

**독립 테스트 기준**:
- ✅ 모든 페이지에서 검정-회색-흰색만 사용
- ✅ 모바일/태블릿/데스크톱에서 레이아웃 정상

#### Tasks

- [ ] T023 [P] 디자인 일관성 검증 (모든 페이지)
- [ ] T024 [P] 반응형 테스트 (모바일, 태블릿, 데스크톱)
- [ ] T025 [P] 불필요한 그라디언트/그림자 제거

**완료 조건**: 디자인 QA 통과

**병렬 실행 가능**: T023 ~ T025 (독립 작업)

---

## Summary

- **총 태스크 수**: 25개
- **MVP 태스크 수**: 25개 (모든 Phase)
- **병렬 실행 가능**: 5개 태스크 ([P] 마커)

---

**생성일**: 2025-11-16
**작성자**: `/speckit.tasks` Automation
