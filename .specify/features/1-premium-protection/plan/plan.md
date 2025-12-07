# 구현 계획: 프리미엄 콘텐츠 보호 시스템

**기능**: 프리미엄 콘텐츠 보호
**작성일**: 2025-11-16
**상태**: 초안
**우선순위**: 중요 (출시 전 필수)

## 개요

이 문서는 프리미엄 콘텐츠 보호 시스템의 기술적 구현 계획을 정의합니다. 이 기능은 유료 구독자만 프리미엄 콘텐츠에 접근할 수 있도록 하는 CryptoTitan 블로그의 핵심 수익화 메커니즘입니다.

## Technical Context

### 현재 스택
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes, Middleware
- **Database**: Supabase (PostgreSQL)
- **CMS**: Sanity (Headless CMS)
- **Authentication**: NextAuth.js + Supabase Auth
- **Payments**: Stripe (Checkout, Customer Portal, Webhooks)
- **Hosting**: NEEDS CLARIFICATION (Vercel assumed)

### 주요 기술 결정 사항
1. **구독 검증 위치**: Middleware vs Server Components vs API Routes
   - **결정**: NEEDS CLARIFICATION - 연구 필요
   - **고려사항**: 성능, 보안, Next.js 14 최적 패턴

2. **세션 캐싱 전략**: Redis vs In-memory vs Supabase direct
   - **결정**: NEEDS CLARIFICATION - 연구 필요
   - **고려사항**: 5분 TTL 요구사항, 비용, 확장성

3. **Stripe Webhook 처리**: 별도 API Route vs Vercel Edge Functions
   - **결정**: NEEDS CLARIFICATION - 연구 필요
   - **고려사항**: 3초 동기화 목표, 실패 복구

4. **프리미엄 콘텐츠 마스킹**: Sanity GROQ 쿼리 vs Server-side filtering
   - **결정**: NEEDS CLARIFICATION - 연구 필요
   - **고려사항**: API 응답 유출 방지, 성능

## Constitution Check

### 관련 원칙
- ✅ **원칙 1: 프리미엄 콘텐츠 보호** (직접 구현)
- ✅ **원칙 6: 보안 및 개인정보 보호** (서버 측 검증)
- ✅ **원칙 7: 성능** (캐싱 전략)

### 원칙 준수 검증

#### 원칙 1: 프리미엄 콘텐츠 보호
- ✅ 서버 측 구독 검증 (클라이언트 측만으로 불충분)
- ✅ 미들웨어 강제 검증 (우회 불가)
- ✅ API 응답에서 프리미엄 콘텐츠 차단
- ✅ Stripe 웹훅 실시간 동기화

#### 원칙 6: 보안
- ✅ 모든 검증은 서버 측에서 수행
- ✅ JWT 토큰 검증 (Supabase Auth)
- ✅ Webhook 서명 검증 (Stripe)

#### 원칙 7: 성능
- ⚠️ 세션 캐싱 전략 필요 (5분 TTL)
- ⚠️ 데이터베이스 쿼리 최적화 필요

### Gate 평가

**Gate 1: 보안 요구사항** 🔴 FAIL
- ❌ 문제: 현재 프리미엄 콘텐츠 보호 없음
- ✅ 해결책: 이 기능 구현으로 해결

**Gate 2: 성능 요구사항** 🟡 PARTIAL
- ⚠️ 문제: 캐싱 전략 미정의
- 📋 TODO: Phase 0 연구에서 결정

**Gate 3: 헌장 준수** 🟢 PASS
- ✅ 모든 관련 원칙 충족
- ✅ 위반 사항 없음

## Implementation Phases

### Phase 0: Research & Technology Decisions (현재 단계)

**목표**: 모든 "NEEDS CLARIFICATION" 항목 해결

**연구 태스크**:
1. Next.js 14 Middleware vs Server Components 패턴 비교
2. Stripe Webhook 모범 사례 (Next.js App Router)
3. 세션 캐싱 전략 (Vercel 환경)
4. Sanity CMS 보안 쿼리 패턴

**결과물**: `research.md` (모든 기술 결정 문서화)

### Phase 1: Design & Contracts

**목표**: 데이터 모델, API 계약, 빠른 시작 가이드 생성

**태스크**:
1. 데이터 모델 설계 (`data-model.md`)
   - `subscriptions` 테이블 스키마
   - Stripe 데이터 매핑
   - RLS 정책

2. API 계약 생성 (`contracts/`)
   - Webhook 엔드포인트 스펙
   - 구독 검증 API 스펙

3. 빠른 시작 가이드 (`quickstart.md`)
   - 개발 환경 설정
   - Stripe 테스트 모드 설정
   - Webhook 로컬 테스트

**결과물**: `data-model.md`, `/contracts/*`, `quickstart.md`

### Phase 2: Implementation Tasks (다음 단계)

**목표**: 실제 코드 구현을 위한 태스크 분할

**다음 단계**: `/speckit.tasks` 실행

## Dependencies

### 외부 종속성
- ✅ Stripe 계정 및 API 키
- ✅ Supabase 프로젝트
- ⚠️ Webhook 엔드포인트 URL (배포 후)

### 내부 종속성
- 🔴 **차단**: 인증 시스템 (Phase 1 필수)
- 🟡 **권장**: SEO 기본 설정 (공개 프리뷰용)
- ⚪ **선택**: Medium 디자인 (페이월 UI)

## Risk Assessment

### 높은 위험
1. **Webhook 실패 시 구독 상태 불일치**
   - 완화: 재시도 로직, 수동 동기화 API

2. **세션 캐싱 무효화 지연**
   - 완화: 짧은 TTL (5분), Stripe 이벤트 시 강제 무효화

### 중간 위험
1. **Middleware 성능 오버헤드**
   - 완화: 캐싱, 조건부 실행

2. **Sanity API 타임아웃**
   - 완화: 프론트엔드 캐싱, 재시도

## Success Criteria

### Phase 0 완료 조건
- ✅ 모든 "NEEDS CLARIFICATION" 해결
- ✅ `research.md` 작성 완료
- ✅ 기술 스택 결정 문서화

### Phase 1 완료 조건
- ✅ `data-model.md` 작성
- ✅ API 계약 정의
- ✅ `quickstart.md` 작성
- ✅ Agent context 업데이트

---

## Planning Summary

### ✅ Phase 0 & 1 완료 (2025-11-16)

**생성된 산출물**:
1. ✅ [`plan.md`](plan.md) - 메인 구현 계획
2. ✅ [`research/research.md`](research/research.md) - 기술 연구 및 결정
3. ✅ [`data-model.md`](data-model.md) - 데이터베이스 스키마 설계
4. ✅ [`contracts/webhook-api.md`](contracts/webhook-api.md) - Stripe Webhook API 계약
5. ✅ [`quickstart.md`](quickstart.md) - 개발 환경 빠른 시작 가이드

### 핵심 기술 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| 구독 검증 | Middleware + Server Components | 인증/권한 분리, Next.js 14 권장 |
| Webhook 처리 | Next.js API Route | 표준 패턴, Vercel 호환 |
| 캐싱 전략 | React Cache (Phase 1) → Vercel KV (Phase 2) | 단계적 최적화, 비용 효율 |
| 보안 쿼리 | GROQ 조건부 투영 + Server-side 이중 검증 | 다층 보안, API 유출 방지 |

**다음 단계**: `/speckit.tasks` 실행 → 구현 작업을 세부 태스크로 분할
