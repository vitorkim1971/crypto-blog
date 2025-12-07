import { client, isSanityConfigured } from './client';
import { Post } from '@/types';

export async function getAllPosts(limit: number = 10): Promise<Post[]> {
  if (!isSanityConfigured) return [];

  const query = `*[_type == "post"] | order(publishedAt desc)[0...$limit] {
    "id": _id,
    "slug": slug.current,
    title,
    excerpt,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{
      "id": _id,
      name,
      "avatar": avatar.asset->url,
      bio,
      social
    },
    "category": {
      "slug": category,
      "name": category,
      "description": ""
    },
    tags,
    isPremium,
    publishedAt,
    _updatedAt,
    "readingTime": coalesce(readingTime, 5)
  }`;

  try {
    return await client.fetch(query, { limit });
  } catch (error) {
    console.error('Error fetching posts:', error);
    return [];
  }
}

export async function getPostsByCategory(
  categorySlug: string,
  page: number = 1,
  limit: number = 10
): Promise<{ posts: Post[]; total: number }> {
  if (!isSanityConfigured) return { posts: [], total: 0 };

  const start = (page - 1) * limit;
  const end = start + limit;

  const query = `{
    "posts": *[_type == "post" && category == $categorySlug] | order(publishedAt desc)[$start...$end] {
      "id": _id,
      "slug": slug.current,
      title,
      excerpt,
      "coverImageUrl": coverImage.asset->url,
      "author": author->{
        "id": _id,
        name,
        "avatar": avatar.asset->url,
        bio,
        social
      },
      "category": {
        "slug": category,
        "name": category
      },
      subcategory,
      tags,
      isPremium,
      publishedAt,
      _updatedAt,
      "readingTime": coalesce(readingTime, 5)
    },
    "total": count(*[_type == "post" && category == $categorySlug])
  }`;

  try {
    return await client.fetch(query, { categorySlug, start, end });
  } catch (error) {
    console.error('Error fetching posts by category:', error);
    return { posts: [], total: 0 };
  }
}

export async function getPostsBySubcategory(
  categorySlug: string,
  subcategorySlug: string,
  page: number = 1,
  limit: number = 10
): Promise<{ posts: Post[]; total: number }> {
  if (!isSanityConfigured) return { posts: [], total: 0 };

  const start = (page - 1) * limit;
  const end = start + limit;

  const query = `{
    "posts": *[_type == "post" && category == $categorySlug && subcategory == $subcategorySlug] | order(publishedAt desc)[$start...$end] {
      "id": _id,
      "slug": slug.current,
      title,
      excerpt,
      "coverImageUrl": coverImage.asset->url,
      "author": author->{
        "id": _id,
        name,
        "avatar": avatar.asset->url,
        bio,
        social
      },
      "category": {
        "slug": category,
        "name": category
      },
      subcategory,
      tags,
      isPremium,
      publishedAt,
      _updatedAt,
      "readingTime": coalesce(readingTime, 5)
    },
    "total": count(*[_type == "post" && category == $categorySlug && subcategory == $subcategorySlug])
  }`;

  try {
    return await client.fetch(query, { categorySlug, subcategorySlug, start, end });
  } catch (error) {
    console.error('Error fetching posts by subcategory:', error);
    return { posts: [], total: 0 };
  }
}

/**
 * T029: Get post by slug with conditional content projection
 * For premium posts, content is only included if hasAccess is true
 */
export async function getPostBySlug(
  slug: string,
  hasAccess: boolean = true
): Promise<Post | null> {
  if (!isSanityConfigured) return null;

  // T029: Conditional GROQ query - only include content if user has access
  const query = `*[_type == "post" && slug.current == $slug][0] {
    "id": _id,
    "slug": slug.current,
    title,
    excerpt,
    ${hasAccess ? 'content,' : ''}
    "coverImageUrl": coverImage.asset->url,
    "author": author->{
      "id": _id,
      name,
      "avatar": avatar.asset->url,
      bio,
      social
    },
    "category": {
      "slug": category,
      "name": category,
      "description": ""
    },
    tags,
    isPremium,
    publishedAt,
    _updatedAt,
    "readingTime": coalesce(readingTime, 5)
  }`;

  try {
    return await client.fetch(query, { slug });
  } catch (error) {
    console.error('Error fetching post by slug:', error);
    return null;
  }
}

