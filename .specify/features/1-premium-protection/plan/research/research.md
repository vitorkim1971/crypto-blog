# 기술 연구: 프리미엄 콘텐츠 보호 시스템

**작성일**: 2025-11-16
**상태**: 완료
**연구자**: Implementation Planning Phase

## 개요

이 문서는 프리미엄 콘텐츠 보호 시스템 구현을 위한 기술적 결정사항을 연구하고 문서화합니다.

---

## Research 1: 구독 검증 위치 (Middleware vs Server Components)

### 연구 질문
Next.js 14 App Router에서 프리미엄 콘텐츠 접근 제어를 구현하기 위한 최적 패턴은 무엇인가?

### 옵션 비교

| 옵션 | 장점 | 단점 | 적합성 |
|------|------|------|--------|
| **Middleware** | - 페이지 렌더링 전 실행<br>- 모든 요청 가로채기<br>- 빠른 리다이렉트 | - Edge Runtime 제한<br>- DB 직접 접근 불가<br>- 복잡한 로직 어려움 | ⭐⭐⭐ 중간 |
| **Server Components** | - Full Node.js Runtime<br>- DB 직접 쿼리 가능<br>- 복잡한 로직 지원 | - 페이지별 중복 코드<br>- 렌더링 후 체크 | ⭐⭐⭐⭐ 높음 |
| **API Routes** | - 백엔드 로직 분리<br>- 재사용 가능 | - 추가 네트워크 요청<br>- 복잡한 구조 | ⭐⭐ 낮음 |

### 결정: 하이브리드 접근 (Middleware + Server Components)

**선택된 패턴**:
1. **Middleware**: 미인증 사용자 조기 리다이렉트
   - 로그인하지 않은 사용자를 `/login?callbackUrl=/blog/[slug]`로 리다이렉트
   - Edge Runtime에서 빠른 처리

2. **Server Component**: 구독 상태 검증 및 콘텐츠 렌더링
   - `app/blog/[slug]/page.tsx`에서 Supabase 직접 쿼리
   - 구독 상태 확인 → 페이월 또는 전체 콘텐츠 렌더링

### 근거
- Next.js 14 공식 문서 권장 패턴
- Middleware는 인증 체크, Server Component는 권한 체크 분리
- Edge Runtime 제한 회피 (Supabase 클라이언트 사용 가능)

### 구현 예시
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const session = await getSession(request);
  if (!session && request.nextUrl.pathname.startsWith('/blog/')) {
    return NextResponse.redirect('/login?callbackUrl=' + request.nextUrl.pathname);
  }
}

// app/blog/[slug]/page.tsx (Server Component)
async function BlogPost({ params }: { params: { slug: string } }) {
  const post = await getPost(params.slug);
  if (post.isPremium) {
    const subscription = await checkSubscription();
    if (!subscription?.isActive) {
      return <Paywall post={post} />;
    }
  }
  return <FullPost post={post} />;
}
```

---

## Research 2: Stripe Webhook 처리 패턴

### 연구 질문
Next.js App Router 환경에서 Stripe Webhook을 안전하고 효율적으로 처리하는 방법은?

### 옵션 비교

| 옵션 | 장점 | 단점 | 적합성 |
|------|------|------|--------|
| **API Route (app/api/webhooks/stripe)** | - 표준 Next.js 패턴<br>- Vercel 자동 배포<br>- 환경 변수 접근 | - Cold start 가능성<br>- 타임아웃 제한 | ⭐⭐⭐⭐⭐ 최적 |
| **Vercel Edge Functions** | - 글로벌 배포<br>- 낮은 지연 | - Runtime 제한<br>- DB 접근 복잡 | ⭐⭐ 낮음 |
| **외부 서비스 (n8n, Zapier)** | - No-code 솔루션 | - 추가 비용<br>- 보안 위험 | ⭐ 매우 낮음 |

### 결정: API Route (`app/api/webhooks/stripe/route.ts`)

**구현 패턴**:
```typescript
// app/api/webhooks/stripe/route.ts
import { headers } from 'next/headers';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(req: Request) {
  const body = await req.text();
  const signature = headers().get('stripe-signature')!;

  // 1. Webhook 서명 검증
  const event = stripe.webhooks.constructEvent(
    body,
    signature,
    process.env.STRIPE_WEBHOOK_SECRET!
  );

  // 2. 이벤트 타입별 처리
  switch (event.type) {
    case 'checkout.session.completed':
      await handleCheckoutCompleted(event.data.object);
      break;
    case 'customer.subscription.updated':
      await handleSubscriptionUpdated(event.data.object);
      break;
    case 'customer.subscription.deleted':
      await handleSubscriptionDeleted(event.data.object);
      break;
  }

  return new Response('OK', { status: 200 });
}
```

### 핵심 구현 사항
1. **서명 검증 필수**: `stripe.webhooks.constructEvent()` 사용
2. **멱등성 보장**: Stripe `idempotency_key` 활용 또는 DB에 이벤트 ID 저장
3. **재시도 처리**: Stripe는 3일간 재시도, 200 응답으로 성공 확인
4. **빠른 응답**: 3초 이내 200 응답, 무거운 작업은 백그라운드 큐

### 처리할 Webhook 이벤트
- `checkout.session.completed`: 구독 생성
- `customer.subscription.updated`: 구독 변경
- `customer.subscription.deleted`: 구독 취소
- `invoice.payment_failed`: 결제 실패

---

## Research 3: 세션 캐싱 전략

### 연구 질문
5분 TTL 요구사항을 충족하면서 성능과 비용을 최적화하는 캐싱 전략은?

### 옵션 비교

| 옵션 | 장점 | 단점 | 비용 | 적합성 |
|------|------|------|------|--------|
| **React Cache (Server Components)** | - Zero cost<br>- Next.js 내장<br>- 간단 | - 요청 범위만<br>- 공유 불가 | $0 | ⭐⭐⭐ 중간 |
| **Vercel KV (Redis)** | - 지속성<br>- 글로벌 캐시 | - 추가 비용<br>- 설정 복잡 | $20+/월 | ⭐⭐⭐⭐ 높음 |
| **Supabase 직접 쿼리** | - 단순<br>- 추가 인프라 없음 | - 매 요청 쿼리<br>- DB 부하 | $0 | ⭐⭐ 낮음 |

### 결정: React Cache + Vercel KV (단계적 도입)

**Phase 1 (출시 전)**: React Cache
```typescript
import { cache } from 'react';

