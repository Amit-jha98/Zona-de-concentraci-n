import { useEffect, useRef, useState } from "react";
import { ArrowUp, MessageCircle, LoaderCircle, RotateCcw, X } from "lucide-react";
import { api } from "../services/api.js";
import RichText from "./ui/RichText.jsx";

export default function TopicTutor({ lessonId, title, questionId, studentAnswer, inline = false }) {
  const [open, setOpen] = useState(inline);
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const request = useRef(null);
  const input = useRef(null);
  const end = useRef(null);
  useEffect(() => () => request.current?.abort(), []);
  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (open && messages.length) end.current?.scrollIntoView({ block: "nearest" }); }, [messages.length, busy, open]);
  const send = async (text) => {
    const content = text.trim();
    if (!content || busy) return;
    const previous = messages.at(-1)?.role === "user" ? messages.slice(0, -1) : messages;
    const next = [...previous, { role: "user", content }];
    setMessages(next);
    setDraft("");
    setError("");
    setBusy(true);
    const controller = new AbortController();
    request.current = controller;
    try {
      const reply = await api("/tutor", { method: "POST", body: { lessonId, questionId, studentAnswer, messages: next.slice(-9) }, signal: controller.signal, timeoutMs: 60000 });
      if (!controller.signal.aborted) setMessages([...next, { role: "assistant", content: reply.answer }]);
    } catch (error) {
      if (!controller.signal.aborted) setError(error.message);
    } finally {
      if (!controller.signal.aborted) setBusy(false);
    }
  };
  const retry = () => {
    const last = messages.at(-1);
    if (last?.role !== "user") return;
    setMessages(messages.slice(0, -1));
    // Submit against the existing context without duplicating the failed turn.
    setDraft(last.content);
    setError("");
    input.current?.focus();
  };
  if (!open) return <button className="button tutor-open" onClick={() => setOpen(true)}><MessageCircle size={17} />Ask about this topic</button>;
  return <section className={`topic-tutor ${inline ? "inline-tutor" : ""}`} aria-label={`Topic tutor: ${title}`}>
    <div className="tutor-heading"><div><MessageCircle size={20} /><div><h2>{questionId ? "Understand this solution" : "Ask about this topic"}</h2><p>{title}</p></div></div>
      <button className="icon-button" aria-label="Close topic tutor" onClick={() => { request.current?.abort(); setBusy(false); setOpen(false); }}><X size={18} /></button></div>
    <div className="tutor-messages" aria-live="polite" aria-busy={busy}>
      {!messages.length && <div className="tutor-welcome"><p>{questionId ? "Ask for a different derivation, a hint about your mistake, or a simpler example." : "Work through a difficult step, test an idea, or ask for another example from this lesson."}</p>
        <div className="tutor-prompts">{(questionId ? ["Explain the solution step by step", "What mistake might lead to my answer?"] : ["Explain the main idea with an example", "Give me a GATE-level practice problem"]).map((text) => <button className="button" key={text} onClick={() => send(text)}>{text}</button>)}</div></div>}
      {messages.map((message, index) => <div key={index} className={`tutor-message ${message.role}`}><span>{message.role === "user" ? "You" : "Gemini tutor"}</span><RichText>{message.content}</RichText></div>)}
      {busy && <p className="tutor-thinking" role="status"><LoaderCircle size={16} className="spin" />Working through your question…</p>}
      {error && <div className="notice error" role="alert"><p>{error}</p><button className="text-button" onClick={retry}><RotateCcw size={15} />Edit and retry</button></div>}
      <div ref={end} />
    </div>
    <form className="tutor-composer" onSubmit={(event) => { event.preventDefault(); send(draft); }}><label className="visually-hidden" htmlFor={`tutor-${questionId || lessonId}`}>Your question about {title}</label><textarea ref={input} id={`tutor-${questionId || lessonId}`} value={draft} maxLength={3000} rows={2} placeholder="Ask a question about this topic…" onChange={(event) => setDraft(event.target.value)} disabled={busy} /><button className="button button-dark" type="submit" aria-label="Send question" disabled={busy || !draft.trim()}><ArrowUp size={19} /></button></form>
    <p className="tutor-disclosure">Questions are sent to Google Gemini. AI explanations can be mistaken; compare with the worked solution and official key.</p>
  </section>;
}
