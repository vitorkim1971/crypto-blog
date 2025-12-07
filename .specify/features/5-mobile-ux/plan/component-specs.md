# 컴포넌트 스펙: 모바일 UX

**작성일**: 2025-11-16
**상태**: 확정

## 개요

모바일 UX 개선을 위한 주요 컴포넌트 (드로어, 스켈레톤, 에러 페이지) 스펙을 정의합니다.

---

## 1. 모바일 드로어 (MobileDrawer)

### 구조

```tsx
'use client';

import { useState } from 'react';
import { XMarkIcon, Bars3Icon } from '@heroicons/react/24/outline';

export function MobileDrawer() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 햄버거 버튼 (모바일만 표시) */}
      <button
        className="md:hidden p-2"
        onClick={() => setIsOpen(true)}
        aria-label="메뉴 열기"
      >
        <Bars3Icon className="w-6 h-6" />
      </button>

      {/* 배경 오버레이 */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* 드로어 */}
      <div
        className={`fixed top-0 right-0 h-full w-[80%] max-w-[320px] bg-white z-50 shadow-xl transition-transform duration-300 ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* 헤더 */}
        <div className="flex items-center justify-between p-4 border-b border-gray-300">
          <h2 className="font-serif text-xl font-bold">CryptoTitan</h2>
          <button onClick={() => setIsOpen(false)} aria-label="메뉴 닫기">
            <XMarkIcon className="w-6 h-6" />
          </button>
        </div>

        {/* 네비게이션 */}
        <nav className="p-4 space-y-1">
          {categories.map((category) => (
            <a
              key={category}
              href={`/category/${category}`}
              className="block py-3 px-4 text-base text-black hover:bg-gray-100 rounded-lg"
              onClick={() => setIsOpen(false)}
            >
              {category}
            </a>
          ))}
        </nav>

        {/* 액션 버튼 */}
        <div className="p-4 space-y-2 border-t border-gray-300">
          <button className="w-full py-3 text-black border border-black rounded-full">
            로그인
          </button>
          <button className="w-full py-3 bg-black text-white rounded-full">
            구독하기
          </button>
        </div>
      </div>
    </>
  );
}
```

### 주요 특징

| 항목 | 값 |
|------|-----|
| 너비 | 화면의 80%, 최대 320px |
| 애니메이션 | `translate-x`, 300ms |
| 배경 오버레이 | `bg-black/50` |
| 터치 타겟 | 최소 48px 높이 |
| 닫기 동작 | 오버레이 클릭, X 버튼, 링크 클릭 |

---

## 2. 로딩 스켈레톤 (LoadingSkeleton)

### 블로그 글 스켈레톤

```tsx
export function BlogPostSkeleton() {
  return (
    <div className="max-w-[680px] mx-auto px-4 pt-12 animate-pulse">
      {/* 커버 이미지 */}
      <div className="w-full h-[400px] bg-gray-200 mb-12 rounded-lg" />

      {/* 제목 */}
      <div className="space-y-3 mb-4">
        <div className="h-12 bg-gray-200 rounded w-full" />
        <div className="h-12 bg-gray-200 rounded w-4/5" />
      </div>

      {/* 메타 정보 */}
      <div className="flex items-center space-x-4 mb-12 pb-8 border-b border-gray-300">
        <div className="h-4 bg-gray-200 rounded w-24" />
        <div className="h-4 bg-gray-200 rounded w-20" />
        <div className="h-4 bg-gray-200 rounded w-16" />
      </div>

      {/* 본문 */}
      <div className="space-y-3">
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-11/12" />
        <div className="h-4 bg-gray-200 rounded w-full" />
        <div className="h-4 bg-gray-200 rounded w-10/12" />
        <div className="h-4 bg-gray-200 rounded w-full" />
      </div>
    </div>
  );
}
```

### PostCard 스켈레톤

```tsx
export function PostCardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="flex gap-6">
        {/* 썸네일 */}
        <div className="w-48 h-32 bg-gray-200 flex-shrink-0 rounded" />

        {/* 콘텐츠 */}
        <div className="flex-1 space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4" />
          <div className="h-6 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-full" />
          <div className="h-4 bg-gray-200 rounded w-2/3" />
          <div className="flex items-center space-x-2">
            <div className="h-3 bg-gray-200 rounded w-20" />
            <div className="h-3 bg-gray-200 rounded w-16" />
          </div>
        </div>
      </div>
    </div>
  );
}
```

### 홈페이지 스켈레톤

```tsx
export function HomePageSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <div className="space-y-8">
        {[...Array(6)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
```

### 스켈레톤 개수 (반응형)

```tsx
// lib/constants/skeleton.ts
export const SKELETON_COUNTS = {
  mobile: 3,    // < 768px
  tablet: 4,    // 768px - 1024px
  desktop: 6,   // >= 1024px
};

// 사용 예시
function HomePage() {
  const skeletonCount = useSkeletonCount(); // Custom hook

  if (loading) {
    return (
      <div className="space-y-8">
        {[...Array(skeletonCount)].map((_, i) => (
          <PostCardSkeleton key={i} />
        ))}
      </div>
    );
  }
}
```

---

## 3. 에러 페이지 (ErrorPage)

### Not Found (404)

```tsx
// app/not-found.tsx
export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 아이콘 */}
        <div className="text-6xl mb-4">🔍</div>

        {/* 제목 */}
        <h1 className="font-serif text-4xl font-bold text-black mb-4">
          페이지를 찾을 수 없습니다
        </h1>

        {/* 설명 */}
        <p className="text-lg text-gray-700 mb-8">
          요청하신 페이지가 존재하지 않거나 이동되었습니다.
        </p>

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <a
            href="/"
            className="inline-block w-full py-3 bg-black text-white rounded-full hover:bg-gray-900"
          >
            홈으로 돌아가기
          </a>
          <button
            onClick={() => window.history.back()}
            className="inline-block w-full py-3 border border-black rounded-full hover:bg-gray-100"
          >
            이전 페이지로
          </button>
        </div>
      </div>
    </div>
  );
}
```

### Error Boundary (500)

```tsx
// app/error.tsx
'use client';

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        {/* 아이콘 */}
        <div className="text-6xl mb-4">⚠️</div>

        {/* 제목 */}
        <h1 className="font-serif text-4xl font-bold text-black mb-4">
          문제가 발생했습니다
        </h1>

        {/* 설명 */}
        <p className="text-lg text-gray-700 mb-8">
          콘텐츠를 불러오는 중 오류가 발생했습니다.
        </p>

        {/* 에러 메시지 (개발 환경만) */}
        {process.env.NODE_ENV === 'development' && (
          <pre className="text-left text-sm bg-gray-100 p-4 rounded mb-8 overflow-auto">
            {error.message}
          </pre>
        )}

        {/* 액션 버튼 */}
        <div className="space-y-3">
          <button
            onClick={reset}
            className="inline-block w-full py-3 bg-black text-white rounded-full hover:bg-gray-900"
          >
            다시 시도
          </button>
          <a
            href="/"
            className="inline-block w-full py-3 border border-black rounded-full hover:bg-gray-100"
          >
            홈으로 돌아가기
          </a>
        </div>
      </div>
    </div>
  );
}
```

### API 에러 처리

```tsx
// components/ErrorMessage.tsx
export function ErrorMessage({
  title = '오류가 발생했습니다',
  message = '잠시 후 다시 시도해주세요',
  onRetry,
}: {
  title?: string;
  message?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-4xl mb-4">🔌</div>
      <h3 className="font-serif text-2xl font-bold mb-2">{title}</h3>
      <p className="text-gray-700 mb-6">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-900"
        >
          다시 시도
        </button>
      )}
    </div>
  );
}
```

---

## 4. 터치 타겟 가이드라인

### 최소 크기

| 요소 | 최소 크기 | 권장 크기 |
|------|-----------|-----------|
| 버튼 | 44 x 44px | 48 x 48px |
| 링크 (텍스트) | 44px 높이 | 48px 높이 |
| 아이콘 버튼 | 44 x 44px | 48 x 48px |
| 카드 (클릭 가능) | 전체 영역 | 전체 영역 |

### Tailwind 클래스

```css
/* 최소 터치 타겟 */
.touch-target {
  @apply min-h-[44px] min-w-[44px];
}

