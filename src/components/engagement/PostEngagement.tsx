'use client';

import ClapButton from './ClapButton';
import BookmarkButton from './BookmarkButton';
import ShareButton from './ShareButton';

interface PostEngagementProps {
  slug: string;
  url: string;
  title: string;
  className?: string;
}

export default function PostEngagement({ slug, url, title, className = '' }: PostEngagementProps) {
  return (
    <div className={`flex items-center justify-between py-4 border-t border-b border-gray-100 ${className}`}>
      {/* Left: Claps */}
      <ClapButton slug={slug} />

      {/* Right: Bookmark & Share */}
      <div className="flex items-center gap-1">
        <BookmarkButton slug={slug} />
        <ShareButton url={url} title={title} />
      </div>
    </div>
  );
}
