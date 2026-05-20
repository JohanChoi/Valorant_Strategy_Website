'use client';

import { useState } from 'react';

interface MediaItem {
  id: string;
  url: string;
  type: string;
}

interface MediaGalleryProps {
  title: string;
  media: MediaItem[];
}

export default function MediaGallery({ title, media }: MediaGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const selected = media[selectedIndex];

  if (!selected) return null;

  return (
    <div className="post-media-gallery">
      <div className="post-detail-media">
        {selected.type === 'image' ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={selected.url} alt={title} />
        ) : (
          <video src={selected.url} controls style={{ width: '100%' }} />
        )}
      </div>

      {media.length > 1 && (
        <div className="media-thumb-strip" aria-label="Post media">
          {media.map((item, index) => (
            <button
              type="button"
              className={`media-thumb ${index === selectedIndex ? 'active' : ''}`}
              key={item.id}
              onClick={() => setSelectedIndex(index)}
              aria-label={`Show media ${index + 1}`}
            >
              {item.type === 'image' ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={item.url} alt="" />
              ) : (
                <video src={item.url} muted />
              )}
              {item.type === 'video' && <span className="media-thumb-type">Video</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
