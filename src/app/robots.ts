/**
 * T022-T025: Robots.txt 생성
 * Feature: SEO 기본 기능 - Phase 5
 */

import { MetadataRoute } from 'next';
import { SITE_CONFIG } from '@/lib/seo/metadata-helpers';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        // T023: User-agent: * 설정
        userAgent: '*',
        allow: '/',
        // T024: Disallow: /api/ 추가
        disallow: ['/api/', '/admin/'],
      },
    ],
    // T025: Sitemap URL 추가
    sitemap: `${SITE_CONFIG.url}/sitemap.xml`,
  };
}
