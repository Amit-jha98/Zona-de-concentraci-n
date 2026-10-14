import React, { useState, useEffect } from 'react';
import { 
  X, 
  FileText, 
  Plus, 
  Download, 
  Trash2, 
  Clock, 
  Check, 
  Sparkles 
} from 'lucide-react';

export default function StudyNotes({ video, isOpen, onClose }) {
  const [notes, setNotes] = useState([]);
  const [newNoteText, setNewNoteText] = useState('');
  const [newTimestamp, setNewTimestamp] = useState('00:00');

  const storageKey = video ? `edubrowse_notes_${video.id}` : null;

  useEffect(() => {
    if (!storageKey) return;
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        setNotes(JSON.parse(saved));
      } else {
        // Pre-populate with initial template if empty
        if (video?.keyTakeaways) {
          const initial = video.keyTakeaways.map((t, i) => ({
            id: `init-${i}`,
            timestamp: `0${i + 2}:00`,
            text: t,
            createdAt: new Date().toISOString()
          }));
          setNotes(initial);
        } else {
          setNotes([]);
        }
      }
    } catch (e) {
      console.error('Error reading notes', e);
    }
  }, [storageKey, video]);

  const saveNotes = (updated) => {
    setNotes(updated);
    if (storageKey) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(updated));
      } catch (e) {
        console.error('Error saving notes', e);
      }
    }
  };

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;

    const note = {
      id: Date.now().toString(),
      timestamp: newTimestamp.trim() || '00:00',
      text: newNoteText.trim(),
      createdAt: new Date().toISOString()
    };

    saveNotes([...notes, note]);
    setNewNoteText('');
  };

  const handleDeleteNote = (id) => {
    saveNotes(notes.filter(n => n.id !== id));
  };

  const handleExportMarkdown = () => {
    if (!video) return;
    const lines = [
      `# Study Notes: ${video.title}`,
      `**Subject:** ${video.subject} | **Channel:** ${video.channel}`,
      `**URL:** https://youtube.com/watch?v=${video.id}`,
      `**Date:** ${new Date().toLocaleDateString()}`,
      '',
      '## Key Exam Concepts',
      ...(video.keyTakeaways || []).map(t => `- ${t}`),
      '',
      '## Timestamped Lecture Notes',
      ...notes.map(n => `- **[${n.timestamp}]**: ${n.text}`),
      '',
      '---',
      '*Generated with EduBrowse CS • Distraction-Free Study Browser*'
    ];

    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(video.title || 'CS_Notes').replace(/[^a-zA-Z0-9]/g, '_')}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <div className="study-notes-drawer">
      <div className="notes-header">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-emerald-400" />
          <h2 className="notes-title">Lecture Study Notes</h2>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={handleExportMarkdown}
            className="notes-action-btn"
            title="Export as Markdown (.md)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export</span>
          </button>
          <button
            onClick={onClose}
            className="notes-close-btn"
            title="Close Drawer"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="notes-lecture-label">
        <span className="label-topic">{video?.subject?.toUpperCase() || 'CS'}</span>
        <span className="label-name" title={video?.title}>{video?.title}</span>
      </div>

      {/* Note Input Box */}
      <form onSubmit={handleAddNote} className="new-note-form">
        <div className="flex gap-2 mb-2">
          <div className="timestamp-input-wrapper">
            <Clock className="w-3 h-3 text-slate-400" />
            <input
              type="text"
              value={newTimestamp}
              onChange={(e) => setNewTimestamp(e.target.value)}
              placeholder="05:20"
              className="timestamp-input"
              title="Timecode (MM:SS)"
            />
          </div>
          <span className="text-xs text-muted flex items-center">Timestamp</span>
        </div>

        <textarea
          value={newNoteText}
          onChange={(e) => setNewNoteText(e.target.value)}
          placeholder="Write formula, key insight, or question to review..."
          className="note-textarea"
          rows={3}
        ></textarea>

        <button type="submit" className="add-note-btn">
          <Plus className="w-3.5 h-3.5" />
          <span>Add Note to Lecture</span>
        </button>
      </form>

      {/* List of notes */}
      <div className="notes-list-container">
        {notes.length === 0 ? (
          <div className="empty-notes">
            <Sparkles className="w-6 h-6 text-slate-600 mb-1" />
            <p className="text-xs text-secondary">No notes yet. Add your first note above!</p>
          </div>
        ) : (
          notes.map((note) => (
            <div key={note.id} className="note-card">
              <div className="note-card-header">
                <span className="note-timestamp-badge">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{note.timestamp}</span>
                </span>
                <button
                  onClick={() => handleDeleteNote(note.id)}
                  className="note-del-btn"
                  title="Delete Note"
                  aria-label="Delete note"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
              <p className="note-text">{note.text}</p>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
