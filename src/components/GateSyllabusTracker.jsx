import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  CheckCircle2, 
  Circle, 
  Play, 
  Award, 
  Percent, 
  Sparkles, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';
import { GATE_CS_SYLLABUS, EDUCATIONAL_VIDEOS } from '../data/csCatalog';

const SYLLABUS_STORAGE_KEY = 'edubrowse_gate_progress';

export default function GateSyllabusTracker({ onSelectVideo, onSelectSubject }) {
  const [syllabus, setSyllabus] = useState(() => {
    try {
      const saved = localStorage.getItem(SYLLABUS_STORAGE_KEY);
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.error(e);
    }
    return GATE_CS_SYLLABUS;
  });

  const saveProgress = (updated) => {
    setSyllabus(updated);
    try {
      localStorage.setItem(SYLLABUS_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleTopic = (subjectIdx, topicIdx) => {
    const updated = syllabus.map((subj, sIdx) => {
      if (sIdx !== subjectIdx) return subj;
      return {
        ...subj,
        topics: subj.topics.map((top, tIdx) => {
          if (tIdx !== topicIdx) return top;
          return { ...top, done: !top.done };
        })
      };
    });
    saveProgress(updated);
  };

  const handleResetProgress = () => {
    if (window.confirm('Reset all GATE syllabus checklist progress?')) {
      saveProgress(GATE_CS_SYLLABUS.map(s => ({
        ...s,
        topics: s.topics.map(t => ({ ...t, done: false }))
      })));
    }
  };

  // Metrics calculation
  const totalTopics = syllabus.reduce((acc, s) => acc + s.topics.length, 0);
  const completedTopics = syllabus.reduce(
    (acc, s) => acc + s.topics.filter(t => t.done).length, 
    0
  );
  const percentComplete = Math.round((completedTopics / totalTopics) * 100);

  return (
    <div className="syllabus-view-container">
      {/* Syllabus Header Dashboard */}
      <div className="syllabus-hero-card">
        <div className="syllabus-hero-content">
          <div className="syllabus-hero-header">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-400 shrink-0" />
              <h1 className="syllabus-hero-title">GATE CS Syllabus Matrix</h1>
            </div>
            <button 
              onClick={handleResetProgress}
              className="syllabus-reset-btn"
              title="Reset checklist progress"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>

          <p className="syllabus-hero-sub">
            Track syllabus coverage across all 9 core subjects. Mark topics completed and launch high-yield lectures directly.
          </p>

          <div className="syllabus-progress-stats">
            <div className="progress-bar-outer">
              <div 
                className="progress-bar-inner" 
                style={{ width: `${percentComplete}%` }}
              ></div>
            </div>

            <div className="syllabus-stats-row">
              <span className="syllabus-stats-highlight">
                {completedTopics} of {totalTopics} Core Topics Mastered
              </span>
              <span className="syllabus-percent-badge">{percentComplete}% Complete</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid of Subject Cards */}
      <div className="syllabus-subjects-grid">
        {syllabus.map((subj, sIdx) => {
          const subjectCompleted = subj.topics.filter(t => t.done).length;
          const subjectTotal = subj.topics.length;
          const subjectPercent = Math.round((subjectCompleted / subjectTotal) * 100);

          // Find first matching lecture in catalog for this subject
          const matchedLecture = EDUCATIONAL_VIDEOS.find(v => v.subject === subj.subjectId);

          return (
            <div key={subj.subjectId} className="syllabus-subject-card">
              <div className="subj-card-header">
                <div className="subj-header-left">
                  <div className="subj-title-row">
                    <h2 className="subj-name">{subj.name}</h2>
                    <span className="subj-weightage-pill">{subj.weightage}</span>
                  </div>
                  <div className="subj-progress-info">
                    <span className="subj-progress-text">
                      {subjectCompleted}/{subjectTotal} Topics • {subjectPercent}%
                    </span>
                    <div className="subj-mini-progress-track">
                      <div 
                        className="subj-mini-progress-fill" 
                        style={{ width: `${subjectPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {matchedLecture && (
                  <button
                    onClick={() => onSelectVideo(matchedLecture)}
                    className="subj-play-lecture-btn"
                    title={`Watch high-yield lecture on ${subj.name}`}
                  >
                    <Play className="w-3 h-3 fill-emerald-400 text-emerald-400 shrink-0" />
                    <span>Watch</span>
                  </button>
                )}
              </div>

              {/* Topics Checklist */}
              <ul className="syllabus-topics-list">
                {subj.topics.map((topic, tIdx) => (
                  <li 
                    key={topic.id}
                    onClick={() => handleToggleTopic(sIdx, tIdx)}
                    className={`syllabus-topic-item ${topic.done ? 'done' : ''}`}
                    role="checkbox"
                    aria-checked={topic.done}
                  >
                    <span className="topic-checkbox-icon">
                      {topic.done ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-4 h-4 text-slate-500 shrink-0" />
                      )}
                    </span>
                    <span className="topic-title">{topic.title}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </div>
  );
}
