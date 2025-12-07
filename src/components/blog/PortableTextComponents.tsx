import Image from 'next/image';
import { PortableTextComponents } from '@portabletext/react';

// YouTube URL에서 Video ID 추출
function getYouTubeVideoId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return match && match[2].length === 11 ? match[2] : null;
}

// 콜아웃 스타일 매핑
const calloutStyles: Record<string, { bg: string; border: string; icon: string }> = {
  tip: { bg: 'bg-amber-50', border: 'border-amber-200', icon: '💡' },
  warning: { bg: 'bg-yellow-50', border: 'border-yellow-200', icon: '⚠️' },
  danger: { bg: 'bg-red-50', border: 'border-red-200', icon: '❌' },
  info: { bg: 'bg-blue-50', border: 'border-blue-200', icon: 'ℹ️' },
  success: { bg: 'bg-green-50', border: 'border-green-200', icon: '✅' },
};

export const portableTextComponents: PortableTextComponents = {
  types: {
    // 이미지 (캡션 포함)
    image: ({ value }) => {
      if (!value?.asset?._ref) {
        return null;
      }

      // Sanity image URL 생성
      const imageUrl = `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${value.asset._ref
        .replace('image-', '')
        .replace('-jpg', '.jpg')
        .replace('-png', '.png')
        .replace('-webp', '.webp')
        .replace('-gif', '.gif')}`;

      return (
        <figure className="my-8">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={value.alt || ''}
              fill
              className="object-cover"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-3">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    // YouTube 임베드
    youtube: ({ value }) => {
      const videoId = getYouTubeVideoId(value.url);
      if (!videoId) {
        return <p className="text-red-500">Invalid YouTube URL</p>;
      }

      return (
        <figure className="my-8">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden">
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title={value.caption || 'YouTube video'}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full"
            />
          </div>
          {value.caption && (
            <figcaption className="text-center text-sm text-gray-500 mt-3">
              {value.caption}
            </figcaption>
          )}
        </figure>
      );
    },

    // 콜아웃 박스
    callout: ({ value }) => {
      const style = calloutStyles[value.type] || calloutStyles.info;

      return (
        <div className={`my-8 p-6 rounded-lg border ${style.bg} ${style.border}`}>
          <div className="flex items-start gap-3">
            <span className="text-xl flex-shrink-0">{style.icon}</span>
            <div>
              {value.title && (
                <h4 className="font-semibold text-gray-900 mb-2">{value.title}</h4>
              )}
              <p className="text-gray-700 leading-relaxed">{value.content}</p>
            </div>
          </div>
        </div>
      );
    },

    // 테이블
    customTable: ({ value }) => {
      return (
        <figure className="my-8 overflow-x-auto">
          {value.caption && (
            <figcaption className="text-sm font-medium text-gray-700 mb-3">
              {value.caption}
            </figcaption>
          )}
          <table className="w-full border-collapse border border-gray-200 rounded-lg overflow-hidden">
            <tbody>
              {value.rows?.map((row: any, rowIndex: number) => (
                <tr
                  key={rowIndex}
                  className={row.isHeader ? 'bg-gray-100' : 'bg-white'}
                >
                  {row.cells?.map((cell: string, cellIndex: number) => {
                    const Tag = row.isHeader ? 'th' : 'td';
                    return (
                      <Tag
                        key={cellIndex}
                        className={`px-4 py-3 border border-gray-200 text-left ${
                          row.isHeader ? 'font-semibold text-gray-900' : 'text-gray-700'
                        }`}
                      >
                        {cell}
                      </Tag>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </figure>
      );
    },

    // 구분선
    divider: ({ value }) => {
      if (value.style === 'dotted') {
        return (
          <div className="my-12 flex justify-center">
            <span className="text-gray-400 tracking-[0.5em]">• • •</span>
          </div>
        );
      }

      if (value.style === 'stars') {
        return (
          <div className="my-12 flex justify-center">
            <span className="text-gray-400 tracking-[0.5em]">✦ ✦ ✦</span>
          </div>
        );
      }

      return <hr className="my-12 border-t border-gray-200" />;
    },

    // CTA 버튼
    cta: ({ value }) => {
      const baseClasses =
        'inline-block px-6 py-3 rounded-lg font-medium transition-colors text-center';

      const styleClasses: Record<string, string> = {
        default: 'bg-gray-900 text-white hover:bg-gray-800',
        primary: 'bg-amber-500 text-white hover:bg-amber-600',
        outline: 'border-2 border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white',
      };

      return (
        <div className="my-8 text-center">
          <a
            href={value.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`${baseClasses} ${styleClasses[value.style] || styleClasses.default}`}
          >
            {value.text}
          </a>
        </div>
      );
    },

    // 코드 블록
    code: ({ value }) => {
      return (
        <div className="my-8">
          {value.filename && (
            <div className="bg-gray-800 text-gray-400 text-sm px-4 py-2 rounded-t-lg">
              {value.filename}
            </div>
          )}
          <pre
            className={`bg-gray-900 text-gray-100 p-4 overflow-x-auto ${
              value.filename ? 'rounded-b-lg' : 'rounded-lg'
            }`}
          >
            <code className={`language-${value.language || 'text'}`}>
              {value.code}
            </code>
          </pre>
        </div>
      );
    },
  },

  marks: {
    // 링크
    link: ({ children, value }) => {
      const target = value.blank ? '_blank' : undefined;
      const rel = value.blank ? 'noopener noreferrer' : undefined;
      return (
        <a
          href={value.href}
          target={target}
          rel={rel}
          className="text-gray-900 underline decoration-gray-400 hover:decoration-gray-900 transition-colors"
        >
          {children}
        </a>
      );
    },

    // 형광펜
    highlight: ({ children }) => (
      <mark className="bg-yellow-200 px-1 rounded">{children}</mark>
    ),

    // 인라인 코드
    code: ({ children }) => (
      <code className="bg-gray-100 text-gray-800 px-1.5 py-0.5 rounded text-sm font-mono">
        {children}
      </code>
    ),
  },

  block: {
    // 인용문
    blockquote: ({ children }) => (
      <blockquote className="my-8 pl-6 border-l-4 border-gray-300 text-gray-600 italic">
        {children}
      </blockquote>
    ),

    // 제목들
    h2: ({ children }) => (
      <h2 className="text-3xl font-serif font-bold text-gray-900 mt-12 mb-6">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-2xl font-serif font-bold text-gray-900 mt-10 mb-4">
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className="text-xl font-serif font-bold text-gray-900 mt-8 mb-4">
        {children}
      </h4>
    ),

    // 일반 문단
    normal: ({ children }) => (
      <p className="text-lg text-gray-700 leading-relaxed mb-6">{children}</p>
    ),
  },

  list: {
    bullet: ({ children }) => (
      <ul className="my-6 ml-6 space-y-2 list-disc text-gray-700">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="my-6 ml-6 space-y-2 list-decimal text-gray-700">{children}</ol>
    ),
  },

  listItem: {
    bullet: ({ children }) => <li className="text-lg leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="text-lg leading-relaxed">{children}</li>,
  },
};
