# 데이터 모델: 프리미엄 콘텐츠 보호 시스템

**작성일**: 2025-11-16
**상태**: 설계 완료

## 개요

이 문서는 프리미엄 콘텐츠 보호 시스템에 필요한 데이터 모델을 정의합니다.

---

## Database Schema (Supabase/PostgreSQL)

### 1. `subscriptions` 테이블

Stripe 구독 정보를 저장하고 사용자 접근 권한을 관리합니다.

```sql
CREATE TABLE public.subscriptions (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign Keys
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Stripe Identifiers
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT UNIQUE NOT NULL,
  stripe_price_id TEXT NOT NULL,

  -- Subscription Status
  status TEXT NOT NULL CHECK (status IN (
    'active',        -- 활성 구독
    'trialing',      -- 무료 체험 중
    'past_due',      -- 결제 실패 (유예 기간)
    'canceled',      -- 취소됨
    'unpaid',        -- 미지급
    'incomplete',    -- 구독 시작 전
    'incomplete_expired'  -- 만료됨
  )),

  -- Subscription Metadata
  current_period_start TIMESTAMPTZ NOT NULL,
  current_period_end TIMESTAMPTZ NOT NULL,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  canceled_at TIMESTAMPTZ,
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,

  -- Audit Fields
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for Performance
CREATE INDEX idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer_id ON public.subscriptions(stripe_customer_id);
CREATE INDEX idx_subscriptions_status ON public.subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON public.subscriptions(current_period_end);

-- Combined Index for Subscription Check
CREATE INDEX idx_subscriptions_user_active ON public.subscriptions(user_id, status)
WHERE status IN ('active', 'trialing');
```

### 2. Row Level Security (RLS) Policies

```sql
-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Users can read their own subscriptions
CREATE POLICY "Users can view own subscriptions"
  ON public.subscriptions
  FOR SELECT
  USING (auth.uid() = user_id);

-- Only service role can insert/update/delete (Webhooks)
CREATE POLICY "Service role can manage subscriptions"
  ON public.subscriptions
  FOR ALL
  USING (auth.role() = 'service_role');
```

### 3. Trigger for `updated_at`

```sql
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

---

## Stripe Data Mapping

### Stripe Subscription → Supabase

| Stripe Field | Supabase Column | 변환 | 비고 |
|--------------|-----------------|------|------|
| `id` | `stripe_subscription_id` | 직접 | Unique |
| `customer` | `stripe_customer_id` | 직접 | |
| `items.data[0].price.id` | `stripe_price_id` | 직접 | |
| `status` | `status` | 직접 | Enum 검증 |
| `current_period_start` | `current_period_start` | Unix → Timestamp | |
| `current_period_end` | `current_period_end` | Unix → Timestamp | |
| `cancel_at_period_end` | `cancel_at_period_end` | 직접 | Boolean |
| `canceled_at` | `canceled_at` | Unix → Timestamp | Nullable |
| `trial_start` | `trial_start` | Unix → Timestamp | Nullable |
| `trial_end` | `trial_end` | Unix → Timestamp | Nullable |

### 변환 함수 예시

```typescript
function mapStripeToSupabase(subscription: Stripe.Subscription, userId: string) {
  return {
    user_id: userId,
    stripe_customer_id: subscription.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0].price.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
    cancel_at_period_end: subscription.cancel_at_period_end,
    canceled_at: subscription.canceled_at
      ? new Date(subscription.canceled_at * 1000).toISOString()
      : null,
    trial_start: subscription.trial_start
      ? new Date(subscription.trial_start * 1000).toISOString()
      : null,
    trial_end: subscription.trial_end
      ? new Date(subscription.trial_end * 1000).toISOString()
      : null,
  };
}
```

---

## Entity Relationships

```
┌──────────────┐
│  auth.users  │
│              │
│  id (PK)     │◄──────┐
│  email       │       │
└──────────────┘       │
                       │
                       │ user_id (FK)
                       │
              ┌────────┴──────────┐
              │   subscriptions   │
              │                   │
              │   id (PK)         │
              │   user_id (FK)    │
              │   stripe_*        │
              │   status          │
              │   period_*        │
              └───────────────────┘
```

---

## Subscription Status State Machine

```
┌──────────┐
│incomplete│ (구독 시작 전)
└─────┬────┘
      │ checkout.session.completed
      ▼
