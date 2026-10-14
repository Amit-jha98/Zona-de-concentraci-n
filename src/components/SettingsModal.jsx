import React, { useState } from 'react';
import { 
  X, 
  Settings, 
  ShieldCheck, 
  Key, 
  Check, 
  Sparkles,
  Sliders
} from 'lucide-react';
import { getStoredApiKey, saveStoredApiKey } from '../services/youtubeService';

export default function SettingsModal({ isOpen, onClose }) {
  const [apiKey, setApiKey] = useState(getStoredApiKey());
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [strictMode, setStrictMode] = useState(true);
  const [autoNext, setAutoNext] = useState(true);

  if (!isOpen) return null;

  const handleSave = (e) => {
    e.preventDefault();
    saveStoredApiKey(apiKey);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex items-center gap-2">
            <Settings className="w-4 h-4 text-slate-300" />
            <h2 className="modal-title">Browser & AdShield Preferences</h2>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSave} className="modal-body">
          {/* AdShield & Distraction Blocker Config */}
          <div className="settings-section">
            <h3 className="section-heading">Protection & Recommendation Filter</h3>
            
            <div className="setting-toggle-row">
              <div>
                <span className="toggle-label">Strict CS Relevance Enforcement</span>
                <p className="toggle-sub">Force all recommendations and search queries to strictly adhere to CS & GATE curriculums.</p>
              </div>
              <input
                type="checkbox"
                checked={strictMode}
                onChange={(e) => setStrictMode(e.target.checked)}
                className="custom-toggle"
              />
            </div>

            <div className="setting-toggle-row">
              <div>
                <span className="toggle-label">Auto-Load Next Syllabus Lecture</span>
                <p className="toggle-sub">Automatically queue the prerequisite or consecutive lecture upon completion.</p>
              </div>
              <input
                type="checkbox"
                checked={autoNext}
                onChange={(e) => setAutoNext(e.target.checked)}
                className="custom-toggle"
              />
            </div>
          </div>

          {/* Optional YouTube Data API Key */}
          <div className="settings-section">
            <div className="flex items-center gap-1.5 mb-1">
              <Key className="w-3.5 h-3.5 text-amber-400" />
              <h3 className="section-heading">YouTube Data API Key (Optional)</h3>
            </div>
            <p className="toggle-sub mb-2">
              EduBrowse includes a built-in verified CS catalog and oEmbed lookup with zero setup required. Adding your personal Google API key enables extended live searches.
            </p>

            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy..."
              className="api-key-input"
            />
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="pill-btn"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="pill-btn primary flex items-center gap-1.5"
            >
              {savedSuccess ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Saved</span>
                </>
              ) : (
                <span>Save Settings</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
