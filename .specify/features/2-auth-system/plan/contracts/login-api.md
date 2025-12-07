# API Contract: 로그인 (이메일/비밀번호)

**Endpoint**: Client-side Supabase Auth SDK (직접 호출)
**Method**: `supabase.auth.signInWithPassword()`
**Purpose**: 이메일/비밀번호 기반 로그인

---

## Request

### Client-side Code

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase.auth.signInWithPassword({
  email: string,
  password: string,
});
```

### Parameters

| 필드 | 타입 | Required | 설명 |
|------|------|----------|------|
| `email` | string | ✅ Yes | 이메일 주소 |
| `password` | string | ✅ Yes | 비밀번호 |

---

## Response

### Success (200 OK)

```typescript
{
  data: {
    user: {
      id: string; // UUID
      email: string;
      email_confirmed_at: string; // ISO 8601
      last_sign_in_at: string; // ISO 8601
      user_metadata: {
        name?: string;
        avatar_url?: string;
      };
      // ...
    };
    session: {
      access_token: string; // JWT
      refresh_token: string;
      expires_in: number; // 초 단위 (기본 3600)
      expires_at: number; // Unix timestamp
      token_type: "bearer";
      user: User; // 위와 동일
    };
  };
  error: null;
}
```

**Session Handling**:
- Supabase SDK가 자동으로 `localStorage`에 세션 저장
- Cookie도 자동으로 설정 (Server Components에서 사용)
- `expires_in` 이후 자동 갱신 (refresh_token 사용)

### Error Responses

#### 1. 잘못된 자격 증명

```typescript
{
  data: { user: null, session: null };
  error: {
    message: "Invalid login credentials";
    status: 400;
  };
}
```

#### 2. 이메일 미인증

```typescript
{
  data: { user: null, session: null };
  error: {
    message: "Email not confirmed";
    status: 400;
  };
}
```

#### 3. Rate Limit 초과

```typescript
{
  data: { user: null, session: null };
  error: {
    message: "Email rate limit exceeded";
    status: 429;
  };
}
```

**애플리케이션 레벨 Rate Limit 에러** (5분 내 5회 초과):
```typescript
{
  error: "너무 많은 로그인 시도. 5분 후 다시 시도하세요.";
}
```

---

## Implementation Example

### 1. Login Form Component

```typescript
// app/login/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { checkRateLimit } from '@/lib/auth/rate-limiter';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      // Rate Limit 체크 (IP + 이메일)
      const ip = await fetch('/api/get-ip').then(r => r.text());
      const identifier = `${ip}:${email}`;

      if (!checkRateLimit(identifier)) {
        throw new Error('너무 많은 로그인 시도. 5분 후 다시 시도하세요.');
      }

      // Supabase 로그인
      const supabase = createClient();

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (loginError) throw loginError;

      // 성공: 홈페이지로 리다이렉트
      router.push('/');
      router.refresh(); // Server Components 재렌더링

    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleLogin}>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="이메일"
        required
      />
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="비밀번호"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? '로그인 중...' : '로그인'}
      </button>
      <a href="/forgot-password">비밀번호를 잊으셨나요?</a>
    </form>
  );
}
```

### 2. Rate Limiter (애플리케이션 레벨)

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

// Cleanup old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of loginAttempts.entries()) {
    if (now > value.resetAt) {
      loginAttempts.delete(key);
    }
  }
}, 60 * 60 * 1000);
```

### 3. Get User IP (for Rate Limiting)

```typescript
// app/api/get-ip/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for') ||
             request.headers.get('x-real-ip') ||
             'unknown';

  return NextResponse.json(ip.split(',')[0].trim());
}
```

---

## Server-Side Session Check

### Get Session (Server Component)

```typescript
// lib/auth/get-session.ts
import { createServerClient } from '@/lib/supabase/server';

export async function getSession() {
  const supabase = createServerClient();

  const { data: { session }, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Session error:', error);
    return null;
  }

  return session;
}
```

