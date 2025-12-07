# 구현 태스크: 인증 시스템 완성

**Feature**: 인증 시스템
**생성일**: 2025-11-16
**상태**: 준비됨

---

## 개요

이 문서는 완전한 인증 시스템(로그인, 회원가입, OAuth, 비밀번호 재설정) 구현을 위한 세부 태스크 목록입니다.

---

## Implementation Strategy

### MVP Scope (User Story 1 + 2)
최소 기능 제품은 **US1 (회원가입)** + **US2 (로그인)**로 구성됩니다. 이메일/비밀번호 기본 인증만으로 출시 가능합니다.

### Incremental Delivery
- **Sprint 1**: Setup + Foundational + US1 + US2 (기본 인증)
- **Sprint 2**: US3 (Google OAuth) + US4 (비밀번호 재설정)
- **Sprint 3**: US5 (이메일 인증) + US6 (세션 관리) + US7 (프로필 페이지)

---

## Phases & Tasks

### Phase 1: Setup (프로젝트 초기화)

**목표**: Supabase Auth 설정, profiles 테이블 생성, Google OAuth 앱 등록

**독립 테스트 기준**:
- ✅ Supabase `profiles` 테이블 존재
- ✅ 트리거 함수 작동 (auth.users 생성 시 profiles 자동 생성)
- ✅ Google OAuth Client ID 발급 완료

#### Tasks

- [X] T001 Supabase에서 profiles 테이블 생성 (migrations/002_create_profiles.sql)
- [X] T002 Supabase에서 RLS 정책 설정 (migrations/002_create_profiles.sql)
- [X] T003 Supabase에서 인덱스 생성 (migrations/002_create_profiles.sql)
- [X] T004 Supabase에서 handle_new_user() 트리거 함수 생성 (migrations/002_create_profiles.sql)
- [X] T005 Supabase에서 on_auth_user_created 트리거 연결 (migrations/002_create_profiles.sql)
- [ ] T006 [P] Google Cloud Console에서 OAuth 앱 생성 (수동)
- [ ] T007 [P] Google OAuth Client ID/Secret 발급 (수동)
- [X] T008 [P] 환경 변수 .env.local 설정 (GOOGLE_*, NEXTAUTH_*)
- [X] T009 Supabase Auth 설정 확인 및 Migration 실행 완료

**완료 조건**: 트리거 테스트 (auth.users 생성 → profiles 자동 생성)

---

### Phase 2: Foundational (기반 코드)

**목표**: 타입 정의, Supabase/NextAuth 클라이언트, 유틸리티 함수

**독립 테스트 기준**:
- ✅ TypeScript 컴파일 오류 없음
- ✅ Supabase Client 연결 성공

#### Tasks

- [X] T010 [P] Profile 타입 정의 (lib/types/auth.ts)
- [X] T011 [P] User 타입 정의 (lib/types/auth.ts)
- [X] T012 [P] Supabase Server Client 헬퍼 (lib/supabase/server.ts)
- [X] T013 [P] Supabase Browser Client 헬퍼 (lib/supabase/client.ts)
- [X] T014 [P] NextAuth 설정 파일 (app/api/auth/[...nextauth]/route.ts)
- [X] T015 [P] NextAuth CredentialsProvider 구현 (app/api/auth/[...nextauth]/route.ts)
- [X] T016 [P] 폼 검증 유틸리티 (lib/auth/validation.ts)

**완료 조건**: 모든 타입 파일 import 시 오류 없음

---

### Phase 3: US1 - 회원가입 페이지

**User Story**: "신규 사용자가 이메일/비밀번호로 계정을 생성할 수 있다"

**독립 테스트 기준**:
- ✅ `/signup` 페이지 접속 → 회원가입 폼 표시
- ✅ 유효한 정보 입력 후 제출 → Supabase에 계정 생성 + profiles 자동 생성
- ✅ 이메일 중복 시 오류 메시지 표시

#### Tasks

- [X] T017 [P] [US1] 회원가입 페이지 생성 (app/signup/page.tsx)
- [X] T018 [P] [US1] SignupForm 컴포넌트 (components/auth/SignupForm.tsx)
- [X] T019 [US1] 이메일 필드 검증 (실시간)
- [X] T020 [US1] 비밀번호 필드 검증 (최소 8자, 영문+숫자)
- [X] T021 [US1] 비밀번호 확인 필드 검증 (일치 여부)
- [X] T022 [US1] 비밀번호 강도 표시기 (약함/보통/강함)
- [X] T023 [US1] 이용약관 체크박스 (필수)
- [X] T024 [US1] Supabase signUp 함수 호출 (lib/auth/signup.ts)
- [X] T025 [US1] 이메일 중복 오류 처리
- [X] T026 [US1] 회원가입 성공 시 "이메일 확인" 화면 표시