/* 권장 터치 타겟 */
.touch-target-lg {
  @apply min-h-[48px] min-w-[48px];
}
```

### 적용 예시

```tsx
{/* 작은 아이콘 버튼 */}
<button className="p-3"> {/* 아이콘 24px + 패딩 12px = 48px */}
  <XMarkIcon className="w-6 h-6" />
</button>

{/* 텍스트 링크 */}
<a className="block py-3 px-4"> {/* py-3 = 12px * 2 + 텍스트 = 48px+ */}
  카테고리
</a>

{/* 작은 버튼 */}
<button className="px-6 py-3"> {/* py-3 충분히 큼 */}
  로그인
</button>
```

---

## 5. 애니메이션 가이드라인

### 드로어 애니메이션

```css
/* 슬라이드 인/아웃 */
.drawer-enter {
  @apply transition-transform duration-300 ease-in-out;
}

/* 오버레이 페이드 */
.overlay-enter {
  @apply transition-opacity duration-200 ease-in-out;
}
```

### 스켈레톤 Shimmer

```css
/* Tailwind 기본 animate-pulse 사용 */
.skeleton {
  @apply animate-pulse bg-gray-200 rounded;
}
```

### 성능 고려사항

```tsx
{/* GPU 가속 (transform 사용) */}
<div className="transition-transform"> {/* ✅ 좋음 */}

{/* CPU 렌더링 (left 사용) */}
<div className="transition-left"> {/* ❌ 나쁨 */}

{/* will-change 사용 (애니메이션 전) */}
<div className="will-change-transform">
```

---

## 구현 체크리스트

### 모바일 드로어

- [ ] 햄버거 버튼 추가 (Header 우측)
- [ ] 드로어 컴포넌트 생성
- [ ] 배경 오버레이 추가
- [ ] 슬라이드 애니메이션 (300ms)
- [ ] 터치 타겟 48px 이상
- [ ] 드로어 외부 클릭 시 닫힘
- [ ] ESC 키로 닫힘
- [ ] 접근성 (aria-label)

### 로딩 스켈레톤

- [ ] 블로그 글 스켈레톤
- [ ] PostCard 스켈레톤
- [ ] 홈페이지 스켈레톤
- [ ] 반응형 개수 (3/4/6)
- [ ] Pulse 애니메이션

### 에러 페이지

- [ ] not-found.tsx (404)
- [ ] error.tsx (500)
- [ ] ErrorMessage 컴포넌트
- [ ] 친절한 메시지
- [ ] 액션 버튼 (재시도, 홈)

---

**관련 문서**: [구현 계획](./plan.md)
