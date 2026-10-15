import React, { useMemo, useState } from 'react';
import { 
  Play, 
  Sparkles, 
  Award, 
  ShieldCheck, 
  Clock, 
  CheckCircle2, 
  Filter,
  ArrowRight
} from 'lucide-react';
import { getStrictRelatedVideos } from '../services/recommendationEngine';
import { EDUCATIONAL_VIDEOS } from '../data/csCatalog';
import VideoThumbnail from './VideoThumbnail';

export default function RelatedEducationalVideos({
  currentVideo,
  onSelectVideo,
  catalog = EDUCATIONAL_VIDEOS
}) {
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'gate-only', 'same-channel'

  // Calculate strictly related CS educational videos
  const relatedVideos = useMemo(() => {
    const raw = getStrictRelatedVideos(currentVideo, catalog, 12);
    if (filterMode === 'gate-only') {
      return raw.filter(v => v.gateWeightage && v.gateWeightage.includes('High'));
    }
    if (filterMode === 'same-channel') {
      return raw.filter(v => v.channel === currentVideo?.channel);
    }
    return raw;
  }, [currentVideo, filterMode]);

  return (
    <aside className="related-videos-sidebar">
      {/* Sidebar Header with Strict Constraint Indicator */}
      <div className="related-header">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <h2 className="related-title">Curated CS Continuity</h2>
          </div>
          <span className="strict-tag">Strict CS Only</span>
        </div>
        
        <p className="related-subtitle">
          Algorithmic feed blocked. Showing only verified lectures matching this syllabus module.
        </p>

        {/* Quick Filter Buttons */}
        <div className="related-filter-strip">
          <button
            onClick={() => setFilterMode('all')}
            className={`filter-chip ${filterMode === 'all' ? 'active' : ''}`}
          >
            All Related
          </button>
          <button
            onClick={() => setFilterMode('gate-only')}
            className={`filter-chip ${filterMode === 'gate-only' ? 'active' : ''}`}
          >
            GATE High-Yield
          </button>
          {currentVideo?.channel && (
            <button
              onClick={() => setFilterMode('same-channel')}
              className={`filter-chip ${filterMode === 'same-channel' ? 'active' : ''}`}
            >
              {currentVideo.channel}
            </button>
          )}
        </div>
      </div>

      {/* List of Strictly Related Educational Videos */}
      <div className="related-list">
        {relatedVideos.length === 0 ? (
          <div className="related-empty">
            <p className="text-secondary text-xs">No matching videos in this sub-filter.</p>
          </div>
        ) : (
          relatedVideos.map((video) => {
            const isGate = video.gateWeightage && video.gateWeightage.toLowerCase().includes('high');

            return (
              <div
                key={video.id}
                onClick={() => onSelectVideo(video)}
                className="related-video-card"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onSelectVideo(video);
                  }
                }}
              >
                {/* Thumbnail Container */}
                <div className="related-thumb-wrapper">
                  <VideoThumbnail
                    videoId={video.id}
                    title={video.title}
                    duration={video.duration}
                  />
                </div>

                {/* Content Info */}
                <div className="related-info">
                  {/* Relationship Badge */}
                  <span className={`relationship-pill ${isGate ? 'gate-pill' : ''}`}>
                    {video.relationshipBadge || 'Related Concept'}
                  </span>

                  <h3 className="related-video-title" title={video.title}>
                    {video.title}
                  </h3>

                  <div className="related-meta-row">
                    <span className="channel-name">{video.channel}</span>
                    <span className="meta-separator">•</span>
                    <span className="subtopic-name">{video.subtopic || 'CS Core'}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Bottom AdShield Guarantee Note */}
      <div className="related-footer-note">
        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
        <span>0 Clickbait, 0 Shorts, 0 Algorithmic Traps Guaranteed</span>
      </div>
    </aside>
  );
}