**완료 조건**:
- 회원가입 완료 후 Supabase에 auth.users + profiles 레코드 생성
- 이메일 인증 메일 수신 (Supabase 자동 발송)

**병렬 실행 가능**: T017, T018 (독립 컴포넌트)

---

### Phase 4: US2 - 로그인 페이지

**User Story**: "기존 사용자가 이메일/비밀번호로 로그인할 수 있다"

**독립 테스트 기준**:
- ✅ `/login` 페이지 접속 → 로그인 폼 표시
- ✅ 올바른 이메일/비밀번호 입력 → 로그인 성공, 세션 생성
- ✅ 잘못된 비밀번호 입력 → "이메일 또는 비밀번호가 올바르지 않습니다" 오류

#### Tasks

- [X] T027 [P] [US2] 로그인 페이지 생성 (app/login/page.tsx)
- [X] T028 [P] [US2] LoginForm 컴포넌트 (components/auth/LoginForm.tsx)
- [X] T029 [US2] 이메일 필드 검증
- [X] T030 [US2] 비밀번호 필드 검증
- [X] T031 [US2] "로그인 유지" 체크박스 (기본값: 체크됨)
- [X] T032 [US2] Supabase signInWithPassword 함수 호출 (lib/auth/login.ts)
- [X] T033 [US2] NextAuth CredentialsProvider authorize 함수 구현
- [X] T034 [US2] 로그인 실패 오류 처리 (명확한 메시지)
- [X] T035 [US2] Rate Limiting 구현 (In-Memory Map, IP 5회)
- [X] T036 [US2] Rate Limiting 구현 (계정 3회)
- [X] T037 [US2] 로그인 성공 시 원래 URL로 리다이렉트 (callbackUrl)

**완료 조건**:
- 로그인 성공 후 NextAuth 세션 생성 + Supabase 세션 동기화
- Header에서 로그인 상태 표시 ("로그아웃" 버튼 보임)

**병렬 실행 가능**: T027, T028 (독립 컴포넌트), T035, T036 (독립 로직)

---

### Phase 5: US3 - Google OAuth 통합

**User Story**: "사용자가 Google 계정으로 간편 로그인할 수 있다"

**독립 테스트 기준**:
- ✅ 로그인 페이지에 "Google로 계속하기" 버튼 표시
- ✅ 버튼 클릭 → Google OAuth 팝업 → 계정 선택 → 로그인 성공
- ✅ 첫 로그인 시 프로필 정보 (이름, 이미지) 자동 저장

#### Tasks

- [X] T038 [P] [US3] NextAuth GoogleProvider 설정 (Phase 2에서 완료: lib/auth/config.ts)
- [X] T039 [US3] Google OAuth 콜백 처리 (Phase 2에서 완료: lib/auth/config.ts signIn callback)
- [X] T040 [US3] Supabase signInWithIdToken 통합 (NextAuth가 자동 처리)
- [X] T041 [US3] Google 프로필 정보 Supabase 동기화 (Phase 2에서 완료: signIn callback)
- [X] T042 [P] [US3] "Google로 계속하기" 버튼 컴포넌트 (Phase 4에서 완료: LoginForm)
- [X] T043 [US3] LoginForm에서 Google 버튼 표시 (Phase 4에서 완료)
- [X] T044 [US3] 기존 계정 자동 연동 (Phase 2에서 완료: email 기반 매칭)

**완료 조건**:
- Google 로그인 후 Supabase + NextAuth 세션 생성
- profiles 테이블에 이름, 프로필 이미지 저장

**병렬 실행 가능**: T038 ~ T040 (독립 파일), T042 (독립 컴포넌트)

---

### Phase 6: US4 - 비밀번호 재설정

**User Story**: "비밀번호를 잊은 사용자가 이메일로 재설정할 수 있다"

**독립 테스트 기준**:
- ✅ "비밀번호를 잊으셨나요?" 클릭 → 이메일 입력 페이지
- ✅ 이메일 입력 후 제출 → 재설정 링크 이메일 수신
- ✅ 링크 클릭 → 새 비밀번호 입력 페이지 → 변경 성공

#### Tasks

