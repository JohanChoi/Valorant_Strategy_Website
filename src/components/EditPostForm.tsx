'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Save, X } from 'lucide-react';
import { MAPS } from '@/lib/maps';

interface EditPostFormProps {
  post: {
    id: string;
    title: string;
    description: string;
    mapName: string;
    siteName: string;
  };
}

export default function EditPostForm({ post }: EditPostFormProps) {
  const router = useRouter();
  const [title, setTitle] = useState(post.title);
  const [description, setDescription] = useState(post.description);
  const [mapName, setMapName] = useState(post.mapName);
  const [siteName, setSiteName] = useState(post.siteName);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const availableSites = useMemo(() => (mapName ? MAPS[mapName] || [] : []), [mapName]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const res = await fetch(`/api/posts/${post.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, description, mapName, siteName }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Could not update post.');
        return;
      }

      router.push(`/post/${post.id}`);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
      {error && <div className="error-banner">{error}</div>}

      <div>
        <label className="form-label">Title</label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="form-label">Description</label>
        <textarea
          rows={5}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          style={{ resize: 'vertical' }}
        />
      </div>

      <div className="flex gap-4 edit-post-selects">
        <div className="flex-1">
          <label className="form-label">Map</label>
          <select
            required
            value={mapName}
            onChange={(e) => {
              const nextMap = e.target.value;
              setMapName(nextMap);
              setSiteName(MAPS[nextMap]?.[0] || '');
            }}
          >
            {Object.keys(MAPS).map((map) => (
              <option key={map} value={map}>{map}</option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="form-label">Site</label>
          <select
            required
            value={siteName}
            onChange={(e) => setSiteName(e.target.value)}
          >
            {availableSites.map((site) => (
              <option key={site} value={site}>Site {site}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex gap-2 edit-post-actions">
        <button type="submit" disabled={saving}>
          <Save size={16} aria-hidden="true" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
        <button
          type="button"
          className="secondary"
          onClick={() => router.push(`/post/${post.id}`)}
        >
          <X size={16} aria-hidden="true" />
          Cancel
        </button>
      </div>
    </form>
  );
}
