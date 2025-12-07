# Victor's Alpha Blog - 암호화폐 투자 블로그 플랫폼

수익화를 위한 풀스택 블로그 플랫폼입니다. Next.js 14, Supabase, Sanity CMS, Stripe를 활용한 프리미엄 콘텐츠 구독 시스템을 포함합니다.

## 주요 기능

### 🎯 콘텐츠 관리
- **6개 전문 카테고리**
  - 입문자 라운지 (기초 콘텐츠)
  - 실전 투자관 (중급 전략)
  - 고급 전략실 (DeFi, NFT 등)
  - 인사이트 라운지 (시장 분석)
  - 실패 투자 아카이브 (차별화 콘텐츠)
  - Titan 생태계 이야기 (개인 브랜딩)

### 💰 수익화 기능
- **Stripe 프리미엄 구독**
  - 월간 구독 ($9.99/월)
  - 연간 구독 ($99.99/년, 20% 할인)
  - 자동 갱신 및 취소 관리
  - Webhook을 통한 실시간 구독 상태 동기화

- **뉴스레터**
  - Resend를 통한 이메일 발송
  - 구독자 관리 시스템
  - 자동 환영 이메일

### 🔐 사용자 인증
- NextAuth.js 기반 인증
- 이메일 로그인
- Google OAuth (설정 가능)
- 프로필 관리

### 📝 CMS
- Sanity.io를 통한 콘텐츠 관리
- 실시간 미리보기
- 이미지 최적화
- 태그 및 카테고리 관리

### 🎨 UI/UX
- 반응형 디자인
- Tailwind CSS
- 프리미엄 콘텐츠 배지
- 읽기 시간 표시

## 기술 스택

### Frontend
- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **Tailwind CSS**

### Backend & Database
- **Supabase** (PostgreSQL, Auth, Storage)
- **Sanity CMS** (Headless CMS)

### 결제 & 이메일
- **Stripe** (구독 결제)
- **Resend** (이메일 발송)

### 인증
- **NextAuth.js**

### 배포
- **Vercel** (권장)

## 시작하기

### 1. 패키지 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.local.example`을 복사하여 `.env.local` 파일을 생성하고 아래 값들을 설정합니다:

#### Supabase 설정
1. [Supabase](https://supabase.com)에서 새 프로젝트 생성
2. `supabase-schema.sql` 파일의 내용을 SQL 에디터에서 실행
3. Project Settings에서 API 키 복사

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### NextAuth 설정
```bash
# 비밀 키 생성
openssl rand -base64 32
```

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your_random_secret_key
```

#### Stripe 설정
1. [Stripe Dashboard](https://dashboard.stripe.com)에서 계정 생성
2. API 키 복사
3. 두 개의 구독 상품 생성 (Monthly, Yearly)

```env
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
STRIPE_SECRET_KEY=your_stripe_secret_key
STRIPE_WEBHOOK_SECRET=your_stripe_webhook_secret
STRIPE_PRICE_ID_MONTHLY=price_xxx
STRIPE_PRICE_ID_YEARLY=price_xxx
```

#### Resend 설정
1. [Resend](https://resend.com)에서 계정 생성
2. API 키 생성

```env
RESEND_API_KEY=your_resend_api_key
RESEND_FROM_EMAIL=noreply@yourdomain.com
```

#### Sanity CMS 설정
1. [Sanity](https://www.sanity.io)에서 새 프로젝트 생성
2. 프로젝트 ID 복사

```env
NEXT_PUBLIC_SANITY_PROJECT_ID=your_sanity_project_id
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=your_sanity_api_token
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:3000](http://localhost:3000)을 엽니다.

## 배포

### Vercel 배포

1. GitHub에 저장소 푸시
2. [Vercel](https://vercel.com)에서 프로젝트 import
3. 환경 변수 설정
4. 배포

### Stripe Webhook 설정

배포 후:
1. Stripe Dashboard에서 Webhook 엔드포인트 추가
2. URL: `https://your-domain.vercel.app/api/stripe/webhook`
3. 이벤트:
   - `checkout.session.completed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

## 프로젝트 구조

```
crypto-blog/
├── src/
│   ├── app/                 # Next.js App Router
│   ├── components/          # React 컴포넌트
│   ├── lib/                # 유틸리티
│   └── types/              # TypeScript 타입
├── public/                 # 정적 파일
├── supabase-schema.sql     # DB 스키마
└── .env.local.example      # 환경 변수
```

## 다음 단계

### 콘텐츠 추가
1. Sanity Studio에서 Author 생성
2. Post 작성
3. 프리미엄 콘텐츠 마킹

### 커스터마이징
- 카테고리 수정 ([src/types/index.ts](src/types/index.ts))
- 브랜딩 업데이트
- 색상 스킴 변경

## 라이선스

MIT License
