# 기술 연구: 인증 시스템

**작성일**: 2025-11-16
**상태**: 완료

## 개요

이 문서는 Supabase Auth + NextAuth.js 기반 인증 시스템 구현을 위한 기술적 결정사항을 연구합니다.

---

## Research 1: Supabase Auth + NextAuth 세션 동기화

### 연구 질문
Supabase Auth와 NextAuth.js를 함께 사용할 때 세션 동기화 전략은?

### 아키텍처 결정 (명세서 기반)

**결정**: **Supabase Auth = Single Source of Truth, NextAuth = OAuth 래퍼**

```
┌──────────────────┐
│   User Login     │
└────────┬─────────┘
         │
    ┌────┴────┐
    │         │
┌───▼───┐  ┌─▼────────┐
│Email/ │  │ Google   │
│Pass   │  │ OAuth    │
└───┬───┘  └─┬────────┘
    │        │
    │    ┌───▼────────┐
    │    │  NextAuth  │ (OAuth만)
    │    └───┬────────┘
    │        │
┌───▼────────▼────┐
│  Supabase Auth  │ (진실 원천)
└────────┬─────────┘
         │
┌────────▼─────────┐
│ Supabase Session │
│  + NextAuth JWT  │
└──────────────────┘
```

### 구현 패턴

**1. 이메일/비밀번호 로그인** (Supabase Auth 직접)
```typescript
// app/login/page.tsx
import { createClient } from '@/lib/supabase/client';

async function handleLogin(email: string, password: string) {
  const supabase = createClient();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;

  // Supabase 세션이 자동으로 쿠키에 저장됨
  // NextAuth 세션은 필요 없음 (이메일/비밀번호는 Supabase만 사용)
}
```

**2. Google OAuth** (NextAuth → Supabase 동기화)
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  callbacks: {
    async signIn({ user, account }) {
      // NextAuth Google 로그인 성공 시
      // Supabase에 사용자 생성/업데이트
      if (account?.provider === 'google') {
        const { data } = await supabase.auth.admin.createUser({
          email: user.email!,
          email_confirm: true,
          user_metadata: {
            name: user.name,
            avatar_url: user.image,
          },
        });

        // Supabase 세션 생성
        const { data: session } = await supabase.auth.setSession({
          access_token: data.user.id, // 임시
          refresh_token: data.user.id,
        });
      }

      return true;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### 세션 확인 패턴

```typescript
// lib/auth/get-session.ts (Server Component용)
import { createServerClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = createServerClient();
  const { data: { session } } = await supabase.auth.getSession();
  return session;
}
```

### 핵심 원칙
1. **이메일/비밀번호**: Supabase Auth만 사용
2. **Google OAuth**: NextAuth → Supabase 동기화
3. **세션 확인**: 항상 Supabase 세션 사용
4. **RLS 정책**: Supabase `auth.uid()` 사용

---

## Research 2: 비밀번호 재설정 플로우

### 연구 질문
Supabase Auth의 비밀번호 재설정 기능을 어떻게 구현하는가?

### 결정: Supabase 내장 비밀번호 재설정 사용

**장점**:
- ✅ 이메일 발송 자동화
- ✅ 토큰 관리 자동화
- ✅ 보안 검증 자동화

**구현 플로우**:

```
1. /forgot-password 페이지
   └─► supabase.auth.resetPasswordForEmail()
        └─► Supabase 이메일 발송 (재설정 링크)

2. 사용자 이메일 클릭
   └─► /reset-password?token=xxx
        └─► supabase.auth.updateUser({ password: newPassword })
             └─► 비밀번호 변경 완료
```

### 구현 코드

**1. 비밀번호 재설정 요청**
```typescript
// app/forgot-password/page.tsx
async function handleResetRequest(email: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
  // "이메일을 확인해주세요" 메시지 표시
}
```

**2. 비밀번호 변경**
```typescript
// app/reset-password/page.tsx
async function handlePasswordUpdate(newPassword: string) {
  const supabase = createClient();

  const { error } = await supabase.auth.updateUser({
    password: newPassword,
  });

  if (error) throw error;
  // 로그인 페이지로 리다이렉트
}
```

### 이메일 템플릿 커스터마이징

Supabase Dashboard → Authentication → Email Templates → Reset Password

```html
<h2>비밀번호 재설정</h2>
<p>아래 링크를 클릭하여 비밀번호를 재설정하세요:</p>
<a href="{{ .ConfirmationURL }}">비밀번호 재설정</a>
<p>이 링크는 1시간 후 만료됩니다.</p>
```

---

## Research 3: Rate Limiting 구현

### 연구 질문
IP + 계정 기반 Rate Limiting을 어떻게 구현하는가?

### 옵션 비교

| 옵션 | 장점 | 단점 | 비용 | 적합성 |
|------|------|------|------|--------|
| **Vercel Edge Config** | Next.js 통합 | 복잡한 로직 어려움 | $20+/월 | ⭐⭐ |
| **Upstash Redis** | Redis 기능 전체 | 추가 서비스 | $10+/월 | ⭐⭐⭐⭐ |
| **In-Memory Map** | Zero cost | 서버 재시작 시 초기화 | $0 | ⭐⭐⭐ |

### 결정: In-Memory Map (Phase 1) → Upstash Redis (Phase 2)

**Phase 1 구현** (간단, 무료):
```typescript
// lib/auth/rate-limiter.ts
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkRateLimit(identifier: string): boolean {
  const now = Date.now();
  const attempt = loginAttempts.get(identifier);

  if (!attempt || now > attempt.resetAt) {
    // 첫 시도 또는 기간 만료
    loginAttempts.set(identifier, {
      count: 1,
      resetAt: now + 5 * 60 * 1000, // 5분
    });
    return true;
  }

  if (attempt.count >= 5) {
    // 5회 초과 → 차단
    return false;
  }

  // 카운트 증가
  attempt.count++;
  return true;
}

// 사용 예시
const ip = request.headers.get('x-forwarded-for') || 'unknown';
const identifier = `${ip}:${email}`;

if (!checkRateLimit(identifier)) {
  throw new Error('너무 많은 로그인 시도. 5분 후 다시 시도하세요.');
}
```

**Phase 2 구현** (프로덕션):
```typescript
import { Redis } from '@upstash/redis';

const redis = Redis.fromEnv();

export async function checkRateLimit(identifier: string): Promise<boolean> {
  const key = `ratelimit:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, 300); // 5분
  }

  return count <= 5;
}
```

---

## Research 4: Google OAuth NextAuth 통합

### 연구 질문
Google OAuth를 NextAuth로 구현하고 Supabase와 동기화하는 방법은?

### 구현 단계

**1. Google Cloud Console 설정**
- OAuth 2.0 클라이언트 ID 생성
- Authorized redirect URIs: `http://localhost:3001/api/auth/callback/google`
- Client ID, Client Secret 저장

