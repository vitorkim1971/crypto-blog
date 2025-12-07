# 컴포넌트 디자인 스펙

**작성일**: 2025-11-16
**상태**: 확정

## 개요

각 컴포넌트의 Before/After 디자인 스펙을 정의합니다.

---

## 1. Header 컴포넌트

### Before (현재)

```jsx
<header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200">
  <div className="max-w-7xl mx-auto px-4">
    <nav className="flex items-center justify-between h-16">
      <Logo className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent" />

      <div className="space-x-6">
        <Link className="text-gray-600 hover:text-blue-600">홈</Link>
        <Link className="text-gray-600 hover:text-blue-600">카테고리</Link>
      </div>

      <div className="space-x-4">
        <button className="px-4 py-2 text-gray-700 hover:text-blue-600">로그인</button>
        <button className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg">
          구독하기
        </button>
      </div>
    </nav>
  </div>
</header>
```

### After (Medium 스타일)

```jsx
<header className="sticky top-0 z-50 bg-white border-b border-gray-300">
  <div className="max-w-7xl mx-auto px-4">
    <nav className="flex items-center justify-between h-16">
      {/* 로고 */}
      <h1 className="text-2xl font-serif font-bold text-black">
        CryptoTitan
      </h1>

      {/* 네비게이션 */}
      <div className="flex items-center space-x-8">
        <Link className="text-sm text-black hover:underline">홈</Link>
        <Link className="text-sm text-black hover:underline">카테고리</Link>
        <Link className="text-sm text-black hover:underline">소개</Link>
      </div>

      {/* 액션 버튼 */}
      <div className="flex items-center space-x-4">
        <button className="text-sm text-black hover:underline">
          로그인
        </button>
        <button className="px-4 py-1.5 bg-black text-white text-sm rounded-full hover:bg-gray-900 transition">
          구독하기
        </button>
      </div>
    </nav>
  </div>
</header>
```

### 변경 사항

| 항목 | Before | After |
|------|--------|-------|
| 배경 | `bg-white/80 backdrop-blur-lg` | `bg-white` (단색) |
| 로고 | 그라디언트 텍스트 | 검정 세리프 폰트 |
| 링크 | 파란색 호버 | 밑줄 호버 |
| 로그인 버튼 | 일반 버튼 | 텍스트 링크 |
| 구독 버튼 | 그라디언트 `rounded-lg` | 검정 `rounded-full` |

---

## 2. Footer 컴포넌트

### Before (현재)

```jsx
<footer className="bg-gray-900 text-white mt-20">
  <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="grid grid-cols-4 gap-8">
      <div>
        <h3 className="font-bold mb-4">CryptoTitan</h3>
        <p className="text-gray-400">암호화폐 인사이트 블로그</p>
      </div>
      {/* ... 기타 섹션 */}
    </div>
  </div>
</footer>
```

### After (Medium 스타일)

```jsx
<footer className="bg-white border-t border-gray-300 mt-20">
  <div className="max-w-7xl mx-auto px-4 py-12">
    <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-8 md:space-y-0">
      {/* 로고 & 설명 */}
      <div>
        <h3 className="font-serif text-xl font-bold text-black mb-2">
          CryptoTitan
        </h3>
        <p className="text-sm text-gray-700">
          암호화폐 투자 인사이트 블로그
        </p>
      </div>

      {/* 링크 */}
      <div className="flex space-x-8 text-sm">
        <a href="/about" className="text-gray-700 hover:text-black">소개</a>
        <a href="/contact" className="text-gray-700 hover:text-black">문의</a>
        <a href="/privacy" className="text-gray-700 hover:text-black">개인정보</a>
        <a href="/terms" className="text-gray-700 hover:text-black">이용약관</a>
      </div>
    </div>

    {/* Copyright */}
    <div className="mt-8 pt-8 border-t border-gray-300 text-center text-sm text-gray-700">
      © 2025 CryptoTitan. All rights reserved.
    </div>
  </div>
</footer>
```

### 변경 사항

| 항목 | Before | After |
|------|--------|-------|
| 배경 | `bg-gray-900` (어두움) | `bg-white` (밝음) |
| 텍스트 색상 | `text-white` | `text-black` / `text-gray-700` |
| 레이아웃 | 4열 그리드 | 1열 플렉스 |
| 구분선 | 없음 | `border-t` 상단만 |

---

## 3. 블로그 상세 페이지

### Before (현재)

```jsx
{/* 커버 이미지 없을 때 */}
<div className="bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 h-64">
  <h1 className="text-white text-4xl font-bold">{post.title}</h1>
</div>

{/* Premium 배지 */}
<span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-3 py-1 rounded-full">
  ⭐ Premium
</span>
```

### After (Medium 스타일)

