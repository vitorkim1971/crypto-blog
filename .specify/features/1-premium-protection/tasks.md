# 구현 태스크: 프리미엄 콘텐츠 보호 시스템

**Feature**: 프리미엄 콘텐츠 보호
**생성일**: 2025-11-16
**상태**: 준비됨

---

## 개요

이 문서는 프리미엄 콘텐츠 보호 시스템 구현을 위한 세부 태스크 목록입니다. 각 태스크는 User Story별로 그룹화되어 독립적으로 구현 및 테스트 가능합니다.

---

## Implementation Strategy

### MVP Scope (User Story 1 + 2)
최소 기능 제품은 **US1 (Middleware 검증)** + **US2 (Webhook 동기화)**로 구성됩니다. 이 두 Story만 완성하면 기본적인 프리미엄 콘텐츠 보호가 작동합니다.

### Incremental Delivery
- **Sprint 1**: Setup + Foundational + US1 + US2 (핵심 보호 기능)
- **Sprint 2**: US3 + US4 (UX 및 API 보안 강화)
- **Sprint 3**: US5 + Polish (성능 최적화)

---

## Phases & Tasks

### Phase 1: Setup (프로젝트 초기화)

**목표**: 데이터베이스, Stripe, 환경 변수 설정

**독립 테스트 기준**:
- ✅ Supabase `subscriptions` 테이블 존재
- ✅ Stripe Webhook Secret 발급 완료
- ✅ 환경 변수 `.env.local` 설정 완료

#### Tasks

- [X] T001 Supabase에서 subscriptions 테이블 생성 (migrations/003_create_subscriptions.sql)
- [X] T002 Supabase에서 RLS 정책 설정 (migrations/003_create_subscriptions.sql)
- [X] T003 Supabase에서 인덱스 생성 (migrations/003_create_subscriptions.sql)
- [X] T004 Supabase에서 updated_at 트리거 생성 (migrations/003_create_subscriptions.sql)
- [X] T005 [P] Stripe Dashboard에서 테스트 제품/가격 생성 (수동)
- [X] T006 [P] Stripe CLI 설치 및 로그인 (수동)
- [X] T007 [P] 환경 변수 .env.local 설정 (STRIPE_*, SUPABASE_*)

**완료 조건**: `npm run dev` 실행 시 환경 변수 오류 없음

---

### Phase 2: Foundational (기반 코드)

**목표**: 타입 정의, 공통 헬퍼 함수, 클라이언트 설정

**독립 테스트 기준**:
- ✅ TypeScript 컴파일 오류 없음
- ✅ Supabase 클라이언트 연결 성공

#### Tasks

- [X] T008 [P] Subscription 타입 정의 (lib/types/subscription.ts)
- [X] T009 [P] Supabase Database 타입 생성 (lib/types/database.types.ts)
- [X] T010 [P] Stripe 클라이언트 초기화 헬퍼 (lib/stripe/client.ts)
- [X] T011 [P] Supabase Server Client 헬퍼 (lib/supabase/server.ts)
- [X] T012 [P] Stripe 데이터 변환 유틸리티 (lib/stripe/utils.ts)

**완료 조건**: 모든 타입 파일 import 시 오류 없음

---

### Phase 3: US1 - Middleware 인증 검증

**User Story**: "비로그인 사용자가 프리미엄 게시글 접근 시 로그인 페이지로 리다이렉트된다"

**독립 테스트 기준**:
- ✅ 비로그인 상태로 `/blog/premium-post` 접근 → `/login?callbackUrl=/blog/premium-post`로 리다이렉트
- ✅ 로그인 상태로 `/blog/premium-post` 접근 → 페이지 로드 (리다이렉트 없음)

#### Tasks

- [X] T013 [US1] Middleware에서 세션 확인 로직 추가 (middleware.ts)
- [X] T014 [US1] /blog/[slug] 경로 매칭 패턴 구현 (middleware.ts)
- [X] T015 [US1] 미인증 사용자 리다이렉트 로직 (middleware.ts)
- [X] T016 [US1] callbackUrl 쿼리 파라미터 추가 (middleware.ts)

**완료 조건**:
- 비로그인 사용자가 프리미엄 게시글 접근 시 로그인 페이지로 리다이렉트
- 로그인 후 원래 URL로 자동 이동

**병렬 실행 가능**: T013 ~ T016은 모두 middleware.ts 작업이므로 순차 실행 필요

---

### Phase 4: US2 - Stripe Webhook 동기화

**User Story**: "Stripe에서 구독 생성/변경/취소 이벤트 발생 시 Supabase에 즉시 반영된다"

**독립 테스트 기준**:
- ✅ `stripe trigger checkout.session.completed` 실행 → Supabase에 새 레코드 생성
- ✅ `stripe trigger customer.subscription.updated` 실행 → 기존 레코드 status 업데이트
- ✅ `stripe trigger customer.subscription.deleted` 실행 → status='canceled' 업데이트
- ✅ `stripe trigger invoice.payment_failed` 실행 → status='past_due' 업데이트

