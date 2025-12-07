'use client';

import React from 'react';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import Header from './Header'; // Import existing Header for mobile
import TopBar from './TopBar';

interface MediumLayoutProps {
    children: React.ReactNode;
    tags?: string[];
}

export default function MediumLayout({ children, tags }: MediumLayoutProps) {
    return (
        <div className="min-h-screen bg-white dark:bg-gray-950 transition-colors">
            {/* Mobile/Tablet Header (Hidden on Large Screens) */}
            <div className="lg:hidden sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-100 dark:border-gray-800 transition-colors">
                <Header />
            </div>

            {/* Desktop TopBar (Visible on Large Screens) */}
            <div className="hidden lg:block">
                <TopBar />
            </div>

            {/* Desktop Layout Container */}
            <div className="flex justify-center mx-auto lg:pt-[60px]">

                {/* Left Sidebar (Fixed) - Desktop Only */}
                <div className="hidden lg:block">
                    <LeftSidebar />
                </div>

                {/* Main Content - Flex Grow to fill space between sidebars */}
                {/* Left padding matches sidebar width: 72px on md/lg, 280px if expanded.
            Wait, LeftSidebar is w-[72px] lg:w-[280px].
            So at lg (1024px+), sidebar is 280px.
        */}
                <div className="flex-1 flex justify-center min-w-0 lg:ml-[260px] gap-12 lg:pl-8 transition-all duration-300">
                    {/* Feed Container */}
                    <main className="w-full max-w-[1000px] px-0 border-r border-transparent min-h-screen bg-white dark:bg-gray-950 transition-colors">
                        {children}
                    </main>

                    {/* Right Sidebar (Sticky Container) - Included in Flex flow */}
                    <div className="hidden xl:block flex-shrink-0 w-[320px]">
                        <RightSidebar tags={tags} />
                    </div>
                </div>
            </div>
        </div>
    );
}