export const getSubscriptionStatus = cache(async (userId: string) => {
  const supabase = createClient();
  const { data } = await supabase
    .from('subscriptions')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'active')
    .single();

  return data;
});
```

**Phase 2 (트래픽 증가 시)**: Vercel KV 추가
```typescript
import { kv } from '@vercel/kv';

export async function getSubscriptionStatus(userId: string) {
  // 1. KV 캐시 확인
  const cached = await kv.get(`subscription:${userId}`);
  if (cached) return cached;

  // 2. DB 쿼리
  const subscription = await queryDatabase(userId);

  // 3. 5분 TTL로 캐싱
  await kv.setex(`subscription:${userId}`, 300, subscription);

  return subscription;
}
```

### 캐시 무효화 전략
- Stripe Webhook 수신 시 즉시 KV 캐시 삭제
- 사용자 로그아웃 시 캐시 삭제
- 5분 후 자동 만료 (TTL)

---

## Research 4: Sanity CMS 보안 쿼리 패턴

### 연구 질문
비구독자에게 프리미엄 콘텐츠가 API 응답에 유출되지 않도록 하는 방법은?

### 옵션 비교

| 옵션 | 보안 | 성능 | 복잡도 | 적합성 |
|------|------|------|--------|--------|
| **GROQ 조건부 투영** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | 중간 | ⭐⭐⭐⭐⭐ 최적 |
| **Server-side 필터링** | ⭐⭐⭐⭐ | ⭐⭐⭐ | 낮음 | ⭐⭐⭐ 중간 |
| **별도 API 엔드포인트** | ⭐⭐⭐ | ⭐⭐ | 높음 | ⭐⭐ 낮음 |

### 결정: GROQ 조건부 투영 + Server-side 이중 검증

**구현 패턴**:
```typescript
// lib/sanity/queries.ts
export function getPostQuery(hasAccess: boolean) {
  return `*[_type == "post" && slug.current == $slug][0]{
    _id,
    title,
    slug,
    isPremium,
    excerpt,
    publishedAt,
    author->,
    category->,
    coverImage,
    // 조건부 콘텐츠 반환
    ${hasAccess ? 'content' : 'content[0...100]'} // 비구독자는 100자만
  }`;
}

// Server Component
async function getPost(slug: string, userId: string) {
  const hasAccess = await checkSubscription(userId);
  const query = getPostQuery(hasAccess);
  const post = await sanityClient.fetch(query, { slug });

  // 이중 검증: 서버 측에서 한 번 더 체크
  if (post.isPremium && !hasAccess) {
    return {
      ...post,
      content: null, // 완전 차단
    };
  }

  return post;
}
```

### 보안 강화 사항
1. **GROQ 투영**: Sanity API 응답에서 아예 제외
2. **Server-side 필터링**: 이중 검증으로 우회 방지
3. **타입 안전성**: TypeScript로 `content` 필드 조건부 타입 정의

---

## 최종 기술 스택 결정

### Architecture Overview
```
┌─────────────────┐
│   Next.js App   │
│   (Middleware)  │ ← 미인증 체크
└────────┬────────┘
         │
┌────────▼────────┐
│ Server Component│ ← 구독 검증
│  (Blog Post)    │
└────────┬────────┘
         │
    ┌────┴─────┐
    │          │
┌───▼──┐  ┌───▼──────┐
│Sanity│  │ Supabase │
│(CMS) │  │ (Subscr.)│
└──────┘  └──────────┘
              ▲
              │ Webhook
         ┌────┴─────┐
         │  Stripe  │
         └──────────┘
```

### 선택된 기술
1. **구독 검증**: Middleware (인증) + Server Components (권한)
2. **Webhook 처리**: Next.js API Route (`app/api/webhooks/stripe/route.ts`)
3. **캐싱**: Phase 1 - React Cache, Phase 2 - Vercel KV
4. **보안 쿼리**: GROQ 조건부 투영 + Server-side 이중 검증

### 성능 목표
- 페이지 로드: < 1초 (캐싱 활용)
- Webhook 동기화: < 3초 (요구사항 충족)
- 세션 캐시 TTL: 5분 (요구사항 충족)

---

## 다음 단계

✅ 모든 "NEEDS CLARIFICATION" 해결 완료
📋 **Phase 1**: 데이터 모델 및 API 계약 설계
