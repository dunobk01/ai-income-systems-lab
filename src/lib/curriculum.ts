/**
 * Canonical curriculum counts.
 *
 * Single source of truth for every marketing / app surface that mentions how
 * big the course is. These mirror the `modules` and `lessons` tables — when
 * content is added, update here once and every page follows.
 */
export const CURRICULUM = {
  modules: 15,
  lessons: 89,
} as const;

/** "15 modules · 89 lessons" */
export const CURRICULUM_LABEL = `${CURRICULUM.modules} modules · ${CURRICULUM.lessons} lessons`;

/** "15 modules, 89 lessons" — for prose/SEO copy. */
export const CURRICULUM_SENTENCE = `${CURRICULUM.modules} modules, ${CURRICULUM.lessons} lessons`;
