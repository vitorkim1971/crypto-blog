# API Contract: 회원가입 (이메일/비밀번호)

**Endpoint**: Client-side Supabase Auth SDK (직접 호출)
**Method**: `supabase.auth.signUp()`
**Purpose**: 이메일/비밀번호 기반 회원가입

---

## Request

### Client-side Code

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase.auth.signUp({
  email: string,
  password: string,
  options: {
    emailRedirectTo: string, // 이메일 인증 후 리다이렉트 URL
    data: {
      name?: string, // 선택: 사용자 이름
    },
  },
});
```

### Parameters

| 필드 | 타입 | Required | 설명 |
|------|------|----------|------|
| `email` | string | ✅ Yes | 이메일 주소 (유효성 검증 필요) |
| `password` | string | ✅ Yes | 비밀번호 (최소 8자) |
| `options.emailRedirectTo` | string | ✅ Yes | 이메일 인증 후 리다이렉트 URL |
| `options.data.name` | string | ⚪ Optional | 사용자 이름 (2-50자) |

### Validation Rules

```typescript
// lib/auth/validation.ts
export const signupValidation = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    maxLength: 255,
  },
  password: {
    minLength: 8,
    maxLength: 128,
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, // 최소 1개의 소문자, 대문자, 숫자
  },
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z가-힣\s]+$/, // 영문, 한글, 공백만
  },
};
```

---

## Response

### Success (200 OK)

```typescript
{
  data: {
    user: {
      id: string; // UUID
      email: string;
      email_confirmed_at: null; // 아직 인증 안 됨
      created_at: string; // ISO 8601
      // ...
    };
    session: null; // 이메일 인증 전까지 세션 없음
  };
  error: null;
}
```

**Flow After Success**:
1. Supabase가 인증 이메일 발송
2. 사용자가 이메일에서 링크 클릭
3. `emailRedirectTo` URL로 리다이렉트
4. 자동 로그인 (세션 생성)

### Error Responses

#### 1. 이메일 이미 사용 중

```typescript
{
  data: { user: null, session: null };
  error: {
    message: "User already registered";
    status: 400;
  };
}
```

#### 2. 잘못된 이메일 형식

```typescript
{
  data: { user: null, session: null };
  error: {
    message: "Unable to validate email address: invalid format";
    status: 400;
  };
}
```

#### 3. 약한 비밀번호

```typescript
{
  data: { user: null, session: null };
  error: {
    message: "Password should be at least 8 characters";
    status: 400;
  };
}
```

#### 4. Rate Limit 초과

```typescript
{
  data: { user: null, session: null };
  error: {
    message: "For security purposes, you can only request this once every 60 seconds";
    status: 429;
  };
}
```

---

## Implementation Example

### 1. Signup Form Component

```typescript
// app/signup/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { data, error: signupError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: {
            name: name || undefined,
          },
        },
      });

      if (signupError) throw signupError;

      // 성공: 이메일 인증 안내 페이지로 이동
      router.push('/auth/verify-email');

    } catch (err: any) {
      setError(err.message || '회원가입에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignup}>
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
        placeholder="비밀번호 (최소 8자)"
        required
      />
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="이름 (선택)"
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? '처리 중...' : '회원가입'}
      </button>
    </form>
  );
}
```

### 2. Email Verification Callback

```typescript
// app/auth/callback/route.ts
import { createServerClient } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createServerClient();

    // 이메일 인증 토큰 교환
    await supabase.auth.exchangeCodeForSession(code);
  }

  // 홈페이지로 리다이렉트 (세션 자동 생성됨)
  return NextResponse.redirect(requestUrl.origin);
}
```

---

## Security Considerations

### 1. Rate Limiting

**Supabase 내장 Rate Limit**:
- 동일 이메일: 60초당 1회
- 동일 IP: 시간당 최대 요청 수 제한

**추가 애플리케이션 레벨 Rate Limit**:
```typescript
// lib/auth/rate-limiter.ts
const signupAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkSignupRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = signupAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    signupAttempts.set(ip, {
      count: 1,
      resetAt: now + 5 * 60 * 1000, // 5분
    });
    return true;
  }

  if (attempt.count >= 3) {
    // 5분 내 3회 초과 → 차단
    return false;
  }

  attempt.count++;
  return true;
}
```

### 2. CSRF Protection

- Supabase Auth SDK가 자동으로 CSRF 토큰 처리
- `emailRedirectTo`는 화이트리스트 도메인만 허용 (Supabase Dashboard 설정)

### 3. Email Verification

**Supabase Dashboard 설정**:
1. Authentication → Settings
2. **Enable email confirmations** 체크 (필수)
3. Email Templates → Confirm Signup 커스터마이징

**이메일 템플릿 예시**:
```html
<h2>이메일 주소를 인증해주세요</h2>
<p>{{ .Email }}님, CryptoTitan에 가입해주셔서 감사합니다.</p>
<p>아래 링크를 클릭하여 이메일 주소를 인증하세요:</p>
<a href="{{ .ConfirmationURL }}">이메일 인증하기</a>
<p>이 링크는 24시간 후 만료됩니다.</p>
```

---

## Testing

### Test Cases

```typescript
// __tests__/auth/signup.test.ts
describe('Signup API', () => {
  it('should create user with valid email/password', async () => {
    const { data, error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'Test1234!',
    });

    expect(error).toBeNull();
    expect(data.user).toBeDefined();
    expect(data.user?.email).toBe('test@example.com');
  });

  it('should reject duplicate email', async () => {
    // 첫 번째 가입
    await supabase.auth.signUp({
      email: 'duplicate@example.com',
      password: 'Test1234!',
    });

    // 두 번째 가입 (중복)
    const { error } = await supabase.auth.signUp({
      email: 'duplicate@example.com',
      password: 'Test1234!',
    });

    expect(error?.message).toContain('already registered');
  });

  it('should reject weak password', async () => {
    const { error } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: '123', // 너무 짧음
    });

    expect(error?.message).toContain('at least 8 characters');
  });
});
```

---

## Related Documents

- [Login API Contract](./login-api.md)
- [Password Reset API Contract](./password-reset-api.md)
- [Data Model](../data-model.md)
- [Research: Session Management](../research/research.md)

---

**작성 완료**: 2025-11-16
