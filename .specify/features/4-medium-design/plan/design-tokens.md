# 디자인 토큰: Medium 스타일

**작성일**: 2025-11-16
**상태**: 확정

## 개요

이 문서는 Medium 스타일 디자인의 핵심 디자인 토큰(색상, 타이포그래피, 여백)을 정의합니다.

---

## 색상 팔레트

### Primary Colors

```css
/* 검정-회색-흰색만 사용 */
--color-black: #000000;
--color-gray-900: #242424;  /* 텍스트 */
--color-gray-700: #757575;  /* 서브텍스트 */
--color-gray-300: #E6E6E6;  /* 테두리 */
--color-gray-100: #F7F7F7;  /* 배경 */
--color-white: #FFFFFF;

/* Accent (최소 사용) */
--color-green: #1A8917;     /* 성공, 프리미엄 */
```

### Tailwind 매핑

```javascript
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        medium: {
          black: '#000000',
          gray: {
            900: '#242424',
            700: '#757575',
            300: '#E6E6E6',
            100: '#F7F7F7',
          },
          green: '#1A8917',
        },
      },
    },
  },
};
```

---

## 타이포그래피

### Font Families

```typescript
// app/layout.tsx
import { Inter } from 'next/font/google';
import { Merriweather } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const merriweather = Merriweather({
  weight: ['300', '400', '700'],
  subsets: ['latin'],
  variable: '--font-serif',
});

// 사용:
// <body className={`${inter.variable} ${merriweather.variable}`}>
```

### Font Scales

| 요소 | 폰트 | 크기 | 굵기 | 행간 |
|------|------|------|------|------|
| H1 (블로그 제목) | Serif | 42px | 700 | 52px |
| H2 (섹션 제목) | Serif | 32px | 700 | 40px |
| H3 | Serif | 24px | 700 | 32px |
| 본문 | Sans | 18px | 400 | 32px |
| 캡션 | Sans | 14px | 400 | 20px |
| 버튼 | Sans | 14px | 500 | 20px |

### Tailwind Classes

```
제목 (큰):     font-serif text-5xl font-bold leading-tight
제목 (중):     font-serif text-4xl font-bold leading-snug
제목 (작):     font-serif text-2xl font-bold leading-normal
본문:          font-sans text-lg leading-relaxed
캡션:          font-sans text-sm text-gray-700
```

---

## 여백 시스템

### Spacing Scale

```css
/* Tailwind 기본값 활용 */
4px   → space-1
8px   → space-2
12px  → space-3
16px  → space-4
24px  → space-6
32px  → space-8
48px  → space-12
64px  → space-16
```

### 레이아웃 가이드

| 영역 | 여백 |
|------|------|
| 컨테이너 max-width | 680px (블로그 글), 1200px (홈) |
| 섹션 간 여백 | 64px (`space-16`) |
| 카드 간 여백 | 32px (`space-8`) |
| 요소 간 여백 | 16px (`space-4`) |
| 텍스트 줄 간격 | 32px (`leading-relaxed`) |

---

## 버튼 스타일

### Primary Button (구독)

```jsx
<button className="px-6 py-2 bg-black text-white rounded-full hover:bg-gray-900 transition">
  구독하기
</button>
```

### Secondary Button (로그인)

```jsx
<button className="px-6 py-2 border border-black rounded-full hover:bg-gray-100 transition">
  로그인
</button>
```

### Text Link

```jsx
<a className="text-black hover:underline">
  더 보기
</a>
```

---

## 테두리 & 구분선

### Border Styles

```css
/* 얇은 테두리 (1px) */
border-b border-gray-300

/* 두꺼운 테두리 (2px) */
border-b-2 border-black
```

### 사용 예시

```jsx
{/* Header 하단 */}
<header className="border-b border-gray-300">

{/* Footer 상단 */}
<footer className="border-t border-gray-300">

{/* 카드 구분 */}
<div className="border-b border-gray-300 pb-8 mb-8">
```

---

## 그림자 (최소 사용)

Medium 스타일은 그림자를 거의 사용하지 않지만, 필요 시:

```css
/* 카드 호버 효과 */
hover:shadow-sm

/* Shadow 정의 */
shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05)
```

---

## 반응형 브레이크포인트

```javascript
// tailwind.config.js (기본값 사용)
screens: {
  'sm': '640px',   // 모바일
  'md': '768px',   // 태블릿
  'lg': '1024px',  // 데스크톱
  'xl': '1280px',  // 대형 화면
}
```

### 사용 패턴

```jsx
{/* Mobile-first */}
<div className="text-2xl md:text-4xl lg:text-5xl">
  제목
</div>

<div className="px-4 md:px-8 lg:px-16">
  컨테이너
</div>
```

---

## 재사용 유틸리티 클래스

### Container

```jsx
{/* 블로그 글 컨테이너 */}
<article className="max-w-[680px] mx-auto px-4">

{/* 전체 너비 컨테이너 */}
<div className="max-w-7xl mx-auto px-4 md:px-8">
```

### Text Styles

```jsx
{/* 제목 */}
<h1 className="font-serif text-5xl font-bold leading-tight mb-4">

{/* 본문 */}
<p className="font-sans text-lg leading-relaxed text-gray-900 mb-6">

{/* 캡션 */}
<span className="text-sm text-gray-700">
```

### 카드 스타일

```jsx
<div className="py-8 border-b border-gray-300">
  {/* 내용 */}
</div>
```

---

## Tailwind Config 전체

```javascript
// tailwind.config.js
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        medium: {
          black: '#000000',
          gray: {
            900: '#242424',
            700: '#757575',
            300: '#E6E6E6',
            100: '#F7F7F7',
          },
          green: '#1A8917',
        },
      },
      fontFamily: {
        sans: ['var(--font-sans)'],
        serif: ['var(--font-serif)'],
      },
      maxWidth: {
        article: '680px',
      },
    },
  },
  plugins: [],
};

export default config;
```

---

## Before/After 예시

### Before (구식)

```jsx
<button className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg shadow-lg">
  구독하기
</button>
```

### After (Medium 스타일)

```jsx
<button className="bg-black text-white px-6 py-2 rounded-full hover:bg-gray-900 transition">
  구독하기
</button>
```

---

## 관련 문서

- [Implementation Plan](./plan.md)
- [Header 디자인 스펙](./design-specs/header.md)
- [Footer 디자인 스펙](./design-specs/footer.md)

---

**작성 완료**: 2025-11-16
