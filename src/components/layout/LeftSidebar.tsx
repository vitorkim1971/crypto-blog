'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
    HomeIcon,
    MagnifyingGlassIcon,
    BookOpenIcon,
    PencilSquareIcon,
    UserIcon,
    ArrowRightOnRectangleIcon,
    AcademicCapIcon,
    ChartBarIcon,
    RocketLaunchIcon,
    LightBulbIcon,
    ExclamationTriangleIcon,
    UserCircleIcon,
    Bars3Icon
} from '@heroicons/react/24/outline';
import {
    HomeIcon as HomeIconSolid,
    MagnifyingGlassIcon as MagnifyingGlassIconSolid,
    BookOpenIcon as BookOpenIconSolid,
} from '@heroicons/react/24/solid';
import Logo from '@/components/common/Logo';
import ThemeToggle from '@/components/ui/ThemeToggle';
import { CATEGORIES } from '@/types';

// Map categories to icons
const CATEGORY_ICONS: Record<string, any> = {
    'beginner-lounge': AcademicCapIcon,
    'practical-investment': ChartBarIcon,
    'advanced-strategy': RocketLaunchIcon,
    'insights': LightBulbIcon,
    'failure-archive': ExclamationTriangleIcon,
    'vitor-story': UserCircleIcon,
};

export default function LeftSidebar() {
    const pathname = usePathname();
    const { data: session } = useSession();

    const mainNavItems = [
        { name: '홈', href: '/', icon: HomeIcon, activeIcon: HomeIconSolid },
    ];

    return (
        <aside className="fixed left-0 top-[60px] h-[calc(100vh-60px)] w-[72px] lg:w-[260px] flex flex-col items-center lg:items-start border-r border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-950 transition-colors z-40 overflow-y-auto scrollbar-hide">
            <div className="w-full flex flex-col min-h-full py-6 lg:px-4">
                {/* Logo */}


                {/* Main Navigation */}
                <nav className="w-full space-y-1 mb-6">
                    {mainNavItems.map((item) => {
                        const isActive = pathname === item.href;
                        const Icon = isActive ? item.activeIcon : item.icon;

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex items-center justify-center lg:justify-start gap-4 px-3 py-3 mx-2 lg:mx-0 rounded-full transition-all group
                  ${isActive
                                        ? 'text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-800'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50'}
                `}
                                title={item.name}
                            >
                                <Icon className="w-6 h-6 flex-shrink-0" />
                                <span className={`hidden lg:block text-[15px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                    {item.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Divider */}
                <div className="w-full px-4 mb-4 lg:block hidden">
                    <div className="h-px bg-gray-100 dark:bg-gray-800" />
                </div>

                {/* Categories Navigation */}
                <div className="hidden lg:block w-full px-4 mb-2">
                    <h3 className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2 px-2">
                        카테고리
                    </h3>
                </div>

                <nav className="w-full space-y-1 flex-1">
                    {CATEGORIES.map((category) => {
                        const categoryPath = `/${category.slug}`;
                        const isActive = pathname === categoryPath || pathname?.startsWith(categoryPath);
                        const Icon = CATEGORY_ICONS[category.slug] || Bars3Icon; // Fallback icon

                        return (
                            <Link
                                key={category.slug}
                                href={categoryPath}
                                className={`flex items-center justify-center lg:justify-start gap-4 px-3 py-2.5 mx-2 lg:mx-0 rounded-full transition-all group
                  ${isActive
                                        ? 'text-gray-900 dark:text-gray-50 bg-gray-100 dark:bg-gray-800'
                                        : 'text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-gray-50'}
                `}
                                title={category.name}
                            >
                                <Icon className="w-6 h-6 flex-shrink-0" />
                                <span className={`hidden lg:block text-[15px] font-medium ${isActive ? 'font-bold' : ''}`}>
                                    {category.name}
                                </span>
                            </Link>
                        );
                    })}
                </nav>

                {/* Bottom Actions */}

            </div>
        </aside>
    );
}
