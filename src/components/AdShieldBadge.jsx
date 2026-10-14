import React, { useState } from 'react';
import { ShieldCheck, ShieldAlert, Sparkles, Check } from 'lucide-react';
import { getAdShieldStats } from '../services/adBlockerService';

export default function AdShieldBadge() {
  const [showPopup, setShowPopup] = useState(false);
  const stats = getAdShieldStats();

  return (
    <div className="relative">
      <button
        onClick={() => setShowPopup(!showPopup)}
        className="adshield-pill"
        title="AdShield & Distraction Blocker Status"
        aria-label="AdShield Status"
      >
        <span className="adshield-dot"></span>
        <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
        <span className="adshield-label">AdShield Active</span>
        <span className="adshield-count">0 Ads</span>
      </button>

      {showPopup && (
        <div className="adshield-popover">
          <div className="adshield-popover-header">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-sm">AdShield Protection</span>
            </div>
            <span className="status-badge-live">ENFORCED</span>
          </div>

          <p className="text-xs text-secondary mt-1">
            Active YouTube Privacy sandbox strictly blocking third-party ads, tracker pixels, and entertainment recommendations.
          </p>

          <div className="adshield-metrics-grid mt-3">
            <div className="metric-box">
              <span className="metric-num">{stats.adsBlockedCount}+</span>
              <span className="metric-sub">Ads Intercepted</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">{stats.clickbaitFilteredCount}+</span>
              <span className="metric-sub">Distractions Blocked</span>
            </div>
            <div className="metric-box">
              <span className="metric-num">100%</span>
              <span className="metric-sub">CS Focus</span>
            </div>
          </div>

          <div className="mt-3 pt-2 border-t border-border flex flex-col gap-1 text-xs text-muted">
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-3 h-3" />
              <span>youtube-nocookie privacy mode active</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-3 h-3" />
              <span>Annotations & promo cards suppressed</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400">
              <Check className="w-3 h-3" />
              <span>Forced CS educational suggestions only</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
