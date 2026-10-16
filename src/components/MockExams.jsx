import { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, CheckCircle2, Clock3, Flag, ListChecks, LoaderCircle } from "lucide-react";
import { usePyqBank } from "../hooks/usePyqBank.js";
import { navigate } from "../hooks/useRoute.js";
import { LESSON_BY_ID } from "../data/gate/index.js";
import { hasResponse, scoreExam } from "../../shared/exam.js";
import { startExamAttempt } from "../services/examState.js";
import { QuestionStem, AnswerControls, WorkedSolution } from "./ExamQuestion.jsx";
import TopicTutor from "./TopicTutor.jsx";
import Dialog from "./ui/Dialog.jsx";
import "./learning.css";

function BankStatus({ loading, error, retry }) {
  return <div className="empty-state">{loading ? <LoaderCircle className="spin" size={28} /> : <BookOpen size={28} />}<h1>{loading ? "Loading your question bank" : "Question bank unavailable"}</h1>{error && <><p>{error}</p><button className="button" onClick={retry}>Retry</button></>}</div>;
}
const route = (examId, attemptId) => `/mock/${examId}${attemptId ? `?attempt=${attemptId}` : ""}`;

export function MockExamHub({ attempts }) {
  const state = usePyqBank();
  if (!state.bank) return <BankStatus {...state} />;
  const { bank } = state;
  return <div className="mock-page page-width"><button className="back-link" onClick={() => navigate("/gate")}><ArrowLeft size={16} />Back to your study track</button>
    <div className="section-heading"><div><span className="eyebrow">PRACTISE UNDER EXAM CONDITIONS</span><h1>GATE CS mock exams</h1><p>Original past papers and balanced mixed papers. Review every answer after you submit.</p></div></div>
    <div className="exam-rules-strip"><span><Clock3 size={18} />180 minutes</span><span><ListChecks size={18} />65 questions · 100 marks</span><span><CheckCircle2 size={18} />Official-key scoring</span></div>
    {[{ kind: "paper", title: "Full previous-year papers", description: "The original question order, marks and question types." }, { kind: "mixed", title: "Mixed PYQ mocks", description: "Questions drawn across years, balanced by section and mark value." }].map((group) => <section className="mock-group" key={group.kind} aria-label={group.title}><div className="section-heading small"><div><h2>{group.title}</h2><p>{group.description}</p></div></div><div className="mock-grid">{bank.exams.filter((exam) => exam.kind === group.kind).map((exam) => {
      const active = attempts.find((attempt) => attempt.examId === exam.id && !attempt.submittedAt);
      const previous = attempts.find((attempt) => attempt.examId === exam.id && attempt.submittedAt);
      const score = previous ? scoreExam(previous.questionIds.map((id) => bank.questions.find((question) => question.id === id)).filter(Boolean), previous.answers) : null;
      return <article className="mock-card" key={exam.id}><span className="eyebrow">{exam.kind === "paper" ? "ORIGINAL PAPER" : "MIXED PRACTICE"}</span><h3>{exam.title}</h3><p>{exam.questionIds.length} questions · {exam.totalMarks} marks · {exam.durationMinutes} min</p><p className="mock-card-note">10 General Aptitude + 55 CS and mathematics questions</p>{score && <p className="mock-last-score">Last attempt <strong>{score.marks.toFixed(2)} / {score.totalMarks}</strong></p>}<div className="mock-card-actions"><button className="button button-dark" onClick={() => navigate(route(exam.id, active?.id))}>{active ? active.deadline <= Date.now() ? "View expired attempt" : "Resume exam" : "View instructions"}<ArrowRight size={15} /></button>{previous && <button className="text-button" onClick={() => navigate(route(exam.id, previous.id))}>Review attempt</button>}</div></article>;
    })}</div></section>)}
    {attempts.some((attempt) => attempt.submittedAt) && <section className="attempt-history"><h2>Your recent attempts</h2>{attempts.filter((attempt) => attempt.submittedAt).map((attempt) => <button key={attempt.id} onClick={() => navigate(route(attempt.examId, attempt.id))}><span>{bank.exams.find((exam) => exam.id === attempt.examId)?.title || attempt.examId}<small>{new Date(attempt.submittedAt).toLocaleString("en-IN")}</small></span><ArrowRight size={17} /></button>)}</section>}
    <p className="source-caption">These are practice scores, not official GATE scores or rank predictions. Attempts save on this device; export them with your study backup.</p>
  </div>;
}

