# API Contract: Google OAuth (NextAuth)

**Endpoints**:
1. `POST /api/auth/signin/google` - OAuth 시작
2. `GET /api/auth/callback/google` - OAuth 콜백
3. `POST /api/auth/signout` - 로그아웃

**Provider**: NextAuth.js + Supabase Auth 동기화
**Purpose**: Google 계정으로 간편 로그인

---

## Flow Overview

```
┌────────────────────┐
│ User: "Google 로그인" │
└─────────┬──────────┘
          │
          ▼
┌─────────────────────────────┐
│ NextAuth: Google OAuth 시작  │
│ → Google 로그인 페이지로 이동 │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ User: Google 계정 선택        │
│ + 권한 승인                  │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ Google: ID Token 반환        │
│ → /api/auth/callback/google │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ NextAuth Callback:           │
│ 1. Google ID Token 검증      │
│ 2. Supabase 동기화           │
│ 3. Profile 자동 생성         │
└─────────┬───────────────────┘
          │
          ▼
┌─────────────────────────────┐
│ ✅ 로그인 완료                │
│ → 홈페이지로 리다이렉트        │
└─────────────────────────────┘
```

---

## 1. OAuth Start Endpoint

### Request

**Client-side Code**:
```typescript
import { signIn } from 'next-auth/react';

// Google OAuth 시작
await signIn('google', {
  callbackUrl: string, // 로그인 후 리다이렉트 URL (기본: '/')
});
```

### Parameters

| 필드 | 타입 | Required | 설명 |
|------|------|----------|------|
| `callbackUrl` | string | ⚪ Optional | 로그인 성공 후 리다이렉트 URL (기본: '/') |

### Response

**Redirect**: Google OAuth 로그인 페이지로 자동 리다이렉트

```
https://accounts.google.com/o/oauth2/v2/auth?
  client_id=YOUR_GOOGLE_CLIENT_ID&
  redirect_uri=http://localhost:3001/api/auth/callback/google&
  response_type=code&
  scope=openid%20email%20profile
```

---

## 2. OAuth Callback Endpoint

### Request

**자동 호출** (Google에서 리다이렉트):
```
GET /api/auth/callback/google?code=GOOGLE_AUTH_CODE&state=STATE_TOKEN
```

### NextAuth Configuration

```typescript
// app/api/auth/[...nextauth]/route.ts
import NextAuth, { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export const authOptions: NextAuthOptions = {
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
    async signIn({ user, account, profile }) {
      // Google OAuth 성공 시 Supabase 동기화
      if (account?.provider === 'google') {
        try {
          // Supabase에 사용자 생성 또는 업데이트
          const { data, error } = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: account.id_token!,
          });

          if (error) {
            console.error('Supabase sync error:', error);
            return false; // 로그인 차단
          }

          return true; // 로그인 허용
        } catch (error) {
          console.error('OAuth error:', error);
          return false;
        }
      }

      return true;
    },
    async jwt({ token, user }) {
      // JWT 토큰에 사용자 ID 추가
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      // 세션에 사용자 ID 추가
      if (session.user) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST };
```

### Response

**Success**: Redirect to `callbackUrl`
```
302 Redirect → http://localhost:3001/
Set-Cookie: next-auth.session-token=...; HttpOnly; Secure; SameSite=Lax
```

**Error**: Redirect to `/login?error=...`
```
302 Redirect → http://localhost:3001/login?error=OAuthSignin
```

---

## 3. Signout Endpoint

### Request

```typescript
import { signOut } from 'next-auth/react';

// 로그아웃
await signOut({
  callbackUrl: string, // 로그아웃 후 리다이렉트 URL (기본: '/')
});
```

### Response

```
302 Redirect → http://localhost:3001/
Set-Cookie: next-auth.session-token=; Expires=Thu, 01 Jan 1970 00:00:00 GMT
```

---

## Supabase Synchronization

### signInWithIdToken() Flow

```typescript
// NextAuth callback 내부
const { data, error } = await supabase.auth.signInWithIdToken({
  provider: 'google',
  token: account.id_token!, // Google에서 받은 ID Token
});
```

**Supabase 동작**:
1. Google ID Token 검증
2. `auth.users` 테이블에 사용자 생성 또는 업데이트
   - `email`: Google 이메일
   - `email_confirmed_at`: 현재 시각 (Google에서 이미 인증됨)
   - `raw_user_meta_data.name`: Google 이름
   - `raw_user_meta_data.avatar_url`: Google 프로필 이미지
3. Trigger 자동 실행 → `public.profiles` 생성
4. Supabase 세션 생성 (access_token, refresh_token)

---

## Session Management

### Client-side Session Check

```typescript
// Client Component
'use client';

import { useSession } from 'next-auth/react';

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <p>Loading...</p>;
  }

  if (status === 'unauthenticated') {
    return <p>Not logged in</p>;
  }

  return (
    <div>
      <h1>Welcome, {session?.user?.name}!</h1>
      <img src={session?.user?.image || ''} alt="Profile" />
      <p>{session?.user?.email}</p>
    </div>
  );
}
```

### Server-side Session Check

```typescript
// Server Component
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { redirect } from 'next/navigation';

export default async function ProtectedPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login?callbackUrl=/protected');
  }

  return (
    <div>
      <h1>Protected Content</h1>
      <p>Only logged-in users can see this.</p>
    </div>
  );
}
```

---

## Implementation Example

### 1. Google Login Button

