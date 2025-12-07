import Link from 'next/link';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  className?: string;
}

export default function Logo({ size = 'md', showText = true, className = '' }: LogoProps) {
  const sizes = {
    sm: { icon: 'w-9 h-9', star: 18, text: 'text-base', sub: 'text-[8px]' },
    md: { icon: 'w-12 h-12', star: 24, text: 'text-xl', sub: 'text-[10px]' }, // Increased size
    lg: { icon: 'w-14 h-14', star: 28, text: 'text-2xl', sub: 'text-xs' },
  };

  const s = sizes[size];

  return (
    <Link href="/" className={`flex items-center group ${className}`}>
      {/* Logo Icon - Rising Star / North Star */}
      <div className={`${s.icon} relative flex items-center justify-center mr-3`}>
        {/* New Logo: The North Star - High Contrast & Solid */}
        <svg
          viewBox="0 0 64 64"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-md"
        >
          {/* Main 4-point Star (Bold Solid Color) - Blue */}
          <path
            d="M32 2 C32 2, 38 22, 60 32 C 38 42, 32 62, 32 62 C 32 62, 26 42, 4 32 C 26 22, 32 2, 32 2 Z"
            fill="#3B82F6"
            stroke="#1D4ED8"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />

          {/* Inner Accent (Light Blue) */}
          <path
            d="M32 14 C32 14, 35 25, 46 32 C 35 39, 32 50, 32 50 C 32 50, 29 39, 18 32 C 29 25, 32 14, 32 14 Z"
            fill="#DBEAFE"
            opacity="0.9"
          />

          {/* Center Core */}
          <circle cx="32" cy="32" r="4" fill="#FFFFFF" />
        </svg>
      </div>

      {/* Text */}
      {showText && (
        <div className="flex flex-col">
          <span className={`${s.text} font-semibold tracking-tight text-gray-900 dark:text-gray-50 leading-tight`}>
            Victor&apos;s Alpha
          </span>
          <span className={`${s.sub} uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400`}>
            Dream · Invest · Achieve
          </span>
        </div>
      )}
    </Link>
  );
}
