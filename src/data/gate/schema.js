import { VIDEO_QUERIES } from "./videoQueries.js";
export function lesson(
  id,
  title,
  notes,
  formula,
  example,
  pitfall,
  question,
  options,
  answer,
  explanation,
) {
  return {
    id,
    title,
    notes,
    formula,
    example,
    pitfall,
    quiz: [{ id: `${id}-q1`, question, options, answer, explanation }],
    estimatedMinutes: 25,
  };
}
export function section(id, number, title, groups, reference) {
  return {
    id,
    number,
    title,
    groups,
    reference,
    lessons: groups.flatMap((group) =>
      group.lessons.map((item) => ({
        ...item,
        group: group.title,
        sectionId: id,
        sectionTitle: title,
        videoQuery:
          VIDEO_QUERIES[item.id] ||
          `${item.title} ${title} GATE CS concept lecture`,
      })),
    ),
  };
}
