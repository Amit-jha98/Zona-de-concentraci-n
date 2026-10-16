export function officialAnswer(type, key) {
  key = String(key).replace(/-\s+(?=\d)/g, "-");
  if (/MTA/i.test(key)) return { kind: "all" };
  if (type === "NAT") {
    const ranges = [...key.matchAll(/(-?\d+(?:\.\d+)?)\s+to\s+(-?\d+(?:\.\d+)?)/gi)]
      .map((match) => [Number(match[1]), Number(match[2])]);
    if (!ranges.length || ranges.some(([low, high]) => low > high)) throw new Error("Invalid official numerical range");
    return { kind: "number", ranges };
  }
  const alternatives = key.split(/\s+or\s+/i).map((part) => [...new Set((part.match(/[A-D]/g) || []).map((letter) => letter.charCodeAt(0) - 65))].sort());
  if (!alternatives.length || alternatives.some((values) => !values.length || (type === "MCQ" && values.length !== 1))) throw new Error("Invalid official choice key");
  return { kind: "choice", alternatives };
}

export function hasResponse(question, response) {
  if (question.type === "NAT") return response !== null && response !== undefined && String(response).trim() !== "";
  return Array.isArray(response) ? response.length > 0 : Number.isInteger(response);
}

export function gradeQuestion(question, response) {
  const accepted = question.accepted || officialAnswer(question.type, question.officialKey);
  const attempted = hasResponse(question, response);
  if (accepted.kind === "all") return { status: "awarded", correct: true, attempted, marks: question.marks };
  if (!attempted) return { status: "unanswered", correct: false, attempted: false, marks: 0 };
  let correct = false;
  if (accepted.kind === "number") {
    const text = String(response).trim();
    const number = /^[-+]?(?:\d+(?:\.\d*)?|\.\d+)$/.test(text) ? Number(text) : NaN;
    correct = Number.isFinite(number) && accepted.ranges.some(([low, high]) => number >= low - 1e-9 && number <= high + 1e-9);
  } else {
    const raw = Array.isArray(response) ? response : [response];
    const selected = [...new Set(raw)].sort();
    correct = selected.every((value) => Number.isInteger(value) && value >= 0 && value <= 3) && accepted.alternatives.some((answer) => answer.length === selected.length && answer.every((value, index) => value === selected[index]));
  }
  return { status: correct ? "correct" : "incorrect", correct, attempted: true, marks: correct ? question.marks : question.type === "MCQ" ? -question.marks / 3 : 0 };
}

export function answerLabel(question) {
  const accepted = question.accepted || officialAnswer(question.type, question.officialKey);
  if (accepted.kind === "all") return "Marks to all (official key)";
  if (accepted.kind === "number") return accepted.ranges.map(([low, high]) => low === high ? String(low) : `${low} to ${high}`).join(" or ");
  return accepted.alternatives.map((answer) => answer.map((value) => String.fromCharCode(65 + value)).join(", ")).join(" or ");
}

export function scoreExam(questions, answers = {}) {
  const results = questions.map((question) => ({ id: question.id, ...gradeQuestion(question, answers[question.id]) }));
  return {
    results,
    marks: Number(results.reduce((sum, result) => sum + result.marks, 0).toFixed(6)),
    totalMarks: questions.reduce((sum, question) => sum + question.marks, 0),
    attempted: results.filter((result) => result.attempted).length,
    correct: results.filter((result) => result.status === "correct").length,
    incorrect: results.filter((result) => result.status === "incorrect").length,
    unanswered: results.filter((result) => !result.attempted).length,
  };
}
