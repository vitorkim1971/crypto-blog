import { defineType, defineField } from '@sanity/types';

export const post = defineType({
  name: 'post',
  title: 'Blog Post',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        maxLength: 96,
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'excerpt',
      title: 'Excerpt',
      type: 'text',
      rows: 3,
      validation: (Rule) => Rule.required().max(200),
    }),
    defineField({
      name: 'coverImage',
      title: 'Cover Image',
      type: 'image',
      options: {
        hotspot: true,
      },
    }),
    defineField({
      name: 'content',
      title: 'Content',
      type: 'array',
      of: [
        // 기본 텍스트 블록 (제목, 문단, 목록 등)
        {
          type: 'block',
          styles: [
            { title: '본문', value: 'normal' },
            { title: '제목 2', value: 'h2' },
            { title: '제목 3', value: 'h3' },
            { title: '제목 4', value: 'h4' },
            { title: '인용문', value: 'blockquote' },
          ],
          lists: [
            { title: '글머리 기호', value: 'bullet' },
            { title: '번호 목록', value: 'number' },
          ],
          marks: {
            decorators: [
              { title: '굵게', value: 'strong' },
              { title: '기울임', value: 'em' },
              { title: '밑줄', value: 'underline' },
              { title: '취소선', value: 'strike-through' },
              { title: '코드', value: 'code' },
              { title: '형광펜', value: 'highlight' },
            ],
            annotations: [
              {
                name: 'link',
                type: 'object',
                title: '링크',
                fields: [
                  {
                    name: 'href',
                    type: 'url',
                    title: 'URL',
                  },
                  {
                    name: 'blank',
                    type: 'boolean',
                    title: '새 탭에서 열기',
                    initialValue: true,
                  },
                ],
              },
            ],
          },
        },
        // 이미지 (캡션 포함)
        {
          type: 'image',
          title: '이미지',
          options: {
            hotspot: true,
          },
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: '캡션',
              description: '이미지 아래 표시될 설명',
            },
            {
              name: 'alt',
              type: 'string',
              title: '대체 텍스트',
              description: '이미지를 설명하는 텍스트 (접근성용)',
            },
          ],
        },
        // 코드 블록
        {
          type: 'code',
          title: '코드 블록',
          options: {
            language: 'javascript',
            languageAlternatives: [
              { title: 'JavaScript', value: 'javascript' },
              { title: 'TypeScript', value: 'typescript' },
              { title: 'Python', value: 'python' },
              { title: 'Solidity', value: 'solidity' },
              { title: 'JSON', value: 'json' },
              { title: 'HTML', value: 'html' },
              { title: 'CSS', value: 'css' },
              { title: 'Bash', value: 'bash' },
            ],
            withFilename: true,
          },
        },
        // YouTube 임베드
        {
          type: 'object',
          name: 'youtube',
          title: 'YouTube 영상',
          fields: [
            {
              name: 'url',
              type: 'url',
              title: 'YouTube URL',
              description: 'YouTube 영상 URL을 입력하세요',
            },
            {
              name: 'caption',
              type: 'string',
              title: '캡션',
            },
          ],
          preview: {
            select: {
              url: 'url',
              caption: 'caption',
            },
            prepare({ url, caption }) {
              return {
                title: caption || 'YouTube 영상',
                subtitle: url,
              };
            },
          },
        },
        // 콜아웃/알림 박스
        {
          type: 'object',
          name: 'callout',
          title: '콜아웃 박스',
          fields: [
            {
              name: 'type',
              type: 'string',
              title: '유형',
              options: {
                list: [
                  { title: '💡 팁', value: 'tip' },
                  { title: '⚠️ 주의', value: 'warning' },
                  { title: '❌ 위험', value: 'danger' },
                  { title: 'ℹ️ 정보', value: 'info' },
                  { title: '✅ 성공', value: 'success' },
                ],
              },
              initialValue: 'info',
            },
            {
              name: 'title',
              type: 'string',
              title: '제목',
            },
            {
              name: 'content',
              type: 'text',
              title: '내용',
              rows: 3,
            },
          ],
          preview: {
            select: {
              type: 'type',
              title: 'title',
              content: 'content',
            },
            prepare({ type, title, content }) {
              const icons: Record<string, string> = {
                tip: '💡',
                warning: '⚠️',
                danger: '❌',
                info: 'ℹ️',
                success: '✅',
              };
              return {
                title: `${icons[type] || ''} ${title || '콜아웃'}`,
                subtitle: content,
              };
            },
          },
        },
        // 테이블
        {
          type: 'object',
          name: 'customTable',
          title: '테이블',
          fields: [
            {
              name: 'caption',
              type: 'string',
              title: '테이블 제목',
            },
            {
              name: 'rows',
              type: 'array',
              title: '행',
              of: [
                {
                  type: 'object',
                  name: 'row',
                  fields: [
                    {
                      name: 'cells',
                      type: 'array',
                      title: '셀',
                      of: [{ type: 'string' }],
                    },
                    {
                      name: 'isHeader',
                      type: 'boolean',
                      title: '헤더 행',
                      initialValue: false,
                    },
                  ],
                },
              ],
            },
          ],
          preview: {
            select: {
              caption: 'caption',
            },
            prepare({ caption }) {
              return {
                title: caption || '테이블',
                subtitle: '표',
              };
            },
          },
        },
        // 구분선
        {
          type: 'object',
          name: 'divider',
          title: '구분선',
          fields: [
            {
              name: 'style',
              type: 'string',
              title: '스타일',
              options: {
                list: [
                  { title: '기본', value: 'default' },
                  { title: '점선', value: 'dotted' },
                  { title: '별표', value: 'stars' },
                ],
              },
              initialValue: 'default',
            },
          ],
          preview: {
            prepare() {
              return {
                title: '── 구분선 ──',
              };
            },
          },
        },
        // 버튼/CTA
        {
          type: 'object',
          name: 'cta',
          title: 'CTA 버튼',
          fields: [
            {
              name: 'text',
              type: 'string',
              title: '버튼 텍스트',
            },
            {
              name: 'url',
              type: 'url',
              title: 'URL',
            },
            {
              name: 'style',
              type: 'string',
              title: '스타일',
              options: {
                list: [
                  { title: '기본', value: 'default' },
                  { title: '강조', value: 'primary' },
                  { title: '외곽선', value: 'outline' },
                ],
              },
              initialValue: 'default',
            },
          ],
          preview: {
            select: {
              text: 'text',
            },
            prepare({ text }) {
              return {
                title: `🔘 ${text || 'CTA 버튼'}`,
              };
            },
          },
        },
      ],
    }),
    defineField({
      name: 'author',
      title: 'Author',
      type: 'reference',
      to: [{ type: 'author' }],
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'category',
      title: 'Category',
      type: 'string',
      options: {
        list: [
          { title: '입문자 라운지', value: 'beginner-lounge' },
          { title: '실전 투자관', value: 'practical-investment' },
          { title: '고급 전략실', value: 'advanced-strategy' },
          { title: '인사이트 라운지', value: 'insights' },
          { title: '실패 투자 아카이브', value: 'failure-archive' },
          { title: "Victor's 이야기", value: 'vitor-story' },
        ],
      },
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'subcategory',
      title: 'Subcategory',
      type: 'string',
      description: '카테고리에 맞는 소항목을 선택하세요',
      options: {
        list: [
          // 입문자 라운지
          { title: '입문 가이드 시리즈', value: 'guide-series' },
          { title: '투자자 유형 분석', value: 'investor-type' },
          { title: '레벨업 성장기', value: 'level-up' },
          { title: 'Q&A 클리닉', value: 'qna-clinic' },

          // 실전 투자관
          { title: '전략 실험실', value: 'strategy-lab' },
          { title: '시간여행 투자일지', value: 'time-travel' },
          { title: '투자 심리 실험', value: 'psychology-experiment' },
          { title: '만약에 시뮬레이터', value: 'what-if' },

          // 고급 전략실
          { title: '역발상 투자 챌린지', value: 'contrarian-challenge' },
          { title: '사이클 분석 리포트', value: 'cycle-analysis' },
          { title: '디파이 프로젝트 리뷰', value: 'defi-review' },
          { title: '에어드랍 헌팅 일지', value: 'airdrop-hunting' },

          // 인사이트 라운지
          { title: '시장 분석', value: 'market-analysis' },
          { title: '뉴스 & 트렌드', value: 'news-trends' },
          { title: '칼럼', value: 'column' },

          // 실패 투자 아카이브
          { title: '실패 해부학 시리즈', value: 'failure-anatomy' },
          { title: '코인 부검 시리즈', value: 'coin-autopsy' },
          { title: '실패 패턴 분석', value: 'failure-pattern' },
          { title: '회복 스토리', value: 'recovery-story' },

          // Victor's 이야기
          { title: '부의 DNA 시리즈', value: 'wealth-dna' },
          { title: '투자 심리 에세이', value: 'psychology-essay' },
          { title: '투자 철학 노트', value: 'philosophy-note' },
          { title: '비하인드 스토리', value: 'behind-story' },
        ],
      },
    }),
    defineField({
      name: 'tags',
      title: 'Tags',
      type: 'array',
      of: [{ type: 'string' }],
      options: {
        layout: 'tags',
      },
    }),
    defineField({
      name: 'isPremium',
      title: 'Premium Content',
      type: 'boolean',
      description: 'Is this content only for premium subscribers?',
      initialValue: false,
    }),
    defineField({
      name: 'publishedAt',
      title: 'Published At',
      type: 'datetime',
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: 'readingTime',
      title: 'Reading Time (minutes)',
      type: 'number',
      description: 'Estimated reading time in minutes',
    }),
  ],
  preview: {
    select: {
      title: 'title',
      author: 'author.name',
      media: 'coverImage',
    },
    prepare(selection) {
      const { author } = selection;
      return { ...selection, subtitle: author && `by ${author}` };
    },
  },
});
