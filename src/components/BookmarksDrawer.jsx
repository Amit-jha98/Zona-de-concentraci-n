import React from 'react';
import { 
  X, 
  Bookmark, 
  History, 
  Play, 
  Trash2, 
  ExternalLink,
  Clock
} from 'lucide-react';

export default function BookmarksDrawer({
  isOpen,
  onClose,
  bookmarks,
  history,
  onSelectVideo,
  onRemoveBookmark
}) {
  const [activeTab, setActiveTab] = React.useState('bookmarks'); // 'bookmarks' | 'history'

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-panel" onClick={(e) => e.stopPropagation()}>
        <div className="drawer-header">
          <div className="flex items-center gap-2">
            <Bookmark className="w-4 h-4 text-blue-400" />
            <h2 className="drawer-title">Study Library</h2>
          </div>

          <button
            onClick={onClose}
            className="drawer-close-btn"
            title="Close"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tab switch */}
        <div className="drawer-tabs">
          <button
            onClick={() => setActiveTab('bookmarks')}
            className={`drawer-tab-btn ${activeTab === 'bookmarks' ? 'active' : ''}`}
          >
            Saved Lectures ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`drawer-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
          >
            Watch History ({history.length})
          </button>
        </div>

        {/* Content */}
        <div className="drawer-content">
          {activeTab === 'bookmarks' ? (
            bookmarks.length === 0 ? (
              <div className="empty-drawer">
                <Bookmark className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-secondary">No saved lectures yet.</p>
                <p className="text-xs text-muted mt-1">Click the bookmark icon on any lecture to save it here.</p>
              </div>
            ) : (
              <div className="drawer-items-list">
                {bookmarks.map((video) => (
                  <div key={video.id} className="drawer-item-card">
                    <div 
                      className="drawer-item-content"
                      onClick={() => {
                        onSelectVideo(video);
                        onClose();
                      }}
                    >
                      <h4 className="drawer-item-title">{video.title}</h4>
                      <div className="drawer-item-meta">
                        <span>{video.channel}</span>
                        <span>•</span>
                        <span>{video.subject}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => onRemoveBookmark(video)}
                      className="drawer-item-delete"
                      title="Remove Bookmark"
                      aria-label="Remove bookmark"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )
          ) : (
            history.length === 0 ? (
              <div className="empty-drawer">
                <History className="w-8 h-8 text-slate-600 mb-2" />
                <p className="text-xs text-secondary">No study history yet.</p>
              </div>
            ) : (
              <div className="drawer-items-list">
                {history.map((video, idx) => (
                  <div 
                    key={`${video.id}-${idx}`}
                    className="drawer-item-card"
                    onClick={() => {
                      onSelectVideo(video);
                      onClose();
                    }}
                  >
                    <div className="drawer-item-content">
                      <h4 className="drawer-item-title">{video.title}</h4>
                      <div className="drawer-item-meta">
                        <span>{video.channel}</span>
                        <span>•</span>
                        <span>{video.watchedAt ? new Date(video.watchedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Recent'}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}