┌─────────┐
│ active  │◄──────┐ (활성)
│trialing │       │
└────┬────┘       │
     │            │ customer.subscription.updated
     │            │ (결제 성공)
     ├────────────┘
     │
     │ invoice.payment_failed
     ▼
┌─────────┐
│past_due │ (결제 실패, 유예)
└────┬────┘
     │
     │ 3회 실패 or 취소
     ▼
┌─────────┐
│canceled │ (취소됨 - 최종 상태)
│ unpaid  │
└─────────┘
```

### 상태별 접근 권한

| Status | 프리미엄 접근 | 설명 |
|--------|-------------|------|
| `active` | ✅ 허용 | 정상 구독 중 |
| `trialing` | ✅ 허용 | 무료 체험 중 |
| `past_due` | ⚠️ 제한적 허용 | 결제 실패했지만 유예 기간 (3일) |
| `canceled` | ❌ 차단 | 구독 취소됨 |
| `unpaid` | ❌ 차단 | 결제 실패 후 미지급 |
| `incomplete` | ❌ 차단 | 구독 미완성 |

---

## Validation Rules

### 1. Subscription Creation
- ✅ `user_id`는 `auth.users`에 존재해야 함
- ✅ `stripe_subscription_id`는 unique
- ✅ `status`는 유효한 enum 값
- ✅ `current_period_end` > `current_period_start`

### 2. Subscription Access Check
```sql
-- 활성 구독 확인 쿼리
SELECT * FROM subscriptions
WHERE user_id = $1
  AND status IN ('active', 'trialing', 'past_due')
  AND current_period_end > NOW()
LIMIT 1;
```

### 3. Webhook Idempotency
- Stripe 이벤트 ID를 별도 테이블에 저장하여 중복 처리 방지 (Optional)
```sql
CREATE TABLE public.webhook_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_event_id TEXT UNIQUE NOT NULL,
  event_type TEXT NOT NULL,
  processed_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Sanity CMS Schema (참고용)

Sanity에서는 이미 `isPremium` 필드가 있다고 가정합니다.

```typescript
// schemas/post.ts
export default {
  name: 'post',
  type: 'document',
  fields: [
    {
      name: 'title',
      type: 'string',
      validation: Rule => Rule.required(),
    },
    {
      name: 'slug',
      type: 'slug',
      options: { source: 'title' },
      validation: Rule => Rule.required(),
    },
    {
      name: 'isPremium',
      title: '프리미엄 콘텐츠',
      type: 'boolean',
      initialValue: false,
      description: 'true일 경우 구독자만 접근 가능',
    },
    {
      name: 'content',
      type: 'array',
      of: [{ type: 'block' }],
    },
    // ... other fields
  ],
};
```

---

## Query Patterns

### 1. Check User Subscription (Server Component)
```typescript
export async function checkSubscription(userId: string): Promise<boolean> {
  const supabase = createServerClient();

  const { data, error } = await supabase
    .from('subscriptions')
    .select('status, current_period_end')
    .eq('user_id', userId)
    .in('status', ['active', 'trialing', 'past_due'])
    .gte('current_period_end', new Date().toISOString())
    .single();

  return !!data && !error;
}
```

### 2. Get Subscription Details
```typescript
export async function getSubscriptionDetails(userId: string) {
  const supabase = createServerClient();

  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  return data;
}
```

### 3. Conditional Content Query (Sanity)
```typescript
export async function getPost(slug: string, hasAccess: boolean) {
  const query = `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    isPremium,
    publishedAt,
    author->,
    ${hasAccess ? 'content' : 'excerpt'}
  }`;

  return sanityClient.fetch(query, { slug });
}
```

---

## Migration Scripts

### Initial Migration
```sql
-- migrations/001_create_subscriptions.sql
-- Run this after Supabase project setup

BEGIN;

-- Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
  -- (full schema from above)
);

-- Create indexes
-- (indexes from above)

-- Enable RLS
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- (policies from above)

-- Create trigger
-- (trigger from above)

COMMIT;
```

---

## Data Cleanup

### Expired Subscriptions Cleanup (Optional Cron Job)
```sql
-- Delete canceled subscriptions older than 90 days
DELETE FROM public.subscriptions
WHERE status = 'canceled'
  AND updated_at < NOW() - INTERVAL '90 days';
```

---

**다음 단계**: API 계약 정의 (`contracts/`)