#### Tasks

- [X] T017 [US2] Webhook API Route 생성 (app/api/webhooks/stripe/route.ts)
- [X] T018 [US2] Stripe 서명 검증 로직 (app/api/webhooks/stripe/route.ts)
- [X] T019 [US2] Event Type Router 구현 (app/api/webhooks/stripe/route.ts)
- [X] T020 [P] [US2] handleCheckoutCompleted 핸들러 (lib/stripe/handlers/checkout.ts)
- [X] T021 [P] [US2] handleSubscriptionUpdated 핸들러 (lib/stripe/handlers/subscription-updated.ts)
- [X] T022 [P] [US2] handleSubscriptionDeleted 핸들러 (lib/stripe/handlers/subscription-deleted.ts)
- [X] T023 [P] [US2] handlePaymentFailed 핸들러 (lib/stripe/handlers/payment-failed.ts)
- [X] T024 [US2] Supabase upsert 로직 (각 핸들러에서 사용)
- [X] T025 [US2] 에러 핸들링 및 200 응답 (app/api/webhooks/stripe/route.ts)

**완료 조건**:
- Stripe CLI로 4개 이벤트 트리거 시 Supabase에 정상 반영
- 잘못된 서명 시 400 에러 반환

**병렬 실행 가능**: T020 ~ T023 (각 핸들러는 독립적)

---

### Phase 5: US3 - Server Component 권한 검증

**User Story**: "로그인한 사용자가 프리미엄 게시글 접근 시 구독 상태를 확인하여 전체 콘텐츠 또는 페이월을 표시한다"

**독립 테스트 기준**:
- ✅ 활성 구독자로 로그인 → 프리미엄 게시글 전체 콘텐츠 표시
- ✅ 비구독자로 로그인 → 페이월 화면 표시 (제목 + 발췌만)
- ✅ 만료된 구독자로 로그인 → 페이월 화면 표시

#### Tasks

- [X] T026 [US3] 구독 상태 조회 헬퍼 함수 (lib/subscription/check.ts)
- [X] T027 [US3] checkSubscription 함수 구현 (lib/subscription/check.ts)
- [X] T028 [US3] getSubscriptionDetails 함수 구현 (lib/subscription/check.ts)
- [X] T029 [US3] Sanity 조건부 GROQ 쿼리 (lib/sanity/queries.ts)
- [X] T030 [US3] BlogPost 페이지에서 구독 검증 로직 추가 (app/blog/[slug]/page.tsx)
- [X] T031 [US3] isPremium 체크 및 분기 처리 (app/blog/[slug]/page.tsx)
- [X] T032 [US3] 전체 콘텐츠 렌더링 (app/blog/[slug]/page.tsx)

**완료 조건**:
- 구독 상태에 따라 전체 콘텐츠 vs 페이월 조건부 렌더링
- Sanity API 응답에 content 포함 여부 올바름

**병렬 실행 가능**: T026~T028 (헬퍼 함수), T029 (Sanity 쿼리)는 독립적

---

### Phase 6: US4 - Paywall UI 구현

**User Story**: "비구독자에게 구독 가치를 명확히 전달하고 구독 페이지로 쉽게 이동할 수 있다"

**독립 테스트 기준**:
- ✅ Paywall 컴포넌트에 제목, 발췌문, 구독 혜택, CTA 버튼 표시
- ✅ CTA 버튼 클릭 시 `/pricing` 또는 Stripe Checkout으로 이동
- ✅ 모바일에서도 UI 깨지지 않음

#### Tasks

- [ ] T033 [P] [US4] Paywall 컴포넌트 생성 (components/Paywall.tsx)
- [ ] T034 [P] [US4] 프리미엄 배지 컴포넌트 (components/PremiumBadge.tsx)
- [ ] T035 [US4] Paywall 레이아웃 구현 (제목, 발췌, 혜택, CTA)
- [ ] T036 [US4] 구독 혜택 리스트 표시 (components/Paywall.tsx)
- [ ] T037 [US4] CTA 버튼 구독 페이지 링크 (components/Paywall.tsx)
- [ ] T038 [US4] BlogPost 페이지에서 Paywall 컴포넌트 연결 (app/blog/[slug]/page.tsx)
- [ ] T039 [US4] 만료된 구독자용 메시지 변형 (components/Paywall.tsx)

**완료 조건**:
- 비구독자가 Paywall 화면을 보고 구독 가치를 이해할 수 있음
- CTA 클릭 시 구독 페이지로 이동

**병렬 실행 가능**: T033, T034 (독립 컴포넌트)

---

### Phase 7: US5 - API 콘텐츠 보호

**User Story**: "비구독자가 API를 직접 호출해도 프리미엄 콘텐츠 본문을 얻을 수 없다"

