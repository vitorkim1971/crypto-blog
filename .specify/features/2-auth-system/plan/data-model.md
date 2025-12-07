# Data Model: 인증 시스템

**기능**: 인증 시스템
**작성일**: 2025-11-16
**상태**: 확정

---

## 개요

이 문서는 인증 시스템의 데이터베이스 스키마 설계를 정의합니다. Supabase Auth (`auth.users`)와 애플리케이션 프로필 (`public.profiles`)의 관계를 명확히 합니다.

---

## Database Schema

### 1. `auth.users` (Supabase 내장 테이블)

**목적**: Supabase Auth가 관리하는 사용자 인증 정보

**주요 필드**:
```sql
-- Supabase가 자동으로 관리 (직접 수정 불가)
id UUID PRIMARY KEY                    -- 사용자 고유 ID
email TEXT UNIQUE                       -- 이메일 주소
encrypted_password TEXT                 -- 해시된 비밀번호
email_confirmed_at TIMESTAMPTZ          -- 이메일 인증 시각
last_sign_in_at TIMESTAMPTZ             -- 마지막 로그인 시각
raw_user_meta_data JSONB                -- OAuth 메타데이터
  -> name TEXT                          -- Google OAuth 이름
  -> avatar_url TEXT                    -- Google OAuth 프로필 이미지
created_at TIMESTAMPTZ
updated_at TIMESTAMPTZ
```

**접근 제어**:
- ✅ Supabase Auth가 완전 관리
- ❌ 애플리케이션에서 직접 수정 불가
- ✅ `auth.uid()` 함수로 현재 사용자 확인

---

### 2. `public.profiles` (애플리케이션 프로필)

**목적**: 사용자의 공개 프로필 정보 (댓글, 작성자 등에 사용)

**스키마**:
```sql
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

**필드 설명**:

| 필드 | 타입 | 제약 조건 | 설명 |
|------|------|-----------|------|
| `id` | UUID | PK, FK → auth.users(id) | 사용자 ID (auth.users와 1:1 매핑) |
| `email` | TEXT | NOT NULL | 이메일 주소 (auth.users와 동기화) |
| `name` | TEXT | NULLABLE | 사용자 이름 (OAuth 또는 수동 입력) |
| `avatar_url` | TEXT | NULLABLE | 프로필 이미지 URL |
| `bio` | TEXT | NULLABLE | 자기소개 (최대 500자, 앱 레벨 검증) |
| `created_at` | TIMESTAMPTZ | DEFAULT NOW() | 생성 시각 |
| `updated_at` | TIMESTAMPTZ | DEFAULT NOW() | 최종 수정 시각 |

**Indexes**:
```sql
-- 이메일 검색용
CREATE INDEX idx_profiles_email ON public.profiles(email);
```

---

### 3. Auto-Profile Creation Trigger

**목적**: `auth.users`에 새 사용자가 생성되면 자동으로 `profiles` 레코드 생성

**Trigger Function**:
```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**동작 방식**:
1. 사용자가 회원가입 (이메일/비밀번호 또는 Google OAuth)
2. Supabase Auth가 `auth.users`에 레코드 생성
3. 트리거가 자동으로 `public.profiles`에 레코드 생성
   - `id`: `auth.users.id` 복사
   - `email`: `auth.users.email` 복사
   - `name`: `raw_user_meta_data.name` (OAuth) 또는 NULL
   - `avatar_url`: `raw_user_meta_data.avatar_url` (OAuth) 또는 NULL

---

## Row Level Security (RLS)

### Profiles Table RLS Policies

```sql
-- RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy 1: 모든 사용자가 모든 프로필 조회 가능 (공개 정보)
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

-- Policy 2: 사용자는 본인 프로필만 수정 가능
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy 3: 사용자는 본인 프로필만 삭제 가능 (거의 사용 안 함)
CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Policy 4: 트리거가 프로필 생성 가능 (service_role)
-- (트리거는 SECURITY DEFINER로 실행되므로 별도 정책 불필요)
```

---

## Data Flow Diagrams