```jsx
{/* 커버 이미지 있을 때 */}
{post.coverImage && (
  <div className="w-full h-[400px] relative mb-12">
    <Image
      src={post.coverImage.url}
      alt={post.title}
      fill
      className="object-cover"
    />
  </div>
)}

{/* 커버 이미지 없을 때 - 배경 없음! */}
<article className="max-w-[680px] mx-auto px-4 pt-12">
  {/* Premium 배지 */}
  {post.isPremium && (
    <span className="inline-flex items-center text-sm text-gray-700 mb-4">
      <span className="mr-1">⭐</span>
      Premium
    </span>
  )}

  {/* 제목 */}
  <h1 className="font-serif text-5xl font-bold leading-tight text-black mb-4">
    {post.title}
  </h1>

  {/* 메타 정보 */}
  <div className="flex items-center space-x-4 text-sm text-gray-700 mb-12 pb-8 border-b border-gray-300">
    <span>{post.author.name}</span>
    <span>·</span>
    <span>{formatDate(post.publishedAt)}</span>
    <span>·</span>
    <span>{post.readingTime}분 읽기</span>
  </div>

  {/* 본문 */}
  <div className="prose prose-lg max-w-none">
    {post.content}
  </div>
</article>
```

### 변경 사항

| 항목 | Before | After |
|------|--------|-------|
| 커버 없을 때 | 그라디언트 배경 | **배경 없음** (흰색만) |
| Premium 배지 | 그라디언트 pill | 심플한 텍스트 + ⭐ |
| 제목 크기 | `text-4xl` | `text-5xl` (더 큼) |
| 제목 폰트 | Sans-serif | **Serif** |
| 메타 정보 | 작은 텍스트 | 구분선 포함 |

---

## 4. 카테고리 페이지

### Before (현재)

```jsx
<div className="bg-gray-50 min-h-screen">
  <div className="max-w-7xl mx-auto px-4 py-12">
    <h1 className="text-3xl font-bold mb-8">{category} 카테고리</h1>

    <div className="grid grid-cols-3 gap-6">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  </div>
</div>
```

### After (Medium 스타일)

```jsx
<div className="bg-white min-h-screen">
  <div className="max-w-[1000px] mx-auto px-4 py-12">
    {/* 카테고리 헤더 */}
    <div className="mb-12 pb-8 border-b border-gray-300">
      <h1 className="font-serif text-4xl font-bold text-black mb-2">
        {category}
      </h1>
      <p className="text-gray-700">
        {posts.length}개의 게시글
      </p>
    </div>

    {/* 리스트 레이아웃 (Grid 제거) */}
    <div className="space-y-8">
      {posts.map(post => (
        <article key={post.id} className="pb-8 border-b border-gray-300 last:border-0">
          <PostCard post={post} variant="horizontal" />
        </article>
      ))}
    </div>
  </div>
</div>
```

### 변경 사항

| 항목 | Before | After |
|------|--------|-------|
| 배경 | `bg-gray-50` | `bg-white` |
| 레이아웃 | 3열 Grid | 1열 List |
| 카드 구분 | 간격만 | `border-b` 구분선 |
| 제목 폰트 | Sans-serif | Serif |

---

## 5. PostCard 컴포넌트 (Horizontal Variant)

### After (Medium 스타일)

```jsx
<article className="flex gap-6">
  {/* 썸네일 (왼쪽) */}
  {post.coverImage && (
    <div className="w-48 h-32 flex-shrink-0 relative">
      <Image
        src={post.coverImage.url}
        alt={post.title}
        fill
        className="object-cover"
      />
    </div>
  )}

  {/* 콘텐츠 (오른쪽) */}
  <div className="flex-1">
    {/* Premium 배지 */}
    {post.isPremium && (
      <span className="text-xs text-gray-700 mb-2 inline-block">
        ⭐ Premium
      </span>
    )}

    {/* 제목 */}
    <h2 className="font-serif text-2xl font-bold text-black mb-2 line-clamp-2">
      {post.title}
    </h2>

    {/* 발췌 */}
    <p className="text-base text-gray-700 mb-4 line-clamp-2">
      {post.excerpt}
    </p>

    {/* 메타 정보 */}
    <div className="flex items-center space-x-2 text-sm text-gray-700">
      <span>{post.author.name}</span>
      <span>·</span>
      <span>{formatDate(post.publishedAt)}</span>
      <span>·</span>
      <span>{post.readingTime}분</span>
    </div>
  </div>
</article>
```

---

## 구현 체크리스트

### Header

- [ ] 배경 단색 변경 (`bg-white`)
- [ ] 로고 세리프 폰트 적용
- [ ] 링크 호버 밑줄 효과
- [ ] 구독 버튼 `rounded-full` + `bg-black`
- [ ] 로그인 텍스트 링크로 변경

### Footer

- [ ] 배경 흰색 변경
- [ ] 상단 테두리 추가
- [ ] 레이아웃 플렉스로 변경
- [ ] 불필요한 섹션 제거

### 블로그 상세

- [ ] 커버 없을 때 배경 제거
- [ ] 제목 Serif 폰트, `text-5xl`
- [ ] Premium 배지 심플화
- [ ] 메타 정보 구분선 추가

### 카테고리

- [ ] 배경 흰색 변경
- [ ] Grid → List 레이아웃
- [ ] 카드 간 구분선 추가

---

**관련 문서**: [디자인 토큰](./design-tokens.md), [구현 계획](./plan.md)
