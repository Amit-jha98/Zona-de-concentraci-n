export const mcq = (prompt, options, answer, solution) => ({ type: "MCQ", marks: 1, prompt, options, answer: [answer], solution });
export const msq = (prompt, options, answer, solution) => ({ type: "MSQ", marks: 2, prompt, options, answer, solution });
export const nat = (prompt, answer, solution, tolerance = 0) => ({ type: "NAT", marks: 2, prompt, options: [], answer, tolerance, solution });
export const depth = (theory, steps, videoFocus, ...questions) => ({ theory, steps: steps.split("|"), videoFocus, questions });
