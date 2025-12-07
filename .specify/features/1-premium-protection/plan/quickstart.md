# Quickstart: 프리미엄 콘텐츠 보호 시스템

**목표**: 로컬 개발 환경에서 프리미엄 콘텐츠 보호 시스템을 설정하고 테스트합니다.

**소요 시간**: ~30분

---

## Prerequisites

- ✅ Node.js 18+ 설치
- ✅ Supabase 프로젝트 생성
- ✅ Stripe 계정 (테스트 모드)
- ✅ Git 저장소 클론 완료

---

## Step 1: 환경 변수 설정 (5분)

### 1.1 `.env.local` 파일 생성

프로젝트 루트에 `.env.local` 파일을 생성합니다:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci... # Service Role Key (Webhooks용)

# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # (Step 4에서 설정)

# NextAuth (기존)
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your-random-secret-key

# Sanity (기존)
NEXT_PUBLIC_SANITY_PROJECT_ID=your-project-id
NEXT_PUBLIC_SANITY_DATASET=production
```

### 1.2 Stripe 키 가져오기

1. [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys) 접속
2. **Developers** → **API keys** 이동
3. **Publishable key**와 **Secret key** 복사

---

## Step 2: Database Migration (10분)

### 2.1 Supabase에서 Migration 실행

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택 → **SQL Editor** 이동
3. 새 쿼리 생성 후 아래 SQL 실행:

```sql
-- subscriptions 테이블 생성
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN (
    'active', 'trialing', 'past_due', 'canceled', 'unpaid', 'incomplete', 'incomplete_expired'
  )),
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_user_active ON public.subscriptions(user_id, status)
WHERE status IN ('active', 'trialing');

-- RLS Policies
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions FOR ALL
  USING (auth.role() = 'service_role');

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
```

4. **Run** 클릭하여 실행

### 2.2 Migration 검증

```sql
-- subscriptions 테이블 확인
SELECT * FROM public.subscriptions LIMIT 1;
```

---

## Step 3: Stripe 제품 생성 (5분)

### 3.1 가격 설정

1. [Stripe Dashboard](https://dashboard.stripe.com/test/products) → **Products** 이동
2. **+ Add product** 클릭
3. 제품 정보 입력:
   - **Name**: CryptoTitan Premium
   - **Description**: 프리미엄 암호화폐 콘텐츠 구독
   - **Pricing model**: Recurring
   - **Price**: $9.99/month (또는 원하는 가격)
   - **Billing period**: Monthly
4. **Save product** 클릭
5. **Price ID** 복사 (예: `price_1234567890`)

### 3.2 환경 변수 추가

`.env.local`에 추가:
```bash
NEXT_PUBLIC_STRIPE_PRICE_ID=price_1234567890
```

---

## Step 4: Stripe Webhook 설정 (10분)

### 4.1 Stripe CLI 설치

**Mac/Linux**:
```bash
brew install stripe/stripe-cli/stripe
```

**Windows**:
```powershell
scoop bucket add stripe https://github.com/stripe/scoop-stripe-cli.git
scoop install stripe
```

또는 [Stripe CLI Releases](https://github.com/stripe/stripe-cli/releases)에서 다운로드

### 4.2 Stripe CLI 로그인

```bash
stripe login
```

브라우저에서 자동으로 인증 페이지가 열리면 승인합니다.

### 4.3 로컬 Webhook 포워딩 시작

```bash
stripe listen --forward-to localhost:3001/api/webhooks/stripe
```

**출력 예시**:
```
> Ready! Your webhook signing secret is whsec_abc123xyz... (^C to quit)
```

### 4.4 Webhook Secret 저장

출력된 `whsec_...` 값을 `.env.local`에 추가:
```bash
STRIPE_WEBHOOK_SECRET=whsec_abc123xyz...
```

**주의**: 이 터미널은 계속 실행 상태로 유지해야 합니다!

---

## Step 5: 로컬 서버 시작 (2분)

새 터미널에서:

```bash
npm install
npm run dev
```

서버가 [http://localhost:3001](http://localhost:3001)에서 실행됩니다.

---

## Step 6: 테스트 (10분)

### 6.1 Webhook 이벤트 테스트

**터미널 1** (Stripe CLI가 실행 중인 터미널):
```bash
stripe trigger checkout.session.completed
```

**예상 결과**:
- Next.js 서버 로그에 "Webhook event received" 출력
- Supabase `subscriptions` 테이블에 새 레코드 생성

### 6.2 Supabase에서 데이터 확인

1. Supabase Dashboard → **Table Editor** → `subscriptions`
2. 테스트 데이터가 생성되었는지 확인

### 6.3 프리미엄 콘텐츠 접근 테스트

1. Sanity Studio에서 테스트 게시글 생성
   - `isPremium: true` 설정

2. 브라우저에서 `/blog/{slug}` 접속
3. **비구독자**: 페이월 화면 표시 예상
4. **구독자**: 전체 콘텐츠 표시 예상

---

## Troubleshooting

### 문제 1: Webhook 서명 검증 실패

**에러**:
```
Error: No signatures found matching the expected signature for payload
```

**해결**:
1. `.env.local`의 `STRIPE_WEBHOOK_SECRET`이 올바른지 확인
2. `stripe listen` 명령을 재시작하고 새 secret 사용
3. Next.js 서버를 재시작 (`npm run dev`)

### 문제 2: Supabase RLS 권한 오류

**에러**:
```
new row violates row-level security policy
```

**해결**:
- Webhook 핸들러에서 **Service Role Key** 사용 확인
- `.env.local`에 `SUPABASE_SERVICE_ROLE_KEY` 설정 확인

### 문제 3: Stripe CLI가 이벤트를 받지 못함

**해결**:
1. 로컬 서버가 `http://localhost:3001`에서 실행 중인지 확인
2. 방화벽이 포트 3001을 차단하는지 확인
3. `stripe listen` 명령에 올바른 URL 사용 확인

---

## Next Steps

✅ 환경 설정 완료!

**다음 작업**:
1. `/speckit.tasks` 실행하여 구현 작업 세분화
2. Middleware 구현 시작
3. Server Components에서 구독 검증 로직 추가
4. Paywall 컴포넌트 UI 개발

---

## Useful Commands

```bash
# Stripe CLI 이벤트 트리거
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed

# Supabase 로컬 개발 (Optional)
npx supabase start
npx supabase migration up

# Next.js 빌드 확인
npm run build
npm run start
```

---

## Resources

- [Stripe Webhooks Guide](https://stripe.com/docs/webhooks)
- [Supabase RLS Guide](https://supabase.com/docs/guides/auth/row-level-security)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [Project Data Model](./data-model.md)
- [Webhook API Contract](./contracts/webhook-api.md)

---

**환경 설정 완료 시간**: 2025-11-16 (예상)
**작성자**: Implementation Planning
