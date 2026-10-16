import { useCallback, useState } from "react";
import { ArrowRight, CheckCircle2, Expand, RotateCcw } from "lucide-react";
import { answerLabel, gradeQuestion, hasResponse } from "../../shared/exam.js";
import RichText from "./ui/RichText.jsx";
import Dialog from "./ui/Dialog.jsx";
import TopicTutor from "./TopicTutor.jsx";

export function QuestionStem({ question: q }) {
  const [zoomed, setZoomed] = useState(false);
  const [zoom, setZoom] = useState(1);
  const close = useCallback(() => setZoomed(false), []);
  return <>
    {!q.sourceFirst && <RichText className="question-stem">{q.prompt}</RichText>}
    {q.images?.length > 0 && <details className="question-source" open={q.sourceFirst || q.hasDiagram || undefined}><summary>Original paper{q.hasDiagram ? " · diagram or figure" : " · question and options"}</summary><div className="question-source-images">{q.images.map((image) => <button type="button" key={image.src} onClick={() => { setZoom(window.matchMedia("(max-width: 600px)").matches ? 2 : 1); setZoomed(true); }} aria-label={`Enlarge original question ${q.number}, page ${image.page}`}><img src={image.src} width={image.width} height={image.height} alt={`Original GATE ${q.year} ${q.set} question ${q.number}, page ${image.page}`} loading="lazy" /><span><Expand size={15} />Enlarge</span></button>)}</div></details>}
    {q.sourceFirst && <details className="question-text-alternative"><summary>Text transcription</summary><p className="field-help">Refer to the original above for diagrams, code layout and mathematical notation.</p><RichText>{q.prompt}</RichText>{q.options?.length > 0 && <ol type="A">{q.options.map((option, index) => <li key={index}><RichText>{option}</RichText></li>)}</ol>}</details>}
    {zoomed && <Dialog title={`GATE ${q.year} ${q.set} · Question ${q.number}`} onClose={close} wide><label className="source-zoom-control">Zoom <input type="range" min="1" max="3" step="0.25" value={zoom} onChange={(event) => setZoom(Number(event.target.value))} /><span>{Math.round(zoom * 100)}%</span></label><div className="source-zoom-scroll">{q.images.map((image) => <img key={image.src} src={image.src} alt={`Source page ${image.page}`} style={{ width: `${zoom * 100}%`, maxWidth: "none" }} />)}</div></Dialog>}
  </>;
}

export function AnswerControls({ question: q, response, onChange, disabled = false, revealed = false }) {
  const selected = Array.isArray(response) ? response : Number.isInteger(response) ? [response] : [];
  const accepted = q.accepted;
  if (accepted?.kind === "all") return <p className="question-awarded">The official key awards marks to all candidates for this question.</p>;
  if (q.type === "NAT") return <div className="numerical-answer"><label htmlFor={`answer-${q.id}`}>Your numerical answer</label><div><input id={`answer-${q.id}`} name={q.id} inputMode="decimal" type="text" maxLength={24} autoComplete="off" value={response ?? ""} onChange={(event) => onChange(event.target.value)} disabled={disabled} placeholder="Enter a number" /><button type="button" className="button" disabled={disabled} aria-label="Change answer sign" onClick={() => onChange(String(response || "").startsWith("-") ? String(response).slice(1) : `-${response || ""}`)}>±</button></div><p>Enter a decimal number without units.</p></div>;
  return <div className={`quiz-options ${q.sourceFirst ? "source-answer-options" : ""}`}>{q.options.map((option, index) => {
    const correct = revealed && accepted?.kind === "choice" && accepted.alternatives.some((answer) => answer.includes(index));
    return <label className={`quiz-option ${correct ? "correct" : revealed && selected.includes(index) ? "incorrect" : ""}`} key={index}><input aria-label={q.sourceFirst ? `Option ${String.fromCharCode(65 + index)}` : undefined} type={q.type === "MSQ" ? "checkbox" : "radio"} name={q.id} value={index} checked={selected.includes(index)} disabled={disabled} onChange={() => onChange(q.type === "MSQ" ? selected.includes(index) ? selected.filter((value) => value !== index) : [...selected, index].sort() : [index])} /><span className="option-letter">{String.fromCharCode(65 + index)}</span>{!q.sourceFirst && <RichText>{option}</RichText>}{correct && <CheckCircle2 size={17} />}</label>;
  })}</div>;
}

export function WorkedSolution({ question: q, response }) {
  const grade = gradeQuestion(q, response);
  return <div className={`quiz-explanation ${grade.correct ? "correct" : "incorrect"}`}>
    <strong>{grade.status === "awarded" ? "Official marks-to-all question" : grade.correct ? "Correct — work through the reasoning." : grade.attempted ? "Review your approach." : "You left this question unanswered."}</strong>
    <p><b>{q.year ? "Official answer" : "Answer"}: {answerLabel(q)}</b></p>
    <RichText>{q.solution}</RichText>
    {q.pitfall && <p className="exam-pitfall"><b>Watch for:</b> {q.pitfall}</p>}
  </div>;
}

export default function PracticeQuestion({ question: q, saved, onAnswer, tutorLessonId }) {
  const [response, setResponse] = useState(saved?.response ?? (q.type === "NAT" ? "" : []));
  const [submitted, setSubmitted] = useState(Boolean(saved));
  const [error, setError] = useState("");
  const submit = (event) => {
    event.preventDefault();
    if (!hasResponse(q, response) && q.accepted.kind !== "all") return;
    if (q.type === "NAT" && !/^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(String(response).trim())) { setError("Enter a decimal number without units."); return; }
    const result = gradeQuestion(q, response);
    setSubmitted(true);
    setError("");
    onAnswer({ response, correct: result.correct, attemptedAt: new Date().toISOString() });
  };
  return <article className="quiz-card pyq-card" data-question-id={q.id}>
    <div className="question-meta"><strong>{q.year ? `GATE ${q.year} ${q.set} · Q${q.number}` : "Exam-level concept practice"}</strong><span>{q.type} · {q.marks} mark{q.marks === 1 ? "" : "s"}</span></div>
    <QuestionStem question={q} />
    <form onSubmit={submit}><fieldset><legend className="visually-hidden">Answer {q.year ? `GATE ${q.year} question ${q.number}` : q.id}</legend><AnswerControls question={q} response={response} onChange={setResponse} disabled={submitted} revealed={submitted} /></fieldset>
    {q.type === "MSQ" && !submitted && <p className="field-help">Choose every correct option. There is no partial credit.</p>}
    {error && <p className="error-text" role="alert">{error}</p>}
    {submitted ? <><WorkedSolution question={q} response={response} /><button type="button" className="text-button" onClick={() => { setSubmitted(false); setResponse(q.type === "NAT" ? "" : []); }}><RotateCcw size={15} />Try again</button></> : <button className="button button-dark" disabled={!hasResponse(q, response) && q.accepted.kind !== "all"} type="submit">{q.accepted.kind === "all" ? "Read solution" : "Check answer"}<ArrowRight size={15} /></button>}</form>
    {submitted && tutorLessonId && <TopicTutor lessonId={tutorLessonId} title={q.testedConcept || "This practice question"} questionId={q.id} studentAnswer={response} />}
  </article>;
}
