import { lesson as L, section as S } from "./schema.js";

export default S("aptitude", "GA", "General Aptitude", [
  { title: "Aptitude supplement for full GATE papers", lessons: [
    L("ga-verbal", "Verbal ability, grammar and comprehension", [
      "Choose an answer using the relation actually tested: vocabulary questions may ask for a synonym, antonym, intensity ordering or analogy. Identify that relation before comparing the options. An antonym of the protagonist, the leading character, is antagonist; an analogy needs the same relation on both sides, not merely a related word.",
      "Articles depend on the first spoken sound, not the first written letter: a university begins with a consonant sound, while an hour begins with a vowel sound. For sentence completion, check grammatical agreement, idiomatic prepositions, tense and the meaning of the whole sentence. Read the completed sentence once before submitting.",
      "In comprehension and inference questions, use only what the passage entails. Words such as some, all, only, always, at least and not necessarily change the logic. Distinguish a stated fact from a plausible real-world assumption. In sentence ordering, resolve pronouns and references, find the opening context, and connect events in a consistent chronology.",
    ], "An inference must follow from the passage; plausibility alone is insufficient.", [
      "A passage states that some models use probability to estimate averages.",
      "It supports the existential claim that at least one model does so.",
      "It does not support the universal claim that all modelling must use probability.",
    ], "Do not turn some into all, or mistake an unstated claim for a claim that has been disproved.", "Which phrase uses the correct article?", ["an university", "a hour", "an honest person", "a umbrella"], 2, "Honest starts with a vowel sound because the h is silent, so an honest person is correct. University begins with a consonant sound; hour and umbrella begin with vowel sounds."),
    L("ga-quantitative", "Quantitative aptitude and data interpretation", [
      "Translate percentages and ratios into a common base before calculating. In a ratio of coin counts, the money ratio must also include the denomination. For successive percentage changes, multiply the factors instead of adding percentages. Keep units throughout calculations and round only the final result to the precision requested.",
      "For averages, medians, tables and charts, distinguish the quantity being weighted. A percentage of energy is not the same as a percentage of mass: convert each energy share to mass using its energy density. To find a median, first sort the observations; with an even count, average the two middle observations.",
      "Use algebra to reduce ratios, logarithms and piecewise expressions before substituting. In geometry, state the dimensions that remain fixed under folding or rolling; a cylinder made by joining long edges has a circumference determined by the short side. For work, speed and distance, choose a single unit system, write the governing relationship, and check whether the result has the expected order of magnitude.",
    ], "Percentage = part / whole × 100; weighted mean = Σ(wᵢxᵢ) / Σwᵢ.", [
      "A diet supplies 2,000 kcal, with 45% from fat.",
      "Energy supplied by fat is 0.45 × 2,000 = 900 kcal.",
      "At 9 kcal per gram, the mass of fat is 900/9 = 100 g.",
    ], "Applying a percentage to the wrong base can produce an apparently reasonable but incorrect answer.", "A price rises by 20% and then falls by 20%. What is its net change?", ["No change", "4% decrease", "4% increase", "8% decrease"], 1, "Let the original price be 100. After the increase it is 120. The decrease is 20% of 120, which is 24, leaving 96. Hence the net change is a decrease of 4%."),
    L("ga-reasoning", "Analytical and logical reasoning", [
      "Turn verbal constraints into symbols, inequalities, tables or cases. If P implies Q, its contrapositive not-Q implies not-P is valid, but the converse Q implies P need not hold. For a not necessarily true question, one counterexample satisfying every given condition is sufficient to reject the proposed conclusion.",
      "For tournament and elimination problems, count how many eliminations must occur. A knockout competition with one winner and no ties eliminates exactly n−1 contestants, so exactly n−1 games are necessary regardless of the bracket shape. In seating, ranking and allocation questions, record every constraint and test the resulting arrangement against all of them.",
      "For recurrences, work backwards when later terms are known. For sequences, do not assume a familiar rule unless the question states it. In maximum/minimum problems, first derive a bound from the compulsory allocations, then construct a valid example achieving that bound. A numeric result without a feasible construction is not a proof of attainability.",
    ], "P ⇒ Q is equivalent to ¬Q ⇒ ¬P; a knockout tournament needs n−1 eliminations.", [
      "A student may take at most 70 credits, with 15 core, 20 project and at least 10 specialization credits.",
      "To maximize elective credits, choose the minimum permitted specialization load.",
      "The remaining budget is 70 − 15 − 20 − 10 = 25 elective credits, and this allocation meets the constraints.",
    ], "A necessary condition is not sufficient; reversing an implication is a frequent distractor.", "If every student who passes has submitted the project, what must be true?", ["Every project submitter passes", "A student who did not submit cannot pass", "Every student submits", "No student fails"], 1, "Let P mean passes and S mean submits. The premise is P implies S. Its contrapositive is not S implies not P. The converse and the other universal claims do not follow from the premise."),
    L("ga-spatial", "Spatial and visual reasoning", [
      "Track orientation using a labelled feature or coordinate system rather than mental resemblance. A rotation preserves handedness, while a reflection reverses it. For sequences of transformations, apply them in the specified order; rotation followed by reflection is generally different from reflection followed by rotation.",
      "For tiling questions, compare area first, then use a checkerboard colouring or another invariant to prove impossibility. Matching area is necessary but not sufficient. When rotations and reflections of a tile are permitted, include every allowed orientation; when they are forbidden, do not silently use them in a construction.",
      "For front and top views, preserve the correspondence between rows, columns and heights. For folding, distinguish an outline reflected across the fold from an outline merely translated. To complete a symmetry figure, reflect each occupied cell or marked feature across the stated axis and count only the missing counterparts, avoiding double-counting features already on the axis.",
    ], "Reflection reverses orientation; rotation preserves orientation and pairwise distances.", [
      "Mark an asymmetric L-shaped object and a point on its short arm.",
      "Rotate both the object and marked point by 90 degrees about the given centre.",
      "Reflect the rotated figure across the specified axis; the final marked point distinguishes mirror-image answer options.",
    ], "A sketch can look similar while having the wrong handedness. Use a labelled feature to check it.", "Which property is preserved by a rigid rotation in the plane?", ["Every point keeps its original coordinates", "All pairwise distances", "Every line retains its slope", "Every point stays on the same side of the y-axis"], 1, "A rotation is an isometry, so it preserves distances between every pair of points. Coordinates, slopes and the side of a fixed coordinate axis can all change under a rotation."),
  ] },
], { label: "Official GATE papers and answer keys", url: "https://gate2027.iitm.ac.in/download" });
