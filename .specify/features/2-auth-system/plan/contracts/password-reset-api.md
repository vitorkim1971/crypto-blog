# API Contract: 비밀번호 재설정

**Endpoints**:
1. `supabase.auth.resetPasswordForEmail()` - 재설정 요청
2. `supabase.auth.updateUser()` - 비밀번호 변경

**Purpose**: 비밀번호를 잊어버린 사용자가 이메일을 통해 비밀번호를 재설정

---

## Flow Overview

```
┌────────────────────┐
│ User: "비밀번호 찾기" │
└─────────┬──────────┘
          │
          ▼
┌────────────────────────────┐
│ Step 1: 재설정 이메일 요청   │
│ resetPasswordForEmail()    │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│ Supabase: 이메일 발송       │
│ (재설정 링크 포함)          │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│ User: 이메일 링크 클릭       │
│ → /reset-password?token=xxx│
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│ Step 2: 새 비밀번호 입력     │
│ updateUser({ password })   │
└─────────┬──────────────────┘
          │
          ▼
┌────────────────────────────┐
│ ✅ 비밀번호 변경 완료         │
│ → 로그인 페이지로 리다이렉트  │
└────────────────────────────┘
```

---

## Step 1: Request Password Reset

### Request

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase.auth.resetPasswordForEmail(
  email: string,
  {
    redirectTo: string, // 비밀번호 재설정 페이지 URL
  }
);
```

### Parameters

| 필드 | 타입 | Required | 설명 |
|------|------|----------|------|
| `email` | string | ✅ Yes | 가입된 이메일 주소 |
| `redirectTo` | string | ✅ Yes | 재설정 페이지 URL (예: `http://localhost:3001/reset-password`) |

### Response

#### Success (200 OK)

```typescript
{
  data: {};
  error: null;
}
```

**중요**: 보안상 이유로 이메일이 존재하지 않아도 성공 응답을 반환합니다. (Enumeration Attack 방어)

#### Error Response

```typescript
{
  data: null;
  error: {
    message: "For security purposes, you can only request this once every 60 seconds";
    status: 429;
  };
}
```

---

## Step 2: Update Password

### Request

**페이지**: `/reset-password?token=xxx`

```typescript
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

const { data, error } = await supabase.auth.updateUser({
  password: string, // 새 비밀번호
});
```

### Parameters

| 필드 | 타입 | Required | 설명 |
|------|------|----------|------|
| `password` | string | ✅ Yes | 새 비밀번호 (최소 8자) |

### Response

#### Success (200 OK)

```typescript
{
  data: {
    user: {
      id: string;
      email: string;
      // ...
    };
  };
  error: null;
}
```

#### Error Responses

```typescript
// 약한 비밀번호
{
  error: {
    message: "Password should be at least 8 characters";
    status: 400;
  };
}

// 토큰 만료
{
  error: {
    message: "Token has expired or is invalid";
    status: 400;
  };
}
```

---

## Implementation

### 1. Forgot Password Page

```typescript
// app/forgot-password/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const supabase = createClient();

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        email,
        {
          redirectTo: `${window.location.origin}/reset-password`,
        }
      );

      if (resetError) throw resetError;

      setSent(true);
    } catch (err: any) {
      setError(err.message || '이메일 전송에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="success-message">
        <h2>이메일을 확인하세요</h2>
        <p>{email}로 비밀번호 재설정 링크를 발송했습니다.</p>
        <p>이메일을 확인하고 링크를 클릭하여 비밀번호를 재설정하세요.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleResetRequest}>
      <h1>비밀번호 찾기</h1>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="가입한 이메일 주소"
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? '전송 중...' : '비밀번호 재설정 이메일 발송'}
      </button>
      <a href="/login">로그인으로 돌아가기</a>
    </form>
  );
}
```

### 2. Reset Password Page

```typescript
// app/reset-password/page.tsx
'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // 비밀번호 확인
    if (password !== confirmPassword) {
      setError('비밀번호가 일치하지 않습니다.');
      return;
    }

    setLoading(true);

    try {
      const supabase = createClient();

      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) throw updateError;

      // 성공: 로그인 페이지로 리다이렉트
      router.push('/login?message=비밀번호가 변경되었습니다.');
    } catch (err: any) {
      setError(err.message || '비밀번호 변경에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handlePasswordUpdate}>
      <h1>새 비밀번호 설정</h1>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="새 비밀번호 (최소 8자)"
        minLength={8}
        required
      />
      <input
        type="password"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        placeholder="비밀번호 확인"
        minLength={8}
        required
      />
      {error && <p className="error">{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? '변경 중...' : '비밀번호 변경'}
      </button>
    </form>
  );
}
```

---

## Email Template Customization

**Supabase Dashboard 설정**:
1. Authentication → Email Templates
2. **Reset Password** 템플릿 선택
3. 커스터마이징