### 회원가입 플로우 (이메일/비밀번호)

```
┌─────────────────┐
│  User Signup    │
│ (Email/Pass)    │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│ supabase.auth.signUp()  │
│ { email, password }     │
└────────┬────────────────┘
         │
         ▼
┌─────────────────────────┐
│   auth.users INSERT     │
│ - id: UUID              │
│ - email: user@email.com │
│ - encrypted_password    │
└────────┬────────────────┘
         │
         ▼ (트리거 자동 실행)
┌─────────────────────────┐
│ public.profiles INSERT  │
│ - id: same UUID         │
│ - email: user@email.com │
│ - name: NULL            │
│ - avatar_url: NULL      │
└─────────────────────────┘
```

### Google OAuth 플로우

```
┌─────────────────┐
│  User Login     │
│ (Google OAuth)  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────┐
│  NextAuth Google OAuth  │
│ → ID Token 받기         │
└────────┬────────────────┘
         │
         ▼
┌──────────────────────────────┐
│ supabase.auth.signInWithIdToken │
│ { provider: 'google', token } │
└────────┬─────────────────────┘
         │
         ▼
┌─────────────────────────────┐
│   auth.users INSERT/UPDATE  │
│ - id: UUID                  │
│ - email: user@gmail.com     │
│ - raw_user_meta_data:       │
│   { name, avatar_url }      │
└────────┬────────────────────┘
         │
         ▼ (트리거 자동 실행)
┌─────────────────────────────┐
│ public.profiles INSERT      │
│ - id: same UUID             │
│ - email: user@gmail.com     │
│ - name: "John Doe"          │
│ - avatar_url: "https://..."  │
└─────────────────────────────┘
```

---

## Migration Script

**파일**: `supabase/migrations/YYYYMMDDHHMMSS_create_profiles_table.sql`

```sql
-- Step 1: Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 2: Create indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- Step 3: Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Step 4: Create RLS policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- Step 5: Create trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$;

-- Step 6: Create trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Step 7: Create updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

---

## TypeScript Types

**파일**: `lib/types/auth.ts`

```typescript
export interface Profile {
  id: string; // UUID
  email: string;
  name: string | null;
  avatar_url: string | null;
  bio: string | null;
  created_at: string; // ISO 8601
  updated_at: string; // ISO 8601
}

export interface User {
  id: string; // UUID from auth.users
  email: string;
  profile: Profile;
}
```

---

## Data Validation Rules

### Application-Level Validation

```typescript
// lib/auth/validation.ts
export const profileValidation = {
  name: {
    minLength: 2,
    maxLength: 50,
    pattern: /^[a-zA-Z가-힣\s]+$/, // 영문, 한글, 공백만
  },
  bio: {
    maxLength: 500,
  },
  avatar_url: {
    pattern: /^https?:\/\/.+/, // http 또는 https URL만
  },
};
```

---

## Performance Considerations

### Caching Strategy

```typescript
// lib/auth/get-profile.ts
import { cache } from 'react';
import { createServerClient } from '@/lib/supabase/server';

export const getProfile = cache(async (userId: string) => {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data;
});
```

**캐싱 전략**:
- React Cache: 단일 요청 내에서 중복 쿼리 방지
- Supabase Realtime (선택): 프로필 업데이트 실시간 반영
- Vercel SWR (클라이언트): 클라이언트 측 캐싱

---

## Security Checklist

- ✅ RLS 활성화 (모든 테이블)
- ✅ 민감한 정보 (`auth.users`) 직접 접근 불가
- ✅ 트리거 함수 `SECURITY DEFINER` 사용
- ✅ 프로필은 공개 정보만 포함 (비밀번호, 결제 정보 제외)
- ✅ 이메일 변경은 Supabase Auth 통해서만 (트리거로 자동 동기화)

---

## Related Documents

- [Implementation Plan](./plan.md)
- [Research: Session Synchronization](./research/research.md)
- [API Contracts](./contracts/)
- [Quickstart Guide](./quickstart.md)

---

**작성 완료**: 2025-11-16
**검토자**: Implementation Planning
