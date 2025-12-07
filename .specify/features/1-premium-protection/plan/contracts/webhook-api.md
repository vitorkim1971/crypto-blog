# API Contract: Stripe Webhook Handler

**Endpoint**: `/api/webhooks/stripe`
**Method**: `POST`
**Purpose**: Stripe 이벤트 수신 및 구독 상태 동기화

---

## Request

### Headers

| Header | Required | Value | Description |
|--------|----------|-------|-------------|
| `stripe-signature` | ✅ Yes | `string` | Stripe webhook 서명 (HMAC SHA256) |
| `Content-Type` | ✅ Yes | `application/json` | |

### Body

Raw Stripe event JSON (서명 검증용)

```json
{
  "id": "evt_1234567890",
  "object": "event",
  "type": "checkout.session.completed",
  "data": {
    "object": {
      // Event-specific data
    }
  },
  "created": 1638360000,
  "livemode": false
}
```

---

## Response

### Success (200 OK)

```json
{
  "received": true
}
```

### Error Responses

#### 400 Bad Request - Invalid Signature
```json
{
  "error": {
    "code": "INVALID_SIGNATURE",
    "message": "Webhook signature verification failed"
  }
}
```

#### 500 Internal Server Error - Processing Failed
```json
{
  "error": {
    "code": "PROCESSING_ERROR",
    "message": "Failed to process webhook event"
  }
}
```

---

## Supported Events

### 1. `checkout.session.completed`

**Trigger**: 사용자가 구독 결제 완료
**Action**: 새 구독 레코드 생성

#### Event Data
```typescript
{
  id: string; // 세션 ID
  customer: string; // Stripe Customer ID
  subscription: string; // Stripe Subscription ID
  client_reference_id: string; // User ID (Supabase)
  metadata: {
    userId: string; // User ID
  }
}
```

#### Database Action
```sql
INSERT INTO public.subscriptions (
  user_id,
  stripe_customer_id,
  stripe_subscription_id,
  stripe_price_id,
  status,
  current_period_start,
  current_period_end
) VALUES (...);
```

---

### 2. `customer.subscription.updated`

**Trigger**: 구독 상태 변경 (갱신, 취소, 다운그레이드 등)
**Action**: 기존 구독 레코드 업데이트

#### Event Data
```typescript
{
  id: string; // Subscription ID
  customer: string; // Customer ID
  status: 'active' | 'past_due' | 'canceled' | ...; // 새 상태
  current_period_start: number; // Unix timestamp
  current_period_end: number; // Unix timestamp
  cancel_at_period_end: boolean;
  canceled_at: number | null;
  trial_start: number | null;
  trial_end: number | null;
}
```

#### Database Action
```sql
UPDATE public.subscriptions
SET
  status = $1,
  current_period_start = $2,
  current_period_end = $3,
  cancel_at_period_end = $4,
  canceled_at = $5,
  trial_start = $6,
  trial_end = $7,
  updated_at = NOW()
WHERE stripe_subscription_id = $subscription_id;
```

---

### 3. `customer.subscription.deleted`

**Trigger**: 구독 완전 삭제 (즉시 취소 또는 만료)
**Action**: 구독 상태를 'canceled'로 변경

#### Event Data
```typescript
{
  id: string; // Subscription ID
  customer: string;
  status: 'canceled';
  canceled_at: number;
}
```

#### Database Action
```sql
UPDATE public.subscriptions
SET
  status = 'canceled',
  canceled_at = $1,
  updated_at = NOW()
WHERE stripe_subscription_id = $subscription_id;
```

---

### 4. `invoice.payment_failed`

**Trigger**: 구독 갱신 결제 실패
**Action**: 구독 상태를 'past_due'로 변경

#### Event Data
```typescript
{
  id: string; // Invoice ID
  customer: string;
  subscription: string;
  status: 'open' | 'paid' | 'uncollectible';
  attempt_count: number; // 결제 재시도 횟수
}
```

