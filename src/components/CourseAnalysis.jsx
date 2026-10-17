import { useState } from "react";
import { ArrowRight } from "lucide-react";
import useCourseAnalysis from "../hooks/useCourseAnalysis.js";
import { navigate } from "../hooks/useRoute.js";
const labels = {
  vvi: "VVI · recurring",
  high: "High priority",
  syllabus: "Syllabus coverage",
};
export function TopicEvidence({ value }) {
  if (!value) return null;
  return (
    <section
      className="topic-evidence"
      aria-label="This topic in the supplied papers"
    >
      <span className={"priority-label " + value.priority}>
        {labels[value.priority]}
      </span>
      <p>
        {value.primaryCount} primary questions · {value.primaryMarks} marks
        across the supplied papers · {value.years.length} of 4 years
      </p>
      <details>
        <summary>What this priority means</summary>
        <p>
          Primary questions count once toward marks. {value.secondaryCount}{" "}
          further questions use this as a supporting concept.{" "}
          {value.meanMarks.toFixed(2)} marks/year averages the four annual
          means, including zeros; papers in one year are averaged first.
        </p>
        <p>
          VVI means at least four primary questions across at least three years.
          These are observed 2023–2026 patterns, not a prediction of GATE 2027.
          All syllabus topics remain required.
        </p>
      </details>
    </section>
  );
}
export default function CourseAnalysis() {
  const { value, error, retry } = useCourseAnalysis();
  const [section, setSection] = useState("cs"),
    [priority, setPriority] = useState("all"),
    [all, setAll] = useState(false);
  if (error)
    return (
      <section className="notice">
        <p>{error}</p>
        <button className="button" onClick={retry}>
          Retry PYQ analysis
        </button>
      </section>
    );
  if (!value) return <p role="status">Loading syllabus priorities…</p>;
  const topics = value.topics
    .filter(
      (t) =>
        (section === "all" ||
          (section === "cs" && t.sectionId !== "aptitude") ||
          section === t.sectionId) &&
        (priority === "all" || t.priority === priority),
    )
    .sort(
      (a, b) =>
        b.meanMarks - a.meanMarks ||
        b.years.length - a.years.length ||
        a.title.localeCompare(b.title),
    );
  return (
    <section className="course-analysis" aria-label="PYQ priorities">
      <div className="section-heading small">
        <div>
          <span className="eyebrow">455 QUESTIONS · 7 PAPERS · 4 YEARS</span>
          <h2>Where the past papers put the work</h2>
          <p>
            Use recurring concepts to plan revision, then cover the full
            syllabus.
          </p>
        </div>
      </div>
      <div className="analysis-controls">
        <label>
          Subject
          <select
            aria-label="Subject"
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setAll(false);
            }}
          >
            <option value="cs">All CS subjects</option>
            <option value="all">CS + Aptitude</option>
            {value.sections.map((s) => (
              <option key={s.id} value={s.id}>
                {s.title}
              </option>
            ))}
          </select>
        </label>
        <label>
          Priority
          <select
            aria-label="Priority"
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setAll(false);
            }}
          >
            <option value="all">All priorities</option>
            <option value="vvi">VVI · recurring</option>
            <option value="high">High priority</option>
            <option value="syllabus">Syllabus coverage</option>
          </select>
        </label>
      </div>
      <div className="analysis-table-scroll">
        <table className="analysis-table">
          <caption>Primary-topic evidence from your supplied papers</caption>
          <thead>
            <tr>
              <th scope="col">Topic</th>
              <th scope="col">Questions</th>
              <th scope="col">Years</th>
              <th scope="col">Mean marks/year</th>
              <th scope="col">Study</th>
            </tr>
          </thead>
          <tbody>
            {topics.slice(0, all ? topics.length : 8).map((t) => (
              <tr key={t.id}>
                <th scope="row">
                  <span>{t.title}</span>
                  <small>
                    {t.sectionTitle} · {labels[t.priority]}
                  </small>
                </th>
                <td>{t.primaryCount}</td>
                <td>{t.years.length}/4</td>
                <td>{t.meanMarks.toFixed(2)}</td>
                <td>
                  <button
                    className="text-button"
                    onClick={() => navigate("/lesson/" + t.id)}
                    aria-label={"Study " + t.title}
                  >
                    <ArrowRight size={17} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {!topics.length && (
        <p className="notice">
          No topics match. Choose another priority or subject.
        </p>
      )}
      {topics.length > 8 && (
        <button
          className="button analysis-show"
          onClick={() => setAll((v) => !v)}
        >
          {all ? "Show fewer topics" : "Show all " + topics.length + " topics"}
        </button>
      )}
      <details className="analysis-method">
        <summary>How priorities and marks are calculated</summary>
        <p>{value.methodology}</p>
        <p>
          MCQ: a wrong attempted response loses one-third of the marks. MSQ:
          select the exact set, with no partial credit or negative marks. NAT:
          use the accepted numerical interval, with no negative marks.
        </p>
      </details>
    </section>
  );
}
