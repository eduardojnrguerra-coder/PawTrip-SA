'use client';

import { useEffect } from 'react';
import { trackEvent } from '@/lib/analytics';

export function BlogArticleViewTracker({ slug, title, category }: { slug: string; title: string; category: string }) {
  useEffect(() => {
    trackEvent('blog_article_viewed', {
      article_slug: slug,
      article_title: title,
      article_category: category,
    });
  }, [category, slug, title]);

  return null;
}