#### Database Action
```sql
UPDATE public.subscriptions
SET
  status = 'past_due',
  updated_at = NOW()
WHERE stripe_subscription_id = $subscription_id;
```

---

## Implementation

### Handler Flow

```
┌────────────────┐
│  Stripe Event  │
└───────┬────────┘
        │
        ▼
┌────────────────────────┐
│ Signature Verification │
│  (stripe-signature)    │
└───────┬────────────────┘
        │
        ├─ Invalid ──► 400 Error
        │
        ▼ Valid
┌────────────────────────┐
│   Event Type Router    │
└───────┬────────────────┘
        │
        ├─ checkout.session.completed ──► createSubscription()
        ├─ customer.subscription.updated ──► updateSubscription()
        ├─ customer.subscription.deleted ──► cancelSubscription()
        ├─ invoice.payment_failed ──► markPastDue()
        │
        └─ Unknown Event ──► Log & Return 200
                │
                ▼
        ┌───────────────┐
        │  Update Cache │ (Vercel KV)
        └───────┬───────┘
                │
                ▼
        ┌───────────────┐
        │   Return 200  │
        └───────────────┘
```

### Example Implementation

```typescript
// app/api/webhooks/stripe/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    // 1. Read raw body
    const body = await req.text();
    const signature = headers().get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: { code: 'MISSING_SIGNATURE', message: 'Missing stripe-signature header' } },
        { status: 400 }
      );
    }

    // 2. Verify webhook signature
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(
        body,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      return NextResponse.json(
        { error: { code: 'INVALID_SIGNATURE', message: 'Webhook signature verification failed' } },
        { status: 400 }
      );
    }

    // 3. Route by event type
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        await handleCheckoutCompleted(session);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdated(subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeleted(subscription);
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        await handlePaymentFailed(invoice);
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // 4. Return 200
    return NextResponse.json({ received: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: { code: 'PROCESSING_ERROR', message: 'Failed to process webhook event' } },
      { status: 500 }
    );
  }
}

// Helper functions
async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
  const userId = session.client_reference_id || session.metadata?.userId;

  await supabase.from('subscriptions').insert({
    user_id: userId,
    stripe_customer_id: session.customer as string,
    stripe_subscription_id: subscription.id,
    stripe_price_id: subscription.items.data[0].price.id,
    status: subscription.status,
    current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
    current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
  });
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
      canceled_at: subscription.canceled_at
        ? new Date(subscription.canceled_at * 1000).toISOString()
        : null,
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await supabase
    .from('subscriptions')
    .update({
      status: 'canceled',
      canceled_at: new Date().toISOString(),
    })
    .eq('stripe_subscription_id', subscription.id);
}

async function handlePaymentFailed(invoice: Stripe.Invoice) {
  await supabase
    .from('subscriptions')
    .update({ status: 'past_due' })
    .eq('stripe_subscription_id', invoice.subscription as string);
}
```

---

## Testing

### Local Testing with Stripe CLI

```bash
# Install Stripe CLI
# https://stripe.com/docs/stripe-cli

# Login
stripe login

# Forward events to local server
stripe listen --forward-to localhost:3001/api/webhooks/stripe

# Trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
stripe trigger invoice.payment_failed
```

### Test Checklist

- [ ] Signature verification works
- [ ] `checkout.session.completed` creates subscription
- [ ] `customer.subscription.updated` updates status
- [ ] `customer.subscription.deleted` marks as canceled
- [ ] `invoice.payment_failed` marks as past_due
- [ ] Invalid signature returns 400
- [ ] Processing error returns 500
- [ ] Unknown events return 200 (logged)

---

## Security

### Required Environment Variables

```env
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...
```

### Security Checklist

- ✅ Always verify webhook signature
- ✅ Use service role key for database updates (bypass RLS)
- ✅ Never expose sensitive keys in client-side code
- ✅ Use HTTPS in production
- ✅ Implement rate limiting (Vercel auto-handles)

---

**Related**: [Data Model](../data-model.md)
**Next**: [Quickstart Guide](../quickstart.md)