- [X] T045 [P] [US4] 비밀번호 찾기 페이지 (app/forgot-password/page.tsx)
- [X] T046 [P] [US4] 비밀번호 재설정 페이지 (app/reset-password/page.tsx)
- [X] T047 [US4] ForgotPasswordForm 컴포넌트 (components/auth/ForgotPasswordForm.tsx)
- [X] T048 [US4] ResetPasswordForm 컴포넌트 (components/auth/ResetPasswordForm.tsx)
- [X] T049 [US4] Supabase resetPasswordForEmail 함수 호출 (lib/auth/reset-password.ts)
- [X] T050 [US4] Supabase updateUser 함수 호출 (새 비밀번호 설정)
- [X] T051 [US4] 토큰 검증 및 만료 처리 (Supabase 자동 처리)
- [X] T052 [US4] 재설정 성공 시 로그인 페이지로 리다이렉트

**완료 조건**:
- 비밀번호 재설정 링크 이메일 수신
- 새 비밀번호로 로그인 가능

**병렬 실행 가능**: T045, T046 (독립 페이지), T047, T048 (독립 컴포넌트)

---

### Phase 7: US5 - 이메일 인증

**User Story**: "회원가입 시 이메일 소유권을 확인한다"

**독립 테스트 기준**:
- ✅ 회원가입 후 이메일 인증 메일 수신
- ✅ 인증 링크 클릭 → email_confirmed_at 설정
- ✅ 미인증 상태로 로그인 → "이메일 인증 필요" 배너 표시

#### Tasks

- [X] T053 [US5] 이메일 인증 안내 페이지 (app/verify-email/page.tsx)
- [X] T054 [US5] 인증 완료 콜백 페이지 (app/auth/callback/route.ts)
- [X] T055 [P] [US5] 미인증 배너 컴포넌트 (components/auth/EmailVerificationBanner.tsx)
- [X] T056 [US5] 인증 메일 재발송 기능 (lib/auth/resend-verification.ts)
- [X] T057 [US5] 1분 쿨다운 로직 (Rate Limiting)
- [X] T058 [US5] 로그인 시 email_confirmed_at 확인 (middleware.ts 또는 layout)
- [X] T059 [US5] 미인증 시 배너 표시

**완료 조건**:
- 이메일 인증 링크 클릭 후 로그인 가능
- 미인증 상태에서 배너 표시

**병렬 실행 가능**: T053, T054 (독립 페이지), T055 (독립 컴포넌트)

---

### Phase 8: US6 - 세션 관리

**User Story**: "사용자 로그인 상태를 안전하게 유지하고 관리한다"

**독립 테스트 기준**:
- ✅ "로그인 유지" 체크 → 브라우저 닫고 재실행 → 여전히 로그인 상태
- ✅ "로그인 유지" 미체크 → 브라우저 닫으면 로그아웃
- ✅ Header "로그아웃" 버튼 클릭 → 세션 삭제 → 홈페이지 리다이렉트

#### Tasks

- [X] T060 [US6] NextAuth 세션 설정 (maxAge, updateAge)
- [X] T061 [US6] "로그인 유지" 체크 시 30일 세션 (LoginForm)
- [X] T062 [US6] 미체크 시 브라우저 세션 (session: false)
- [X] T063 [P] [US6] 로그아웃 API Route (app/api/auth/signout/route.ts)
- [X] T064 [US6] Supabase 세션 무효화 (signOut)
- [X] T065 [US6] NextAuth 세션 무효화
- [X] T066 [P] [US6] Header 로그아웃 버튼 (components/Header.tsx)
- [X] T067 [US6] 세션 자동 갱신 로직 (NextAuth 기본 제공)

**완료 조건**:
- 로그인 상태 지속성 (30일 vs 브라우저 세션)
- 로그아웃 후 프리미엄 콘텐츠 접근 차단

**병렬 실행 가능**: T060 ~ T062 (독립 로직), T063 ~ T065 (독립 API), T066 (독립 컴포넌트)

---

### Phase 9: US7 - 사용자 프로필 페이지

**User Story**: "로그인한 사용자가 자신의 프로필을 볼 수 있다"

**독립 테스트 기준**:
- ✅ `/profile` 페이지 접속 → 프로필 정보 (이름, 이메일, 가입일, 구독 상태) 표시
- ✅ 비로그인 상태로 `/profile` 접근 → 로그인 페이지로 리다이렉트

#### Tasks

- [X] T068 [P] [US7] 프로필 페이지 생성 (app/profile/page.tsx)
- [X] T069 [P] [US7] ProfileCard 컴포넌트 (components/profile/ProfileCard.tsx)
- [X] T070 [US7] 프로필 데이터 조회 (lib/auth/get-profile.ts)
- [X] T071 [US7] 구독 상태 표시 (구독 테이블 조인 쿼리)
- [X] T072 [US7] "구독 관리" 버튼 (활성 구독 시만)
- [X] T073 [US7] 기본 아바타 이미지 (Gravatar or Placeholder)
- [X] T074 [US7] Header에서 사용자 아이콘 추가 → 프로필 링크