export function MockExam({ examId, attemptId, attempts, setAttempts }) {
  const state = usePyqBank();
  const bank = state.bank;
  const exam = bank?.exams.find((item) => item.id === examId);
  const attempt = attempts.find((item) => item.id === attemptId && item.examId === examId);
  const activeAttemptId = attempt?.id;
  const deadline = attempt?.deadline;
  const submittedAt = attempt?.submittedAt;
  const questionIds = attempt?.questionIds;
  const [now, setNow] = useState(Date.now);
  const [submitOpen, setSubmitOpen] = useState(false);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [filter, setFilter] = useState("all");
  const closeSubmit = useCallback(() => setSubmitOpen(false), []);
  const finish = useCallback((reason) => {
    setAttempts((previous) => previous.map((item) => item.id === attemptId && !item.submittedAt ? { ...item, submittedAt: Math.max(item.startedAt, Date.now()), finishReason: reason } : item));
  }, [attemptId, setAttempts]);
  useEffect(() => {
    if (!activeAttemptId || submittedAt) return;
    const tick = () => {
      setNow(Date.now());
      if (Date.now() >= deadline) finish("time");
    };
    tick();
    const timer = setInterval(tick, 1000);
    document.addEventListener("visibilitychange", tick);
    const warn = (event) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => { clearInterval(timer); document.removeEventListener("visibilitychange", tick); window.removeEventListener("beforeunload", warn); };
  }, [activeAttemptId, deadline, submittedAt, finish]);
  const questions = useMemo(() => {
    if (!bank || !questionIds) return [];
    const lookup = new Map(bank.questions.map((question) => [question.id, question]));
    return questionIds.map((id) => lookup.get(id)).filter(Boolean);
  }, [bank, questionIds]);
  if (!bank) return <BankStatus {...state} />;
  if (!exam || attemptId && !attempt || attempt && questions.length !== attempt.questionIds.length) return <div className="empty-state"><BookOpen size={28} /><h1>Exam not found</h1><p>This paper or saved attempt is unavailable on this device.</p><button className="button" onClick={() => navigate("/mocks")}>All mock exams</button></div>;
  if (!attempt) return <div className="mock-page exam-instructions page-width"><button className="back-link" onClick={() => navigate("/mocks")}><ArrowLeft size={16} />All mock exams</button><span className="eyebrow">BEFORE YOU BEGIN</span><h1>{exam.title}</h1><p>{exam.questionIds.length} questions · {exam.totalMarks} marks · {exam.durationMinutes} minutes</p><ol><li>The timer starts when you begin and continues if you leave or reload the page. Your responses save automatically on this device.</li><li>MCQ: one correct option. An incorrect response loses one-third of the question's marks.</li><li>MSQ: choose all correct options and no incorrect options. No partial credit and no negative marks.</li><li>NAT: enter a decimal number within the official accepted range. No negative marks.</li><li>You may revisit questions, clear answers and flag questions for review. Flagged answers still count when submitted.</li><li>Submit when you are ready. When time expires, your saved answers are submitted automatically. Worked solutions and topic help appear after submission.</li><li>Questions officially awarded marks to all receive their full marks regardless of response.</li></ol><p className="notice">The full paper includes 15 marks of General Aptitude, alongside 85 marks of CS and mathematics.</p><button className="button button-dark" onClick={() => { const created = startExamAttempt(exam); setAttempts((previous) => [created, ...previous].slice(0, 30)); navigate(route(exam.id, created.id)); }}>Begin timed exam<ArrowRight size={17} /></button></div>;
  const update = (change) => setAttempts((previous) => previous.map((item) => {
    if (item.id !== attempt.id || item.submittedAt) return item;
    if (Date.now() >= item.deadline) return { ...item, submittedAt: Date.now(), finishReason: "time" };
    return { ...item, ...change };
  }));
  const score = scoreExam(questions, attempt.answers);
  const submitted = Boolean(attempt.submittedAt);
  const activeIndices = questions.map((question, index) => index).filter((index) => filter === "all" || filter === "flagged" ? filter === "all" || attempt.flagged.includes(questions[index].id) : score.results[index].status === filter);
  const current = submitted ? activeIndices.includes(reviewIndex) ? reviewIndex : activeIndices[0] : attempt.currentIndex;
  const question = questions[current];
  const remaining = Math.max(0, Math.ceil((attempt.deadline - now) / 1000));
  const clock = `${String(Math.floor(remaining / 3600)).padStart(2, "0")}:${String(Math.floor(remaining / 60) % 60).padStart(2, "0")}:${String(remaining % 60).padStart(2, "0")}`;
  const jump = (index) => submitted ? setReviewIndex(index) : update({ currentIndex: index });
  return <div className="mock-page exam-page page-width"><button className="back-link" onClick={() => navigate("/mocks")}><ArrowLeft size={16} />All mock exams</button><div className="exam-heading"><div><span className="eyebrow">{submitted ? "YOUR EXAM REVIEW" : "TIMED PRACTICE"}</span><h1>{exam.title}</h1></div>{!submitted && <div className={`exam-clock ${remaining < 300 ? "urgent" : ""}`} aria-label="Time remaining"><Clock3 size={19} /><time>{clock}</time></div>}</div>
    {submitted && <><div className="exam-scoreboard"><div><span>Your score</span><strong>{score.marks.toFixed(2)} <small>/ {score.totalMarks}</small></strong></div><div><span>Attempted</span><strong>{score.attempted} <small>/ {questions.length}</small></strong></div><div><span>Correct</span><strong>{score.correct}</strong></div><div><span>Incorrect</span><strong>{score.incorrect}</strong></div></div><p className="source-caption">{attempt.finishReason === "time" ? "Time expired; your saved responses were submitted automatically." : "Submitted"} · {new Date(attempt.submittedAt).toLocaleString("en-IN")}. Raw practice score using official answer keys.</p><div className="exam-review-filter" aria-label="Review question filter">{[["all", "All questions"], ["incorrect", "Incorrect"], ["unanswered", "Unanswered"], ["flagged", "Flagged"]].map(([value, label]) => <button className={`button ${filter === value ? "selected" : ""}`} key={value} onClick={() => setFilter(value)} aria-pressed={filter === value}>{label}</button>)}</div></>}
    <div className="exam-layout"><div className="exam-question-area">{question ? <article className="exam-question" key={question.id}><div className="question-meta"><strong>Question {current + 1} of {questions.length}</strong><span>{question.number <= 10 ? "General Aptitude" : "Computer Science"} · {question.type} · {question.marks} mark{question.marks === 1 ? "" : "s"}</span></div><p className="source-caption">GATE {question.year} {question.set} · original Q{question.number}</p><QuestionStem question={question} /><fieldset><legend className="visually-hidden">Answer question {current + 1}</legend><AnswerControls question={question} response={attempt.answers[question.id]} onChange={(response) => update({ answers: { ...attempt.answers, [question.id]: response } })} disabled={submitted} revealed={submitted} /></fieldset>{!submitted && <div className="exam-question-actions"><button className="button" onClick={() => { const answers = { ...attempt.answers }; delete answers[question.id]; update({ answers }); }}>Clear response</button><button className="button" aria-pressed={attempt.flagged.includes(question.id)} onClick={() => update({ flagged: attempt.flagged.includes(question.id) ? attempt.flagged.filter((id) => id !== question.id) : [...attempt.flagged, question.id] })}><Flag size={16} />{attempt.flagged.includes(question.id) ? "Unflag question" : "Flag for review"}</button></div>}{submitted && <><WorkedSolution question={question} response={attempt.answers[question.id]} /><div className="review-topic-links"><h2>Review this concept</h2>{question.lessonIds.map((id) => <button className="button" key={id} onClick={() => navigate(`/lesson/${id}`)}><BookOpen size={16} />{LESSON_BY_ID[id]?.title || id}</button>)}</div><TopicTutor key={question.id} lessonId={question.lessonIds[0]} title={LESSON_BY_ID[question.lessonIds[0]]?.title || question.testedConcept} questionId={question.id} studentAnswer={attempt.answers[question.id]} /></>}</article> : <div className="empty-state"><CheckCircle2 size={28} /><h2>No questions match this filter</h2><button className="button" onClick={() => setFilter("all")}>Show all questions</button></div>}
      {question && <div className="exam-navigation"><button className="button" disabled={submitted ? activeIndices.indexOf(current) <= 0 : current === 0} onClick={() => jump(submitted ? activeIndices[activeIndices.indexOf(current) - 1] : current - 1)}><ArrowLeft size={16} />Previous</button><span>{current + 1} / {questions.length}</span><button className="button button-dark" disabled={submitted ? activeIndices.indexOf(current) === activeIndices.length - 1 : current === questions.length - 1} onClick={() => jump(submitted ? activeIndices[activeIndices.indexOf(current) + 1] : current + 1)}>Next<ArrowRight size={16} /></button></div>}
    </div><aside className="exam-palette"><h2>Question navigator</h2><div className="palette-legend"><span>Answered</span><span>Flagged</span>{submitted && <span>Incorrect</span>}</div><div className="palette-grid">{questions.map((item, index) => <button key={item.id} className={`${index === current ? "current" : ""} ${hasResponse(item, attempt.answers[item.id]) ? "answered" : ""} ${attempt.flagged.includes(item.id) ? "flagged" : ""} ${submitted ? score.results[index].status : ""}`} aria-label={`Question ${index + 1}${attempt.flagged.includes(item.id) ? ", flagged" : ""}${hasResponse(item, attempt.answers[item.id]) ? ", answered" : ", unanswered"}`} aria-current={index === current ? "step" : undefined} onClick={() => { if (submitted && !activeIndices.includes(index)) setFilter("all"); jump(index); }}>{index + 1}</button>)}</div><p>{score.attempted} answered · {questions.length - score.attempted} unanswered</p>{!submitted && <><p className="field-help">Responses save automatically. The timer keeps running if you leave.</p><button className="button button-dark exam-submit" onClick={() => setSubmitOpen(true)}>Submit exam</button></>}</aside></div>
    {submitOpen && !submitted && <Dialog title="Submit this exam?" onClose={closeSubmit}><p>You have answered {score.attempted} of {questions.length} questions. {questions.length - score.attempted} remain unanswered.</p><p>You can review solutions after submitting. Submitted responses cannot be changed.</p><div className="dialog-actions"><button className="button" onClick={closeSubmit}>Keep working</button><button className="button button-dark" onClick={() => { finish("manual"); setSubmitOpen(false); }}>Submit and review</button></div></Dialog>}
  </div>;
}
