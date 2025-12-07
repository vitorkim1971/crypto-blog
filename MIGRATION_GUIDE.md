# Supabase 마이그레이션 가이드

## 방법 1: 자동 스크립트 실행 (권장)

### 1단계: Service Role Key 가져오기

1. [Supabase API Settings](https://supabase.com/dashboard/project/ctoqgislfhnqfwpxwqvb/settings/api) 페이지로 이동
2. "Project API keys" 섹션에서 **"service_role"** 키를 찾습니다
3. 키를 복사합니다 (⚠️ 이 키는 절대 노출하지 마세요!)

### 2단계: 환경 변수 업데이트

`.env.local` 파일을 열고 다음 줄을 업데이트:

```
SUPABASE_SERVICE_ROLE_KEY=여기에_복사한_키를_붙여넣기
```

### 3단계: 마이그레이션 실행

```bash
node scripts/run-migrations.js
```

---

## 방법 2: 수동 실행 (Service Role Key 없이)

### 1단계: Supabase SQL Editor 열기

[SQL Editor](https://supabase.com/dashboard/project/ctoqgislfhnqfwpxwqvb/sql/new)로 이동

### 2단계: SQL 실행

아래 파일의 내용을 복사하여 SQL Editor에 붙여넣고 실행:

1. `supabase/migrations/002_create_profiles.sql`
2. `supabase/migrations/003_create_subscriptions.sql`

또는 통합 SQL 파일 사용:
- `supabase/migrations/combined_migration.sql` (자동 생성됨)

---

## 마이그레이션 확인

마이그레이션이 성공적으로 완료되었는지 확인:

```sql
-- 테이블 확인
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('profiles', 'subscriptions');

-- RLS 정책 확인
SELECT schemaname, tablename, policyname
FROM pg_policies
WHERE tablename IN ('profiles', 'subscriptions');
```

## 문제 해결

### 오류: "relation already exists"
- 이미 테이블이 존재합니다. 안전하게 무시할 수 있습니다.

### 오류: "permission denied"
- Service Role Key가 올바른지 확인하세요
- 또는 방법 2(수동 실행)를 사용하세요

### 오류: "function does not exist"
- SQL을 순서대로 실행했는지 확인하세요
- 먼저 002_create_profiles.sql, 그 다음 003_create_subscriptions.sql
