import Link from 'next/link';
import { blogPosts } from '@/data/blog';

export function BlogBrowser() {
  return (
    <div className="blogGrid">
      {blogPosts.map((post) => (
        <Link href={`/blog/${post.slug}`} key={post.slug} className="blogCard card">
          <div className="blogThumb">
            <img src={post.image} alt={`${post.title} - PawTrip SA ${post.category} guide`} loading="lazy" />
          </div>
          <span className="guideBadge">{post.category}</span>
          <strong className="blogTitle">{post.title}</strong>
          <p>{post.excerpt}</p>
          <p>
            {post.date} • {post.readTime}
          </p>
        </Link>
      ))}
    </div>
  );
}