**독립 테스트 기준**:
- ✅ 비구독자 JWT로 `/api/posts/premium-slug` 호출 → `content` 필드 null
- ✅ 구독자 JWT로 호출 → `content` 필드 포함

#### Tasks

- [ ] T040 [P] [US5] getPost API에서 구독 검증 추가 (lib/sanity/queries.ts)
- [ ] T041 [US5] 조건부 필드 투영 (GROQ 쿼리)
- [ ] T042 [US5] Server-side 이중 검증 (content 필드 null 처리)
- [ ] T043 [US5] API Route에서 권한 체크 (app/api/posts/[slug]/route.ts)

**완료 조건**:
- API 응답에서 비구독자에게 content 필드 노출 안 됨

**병렬 실행 가능**: T040, T043 (독립 파일)

---

### Phase 8: Polish & Cross-Cutting Concerns

**목표**: 캐싱, 에러 처리, 로깅, 성능 최적화

**독립 테스트 기준**:
- ✅ 동일 사용자 2번 연속 접근 시 DB 쿼리 1회만 (캐싱)
- ✅ Webhook 실패 시 재시도 로그 확인

#### Tasks

- [ ] T044 [P] React Cache 적용 (lib/subscription/check.ts)
- [ ] T045 [P] Webhook 재시도 로직 (app/api/webhooks/stripe/route.ts)
- [ ] T046 [P] 에러 로깅 (lib/logger.ts)
- [ ] T047 [P] Sentry 연동 (선택 사항)
- [ ] T048 [P] 성능 모니터링 (구독 검증 시간 측정)
- [ ] T049 Vercel KV 캐싱 준비 (lib/cache/kv.ts, Phase 2용)
- [ ] T050 구독 만료 알림 이메일 (선택 사항)

**완료 조건**:
- 캐싱으로 DB 부하 감소 확인
- 에러 발생 시 로그에 기록됨

**병렬 실행 가능**: T044 ~ T048 (독립 파일)

---

## Dependencies Graph

### User Story 완료 순서

```
Setup (Phase 1)
  ↓
Foundational (Phase 2)
  ↓
US1 (Phase 3) ←─┐
  ↓             │ (병렬 가능)
US2 (Phase 4) ←─┘
  ↓
US3 (Phase 5) ← US2 완료 후 (구독 데이터 필요)
  ↓
US4 (Phase 6) ← US3 완료 후 (Paywall 렌더링 조건)
  ↓
US5 (Phase 7) ← US3 완료 후 (권한 체크 로직 재사용)
  ↓
Polish (Phase 8) ← 모든 US 완료 후
```

### 핵심 블로킹 종속성

- **US3, US4, US5는 US2 완료 필요**: Supabase에 구독 데이터가 있어야 검증 가능
- **US4는 US3 완료 필요**: Paywall 조건부 렌더링 로직이 있어야 함
- **US1은 독립적**: 다른 Story와 병렬 진행 가능

---

## Parallel Execution Examples

### Sprint 1 (Week 1)

**병렬 실행 가능**:
- Developer A: Phase 1 (Setup) → Phase 3 (US1 - Middleware)
- Developer B: Phase 2 (Foundational) → Phase 4 (US2 - Webhook)

### Sprint 2 (Week 2)

**순차 실행 (US2 완료 후)**:
- Developer A: Phase 5 (US3 - Server Component 검증)
- Developer B: Phase 6 (US4 - Paywall UI)
- Developer C: Phase 7 (US5 - API 보호)

### Sprint 3 (Week 3)

**병렬 실행**:
- Developer A: T044 (React Cache)
- Developer B: T045 (Webhook 재시도)
- Developer C: T046 (로깅)

---

## Testing Strategy

### Unit Tests (선택 사항)
- `lib/subscription/check.ts` - 구독 상태 로직
- `lib/stripe/utils.ts` - 데이터 변환

### Integration Tests
- Stripe Webhook 이벤트 → Supabase 업데이트
- 구독 상태에 따른 페이지 렌더링

### E2E Tests
- 비구독자 접근 → 페이월 표시
- 구독 결제 → 즉시 접근 가능

---

## Summary

- **총 태스크 수**: 50개
- **MVP 태스크 수**: 25개 (Phase 1~4)
- **병렬 실행 가능**: 20개 태스크 ([P] 마커)
- **User Story별 태스크 수**:
  - Setup: 7개
  - Foundational: 5개
  - US1: 4개
  - US2: 9개
  - US3: 7개
  - US4: 7개
  - US5: 4개
  - Polish: 7개

---

## Next Steps

1. ✅ **MVP Sprint 계획**: Setup + Foundational + US1 + US2 (2주)
2. ⏳ **Phase 1 시작**: Supabase 테이블 생성부터
3. 📋 **Daily Standup**: 매일 진행 상황 공유

---

**생성일**: 2025-11-16
**작성자**: `/speckit.tasks` Automation
