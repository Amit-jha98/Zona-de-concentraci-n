import { useMemo, useState } from "react";
import { LoaderCircle } from "lucide-react";
import { usePyqBank } from "../hooks/usePyqBank.js";
import PracticeQuestion from "./ExamQuestion.jsx";

export default function TopicPractice({ lesson, saved = {}, onAnswer }) {
  const { bank, loading, error, retry } = usePyqBank();
  const [year, setYear] = useState("all");
  const questions = useMemo(() => bank?.questions.filter((question) => question.lessonIds.includes(lesson.id)) || [], [bank, lesson.id]);
  const visible = questions.filter((question) => year === "all" || String(question.year) === year);
  return <section className="topic-pyqs" aria-label="Topic past-year questions"><div className="section-heading small"><div><h2>Previous-year questions</h2><p>Mapped to this concept, with original question types and worked solutions.</p></div>{questions.length > 0 && <label className="pyq-year-filter">Year<select value={year} onChange={(event) => setYear(event.target.value)}><option value="all">All years ({questions.length})</option>{[...new Set(questions.map((question) => question.year))].sort((a, b) => b - a).map((value) => <option key={value} value={value}>{value} ({questions.filter((question) => question.year === value).length})</option>)}</select></label>}</div>
    {loading && <p role="status"><LoaderCircle size={17} className="spin" />Loading topic questions…</p>}
    {error && <div className="notice error" role="alert"><p>{error}</p><button className="button" onClick={retry}>Retry question bank</button></div>}
    {bank && !questions.length && <p className="notice">No question in the supplied 2023–2026 papers is directly mapped to this concept. Use the exam-level practice below; this topic still belongs to the syllabus.</p>}
    {visible.map((question) => <PracticeQuestion key={question.id} question={question} saved={saved[question.id]} tutorLessonId={lesson.id} onAnswer={(answer) => onAnswer(question.id, answer)} />)}
    {lesson.advancedQuiz?.length > 0 && <section className="advanced-practice" aria-label="Exam-level concept questions"><h2>Exam-level concept practice</h2><p className="field-help">Additional original questions that develop the techniques used in past papers.</p>{lesson.advancedQuiz.map((question) => <PracticeQuestion key={question.id} question={question} saved={saved[question.id]} tutorLessonId={lesson.id} onAnswer={(answer) => onAnswer(question.id, answer)} />)}</section>}
    {questions.length > 0 && <p className="source-caption">Questions and final answer keys are from the respective GATE papers. Worked explanations are study material authored for this app.</p>}
  </section>;
}