```typescript
// components/auth/GoogleButton.tsx
'use client';

import { signIn } from 'next-auth/react';

export function GoogleButton() {
  return (
    <button
      onClick={() => signIn('google', { callbackUrl: '/' })}
      className="flex items-center gap-2 px-6 py-3 border border-gray-300 rounded-full hover:bg-gray-50"
    >
      <svg className="w-5 h-5" viewBox="0 0 24 24">
        {/* Google Icon SVG */}
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
      </svg>
      <span>Google로 계속하기</span>
    </button>
  );
}
```

### 2. Login Page with OAuth

```typescript
// app/login/page.tsx
import { GoogleButton } from '@/components/auth/GoogleButton';

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">로그인</h1>

      {/* Google OAuth */}
      <GoogleButton />

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-300"></div>
        <span className="px-4 text-gray-500">또는</span>
        <div className="flex-1 border-t border-gray-300"></div>
      </div>

      {/* Email/Password Form */}
      <form>
        {/* ... 이메일/비밀번호 폼 ... */}
      </form>
    </div>
  );
}
```

---

## Google Cloud Console Setup

### Prerequisites

1. **Google Cloud Console** 접속: https://console.cloud.google.com
2. 새 프로젝트 생성 또는 기존 프로젝트 선택

### Step 1: OAuth Consent Screen

1. **APIs & Services** → **OAuth consent screen**
2. **User Type**: External 선택
3. 앱 정보 입력:
   - App name: `CryptoTitan`
   - User support email: `your-email@example.com`
   - Developer contact information: `your-email@example.com`
4. **Scopes** 추가:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
5. **Save and Continue**

### Step 2: Create OAuth Client ID

1. **Credentials** → **Create Credentials** → **OAuth client ID**
2. **Application type**: Web application
3. **Name**: `CryptoTitan Web Client`
4. **Authorized JavaScript origins**:
   - `http://localhost:3001` (개발)
   - `https://yourdomain.com` (프로덕션)
5. **Authorized redirect URIs**:
   - `http://localhost:3001/api/auth/callback/google` (개발)
   - `https://yourdomain.com/api/auth/callback/google` (프로덕션)
6. **Create**

### Step 3: Save Credentials

복사된 Client ID와 Client Secret을 `.env.local`에 추가:
```env
GOOGLE_CLIENT_ID=123456789-abcdefg.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## Security Considerations

### 1. CSRF Protection

- ✅ NextAuth가 자동으로 `state` 파라미터 생성 및 검증
- ✅ CSRF 토큰을 세션에 저장하여 콜백 검증

### 2. Token Validation

```typescript
// NextAuth가 자동으로 처리
// 1. Google ID Token 서명 검증
// 2. Token expiration 확인
// 3. Audience (client_id) 확인
```

### 3. Secure Cookie Settings

```typescript
// NextAuth 자동 설정
cookies: {
  sessionToken: {
    name: `next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: process.env.NODE_ENV === 'production', // HTTPS만
    },
  },
}
```

---

## Error Handling

### Common OAuth Errors

| Error Code | 설명 | 사용자 메시지 |
|------------|------|---------------|
| `OAuthSignin` | OAuth 시작 실패 | "Google 로그인을 시작할 수 없습니다." |
| `OAuthCallback` | 콜백 검증 실패 | "Google 로그인에 실패했습니다." |
| `OAuthAccountNotLinked` | 이메일이 다른 방법으로 가입됨 | "이미 다른 방법으로 가입된 이메일입니다." |

### Error Handling Component

```typescript
// app/login/page.tsx
'use client';

import { useSearchParams } from 'next/navigation';

export default function LoginPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  return (
    <div>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {getOAuthErrorMessage(error)}
        </div>
      )}
      {/* Login form */}
    </div>
  );
}

function getOAuthErrorMessage(error: string): string {
  switch (error) {
    case 'OAuthSignin':
      return 'Google 로그인을 시작할 수 없습니다. 다시 시도해주세요.';
    case 'OAuthCallback':
      return 'Google 로그인에 실패했습니다. 다시 시도해주세요.';
    case 'OAuthAccountNotLinked':
      return '이미 다른 방법으로 가입된 이메일입니다. 이메일/비밀번호로 로그인하세요.';
    default:
      return '로그인 중 오류가 발생했습니다.';
  }
}
```

---

## Testing

### Test Cases

```typescript
// __tests__/auth/oauth.test.ts
describe('Google OAuth', () => {
  it('should redirect to Google login page', async () => {
    const response = await fetch('/api/auth/signin/google');
    expect(response.status).toBe(302);
    expect(response.headers.get('location')).toContain('accounts.google.com');
  });

  it('should create Supabase user on successful OAuth', async () => {
    // Mock Google OAuth response
    // ...

    // Verify Supabase user created
    const { data: user } = await supabase
      .from('auth.users')
      .select('*')
      .eq('email', 'test@gmail.com')
      .single();

    expect(user).toBeDefined();
  });

  it('should auto-create profile on OAuth signup', async () => {
    // Mock Google OAuth response
    // ...

    // Verify profile created
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('email', 'test@gmail.com')
      .single();

    expect(profile.name).toBe('Test User');
    expect(profile.avatar_url).toContain('googleusercontent.com');
  });
});
```

---

## Performance Metrics

**목표** (명세서 요구사항):
- OAuth 왕복 시간: < 2초

**측정 포인트**:
```typescript
const startTime = performance.now();
await signIn('google');
// ... OAuth flow ...
// ... callback ...
const duration = performance.now() - startTime;

console.log(`OAuth flow took ${duration}ms`); // Should be < 2000ms
```

---

## Related Documents

- [Login API Contract](./login-api.md)
- [Signup API Contract](./signup-api.md)
- [Data Model](../data-model.md)
- [Research: Google OAuth Integration](../research/research.md)

---

**작성 완료**: 2025-11-16
