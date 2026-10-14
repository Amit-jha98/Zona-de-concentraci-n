import React from 'react';
import { Plus, X, Globe, Play, BookOpen } from 'lucide-react';

export default function TabNav({ tabs, activeTabId, onSelectTab, onCloseTab, onNewTab }) {
  return (
    <div className="browser-tabs-strip">
      <div className="tabs-container">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTabId;
          const isSyllabus = tab.type === 'syllabus';
          const isPlayer = tab.type === 'player';

          return (
            <div
              key={tab.id}
              onClick={() => onSelectTab(tab.id)}
              className={`browser-tab ${isActive ? 'active' : ''}`}
              title={tab.title}
            >
              <div className="tab-icon">
                {isSyllabus ? (
                  <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                ) : isPlayer ? (
                  <Play className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                ) : (
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                )}
              </div>
              <span className="tab-title">{tab.title}</span>
              {tabs.length > 1 && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                  className="tab-close-btn"
                  title="Close Tab"
                  aria-label="Close Tab"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          );
        })}
      </div>

      <button
        onClick={onNewTab}
        className="tab-new-btn"
        title="Open New Tab (Ctrl+T)"
        aria-label="New Tab"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
