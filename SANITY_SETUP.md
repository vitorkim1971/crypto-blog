# Sanity Studio 설정 가이드

## ✅ 완료된 작업

Sanity Studio가 프로젝트에 설치되었습니다:

- ✅ `sanity.config.ts` - Sanity 설정 파일
- ✅ `/studio` 라우트 - Studio 접근 경로
- ✅ 필요한 패키지 설치 완료

---

## 📋 Sanity 프로젝트 설정

Sanity Studio를 사용하려면 Sanity 프로젝트를 생성하고 환경 변수를 설정해야 합니다.

### 1️⃣ Sanity 계정 생성 및 프로젝트 만들기

1. **Sanity.io 가입**
   ```
   https://www.sanity.io
   ```
   - Google 또는 GitHub 계정으로 가입 가능
   - 무료 티어 선택

2. **새 프로젝트 생성**
   - Dashboard에서 "Create new project" 클릭
   - 프로젝트 이름: `Victor's Alpha Blog` (또는 원하는 이름)
   - Dataset: `production` (기본값 사용)

3. **프로젝트 ID 확인**
   - 프로젝트 설정 페이지에서 `Project ID` 복사
   - 예: `abc123de`

### 2️⃣ API Token 생성

1. **프로젝트 설정 → API**
   - Settings → API → Tokens
   - "Add API token" 클릭

2. **Token 권한 설정**
   - Name: `Production Token`
   - Permissions: `Editor` (읽기/쓰기 권한)
   - Token 생성 후 **즉시 복사** (다시 볼 수 없음!)

### 3️⃣ 환경 변수 설정

`.env.local` 파일을 업데이트하세요:

```env
# Sanity CMS
NEXT_PUBLIC_SANITY_PROJECT_ID=여기에_프로젝트_ID_입력  # 예: abc123de
NEXT_PUBLIC_SANITY_DATASET=production
SANITY_API_TOKEN=여기에_API_토큰_입력              # sk-xxxxxxx
```

**⚠️ 주의**: `.env.local` 파일은 Git에 커밋하지 마세요!

---

## 🚀 Sanity Studio 사용하기

### Studio 접속

1. **개발 서버 실행**
   ```bash
   npm run dev
   ```

2. **Studio 접속**
   ```
   http://localhost:3001/studio
   ```

3. **로그인**
   - Sanity 계정으로 로그인
   - 프로젝트에 대한 접근 권한 필요

### 첫 번째 게시글 작성

1. **Author 생성** (먼저 필요!)
   - Studio에서 "Author" 클릭
   - "Create" 버튼
   - 이름, 이미지 등 입력
   - "Publish" 클릭

2. **Blog Post 작성**
   - Studio에서 "Blog Post" 클릭
   - "Create" 버튼
   - 필드 입력:
     ```
     Title: 첫 번째 글
     Slug: [자동 생성] 또는 수동 입력
     Excerpt: 글 요약 (200자 이내)
     Cover Image: 드래그 앤 드롭으로 업로드
     Content: 본문 작성 (Rich Text)
     Author: 방금 만든 작성자 선택
     Category: 카테고리 선택 (드롭다운)
     Tags: 태그 추가
     Premium Content: 체크 여부
     Published At: 발행 날짜/시간
     Reading Time: 예상 읽기 시간 (분)
     ```
   - "Publish" 클릭

3. **블로그에서 확인**
   - 홈페이지: `http://localhost:3001`
   - 카테고리 페이지: `http://localhost:3001/[카테고리-slug]`
   - 글 상세: `http://localhost:3001/blog/[글-slug]`

---

## 📝 콘텐츠 작성 팁

### Rich Text Editor (Content 필드)

```markdown
# 제목은 자동으로 H1이 됩니다

## 소제목 (H2)

**굵은 글씨**, *기울임*, ~~취소선~~

- 리스트 항목 1
- 리스트 항목 2

1. 순서 있는 리스트
2. 항목 2

> 인용구는 이렇게

[링크 텍스트](https://example.com)
```

### 이미지 삽입

1. **본문 중간에 이미지 추가**:
   - Content 필드에서 "+" 버튼 클릭
   - "Image" 선택
   - 이미지 업로드 또는 선택
   - Hotspot 설정 (중요한 부분 지정)

2. **코드 블록 추가**:
   - Content 필드에서 "+" 버튼 클릭
   - "Code" 선택
   - 언어 선택 (JavaScript, Python 등)
   - 코드 입력

---

## 🔧 데이터 스키마 커스터마이징

필드를 추가하거나 수정하려면:

**[src/lib/sanity/schemas/post.ts](src/lib/sanity/schemas/post.ts)**

예시: "조회수" 필드 추가
```typescript
defineField({
  name: 'views',
  title: 'View Count',
  type: 'number',
  description: '글 조회수',
  initialValue: 0,
}),
```

수정 후 Studio를 새로고침하면 자동으로 반영됩니다.

---

## 🎨 Studio 커스터마이징

**[sanity.config.ts](sanity.config.ts)**에서:

```typescript
export default defineConfig({
  name: 'VictorsAlpha',
  title: "Victor's Alpha Blog Studio", // Studio 제목
  // ... 기타 설정
});
```

---

## ❓ 문제 해결

### "Invalid credentials" 오류
- `.env.local`의 `NEXT_PUBLIC_SANITY_PROJECT_ID` 확인
- Sanity 계정으로 로그인했는지 확인
- 프로젝트 멤버로 추가되었는지 확인

### 게시글이 블로그에 안 보임
1. Studio에서 "Publish" 했는지 확인 (Draft 상태가 아닌지)
2. `publishedAt` 날짜가 미래가 아닌지 확인
3. 개발 서버 재시작: `npm run dev`

### 이미지가 안 보임
- Sanity CDN이 이미지를 처리하는 데 시간이 걸릴 수 있음 (몇 초)
- 브라우저 캐시 삭제 후 새로고침

---

## 📚 추가 자료

- [Sanity 공식 문서](https://www.sanity.io/docs)
- [Portable Text 가이드](https://www.sanity.io/docs/presenting-block-text)
- [Schema Types](https://www.sanity.io/docs/schema-types)

---

**설정이 완료되면 `http://localhost:3001/studio`에서 콘텐츠를 관리할 수 있습니다!**