export async function getFeaturedPosts(limit: number = 3): Promise<Post[]> {
  if (!isSanityConfigured) return [];

  const query = `*[_type == "post"] | order(publishedAt desc)[0...$limit] {
    "id": _id,
    "slug": slug.current,
    title,
    excerpt,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{
      "id": _id,
      name,
      "avatar": avatar.asset->url,
      bio,
      social
    },
    "category": {
      "slug": category,
      "name": category,
      "description": ""
    },
    tags,
    isPremium,
    publishedAt,
    _updatedAt,
    "readingTime": coalesce(readingTime, 5)
  }`;

  try {
    return await client.fetch(query, { limit: limit - 1 });
  } catch (error) {
    console.error('Error fetching featured posts:', error);
    return [];
  }
}

export async function searchPosts(searchTerm: string): Promise<Post[]> {
  if (!isSanityConfigured) return [];

  const query = `*[_type == "post" && (
    title match $searchTerm ||
    excerpt match $searchTerm ||
    pt::text(content) match $searchTerm
  )] | order(publishedAt desc) {
    "id": _id,
    "slug": slug.current,
    title,
    excerpt,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{
      "id": _id,
      name,
      "avatar": avatar.asset->url,
      bio,
      social
    },
    "category": {
      "slug": category,
      "name": category,
      "description": ""
    },
    tags,
    isPremium,
    publishedAt,
    _updatedAt,
    "readingTime": coalesce(readingTime, 5)
  }`;

  try {
    return await client.fetch(query, { searchTerm: `*${searchTerm}*` });
  } catch (error) {
    console.error('Error searching posts:', error);
    return [];
  }
}

/**
 * 관련 글 가져오기
 * 같은 카테고리 또는 태그를 가진 글을 반환
 */
export async function getRelatedPosts(
  currentSlug: string,
  categorySlug: string,
  tags: string[] = [],
  limit: number = 3
): Promise<Post[]> {
  if (!isSanityConfigured) return [];

  // 같은 카테고리의 글 + 같은 태그를 가진 글을 우선순위로
  /* Safe tagging query */
  const query = `*[_type == "post" && slug.current != $currentSlug && (
    category == $categorySlug ||
    count(coalesce(tags, [])[@ in $tags]) > 0
  )] | order(publishedAt desc)[0...$limit] {
    "id": _id,
    "slug": slug.current,
    title,
    excerpt,
    "coverImageUrl": coverImage.asset->url,
    "author": author->{
      "id": _id,
      name,
      "avatar": avatar.asset->url,
      bio,
      social
    },
    "category": {
      "slug": category,
      "name": category
    },
    tags,
    isPremium,
    publishedAt,
    _updatedAt,
    "readingTime": coalesce(readingTime, 5)
  }`;

  try {
    const safeTags = Array.isArray(tags) ? tags : [];
    return await client.fetch(query, {
      currentSlug,
      categorySlug: categorySlug || '',
      tags: safeTags,
      limit: limit || 3
    });
  } catch (error) {
    console.error('Error fetching related posts:', error);
    return [];
  }
}

export async function getAllUniqueTags(): Promise<string[]> {
  if (!isSanityConfigured) return [];

  const query = `*[_type == "post" && defined(tags)].tags[]`;

  try {
    const tags = await client.fetch<string[]>(query);
    // Deduplicate tags
    return Array.from(new Set(tags));
  } catch (error) {
    console.error('Error fetching tags:', error);
    return [];
  }
}
