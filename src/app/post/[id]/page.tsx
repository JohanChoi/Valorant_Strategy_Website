import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import CommentSection from '@/components/CommentSection';
import MediaGallery from '@/components/MediaGallery';
import PostOwnerActions from '@/components/PostOwnerActions';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PageProps) {
  const { id } = await params;
  const session = await getSession();

  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      user: { select: { username: true } },
      media: { orderBy: { order: 'asc' } },
    },
  });

  if (!post) return notFound();

  const returnHref = `/maps/${post.mapName.toLowerCase()}/${post.siteName}`;
  const isOwner = session?.userId === post.userId;
  const media = post.media.length > 0
    ? post.media
    : [{ id: post.id, url: post.mediaUrl, type: post.mediaType }];

  const formattedDate = new Date(post.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '3rem' }}>
      <div className="mb-4">
        <Link href={returnHref} className="text-muted back-link">
          Back to {post.mapName} Site {post.siteName}
        </Link>
      </div>

      <div className="post-detail card glass-panel">
        <MediaGallery title={post.title} media={media} />

        <div className="post-detail-info">
          <div className="post-detail-tags mb-2">
            <span className="tag">{post.mapName}</span>
            <span className="tag">Site {post.siteName}</span>
            <span className="tag">{media.length} {media.length === 1 ? 'file' : 'files'}</span>
          </div>

          <h1 style={{ fontSize: '2rem' }}>{post.title}</h1>

          <div className="post-detail-meta flex gap-4 items-center text-muted mb-4">
            <span>by <strong style={{ color: 'var(--val-text)' }}>{post.user.username}</strong></span>
            <span>{formattedDate}</span>
          </div>

          {post.description && (
            <p className="post-detail-description">{post.description}</p>
          )}

          {isOwner && (
            <PostOwnerActions postId={post.id} returnHref={returnHref} />
          )}
        </div>
      </div>

      <div className="mt-8">
        <CommentSection postId={post.id} currentUserId={session?.userId} />
      </div>
    </div>
  );
}
