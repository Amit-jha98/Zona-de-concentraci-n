import { useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  BookOpen,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  Download,
  ExternalLink,
  FileText,
  GraduationCap,
  Lightbulb,
  ListChecks,
  Play,
  Search,
  Circle,
  AlertCircle,
} from "lucide-react";
import {
  GATE_SECTIONS,
  GATE_LESSONS,
  EXAM_LESSONS,
  APTITUDE_SECTION,
  LESSON_BY_ID,
  SYLLABUS_SOURCE,
  lessonMarkdown,
} from "../data/gate/index.js";
import { navigate } from "../hooks/useRoute.js";
import { downloadText } from "../services/storage.js";
import { useVideos } from "../hooks/useVideos.js";
import { useTopicCandidates } from "../hooks/useTopicCandidates.js";
import { uniqueVideos } from "../../shared/video.js";
import VideoCard, { SkeletonGrid } from "./ui/VideoCard.jsx";
import TopicPractice from "./TopicPractice.jsx";
import TopicTutor from "./TopicTutor.jsx";
import RichText from "./ui/RichText.jsx";
import "./learning.css";

export function GateOverview({ progress }) {
  const [expanded, setExpanded] = useState(null);
  const [query, setQuery] = useState("");
  const completed = GATE_LESSONS.filter(
    (l) => progress[l.id]?.completed,
  ).length;
  const next =
    GATE_LESSONS.find((l) => !progress[l.id]?.completed) || GATE_LESSONS[0];
  const revision = GATE_LESSONS.filter((l) =>
    Object.values(progress[l.id]?.answers || {}).some(
      (a) => a.correct === false,
    ),
  );
  const filtered = useMemo(
    () =>
      GATE_SECTIONS.map((section) => ({
        ...section,
        visibleLessons: section.lessons.filter((l) =>
          `${l.title} ${l.group} ${section.title}`
            .toLowerCase()
            .includes(query.toLowerCase()),
        ),
      })).filter((s) => s.visibleLessons.length),
    [query],
  );
  return (
    <div className="gate-page page-width">
      <button className="back-link" onClick={() => navigate("/")}>
        <ArrowLeft size={16} />
        Back to explore
      </button>
      <div className="section-heading">
        <div>
          <span className="eyebrow">A STRUCTURED LEARNING PATH</span>
          <h1>
            GATE Computer Science <span className="year-tag">2027</span>
          </h1>
          <p>
            Understand one concept at a time. Read, watch, then put it into
            practice.
          </p>
        </div>
        <a
          className="button"
          href={SYLLABUS_SOURCE}
          target="_blank"
          rel="noreferrer"
        >
          <FileText size={17} />
          View syllabus
          <ExternalLink size={14} />
        </a>
      </div>
      <div className="gate-summary">
        <div className="gate-summary-main">
          <span className="gate-summary-icon">
            <GraduationCap size={28} />
          </span>
          <div>
            <strong>
              {completed
                ? "Keep building on what you know."
                : "Start with the foundations."}
            </strong>
            <p>
              {GATE_SECTIONS.length} sections · {GATE_LESSONS.length} concept
              lessons · {GATE_LESSONS.reduce((n, l) => n + l.quiz.length, 0)}{" "}
              explained questions
            </p>
            <span className="small-text">
              Mapped to GATE-cs Syllabus.
            </span>
          </div>
        </div>
        <div className="gate-summary-progress">
          <div>
            <strong>
              {Math.round((completed / GATE_LESSONS.length) * 100)}%
            </strong>
            <span>
              {completed} of {GATE_LESSONS.length} complete
            </span>
          </div>
          <div className="progress-track">
            <span
              style={{ width: `${(completed / GATE_LESSONS.length) * 100}%` }}
            />
          </div>
        </div>
        <button
          className="button button-dark"
          onClick={() => navigate(`/lesson/${next.id}`)}
        >
          {completed ? "Continue learning" : "Start learning"}
          <ArrowRight size={16} />
        </button>
      </div>
      <section className="gate-exam-entry" aria-label="Mock exam preparation"><div><span className="eyebrow">PUT YOUR PREPARATION TO THE TEST</span><h2>Practise full GATE papers</h2><p>Timed PYQ mocks, official-key scoring, worked solutions and topic-by-topic review.</p></div><button className="button button-dark" onClick={() => navigate("/mocks")}>Open mock exams<ArrowRight size={17} /></button></section>
      {revision.length > 0 && (
        <div className="revision-strip">
          <Lightbulb size={19} />
          <div>
            <strong>
              {revision.length} concept{revision.length === 1 ? "" : "s"} to
              revisit
            </strong>
            <span>
              A missed question is a useful place to start your next revision.
            </span>
          </div>
          <button
            className="text-button"
            onClick={() => navigate(`/lesson/${revision[0].id}?tab=practice`)}
          >
            Review <ArrowRight size={16} />
          </button>
        </div>
      )}
      <div className="section-heading small">
        <h2>The complete syllabus</h2>
        <label className="inline-search">
          <Search size={16} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Find a topic"
            aria-label="Find a syllabus topic"
          />
        </label>
      </div>
      <div className="curriculum-list">
        {filtered.map((section) => {
          const done = section.lessons.filter(
            (l) => progress[l.id]?.completed,
          ).length;
          const open = expanded === section.id || !!query;
          return (
            <section
              className={`curriculum-section ${open ? "expanded" : ""}`}
              key={section.id}
            >
              <button
                className="curriculum-section-toggle"
                aria-expanded={open}
                aria-controls={`section-${section.id}`}
                onClick={() => setExpanded(open ? null : section.id)}
              >
                <span className="section-number">
                  {String(section.number).padStart(2, "0")}
                </span>
                <span className="curriculum-section-title">
                  <strong>{section.title}</strong>
                  <span>
                    {section.lessons.length} lessons · Notes, videos & practice
                  </span>
                </span>
                <span className="section-completion">
                  {done}/{section.lessons.length}
                  <span className="mini-progress">
                    <span
                      style={{
                        width: `${(done / section.lessons.length) * 100}%`,
                      }}
                    />
                  </span>
                </span>
                {open ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              </button>
              {open && (
                <div
                  id={`section-${section.id}`}
                  className="curriculum-section-body"
                >
                  {section.groups.map((group) => {
                    const items = section.visibleLessons.filter(
                      (l) => l.group === group.title,
                    );
                    if (!items.length) return null;
                    return (
                      <div className="lesson-group" key={group.title}>
                        <h3>{group.title}</h3>
                        {items.map((l) => (
                          <button
                            className="lesson-row"
                            key={l.id}
                            onClick={() => navigate(`/lesson/${l.id}`)}
                          >
                            {progress[l.id]?.completed ? (
                              <CheckCircle2
                                size={18}
                                className="success-text"
                              />
                            ) : (
                              <Circle size={18} />
                            )}
                            <span>{l.title}</span>
                            <span className="lesson-resources">
                              <FileText size={13} />
                              <Play size={13} />
                              <ListChecks size={14} />
                            </span>
                            <ChevronRight size={16} />
                          </button>
                        ))}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>
      {!filtered.length && (
        <div className="empty-state">
          <Search size={28} />
          <h2>No topic found</h2>
          <p>Try a shorter concept name.</p>
        </div>
      )}
      <div className="curriculum-footer">
        <div className="aptitude-supplement"><h2>General Aptitude supplement</h2><p>The full GATE paper includes 15 marks of aptitude. These lessons supplement your supplied CS syllabus.</p><div className="aptitude-links">{APTITUDE_SECTION.lessons.map((lesson) => <button key={lesson.id} className="button" onClick={() => navigate(`/lesson/${lesson.id}`)}>{lesson.title}<ChevronRight size={16} /></button>)}</div></div>
      </div>
      <div className="curriculum-footer">
        <BookOpen size={19} />
        <p>
          The CS track follows the supplied syllabus. Practice includes original concept checks and topic-mapped official past-year questions. The aptitude supplement supports full-paper mock exams.
        </p>
      </div>
    </div>
  );
}

export function GateLesson({
  id,
  tab: requestedTab,
  progress,
  updateProgress,
  onPlay,
  saved,
  onSave,
  revision,
}) {
  const lesson = LESSON_BY_ID[id];
  const [tab, setTab] = useState(
    ["notes", "videos", "practice"].includes(requestedTab)
      ? requestedTab
      : "notes",
  );
  const [language, setLanguage] = useState("");
  const [liveRequested, setLiveRequested] = useState(false);
  const candidates = useTopicCandidates(id);
  const videos = useVideos(lesson?.videoQuery || "", {
    duration: "concept",
    language,
    enabled: tab === "videos" && liveRequested,
    revision,
  });
  const visibleVideos = uniqueVideos([
    ...(language ? [] : candidates.items),
    ...videos.items,
  ]);
  if (!lesson)
    return (
      <div className="empty-state">
        <BookOpen size={30} />
        <h1>Lesson not found</h1>
        <button className="button" onClick={() => navigate("/gate")}>
          Open the syllabus
        </button>
      </div>
    );
  const index = EXAM_LESSONS.findIndex((item) => item.id === id);
  const section = [...GATE_SECTIONS, APTITUDE_SECTION].find((s) => s.id === lesson.sectionId);
  const state = progress[id] || {};
  const answeredCorrectly = lesson.quiz.every(
    (q) => state.answers?.[q.id]?.correct,
  );
  const setState = (change) =>
    updateProgress((prev) => ({ ...prev, [id]: { ...prev[id], ...change } }));
  const tabs = [
    { id: "notes", label: "Concept notes", icon: FileText },
    { id: "videos", label: "Watch & learn", icon: Play },
    { id: "practice", label: "Practice", icon: ListChecks },
  ];
  const complete = () => {
    setState({ completed: true, completedAt: new Date().toISOString() });
    if (EXAM_LESSONS[index + 1])
      navigate(`/lesson/${EXAM_LESSONS[index + 1].id}`);
  };
  return (
    <div className="lesson-page page-width">
      <nav className="breadcrumb" aria-label="Breadcrumb">
        <button onClick={() => navigate("/gate")}>GATE CS 2027</button>
        <ChevronRight size={13} />
        <span>{section.title}</span>
        <ChevronRight size={13} />
        <span>Lesson {section.lessons.findIndex((l) => l.id === id) + 1}</span>
      </nav>
      <div className="lesson-layout">
        <aside className="lesson-outline">
          <button className="back-link" onClick={() => navigate("/gate")}>
            <ArrowLeft size={15} />
            All sections
          </button>
          <span className="eyebrow">
            SECTION {String(section.number).padStart(2, "0")}
          </span>
          <h2>{section.title}</h2>
          <div className="outline-items">
            {section.lessons.map((l, i) => (
              <button
                className={l.id === id ? "active" : ""}
                key={l.id}
                onClick={() => navigate(`/lesson/${l.id}`)}
                aria-current={l.id === id ? "step" : undefined}
              >
                {progress[l.id]?.completed ? (
                  <CheckCircle2 size={15} className="success-text" />
                ) : (
                  <span className="outline-number">{i + 1}</span>
                )}
                <span>{l.title}</span>
              </button>
            ))}
          </div>
        </aside>
        <article className="lesson-article">
          <div className="lesson-topline">
            <span className="eyebrow">{lesson.group}</span>
            {state.completed && (
              <span className="completed-tag">
                <Check size={13} />
                Completed
              </span>
            )}
          </div>
          <h1>{lesson.title}</h1>
          <p className="lesson-intro">
            Learn the idea, work through an example, and check your
            understanding.
          </p>
          {index > 0 && (
            <p className="prerequisite">
              Suggested before this:{" "}
              <button
                onClick={() =>
                  navigate(`/lesson/${EXAM_LESSONS[index - 1].id}`)
                }
              >
                {EXAM_LESSONS[index - 1].title}
              </button>
            </p>
          )}
          <div
            className="lesson-tabs"
            role="tablist"
            aria-label="Lesson resources"
          >
            {tabs.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  role="tab"
                  id={`tab-${item.id}`}
                  aria-selected={tab === item.id}
                  aria-controls={`panel-${item.id}`}
                  tabIndex={tab === item.id ? 0 : -1}
                  onClick={() => setTab(item.id)}
                  onKeyDown={(event) => {
                    if (
                      ["ArrowLeft", "ArrowRight", "Home", "End"].includes(
                        event.key,
                      )
                    ) {
                      event.preventDefault();
                      const next =
                        event.key === "Home"
                          ? 0
                          : event.key === "End"
                            ? 2
                            : (i + (event.key === "ArrowRight" ? 1 : -1) + 3) %
                              3;
                      setTab(tabs[next].id);
                      document.getElementById(`tab-${tabs[next].id}`)?.focus();
                    }
                  }}
                >
                  <Icon size={17} />
                  {item.label}
                </button>
              );
            })}
          </div>
          <div
            role="tabpanel"
            id={`panel-${tab}`}
            aria-labelledby={`tab-${tab}`}
            tabIndex={0}
          >
            {tab === "notes" && (
              <div className="concept-content">
                <div className="notes-toolbar">
                  <span>
                    <BookOpen size={16} />
                    Concept guide
                  </span>
                  <button
                    className="text-button"
                    onClick={() =>
                      downloadText(`${id}-notes.md`, lessonMarkdown(lesson))
                    }
                  >
                    <Download size={15} />
                    Download notes
                  </button>
                </div>
                {lesson.notes.map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
                <div className="formula-box">
                  <span>KEY RELATIONSHIP</span>
                  <code>{lesson.formula}</code>
                </div>
                <h2>Work through an example</h2>
                <ol className="worked-steps">
                  {lesson.example.map((step, i) => (
                    <li key={i}>
                      <span>{i + 1}</span>
                      <p>{step}</p>
                    </li>
                  ))}
                </ol>
                <div className="concept-caution">
                  <Lightbulb size={20} />
                  <div>
                    <h3>A common mistake</h3>
                    <p>{lesson.pitfall}</p>
                  </div>
                </div>
                <div className="further-reading">
                  <span>Further reading</span>
                  <a href={section.reference.url} target="_blank" rel="noreferrer">{section.reference.label}<ExternalLink size={14} /></a>
                </div>
                {lesson.examGuide?.length > 0 && <section className="lesson-exam-guide"><h2>Prepare at GATE depth</h2>{lesson.examGuide.map((item) => <section key={item.title}><h3>{item.title}</h3><RichText>{item.body}</RichText></section>)}</section>}
                <TopicTutor key={lesson.id} lessonId={lesson.id} title={lesson.title} />
                <label className="personal-note-label">
                  Your revision note
                  <textarea
                    placeholder="Explain the idea in your own words, or note what you want to revisit."
                    value={state.personalNote || ""}
                    onChange={(e) => setState({ personalNote: e.target.value })}
                    rows={4}
                    maxLength={10000}
                  />
                </label>
                <span className="small-text muted">
                  Saved on this device as you type.
                </span>
                <div className="lesson-bottom-actions">
                  <button className="button" onClick={() => setTab("videos")}>
                    <Play size={16} />
                    Find a concept lecture
                  </button>
                  <button
                    className="button button-dark"
                    onClick={() => setTab("practice")}
                  >
                    Check understanding
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
            {tab === "videos" && (
              <div className="lesson-videos">
                <div className="section-heading small">
                  <div>
                    <h2>One concept. A focused lecture.</h2>
                    <p>
                      Topic-specific results, with long courses filtered out.
                    </p>
                  </div>
                  <label className="visually-hidden" htmlFor="lesson-language">
                    Video language
                  </label>
                  <select
                    id="lesson-language"
                    value={language}
                    onChange={(e) => {
                      setLanguage(e.target.value);
                      setLiveRequested(true);
                    }}
                  >
                    <option value="">Any language</option>
                    <option value="en">English</option>
                    <option value="hi">Hindi</option>
                  </select>
                </div>
                <p className="search-query">
                  <Search size={15} />
                  {lesson.title}
                </p>
                {videos.error && (
                  <div className="notice error">
                    <AlertCircle size={20} />
                    <div>
                      <strong>Lectures couldn’t be loaded</strong>
                      <p>{videos.error}</p>
                    </div>
                    <button className="button" onClick={videos.refresh}>
                      Retry
                    </button>
                  </div>
                )}
                {(candidates.loading || videos.loading) &&
                !visibleVideos.length ? (
                  <SkeletonGrid count={4} />
                ) : (
                  <div className="video-grid lesson-video-grid">
                    {visibleVideos.map((v) => (
                      <VideoCard
                        key={v.id}
                        video={v}
                        onPlay={(video) => onPlay(video, id)}
                        saved={saved.some((s) => s.id === v.id)}
                        onSave={onSave}
                      />
                    ))}
                  </div>
                )}
                {!candidates.loading &&
                  !videos.loading &&
                  !visibleVideos.length &&
                  !videos.error && (
                    <div className="empty-state">
                      <Play size={30} />
                      <h3>No short lecture returned on this page</h3>
                      <p>
                        Find more lectures or search this exact concept on
                        YouTube.
                      </p>
                    </div>
                  )}
                <div className="lesson-bottom-actions">
                  <a
                    className="button"
                    href={`https://www.youtube.com/results?search_query=${encodeURIComponent(lesson.videoQuery)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Search this topic on YouTube
                    <ExternalLink size={15} />
                  </a>
                  {!liveRequested ? (
                    <button
                      className="button button-dark"
                      onClick={() => setLiveRequested(true)}
                    >
                      Find more lectures
                      <Search size={15} />
                    </button>
                  ) : videos.nextPageToken ? (
                    <button
                      className="button"
                      disabled={videos.loadingMore}
                      onClick={videos.loadMore}
                    >
                      {videos.loadingMore
                        ? "Loading…"
                        : "More concept lectures"}
                    </button>
                  ) : (
                    <button
                      className="button"
                      disabled={videos.loading}
                      onClick={videos.refresh}
                    >
                      {videos.loading ? "Searching…" : "Refresh lectures"}
                    </button>
                  )}
                </div>
                <p className="source-caption">
                  Videos provided by YouTube
                  {candidates.checkedAt
                    ? ` · Initial candidates checked ${new Date(candidates.checkedAt).toLocaleDateString("en-IN")}`
                    : ""}
                  . Availability can vary. Topic matching uses lecture titles,
                  rather than a review of the full lecture.
                </p>
              </div>
            )}
            {tab === "practice" && (
              <div className="practice-content">
                <div className="section-heading small">
                  <div>
                    <h2>Check your understanding</h2>
                    <p>
                      Original concept practice. Read the reasoning after you
                      answer.
                    </p>
                  </div>
                  <span className="quiet-label">
                    {lesson.quiz.length} question
                    {lesson.quiz.length === 1 ? "" : "s"}
                  </span>
                </div>
                {lesson.quiz.map((q, i) => (
                  <Quiz
                    key={q.id}
                    question={q}
                    number={i + 1}
                    saved={state.answers?.[q.id]}
                    onAnswer={(answer) =>
                      setState({
                        answers: { ...state.answers, [q.id]: answer },
                        ...(!answer.correct ? { completed: false } : {}),
                      })
                    }
                  />
                ))}
                <TopicPractice lesson={lesson} saved={state.pyqAnswers} onAnswer={(questionId, answer) => setState({ pyqAnswers: { ...state.pyqAnswers, [questionId]: answer } })} />
                <div className="completion-box">
                  <div>
                    <h3>
                      {state.completed
                        ? "This lesson is complete"
                        : answeredCorrectly
                          ? "Ready for the next concept?"
                          : "Learn it, then make it stick"}
                    </h3>
                    <p>
                      {answeredCorrectly
                        ? "You’ve answered the practice correctly. Mark this lesson complete when you’re ready."
                        : "Answer the practice correctly to complete this lesson. You can retry after reviewing the explanation."}
                    </p>
                  </div>
                  <button
                    className="button button-dark"
                    disabled={!answeredCorrectly}
                    onClick={complete}
                  >
                    {index === GATE_LESSONS.length - 1
                      ? "Mark complete"
                      : "Complete & continue"}
                    <ArrowRight size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
          <div className="lesson-navigation">
            {index > 0 ? (
              <button
                onClick={() =>
                  navigate(`/lesson/${EXAM_LESSONS[index - 1].id}`)
                }
              >
                <ArrowLeft size={17} />
                <span>
                  <small>Previous concept</small>
                  {EXAM_LESSONS[index - 1].title}
                </span>
              </button>
            ) : (
              <span />
            )}
            {index < EXAM_LESSONS.length - 1 && (
              <button
                onClick={() =>
                  navigate(`/lesson/${EXAM_LESSONS[index + 1].id}`)
                }
              >
                <span>
                  <small>Next concept</small>
                  {EXAM_LESSONS[index + 1].title}
                </span>
                <ArrowRight size={17} />
              </button>
            )}
          </div>
        </article>
      </div>
    </div>
  );
}

function Quiz({ question: q, number, saved, onAnswer }) {
  const [selected, setSelected] = useState(saved?.answer ?? null);
  const [submitted, setSubmitted] = useState(saved || null);
  const submit = (e) => {
    e.preventDefault();
    if (selected == null) return;
    const answer = {
      answer: selected,
      correct: selected === q.answer,
      attemptedAt: new Date().toISOString(),
    };
    setSubmitted(answer);
    onAnswer(answer);
  };
  return (
    <form className="quiz-card" onSubmit={submit}>
      <fieldset>
        <legend>
          <span className="eyebrow">
            QUESTION {String(number).padStart(2, "0")}
          </span>
          <span>{q.question}</span>
        </legend>
        <div className="quiz-options">
          {q.options.map((option, i) => (
            <label
              key={i}
              className={`quiz-option ${submitted && i === q.answer ? "correct" : submitted && submitted.answer === i ? "incorrect" : ""}`}
            >
              <input
                type="radio"
                name={q.id}
                value={i}
                checked={selected === i}
                onChange={() => setSelected(i)}
                disabled={!!submitted}
              />
              <span className="option-letter">
                {String.fromCharCode(65 + i)}
              </span>
              <span>{option}</span>
              {submitted && i === q.answer && <CheckCircle2 size={17} />}
            </label>
          ))}
        </div>
      </fieldset>
      {submitted ? (
        <div
          className={`quiz-explanation ${submitted.correct ? "correct" : "incorrect"}`}
          role="status"
        >
          <strong>
            {submitted.correct
              ? "Correct — here’s why."
              : "Not quite — work through the reasoning."}
          </strong>
          <p>
            <b>
              Answer {String.fromCharCode(65 + q.answer)}: {q.options[q.answer]}
              .
            </b>{" "}
            {q.explanation}
          </p>
          <button
            type="button"
            className="text-button"
            onClick={() => {
              setSubmitted(null);
              setSelected(null);
            }}
          >
            Try again
          </button>
        </div>
      ) : (
        <button
          className="button button-dark"
          type="submit"
          disabled={selected == null}
        >
          Check answer
          <ArrowRight size={15} />
        </button>
      )}
    </form>
  );
}
