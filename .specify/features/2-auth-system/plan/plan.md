# 구현 계획: 인증 시스템 완성

**기능**: 인증 시스템
**작성일**: 2025-11-16
**상태**: 초안
**우선순위**: 중요 (출시 전 필수)

## 개요

이 문서는 완전한 인증 시스템(로그인, 회원가입, OAuth, 비밀번호 재설정)의 기술적 구현 계획을 정의합니다.

## Technical Context

### 현재 스택
- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth (메인) + NextAuth.js (OAuth 래퍼)
- **Email**: Supabase Email (인증 메일)
- **Hosting**: Vercel

### 주요 기술 결정 사항
1. **이중 인증 시스템**: Supabase Auth + NextAuth 동기화
   - **결정**: ✅ Supabase Auth가 Single Source of Truth
   - **이유**: 명세서에서 이미 결정됨, RLS 통합

2. **Rate Limiting 구현**: IP vs 계정 기반
   - **결정**: ✅ IP 5회 + 계정 3회 조합
   - **이유**: 명세서에서 이미 결정됨

3. **Profile 자동 생성**: 트리거 vs 애플리케이션 레이어
   - **결정**: ✅ Supabase 트리거
   - **이유**: 명세서에서 이미 결정됨, SQL 코드 제공됨

4. **비밀번호 재설정 플로우**: Supabase vs Custom
   - **결정**: NEEDS CLARIFICATION - 연구 필요

5. **세션 관리**: NextAuth vs Supabase Session
   - **결정**: NEEDS CLARIFICATION - 동기화 전략 필요

## Constitution Check

### 관련 원칙
- ✅ **원칙 6: 보안 및 개인정보 보호** (핵심 구현)
- ✅ **원칙 5: 사용자 경험 우선** (폼 UX)

### 원칙 준수 검증

#### 원칙 6: 보안
- ✅ bcrypt 비밀번호 해싱 (10 라운드)
- ✅ HttpOnly, Secure 쿠키
- ✅ CSRF 보호 (NextAuth 내장)
- ✅ Rate limiting (Brute-force 방어)
- ✅ 이메일 인증 필수

#### 원칙 5: 사용자 경험
- ✅ 실시간 폼 검증
- ✅ 명확한 오류 메시지
- ✅ 비밀번호 보기/숨기기 토글
- ✅ 키보드 네비게이션 지원

### Gate 평가

**Gate 1: 보안 요구사항** 🟢 PASS
- ✅ 모든 보안 요구사항 충족
- ✅ 업계 표준 준수

**Gate 2: 종속성** 🔴 BLOCKER
- ❌ **차단**: 프리미엄 보호 기능 필요 (인증 후 구독 확인)
- ⚠️ Supabase `profiles` 테이블 필요

**Gate 3: 헌장 준수** 🟢 PASS
- ✅ 원칙 위반 없음

## Implementation Phases

### Phase 0: Research & Technology Decisions

**목표**: 세션 동기화 및 비밀번호 재설정 전략 결정

**연구 태스크**:
1. Supabase Auth + NextAuth 세션 동기화 패턴
2. Supabase Email 비밀번호 재설정 플로우
3. Rate Limiting 구현 옵션 (Vercel Edge Config, Upstash)
4. Google OAuth NextAuth 통합 패턴

**결과물**: `research.md`

### Phase 1: Design & Contracts

**목표**: 데이터 모델, API 계약, 빠른 시작 가이드

**태스크**:
1. 데이터 모델 설계 (`data-model.md`)
   - `profiles` 테이블 스키마
   - `auth.users` 확장 필드
   - RLS 정책

2. API 계약 생성 (`contracts/`)
   - 회원가입 API
   - 로그인 API
   - OAuth 콜백 API
   - 비밀번호 재설정 API

3. 빠른 시작 가이드 (`quickstart.md`)
   - Supabase Auth 설정
   - Google OAuth 앱 생성
   - 이메일 템플릿 커스터마이징

**결과물**: `data-model.md`, `/contracts/*`, `quickstart.md`

### Phase 2: Implementation Tasks

**다음 단계**: `/speckit.tasks` 실행

## Dependencies

### 외부 종속성
- ✅ Supabase 프로젝트
- ⚠️ Google Cloud Console (OAuth)
- ⚠️ SMTP 설정 (또는 Supabase Email)

### 내부 종속성
- 🔴 **차단**: 프리미엄 보호 기능 (구독 확인 의존)
- 🟡 **권장**: Medium 디자인 (로그인/회원가입 폼 UI)

## Risk Assessment

### 높은 위험
1. **이중 세션 불일치**
   - 완화: Supabase를 진실 원천으로, NextAuth는 래퍼만

2. **이메일 스팸 처리**
   - 완화: Supabase 도메인 인증 (SPF/DKIM)

### 중간 위험
1. **Google OAuth 장애**
   - 완화: 이메일/비밀번호 대체 수단 항상 제공

2. **Rate Limiting 우회**
   - 완화: IP + 계정 조합, CAPTCHA 추가 (Phase 2)

## Success Criteria

### Phase 0 완료 조건
- ✅ 세션 동기화 전략 문서화
- ✅ 비밀번호 재설정 플로우 결정
- ✅ Rate Limiting 구현 방법 선택

### Phase 1 완료 조건
- ✅ `data-model.md` 작성
- ✅ API 계약 정의
- ✅ `quickstart.md` 작성

---

## Planning Summary

### ✅ Phase 0 & 1 완료 (2025-11-16)

**생성된 산출물**:
1. ✅ [`plan.md`](plan.md) - 메인 구현 계획
2. ✅ [`research/research.md`](research/research.md) - 기술 연구 및 결정 (4개 항목)
3. ✅ [`data-model.md`](data-model.md) - 데이터베이스 스키마 설계
4. ✅ [`contracts/signup-api.md`](contracts/signup-api.md) - 회원가입 API 계약
5. ✅ [`contracts/login-api.md`](contracts/login-api.md) - 로그인 API 계약
6. ✅ [`contracts/password-reset-api.md`](contracts/password-reset-api.md) - 비밀번호 재설정 API 계약
7. ✅ [`contracts/oauth-api.md`](contracts/oauth-api.md) - Google OAuth API 계약
8. ✅ [`quickstart.md`](quickstart.md) - 개발 환경 빠른 시작 가이드 (40분)

### 핵심 기술 결정

| 항목 | 결정 | 근거 |
|------|------|------|
| 세션 관리 | Supabase Auth (Single Source of Truth) | RLS 통합, 명세서 요구사항 |
| OAuth 통합 | NextAuth → Supabase 동기화 | OAuth 래퍼로만 사용 |
| 비밀번호 재설정 | Supabase 내장 기능 | 자동화, 보안 검증 |
| Rate Limiting | In-Memory Map (Phase 1) → Upstash Redis (Phase 2) | 단계적 최적화 |
| Profile 생성 | Supabase Trigger (SECURITY DEFINER) | 자동화, 일관성 보장 |

### Architecture Decision

```
User Login/Signup
├── Email/Password → Direct Supabase Auth
│   └── profiles 자동 생성 (Trigger)
│
└── Google OAuth → NextAuth → Supabase Sync
    └── signInWithIdToken() → profiles 자동 생성

모든 세션 확인 → Supabase Session (Single Source of Truth)
```

**다음 단계**: `/speckit.tasks` 실행 → 구현 작업을 세부 태스크로 분할
