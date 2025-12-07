'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Post } from '@/types';
import { format } from 'date-fns';
import { ko } from 'date-fns/locale';
import PremiumBadge from '@/components/premium/PremiumBadge';

interface HeroProps {
    post?: Post;
}

// Star component - static with glow effect based on mouse proximity
function Star({
    style,
    size = 'sm',
    mousePosition,
    index
}: {
    style: React.CSSProperties;
    size?: 'sm' | 'md' | 'lg';
    mousePosition: { x: number; y: number };
    index: number;
}) {
    const sizeClasses = {
        sm: 'w-1 h-1',
        md: 'w-1.5 h-1.5',
        lg: 'w-2 h-2'
    };

    // Colorful stars on white background - Blue theme
    const colors = ['bg-blue-400', 'bg-cyan-400', 'bg-sky-300', 'bg-blue-300'];
    const colorClass = colors[index % colors.length];

    // Calculate distance from mouse for glow effect
    const starX = parseFloat(style.left as string) / 100;
    const starY = parseFloat(style.top as string) / 100;
    const mouseNormX = (mousePosition.x + 1) / 2; // Convert -1~1 to 0~1
    const mouseNormY = (mousePosition.y + 1) / 2;

    const distance = Math.sqrt(
        Math.pow(starX - mouseNormX, 2) + Math.pow(starY - mouseNormY, 2)
    );

    // Stars glow when mouse is near (within 0.3 distance)
    const glowIntensity = Math.max(0, 1 - distance / 0.3);
    const baseOpacity = 0.5 + (index % 3) * 0.15;
    const finalOpacity = baseOpacity + glowIntensity * 0.4;
    const scale = 1 + glowIntensity * 0.8;

    return (
        <div
            className={`absolute ${sizeClasses[size]} ${colorClass} rounded-full transition-all duration-300`}
            style={{
                ...style,
                opacity: finalOpacity,
                transform: `scale(${scale})`,
                boxShadow: glowIntensity > 0.3 ? `0 0 ${glowIntensity * 12}px rgba(59,130,246,${glowIntensity * 0.6})` : 'none',
            }}
        />
    );
}

// Shooting star component
function ShootingStar({ delay }: { delay: number }) {
    const [top] = useState(() => Math.random() * 50);

    return (
        <div
            className="absolute w-1.5 h-1.5 bg-blue-400 rounded-full animate-shooting-star"
            style={{
                top: `${top}%`,
                left: '-10%',
                animationDelay: `${delay}s`,
            }}
        >
            <div className="absolute w-24 h-0.5 bg-gradient-to-r from-blue-400/80 to-transparent -left-24 top-0.5" />
        </div>
    );
}

// Floating dream icon with mouse interaction
function DreamIcon({
    type,
    style,
    mousePosition
}: {
    type: 'star' | 'moon' | 'sparkle' | 'heart';
    style: React.CSSProperties;
    mousePosition: { x: number; y: number };
}) {
    const icons = {
        star: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
        ),
        moon: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
            </svg>
        ),
        sparkle: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0L14.59 9.41 24 12 14.59 14.59 12 24 9.41 14.59 0 12 9.41 9.41z" />
            </svg>
        ),
        heart: (
            <svg className="w-full h-full" viewBox="0 0 24 24" fill="currentColor">
                <path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z" />
            </svg>
        ),
    };

    const colorClass = {
        star: 'text-blue-300',
        moon: 'text-slate-200',
        sparkle: 'text-cyan-300',
        heart: 'text-pink-400',
    };

    // Calculate parallax offset based on mouse position
    const parallaxX = mousePosition.x * 15;
    const parallaxY = mousePosition.y * 15;

    return (
        <div
            className={`absolute ${colorClass[type]} transition-all duration-500 ease-out`}
            style={{
                ...style,
                transform: `translate(${parallaxX}px, ${parallaxY}px)`,
                filter: 'drop-shadow(0 0 12px currentColor)',
            }}
        >
            {icons[type]}
        </div>
    );
}

