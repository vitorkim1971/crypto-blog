/**
 * T002: SEO 타입 정의
 * Feature: SEO 기본 기능
 */

export interface OpenGraphMetadata {
  title: string;
  description: string;
  url: string;
  siteName: string;
  images: OpenGraphImage[];
  locale: string;
  type: 'website' | 'article';
}

export interface OpenGraphImage {
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface TwitterMetadata {
  card: 'summary' | 'summary_large_image' | 'app' | 'player';
  title: string;
  description: string;
  images: string[];
  creator?: string;
  site?: string;
}

export interface PageMetadata {
  title: string;
  description: string;
  keywords?: string[];
  authors?: { name: string }[];
  openGraph: OpenGraphMetadata;
  twitter: TwitterMetadata;
  alternates?: {
    canonical?: string;
  };
}

export interface BlogPostMetadata extends PageMetadata {
  publishedTime?: string;
  modifiedTime?: string;
  authors: { name: string }[];
  section?: string;
  tags?: string[];
}

export interface SitemapEntry {
  url: string;
  lastModified?: Date | string;
  changeFrequency?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  priority?: number;
}

export interface JsonLdBlogPosting {
  '@context': 'https://schema.org';
  '@type': 'BlogPosting';
  headline: string;
  image: string | string[];
  datePublished: string;
  dateModified?: string;
  author: JsonLdPerson;
  publisher?: JsonLdOrganization;
  description?: string;
  mainEntityOfPage?: {
    '@type': 'WebPage';
    '@id': string;
  };
}

export interface JsonLdPerson {
  '@type': 'Person';
  name: string;
  image?: string;
  url?: string;
}

export interface JsonLdOrganization {
  '@type': 'Organization';
  name: string;
  logo?: {
    '@type': 'ImageObject';
    url: string;
  };
}
