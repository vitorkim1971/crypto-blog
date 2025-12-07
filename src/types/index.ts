export interface User {
  id: string;
  email: string;
  name?: string;
  avatar?: string;
  isPremium: boolean;
  createdAt: string;
}

export interface Post {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content?: any; // eslint-disable-line @typescript-eslint/no-explicit-any
  coverImageUrl?: string;
  coverImage?: {
    url: string;
    metadata?: {
      dimensions: {
        width: number;
        height: number;
      };
    };
  };
  author: Author;
  category: Category;
  subcategory?: string;
  tags: string[];
  isPremium: boolean;
  publishedAt: string;
  _updatedAt: string;
  readingTime: number;
  views: number;
}

export interface Author {
  id: string;
  name: string;
  avatar?: string;
  bio?: string;
  social?: {
    twitter?: string;
    github?: string;
    linkedin?: string;
  };
}

export type CategorySlug =
  | 'beginner-lounge'
  | 'practical-investment'
  | 'advanced-strategy'
  | 'insights'
  | 'failure-archive'
  | 'vitor-story';

export interface SubCategory {
  slug: string;
  name: string;
}

export interface Category {
  slug: CategorySlug;
  name: string;
  description: string;
  icon?: string;
  subCategories?: SubCategory[];
}

export interface NewsletterSubscriber {
  id: string;
  email: string;
  name?: string;
  subscribedAt: string;
  isActive: boolean;
}

export interface Subscription {
  id: string;
  userId: string;
  stripeSubscriptionId: string;
  stripeCustomerId: string;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  plan: 'monthly' | 'yearly';
  currentPeriodEnd: string;
  cancelAtPeriodEnd: boolean;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  user: User;
  content: string;
  createdAt: string;
  updatedAt: string;
  parentId?: string;
  replies?: Comment[];
}

export const CATEGORIES: Category[] = [
  {
    slug: 'beginner-lounge',
    name: '입문자 라운지',
    description: '암호화폐 투자 기초부터 차근차근',
    subCategories: [
      { slug: 'guide-series', name: '입문 가이드 시리즈' },
      { slug: 'investor-type', name: '투자자 유형 분석' },
      { slug: 'level-up', name: '레벨업 성장기' },
      { slug: 'qna-clinic', name: 'Q&A 클리닉' },
    ]
  },
  {
    slug: 'practical-investment',
    name: '실전투자관',
    description: '검증된 중급 투자 전략',
    subCategories: [
      { slug: 'strategy-lab', name: '전략 실험실' },
      { slug: 'time-travel', name: '시간여행 투자일지' },
      { slug: 'psychology-experiment', name: '투자 심리 실험' },
      { slug: 'what-if', name: '만약에 시뮬레이터' },
    ]
  },
  {
    slug: 'advanced-strategy',
    name: '고급 전략실',
    description: 'DeFi, NFT 고급 투자 전략',
    subCategories: [
      { slug: 'contrarian-challenge', name: '역발상 투자 챌린지' },
      { slug: 'cycle-analysis', name: '사이클 분석 리포트' },
      { slug: 'defi-review', name: '디파이 프로젝트 리뷰' },
      { slug: 'airdrop-hunting', name: '에어드랍 헌팅 일지' },
    ]
  },
  {
    slug: 'insights',
    name: '인사이트 라운지',
    description: '시장 분석과 트렌드 인사이트',
    subCategories: [
      { slug: 'market-analysis', name: '시장 분석' },
      { slug: 'news-trends', name: '뉴스 & 트렌드' },
      { slug: 'column', name: '칼럼' },
    ]
  },
  {
    slug: 'failure-archive',
    name: '실패 투자 아카이브',
    description: '실패에서 배우는 투자 지혜',
    subCategories: [
      { slug: 'failure-anatomy', name: '실패 해부학 시리즈' },
      { slug: 'coin-autopsy', name: '코인 부검 시리즈' },
      { slug: 'failure-pattern', name: '실패 패턴 분석' },
      { slug: 'recovery-story', name: '회복 스토리' },
    ]
  },
  {
    slug: 'vitor-story',
    name: "Victor's 이야기",
    description: '투자 철학과 비하인드 스토리',
    subCategories: [
      { slug: 'wealth-dna', name: '부의 DNA 시리즈' },
      { slug: 'psychology-essay', name: '투자 심리 에세이' },
      { slug: 'philosophy-note', name: '투자 철학 노트' },
      { slug: 'behind-story', name: '비하인드 스토리' },
    ]
  }
];

export interface AdminUser {
  id: string;
  email: string;
  name: string | null;
  avatar_url: string | null;
  created_at: string;
  isPremium: boolean;
  subscription?: {
    status: string;
    current_period_end: string;
    plan_type: string;
  };
}