### Usage in Server Component

```typescript
// app/dashboard/page.tsx
import { getSession } from '@/lib/auth/get-session';
import { redirect } from 'next/navigation';

export default async function DashboardPage() {
  const session = await getSession();

  if (!session) {
    redirect('/login?callbackUrl=/dashboard');
  }

  return (
    <div>
      <h1>Dashboard</h1>
      <p>Welcome, {session.user.email}!</p>
    </div>
  );
}
```

---

## Security Features

### 1. Rate Limiting

**2-tier Rate Limiting**:

| Level | Identifier | Limit | Window | Purpose |
|-------|------------|-------|--------|---------|
| Supabase | 이메일 | 1회 | 60초 | API 보호 |
| Application | IP + 이메일 | 5회 | 5분 | Brute-force 방어 |

### 2. Password Security

- ✅ Supabase가 bcrypt로 자동 해싱 (10 라운드)
- ✅ 평문 비밀번호는 전송 중에만 존재 (HTTPS)
- ✅ 데이터베이스에는 해시만 저장

### 3. Session Management

**Cookie 설정** (Supabase 자동 처리):
```
Set-Cookie: sb-access-token=...; HttpOnly; Secure; SameSite=Lax; Path=/
Set-Cookie: sb-refresh-token=...; HttpOnly; Secure; SameSite=Lax; Path=/
```

**보안 속성**:
- `HttpOnly`: JavaScript 접근 불가 (XSS 방어)
- `Secure`: HTTPS만 허용
- `SameSite=Lax`: CSRF 방어

### 4. Token Expiration

```typescript
// Supabase SDK가 자동 갱신
supabase.auth.onAuthStateChange((event, session) => {
  if (event === 'TOKEN_REFRESHED') {
    console.log('Session refreshed automatically');
  }
});
```

---

## Error Handling

### User-Friendly Error Messages

```typescript
// lib/auth/error-messages.ts
export function getLoginErrorMessage(error: any): string {
  switch (error.message) {
    case 'Invalid login credentials':
      return '이메일 또는 비밀번호가 올바르지 않습니다.';
    case 'Email not confirmed':
      return '이메일 주소를 먼저 인증해주세요. 이메일을 확인하세요.';
    case 'Email rate limit exceeded':
      return '너무 많은 시도가 있었습니다. 잠시 후 다시 시도하세요.';
    default:
      return '로그인에 실패했습니다. 다시 시도해주세요.';
  }
}
```

---

## Testing

### Test Cases

```typescript
// __tests__/auth/login.test.ts
describe('Login API', () => {
  it('should login with valid credentials', async () => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'Test1234!',
    });

    expect(error).toBeNull();
    expect(data.session).toBeDefined();
    expect(data.session?.access_token).toBeTruthy();
  });

  it('should reject invalid password', async () => {
    const { error } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'WrongPassword123!',
    });

    expect(error?.message).toContain('Invalid login credentials');
  });

  it('should enforce rate limiting', async () => {
    const identifier = 'test-ip:test@example.com';

    // 5번 시도 (성공)
    for (let i = 0; i < 5; i++) {
      expect(checkRateLimit(identifier)).toBe(true);
    }

    // 6번째 시도 (실패)
    expect(checkRateLimit(identifier)).toBe(false);
  });
});
```

---

## Performance Metrics

**목표** (명세서 요구사항):
- 로그인 응답 시간: < 500ms

**측정 포인트**:
```typescript
const startTime = performance.now();
await supabase.auth.signInWithPassword({ email, password });
const duration = performance.now() - startTime;

console.log(`Login took ${duration}ms`); // Should be < 500ms
```

---

## Related Documents

- [Signup API Contract](./signup-api.md)
- [Password Reset API Contract](./password-reset-api.md)
- [OAuth API Contract](./oauth-api.md)
- [Research: Session Management](../research/research.md)

---

**작성 완료**: 2025-11-16