**완료 조건**:
- 프로필 페이지에서 사용자 정보 표시
- Header 아이콘 클릭 → 프로필 페이지 이동

**병렬 실행 가능**: T068, T069 (독립 페이지/컴포넌트)

---

### Phase 10: Polish & Cross-Cutting Concerns

**목표**: 에러 처리, 로딩 상태, 로깅, 접근성

**독립 테스트 기준**:
- ✅ 폼 제출 중 로딩 스피너 표시
- ✅ 에러 발생 시 Toast 알림 표시

#### Tasks

- [ ] T075 [P] 로딩 스피너 컴포넌트 (components/ui/LoadingSpinner.tsx)
- [ ] T076 [P] Toast 알림 컴포넌트 (components/ui/Toast.tsx)
- [ ] T077 [P] 폼 제출 중 로딩 상태 (모든 폼)
- [ ] T078 [P] 비밀번호 보기/숨기기 토글 (모든 비밀번호 필드)
- [ ] T079 [P] 키보드 네비게이션 지원 (Tab, Enter)
- [ ] T080 [P] ARIA 라벨 추가 (스크린 리더)
- [ ] T081 [P] 에러 로깅 (Sentry 또는 Console)
- [ ] T082 Rate Limiting을 Upstash Redis로 마이그레이션 (Phase 2, 선택)

**완료 조건**:
- 모든 폼에서 로딩/에러 상태 명확히 표시
- 접근성 테스트 통과

**병렬 실행 가능**: T075 ~ T081 (모두 독립 작업)

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
US3 (Phase 5) ← US2 완료 후 (NextAuth 설정 필요)
  ↓
US4 (Phase 6) ← US1 완료 후 (Supabase Auth 설정 재사용)
  ↓
US5 (Phase 7) ← US1 완료 후 (회원가입 플로우 의존)
  ↓
US6 (Phase 8) ← US2 완료 후 (세션 로직 의존)
  ↓
US7 (Phase 9) ← US2 + 구독 테이블 완료 후
  ↓
Polish (Phase 10) ← 모든 US 완료 후
```

### 핵심 블로킹 종속성

- **US3 (OAuth)은 US2 완료 필요**: NextAuth 기본 설정 필요
- **US7 (프로필)은 구독 기능 필요**: 구독 상태 표시를 위해 subscriptions 테이블 필요
- **모든 US는 Setup/Foundational 완료 필요**

---

## Parallel Execution Examples

### Sprint 1 (Week 1)

**병렬 실행 가능**:
- Developer A: Phase 1 (Setup) → Phase 3 (US1 - 회원가입)
- Developer B: Phase 2 (Foundational) → Phase 4 (US2 - 로그인)

### Sprint 2 (Week 2)

**순차 실행 (US2 완료 후)**:
- Developer A: Phase 5 (US3 - Google OAuth)
- Developer B: Phase 6 (US4 - 비밀번호 재설정)
- Developer C: Phase 7 (US5 - 이메일 인증)

### Sprint 3 (Week 3)

**병렬 실행**:
- Developer A: Phase 8 (US6 - 세션 관리)
- Developer B: Phase 9 (US7 - 프로필 페이지)
- Developer C: Phase 10 (Polish - T075 ~ T081)

---

## Testing Strategy

### Unit Tests (선택 사항)
- `lib/auth/validation.ts` - 폼 검증 로직
- `lib/auth/login.ts` - 로그인 함수
- `lib/auth/signup.ts` - 회원가입 함수

### Integration Tests
- Supabase Auth 회원가입 → profiles 자동 생성
- Google OAuth → Supabase 동기화

### E2E Tests
- 회원가입 → 이메일 인증 → 로그인 → 프로필 조회
- 비밀번호 재설정 플로우

---

## Summary

- **총 태스크 수**: 82개
- **MVP 태스크 수**: 37개 (Phase 1~4)
- **병렬 실행 가능**: 35개 태스크 ([P] 마커)
- **User Story별 태스크 수**:
  - Setup: 9개
  - Foundational: 7개
  - US1: 10개
  - US2: 11개
  - US3: 7개
  - US4: 8개
  - US5: 7개
  - US6: 8개
  - US7: 7개
  - Polish: 8개

---

## Next Steps

1. ✅ **MVP Sprint 계획**: Setup + Foundational + US1 + US2 (2주)
2. ⏳ **Phase 1 시작**: Supabase profiles 테이블 생성부터
3. 📋 **Daily Standup**: 매일 진행 상황 공유

---

**생성일**: 2025-11-16
**작성자**: `/speckit.tasks` Automation
