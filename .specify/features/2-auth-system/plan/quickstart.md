# Quickstart: 인증 시스템

**목표**: 로컬 개발 환경에서 인증 시스템 (이메일/비밀번호 + Google OAuth)을 설정하고 테스트합니다.

**소요 시간**: ~40분

---

## Prerequisites

- ✅ Node.js 18+ 설치
- ✅ Supabase 프로젝트 생성
- ✅ Google Cloud Console 계정
- ✅ Git 저장소 클론 완료

---

## Step 1: Supabase 프로젝트 설정 (10분)

### 1.1 Database Migration 실행

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → **SQL Editor** 이동
3. 새 쿼리 생성 후 아래 SQL 실행:

```sql
-- 1. Profiles 테이블 생성
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Indexes
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- 3. RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
CREATE POLICY "Profiles are viewable by everyone"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile"
  ON public.profiles FOR DELETE
  USING (auth.uid() = id);

-- 5. Auto-profile creation trigger
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

-- 6. Updated_at trigger
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

4. **Run** 클릭하여 실행

### 1.2 Supabase Auth 설정

1. Supabase Dashboard → **Authentication** → **Settings**
2. **Enable email confirmations** 체크 (이메일 인증 활성화)
3. **Site URL** 설정: `http://localhost:3001`
4. **Redirect URLs** 추가:
   - `http://localhost:3001/auth/callback`
   - `http://localhost:3001/reset-password`
5. **Save** 클릭

### 1.3 이메일 템플릿 커스터마이징 (선택)

1. Authentication → **Email Templates**
2. **Confirm signup** 템플릿 선택
3. 한국어로 커스터마이징:

```html
<h2>이메일 주소를 인증해주세요</h2>
<p>{{ .Email }}님, CryptoTitan에 가입해주셔서 감사합니다.</p>
<p>아래 링크를 클릭하여 이메일 주소를 인증하세요:</p>
<a href="{{ .ConfirmationURL }}">이메일 인증하기</a>
<p>이 링크는 24시간 후 만료됩니다.</p>
```

4. **Save** 클릭

---

## Step 2: Google OAuth 설정 (15분)

### 2.1 Google Cloud Console 프로젝트 생성