**한국어 템플릿 예시**:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>비밀번호 재설정</title>
</head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h2 style="color: #333;">비밀번호 재설정 요청</h2>

  <p>안녕하세요,</p>

  <p>CryptoTitan 계정의 비밀번호 재설정을 요청하셨습니다.</p>

  <p>아래 버튼을 클릭하여 새 비밀번호를 설정하세요:</p>

  <a href="{{ .ConfirmationURL }}"
     style="display: inline-block; background-color: #0070f3; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0;">
    비밀번호 재설정하기
  </a>

  <p style="color: #666; font-size: 14px;">
    이 링크는 <strong>1시간 후 만료</strong>됩니다.
  </p>

  <p style="color: #666; font-size: 14px;">
    비밀번호 재설정을 요청하지 않으셨다면 이 이메일을 무시하세요.
  </p>

  <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">

  <p style="color: #999; font-size: 12px;">
    CryptoTitan | 암호화폐 프리미엄 블로그
  </p>
</body>
</html>
```

---

## Security Considerations

### 1. Token Expiration

- ✅ 재설정 링크는 **1시간 후 자동 만료**
- ✅ 한 번 사용된 토큰은 재사용 불가
- ✅ 새 재설정 요청 시 이전 토큰 무효화

### 2. Rate Limiting

**Supabase 내장 Rate Limit**:
- 동일 이메일: 60초당 1회 요청만 허용
- 목적: 이메일 스팸 방지

**추가 애플리케이션 레벨 Rate Limit**:
```typescript
// lib/auth/rate-limiter.ts
const resetAttempts = new Map<string, { count: number; resetAt: number }>();

export function checkResetRateLimit(ip: string): boolean {
  const now = Date.now();
  const attempt = resetAttempts.get(ip);

  if (!attempt || now > attempt.resetAt) {
    resetAttempts.set(ip, {
      count: 1,
      resetAt: now + 15 * 60 * 1000, // 15분
    });
    return true;
  }

  if (attempt.count >= 3) {
    // 15분 내 3회 초과 → 차단
    return false;
  }

  attempt.count++;
  return true;
}
```

### 3. Enumeration Attack Prevention

**문제**: 악의적 사용자가 "이메일이 존재하는지" 확인하려고 시도

**해결책**:
- ✅ 이메일 존재 여부와 관계없이 동일한 성공 메시지 반환
- ✅ 응답 시간도 동일하게 유지 (타이밍 공격 방지)

```typescript
// 항상 동일한 메시지 표시
setSent(true); // "이메일을 확인하세요" (이메일 존재 여부 노출 안 함)
```

---

## Testing

### Test Cases

```typescript
// __tests__/auth/password-reset.test.ts
describe('Password Reset API', () => {
  it('should send reset email for valid email', async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      'test@example.com',
      { redirectTo: 'http://localhost:3001/reset-password' }
    );

    expect(error).toBeNull();
  });

  it('should not reveal if email does not exist', async () => {
    const { error } = await supabase.auth.resetPasswordForEmail(
      'nonexistent@example.com',
      { redirectTo: 'http://localhost:3001/reset-password' }
    );

    // 보안상 성공 응답 반환
    expect(error).toBeNull();
  });

  it('should update password with valid token', async () => {
    // 먼저 재설정 이메일 요청
    await supabase.auth.resetPasswordForEmail('test@example.com', {
      redirectTo: 'http://localhost:3001/reset-password',
    });

    // 이메일에서 토큰 추출 (테스트 환경)
    // ...

    // 새 비밀번호로 업데이트
    const { error } = await supabase.auth.updateUser({
      password: 'NewPassword123!',
    });

    expect(error).toBeNull();
  });

  it('should reject weak password', async () => {
    const { error } = await supabase.auth.updateUser({
      password: '123', // 너무 짧음
    });

    expect(error?.message).toContain('at least 8 characters');
  });
});
```

### Manual Testing

**Step 1**: Forgot Password 페이지에서 이메일 입력
```bash
# 개발 환경에서 이메일 확인
# Supabase Dashboard → Authentication → Logs 확인
```

**Step 2**: 이메일에서 재설정 링크 클릭
```
http://localhost:3001/reset-password?token=eyJhbGci...
```

**Step 3**: 새 비밀번호 입력 및 변경

**Step 4**: 새 비밀번호로 로그인 확인

---

## Error Handling

### User-Friendly Messages

```typescript
// lib/auth/error-messages.ts
export function getResetErrorMessage(error: any): string {
  switch (error.message) {
    case 'For security purposes, you can only request this once every 60 seconds':
      return '잠시 후 다시 시도해주세요.';
    case 'Token has expired or is invalid':
      return '링크가 만료되었습니다. 비밀번호 재설정을 다시 요청하세요.';
    case 'Password should be at least 8 characters':
      return '비밀번호는 최소 8자 이상이어야 합니다.';
    default:
      return '오류가 발생했습니다. 다시 시도해주세요.';
  }
}
```

---

## Related Documents

- [Login API Contract](./login-api.md)
- [Signup API Contract](./signup-api.md)
- [Data Model](../data-model.md)
- [Research: Session Management](../research/research.md)

---

**작성 완료**: 2025-11-16
