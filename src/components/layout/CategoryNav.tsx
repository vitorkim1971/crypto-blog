'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { CATEGORIES } from '@/types';

export default function CategoryNav() {
  const pathname = usePathname();

  return (
    <nav className="border-b border-gray-200 bg-white">
      <div className="max-w-[1336px] mx-auto px-6">
        <div className="flex gap-8 overflow-x-auto scrollbar-hide py-4">
          {CATEGORIES.map((category) => {
            const isActive = pathname === `/${category.slug}`;
            
            return (
              <Link
                key={category.slug}
                href={`/${category.slug}`}
                className={`
                  whitespace-nowrap text-sm font-medium transition-all duration-200
                  ${isActive 
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-1' 
                    : 'text-gray-600 hover:text-gray-900 pb-1'
                  }
                `}
              >
                {category.name}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