1. [Google Cloud Console](https://console.cloud.google.com) 접속
2. **프로젝트 만들기** 클릭
3. 프로젝트 이름: `CryptoTitan` 입력
4. **만들기** 클릭

### 2.2 OAuth Consent Screen 설정

1. **APIs & Services** → **OAuth consent screen** 이동
2. **User Type**: **External** 선택 → **만들기**
3. 앱 정보 입력:
   - **App name**: `CryptoTitan`
   - **User support email**: 본인 Gmail 주소
   - **Developer contact information**: 본인 Gmail 주소
4. **저장 후 계속** 클릭

5. **Scopes** 단계:
   - **ADD OR REMOVE SCOPES** 클릭
   - 다음 스코프 선택:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - **UPDATE** 클릭
   - **저장 후 계속** 클릭

6. **Test users** 단계:
   - **ADD USERS** 클릭
   - 테스트용 Gmail 주소 추가
   - **저장 후 계속** 클릭

### 2.3 OAuth Client ID 생성

1. **Credentials** → **CREATE CREDENTIALS** → **OAuth client ID**
2. **Application type**: **Web application**
3. **Name**: `CryptoTitan Web Client`
4. **Authorized JavaScript origins**:
   - **ADD URI** 클릭
   - `http://localhost:3001` 입력
5. **Authorized redirect URIs**:
   - **ADD URI** 클릭
   - `http://localhost:3001/api/auth/callback/google` 입력
6. **CREATE** 클릭

### 2.4 Client ID & Secret 저장

생성 완료 후 표시되는 팝업에서:
- **Client ID** 복사
- **Client Secret** 복사

`.env.local` 파일에 추가:
```env
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrst.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz
```

---

## Step 3: 환경 변수 설정 (5분)

### 3.1 `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성하고 아래 내용 추가:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... # Service Role Key

# NextAuth
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-random-secret-key-here-min-32-chars

# Google OAuth
GOOGLE_CLIENT_ID=123456789-abcdefghijklmnopqrst.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-abcdefghijklmnopqrstuvwxyz

# Sanity (기존)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

### 3.2 NEXTAUTH_SECRET 생성

터미널에서 랜덤 시크릿 키 생성:

**Mac/Linux**:
```bash
openssl rand -base64 32
```

**Windows (PowerShell)**:
```powershell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

생성된 값을 `NEXTAUTH_SECRET`에 사용

---

## Step 4: 패키지 설치 (2분)

```bash
npm install next-auth @supabase/supabase-js @supabase/auth-helpers-nextjs
```

---

## Step 5: 로컬 서버 시작 (2분)

```bash
npm run dev
```

서버가 [http://localhost:3001](http://localhost:3001)에서 실행됩니다.

---

## Step 6: 테스트 (10분)

### 6.1 이메일/비밀번호 회원가입 테스트

1. 브라우저에서 `http://localhost:3001/signup` 접속
2. 이메일과 비밀번호 입력 후 회원가입
3. **이메일 확인 안내** 페이지로 이동
4. Supabase Dashboard → **Authentication** → **Users**에서 사용자 생성 확인
5. **Email confirmations** 메일함 확인 (또는 Supabase Logs에서 확인)
6. 이메일 링크 클릭 → 자동 로그인

**예상 결과**:
- ✅ `auth.users` 테이블에 사용자 생성
- ✅ `public.profiles` 테이블에 프로필 자동 생성 (트리거)
- ✅ 이메일 인증 후 자동 로그인

### 6.2 Supabase에서 데이터 확인

**SQL Editor**에서 실행:
```sql
-- 사용자 확인
SELECT id, email, email_confirmed_at, created_at
FROM auth.users
LIMIT 5;

-- 프로필 확인
SELECT id, email, name, avatar_url, created_at
FROM public.profiles
LIMIT 5;
```

**예상 결과**:
```
id                                   | email              | name | avatar_url | created_at
-------------------------------------|--------------------| ---- | ---------- | ----------
550e8400-e29b-41d4-a716-446655440000 | test@example.com   | NULL | NULL       | 2025-11-16...
```

### 6.3 Google OAuth 로그인 테스트

1. `http://localhost:3001/login` 접속
2. **Google로 계속하기** 버튼 클릭
3. Google 계정 선택
4. 권한 승인
5. 자동으로 홈페이지로 리다이렉트

**예상 결과**:
- ✅ Google 계정 정보로 `auth.users` 생성
- ✅ `public.profiles`에 Google 이름 + 프로필 이미지 자동 저장
- ✅ NextAuth 세션 생성

**Supabase에서 확인**:
```sql
SELECT id, email, name, avatar_url
FROM public.profiles
WHERE email = 'your-gmail@gmail.com';
```

**예상 결과**:
```
name         | avatar_url
------------ | -----------------------------------------------
John Doe     | https://lh3.googleusercontent.com/a/ACg8oc...
```

### 6.4 로그인/로그아웃 테스트

**로그인**:
1. `http://localhost:3001/login` 접속
2. 가입한 이메일/비밀번호 입력
3. **로그인** 클릭
4. 홈페이지로 리다이렉트

**로그아웃**:
1. 로그아웃 버튼 클릭 (구현 필요)
2. 로그인 페이지로 리다이렉트
3. 보호된 페이지 접근 시 다시 로그인 페이지로 리다이렉트

### 6.5 비밀번호 재설정 테스트

1. `http://localhost:3001/forgot-password` 접속
2. 가입한 이메일 입력
3. "이메일을 확인하세요" 메시지 확인
4. Supabase Logs에서 재설정 이메일 확인
5. 링크 클릭 → `/reset-password?token=...`
6. 새 비밀번호 입력 후 변경
7. 새 비밀번호로 로그인 확인

---

## Troubleshooting

### 문제 1: 이메일이 발송되지 않음

**증상**: 회원가입 후 이메일이 오지 않음

**해결**:
1. Supabase Dashboard → **Authentication** → **Email Templates** 확인
2. **SMTP Settings** 확인 (기본은 Supabase 내장 SMTP 사용)
3. 개발 환경에서는 Supabase Dashboard → **Logs** → **Auth Logs**에서 이메일 내용 확인 가능
4. 프로덕션에서는 Custom SMTP 설정 권장 (SendGrid, Resend 등)

### 문제 2: Google OAuth 로그인 실패

**에러**:
```
Error: redirect_uri_mismatch
```

**해결**:
1. Google Cloud Console → **Credentials** → OAuth Client ID 확인
2. **Authorized redirect URIs**에 정확히 `http://localhost:3001/api/auth/callback/google` 추가
3. 포트 번호 확인 (3001)
4. 변경 후 몇 분 기다렸다가 재시도

### 문제 3: Profile 자동 생성 안 됨

**증상**: `auth.users`에는 사용자가 있지만 `profiles`에는 없음

**해결**:
1. Trigger가 제대로 생성되었는지 확인:
```sql
SELECT * FROM pg_trigger WHERE tgname = 'on_auth_user_created';
```

2. Trigger 함수 재생성:
```sql
-- Step 1 Migration SQL 다시 실행
```

3. 기존 사용자에 대해 수동으로 프로필 생성:
```sql
INSERT INTO public.profiles (id, email, name, avatar_url)
SELECT
  id,
  email,
  raw_user_meta_data->>'name',
  raw_user_meta_data->>'avatar_url'
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.profiles);
```

### 문제 4: NEXTAUTH_SECRET 관련 오류

**에러**:
```
Error: Please define a `secret` in production
```

**해결**:
1. `.env.local`에 `NEXTAUTH_SECRET` 추가
2. 최소 32자 이상의 랜덤 문자열 사용
3. Next.js 서버 재시작 (`npm run dev`)

---

## Next Steps

✅ 인증 시스템 환경 설정 완료!

**다음 작업**:
1. `/speckit.tasks` 실행하여 구현 작업 세분화
2. 로그인/회원가입 UI 컴포넌트 개발
3. Middleware에서 인증 체크 로직 추가
4. 보호된 페이지 구현

---

## Useful Commands

```bash
# 개발 서버 시작
npm run dev

# Supabase 로컬 개발 (Optional)
npx supabase start
npx supabase migration up

# TypeScript 타입 체크
npm run type-check

# 빌드 확인
npm run build
npm run start
```

---

## Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [NextAuth.js Documentation](https://next-auth.js.org)
- [Google OAuth Guide](https://developers.google.com/identity/protocols/oauth2)
- [Project Data Model](./data-model.md)
- [API Contracts](./contracts/)

---

**환경 설정 완료 시간**: 2025-11-16 (예상)
**작성자**: Implementation Planning