**2. NextAuth 설정**
```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    }),
  ],
  pages: {
    signIn: '/login',
    error: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      // Google 로그인 성공 시 Supabase에 동기화
      if (account?.provider === 'google') {
        try {
          const supabase = createClient();

          // Supabase에 사용자 생성/가져오기
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: account.id_token!,
          });

          if (error) {
            console.error('Supabase sync error:', error);
            return false;
          }

          return true;
        } catch (error) {
          console.error('OAuth error:', error);
          return false;
        }
      }

      return true;
    },
  },
};
```

**3. 로그인 버튼**
```typescript
// components/auth/GoogleButton.tsx
'use client';

import { signIn } from 'next-auth/react';

export function GoogleButton() {
  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full"
    >
      <GoogleIcon />
      <span>Google로 계속하기</span>
    </button>
  );
}
```

---

## 최종 기술 스택 결정

### Architecture Overview

```
┌─────────────────────┐
│   Login/Signup UI   │
└──────────┬──────────┘
           │
      ┌────┴─────┐
      │          │
┌─────▼───┐  ┌──▼────────┐
│Supabase │  │ NextAuth  │
│ Auth    │  │ (OAuth)   │
│(Email/  │  │           │
│ Pass)   │  │           │
└─────┬───┘  └──┬────────┘
      │         │
      └────┬────┘
           │
    ┌──────▼───────┐
    │   Supabase   │
    │   Session    │
    │  (진실 원천)  │
    └──────────────┘
```

### 선택된 기술
1. **세션 관리**: Supabase Auth (진실 원천), NextAuth (OAuth 래퍼)
2. **비밀번호 재설정**: Supabase 내장 기능
3. **Rate Limiting**: In-Memory Map (Phase 1) → Upstash Redis (Phase 2)
4. **OAuth**: NextAuth GoogleProvider

### 성능 목표
- 로그인: < 500ms (명세서 요구사항)
- OAuth 왕복: < 2초 (명세서 요구사항)
- Rate Limit 체크: < 10ms

---

## 다음 단계

✅ 모든 기술 결정 완료
📋 **Phase 1**: 데이터 모델 및 API 계약 설계