// Typing effect hook
function useTypingEffect(text: string, speed: number = 50, delay: number = 0, startTyping: boolean = true) {
    const [displayedText, setDisplayedText] = useState('');
    const [isComplete, setIsComplete] = useState(false);

    useEffect(() => {
        if (!startTyping) return;

        setDisplayedText('');
        setIsComplete(false);

        const startTimeout = setTimeout(() => {
            let currentIndex = 0;
            const interval = setInterval(() => {
                if (currentIndex < text.length) {
                    setDisplayedText(text.slice(0, currentIndex + 1));
                    currentIndex++;
                } else {
                    setIsComplete(true);
                    clearInterval(interval);
                }
            }, speed);

            return () => clearInterval(interval);
        }, delay);

        return () => clearTimeout(startTimeout);
    }, [text, speed, delay, startTyping]);

    return { displayedText, isComplete };
}

// Mouse parallax hook
function useMouseParallax() {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

    const handleMouseMove = useCallback((e: MouseEvent) => {
        const x = (e.clientX / window.innerWidth - 0.5) * 2;
        const y = (e.clientY / window.innerHeight - 0.5) * 2;
        setMousePosition({ x, y });
    }, []);

    useEffect(() => {
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [handleMouseMove]);

    return mousePosition;
}

export default function Hero({ post }: HeroProps) {
    const [mounted, setMounted] = useState(false);
    // const [showSecondLine, setShowSecondLine] = useState(false); // Removed

    const mousePosition = useMouseParallax();

    const mainText = "우리는 돈 때문에 꿈과 삶을 포기하는 세상에 살고 있습니다.";
    const subText = "나 또한 그 고통을 알기에, 더 이상 돈이 꿈을 가로막는 장애물이 되지 않는 세상을 꿈꿉니다.";

    const { displayedText: typedMain, isComplete: mainComplete } = useTypingEffect(mainText, 50, 800, mounted);
    const { displayedText: typedSub, isComplete: subComplete } = useTypingEffect(subText, 35, 300, mainComplete);

    const showSecondLine = mainComplete;

    useEffect(() => {
        setMounted(true);
    }, []);



    // Generate stars with fixed positions (seeded by index for consistency)
    const stars = mounted ? [...Array(80)].map((_, i) => {
        // Use deterministic positioning based on index
        const seed1 = (i * 17 + 31) % 100;
        const seed2 = (i * 23 + 47) % 100;
        return {
            id: i,
            style: {
                left: `${seed1}%`,
                top: `${seed2}%`,
            },
            size: (i % 10 === 0 ? 'lg' : i % 3 === 0 ? 'md' : 'sm') as 'sm' | 'md' | 'lg',
        };
    }) : [];

    // Dream icons configuration - larger and more visible
    const dreamIcons = mounted ? [
        { type: 'star' as const, style: { left: '8%', top: '18%', width: '36px', height: '36px', animationDelay: '0s', opacity: 0.8 } },
        { type: 'moon' as const, style: { right: '12%', top: '12%', width: '48px', height: '48px', animationDelay: '1s', opacity: 0.7 } },
        { type: 'sparkle' as const, style: { left: '15%', bottom: '22%', width: '32px', height: '32px', animationDelay: '2s', opacity: 0.75 } },
        { type: 'heart' as const, style: { right: '18%', bottom: '28%', width: '28px', height: '28px', animationDelay: '0.5s', opacity: 0.7 } },
        { type: 'star' as const, style: { left: '4%', top: '55%', width: '24px', height: '24px', animationDelay: '1.5s', opacity: 0.65 } },
        { type: 'sparkle' as const, style: { right: '6%', top: '45%', width: '28px', height: '28px', animationDelay: '2.5s', opacity: 0.7 } },
        { type: 'star' as const, style: { right: '35%', top: '8%', width: '20px', height: '20px', animationDelay: '3s', opacity: 0.6 } },
        { type: 'heart' as const, style: { left: '30%', bottom: '15%', width: '22px', height: '22px', animationDelay: '1.8s', opacity: 0.65 } },
    ] : [];

    // If no featured post, show welcome hero
    if (!post) {
        return (
            <section className="relative bg-white dark:bg-transparent overflow-hidden">
                {/* Starfield background - stars glow on mouse hover */}
                <div className="absolute inset-0">
                    {stars.map((star) => (
                        <Star
                            key={star.id}
                            style={star.style}
                            size={star.size}
                            mousePosition={mousePosition}
                            index={star.id}
                        />
                    ))}
                </div>

                {/* Single shooting star - less frequent */}
                {mounted && <ShootingStar delay={8} />}

                {/* Dream icons with parallax */}
                <div className="absolute inset-0 pointer-events-none">
                    {dreamIcons.map((icon, i) => (
                        <DreamIcon
                            key={i}
                            type={icon.type}
                            style={icon.style}
                            mousePosition={mousePosition}
                        />
                    ))}
                </div>

                {/* Gradient orbs - Warm amber theme with subtle parallax */}
                <div
                    className="absolute -top-40 -right-40 w-96 h-96 bg-blue-200/30 rounded-full blur-3xl transition-transform duration-700 ease-out"
                    style={{
                        transform: `translate(${mousePosition.x * -25}px, ${mousePosition.y * -25}px)`,
                    }}
                />
                <div
                    className="absolute -bottom-40 -left-40 w-96 h-96 bg-cyan-200/25 rounded-full blur-3xl transition-transform duration-700 ease-out"
                    style={{
                        transform: `translate(${mousePosition.x * -15}px, ${mousePosition.y * -15}px)`,
                    }}
                />
                <div
                    className="absolute top-1/2 left-1/2 w-[500px] h-[500px] bg-sky-100/20 rounded-full blur-3xl transition-transform duration-1000 ease-out"
                    style={{
                        transform: `translate(calc(-50% + ${mousePosition.x * 10}px), calc(-50% + ${mousePosition.y * 10}px))`,
                    }}
                />
                <div
                    className="absolute top-1/4 right-1/4 w-64 h-64 bg-blue-100/25 rounded-full blur-3xl transition-transform duration-800 ease-out"
                    style={{
                        transform: `translate(${mousePosition.x * -20}px, ${mousePosition.y * -20}px)`,
                    }}
                />

                {/* Constellation lines */}
                <svg className="absolute inset-0 w-full h-full opacity-20" xmlns="http://www.w3.org/2000/svg">
                    <defs>
                        <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3b82f6" stopOpacity="0" />
                            <stop offset="50%" stopColor="#3b82f6" stopOpacity="0.5" />
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity="0" />
                        </linearGradient>
                    </defs>
                    {mounted && (
                        <>
                            <line x1="10%" y1="20%" x2="25%" y2="35%" stroke="url(#lineGradient)" strokeWidth="0.5" className="animate-draw-line" />
                            <line x1="25%" y1="35%" x2="15%" y2="55%" stroke="url(#lineGradient)" strokeWidth="0.5" className="animate-draw-line animation-delay-500" />
                            <line x1="75%" y1="15%" x2="85%" y2="40%" stroke="url(#lineGradient)" strokeWidth="0.5" className="animate-draw-line animation-delay-1000" />
                            <line x1="85%" y1="40%" x2="70%" y2="60%" stroke="url(#lineGradient)" strokeWidth="0.5" className="animate-draw-line animation-delay-1500" />
                        </>
                    )}
                </svg>

                <div className="relative max-w-7xl mx-auto px-8 py-16 md:py-20 w-full z-10">
                    <div className="max-w-4xl mx-auto text-center">
                        {/* Logo/Brand mark */}
                        <div className={`mb-6 transform transition-all duration-1000 ${mounted ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-violet-50/90 dark:from-violet-500/10 via-purple-50/90 dark:via-purple-500/10 to-indigo-50/90 dark:to-indigo-500/10 backdrop-blur-sm rounded-full border border-purple-200/60 dark:border-purple-400/30 shadow-sm">
                                <div className="w-1.5 h-1.5 bg-gradient-to-r from-violet-500 to-purple-500 dark:from-violet-400 dark:to-purple-400 rounded-full animate-pulse" />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-700 via-purple-700 to-indigo-700 dark:from-violet-300 dark:via-purple-300 dark:to-indigo-300 text-xs uppercase tracking-[0.2em] font-semibold">
                                    Victor's Alpha
                                </span>
                                <div className="w-1.5 h-1.5 bg-gradient-to-r from-purple-500 to-indigo-500 dark:from-purple-400 dark:to-indigo-400 rounded-full animate-pulse" />
                            </div>
                        </div>

                        {/* Main heading with typing effect */}
                        <div className="relative mb-4">
                            <h1 className={`text-2xl md:text-3xl lg:text-4xl font-serif text-gray-900 dark:text-gray-50 leading-tight transition-all duration-500 [word-break:keep-all] ${mounted ? 'opacity-100' : 'opacity-0'}`}>
                                <span className="relative">
                                    {typedMain}
                                    {!mainComplete && (
                                        <span className="inline-block w-0.5 h-6 md:h-8 lg:h-10 bg-blue-400 ml-1 animate-blink align-middle" />
                                    )}
                                </span>
                            </h1>
                            {/* Highlight effect on key words */}
                            {mainComplete && (
                                <div className="absolute inset-0 pointer-events-none">
                                    <span className="absolute opacity-0 animate-highlight-word" style={{ animationDelay: '0.5s' }}>
                                        꿈
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Sub text with fade in */}
                        <p className={`text-sm md:text-base text-gray-600 dark:text-gray-300 leading-relaxed mb-6 max-w-2xl mx-auto transition-all duration-1000 [word-break:keep-all] ${showSecondLine ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                            {typedSub}
                            {showSecondLine && !subComplete && (
                                <span className="inline-block w-0.5 h-4 md:h-5 bg-blue-400 ml-1 animate-blink align-middle" />
                            )}
                        </p>

                        {/* CTA Buttons with stagger animation */}
                        <div className={`flex flex-wrap justify-center gap-3 transition-all duration-1000 ${subComplete ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
                            <Link
                                href="/beginner-lounge"
                                className="group relative px-6 py-2.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white text-sm font-medium rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                <span className="relative z-10 flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                                    </svg>
                                    꿈을 향한 여정 시작하기
                                    <svg className="w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                    </svg>
                                </span>
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-700 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </Link>
                            <Link
                                href="/insights"
                                className="group px-6 py-2.5 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 hover:border-gray-400 dark:hover:border-gray-600 transition-all duration-300 hover:scale-105"
                            >
                                <span className="flex items-center gap-2">
                                    인사이트 탐색
                                    <svg className="w-4 h-4 transform group-hover:rotate-45 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </span>
                            </Link>
                        </div>


                    </div>
                </div>

                {/* Bottom gradient fade */}
                <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-gray-50 dark:from-gray-950 to-transparent" />
            </section>
        );
    }

    return (
        <section className="relative bg-gray-900 overflow-hidden">
            {/* Background Image with Overlay */}
            {post.coverImageUrl && (
                <div className="absolute inset-0">
                    <Image
                        src={post.coverImageUrl}
                        alt={post.title}
                        fill
                        className="object-cover opacity-40"
                        priority
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/80 to-gray-900/40" />
                </div>
            )}

            <div className="relative max-w-7xl mx-auto px-8 py-20 md:py-28">
                <Link href={`/blog/${post.slug}`} className="group block">
                    <div className="max-w-3xl">
                        {/* Labels */}
                        <div className="flex items-center gap-3 mb-6">
                            <span className="px-3 py-1 bg-blue-500 text-white text-xs uppercase tracking-wider rounded">
                                Featured
                            </span>
                            <span className="text-sm text-gray-300">
                                {post.category?.name}
                            </span>
                            {post.isPremium && <PremiumBadge size="sm" />}
                        </div>

                        {/* Title */}
                        <h1 className="text-3xl md:text-4xl lg:text-5xl font-serif text-white mb-6 leading-tight group-hover:text-blue-400 transition-colors">
                            {post.title}
                        </h1>

                        {/* Excerpt */}
                        <p className="text-base md:text-lg text-gray-300 leading-relaxed mb-8 max-w-2xl">
                            {post.excerpt}
                        </p>

                        {/* Meta */}
                        <div className="flex items-center gap-4 text-sm text-gray-400 dark:text-gray-500">
                            {post.author && (
                                <div className="flex items-center gap-2">
                                    {post.author.avatar ? (
                                        <Image
                                            src={post.author.avatar}
                                            alt={post.author.name}
                                            width={32}
                                            height={32}
                                            className="rounded-full"
                                        />
                                    ) : (
                                        <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center">
                                            <span className="text-sm text-white">{post.author.name?.[0]}</span>
                                        </div>
                                    )}
                                    <span className="text-white">{post.author.name}</span>
                                </div>
                            )}
                            {post.author && <span>·</span>}
                            <time>{format(new Date(post.publishedAt), 'yyyy년 M월 d일', { locale: ko })}</time>
                            <span>·</span>
                            <span>{post.readingTime}분 읽기</span>
                        </div>

                        {/* Read More Button */}
                        <div className="mt-8">
                            <span className="inline-flex items-center gap-2 text-blue-400 font-medium group-hover:gap-3 transition-all">
                                읽어보기
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                                </svg>
                            </span>
                        </div>
                    </div>
                </Link>
            </div>
        </section>
    );
}
