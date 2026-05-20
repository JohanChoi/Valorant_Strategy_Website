'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';

interface PostOwnerActionsProps {
  postId: string;
  returnHref: string;
}

export default function PostOwnerActions({ postId, returnHref }: PostOwnerActionsProps) {
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState('');

  async function handleDelete() {
    const confirmed = window.confirm('Take down this post? This will also remove its discussion.');
    if (!confirmed) return;

    setDeleting(true);
    setError('');

    try {
      const res = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not delete post.');
        return;
      }

      router.push(returnHref);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="post-owner-actions">
      <div className="flex gap-2">
        <Link href={`/post/${postId}/edit`} className="btn secondary owner-action-btn">
          <Pencil size={16} aria-hidden="true" />
          Edit
        </Link>
        <button
          type="button"
          className="danger owner-action-btn"
          onClick={handleDelete}
          disabled={deleting}
        >
          <Trash2 size={16} aria-hidden="true" />
          {deleting ? 'Deleting...' : 'Take Down'}
        </button>
      </div>
      {error && <div className="error-banner mt-4">{error}</div>}
    </div>
  );
}
