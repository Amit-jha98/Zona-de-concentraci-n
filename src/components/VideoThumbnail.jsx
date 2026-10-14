import React, { useState } from 'react';
import { Play, Code2, BookOpen } from 'lucide-react';

export default function VideoThumbnail({ videoId, title, duration, subjectColor, className = '' }) {
  const [errorLevel, setErrorLevel] = useState(0);

  const getSource = () => {
    if (errorLevel === 0) return `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;
    if (errorLevel === 1) return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
    return null;
  };

  const src = getSource();

  return (
    <div className={`video-thumb-container ${className}`}>
      {src ? (
        <img
          src={src}
          alt={title || 'Lecture Thumbnail'}
          className="thumb-image"
          loading="lazy"
          onError={() => setErrorLevel(prev => prev + 1)}
        />
      ) : (
        <div className="thumb-minimal-fallback" style={{ borderColor: subjectColor || '#38bdf8' }}>
          <div className="fallback-grid-pattern"></div>
          <Code2 className="w-8 h-8 opacity-40 mb-1" style={{ color: subjectColor || '#38bdf8' }} />
          <span className="fallback-title">{title}</span>
        </div>
      )}

      {duration && <span className="thumb-duration-pill">{duration}</span>}
      
      <div className="thumb-hover-overlay">
        <div className="thumb-play-btn">
          <Play className="w-4 h-4 text-white fill-white ml-0.5" />
        </div>
      </div>
    </div>
  );
}
