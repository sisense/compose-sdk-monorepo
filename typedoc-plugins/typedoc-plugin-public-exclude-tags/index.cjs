// @ts-check
/**
 * TypeDoc plugin for public-doc exclusion based on tags (when `excludeInternal` is `true`):
 *
 * Removes declarations with the following tags from public API docs:
 * - @sisenseInternal
 * - @alpha
 */

const { Converter } = require('typedoc');

const TAGS_TO_EXCLUDE = [
  '@sisenseInternal',
  '@alpha',
];

/**
 * @param {import("typedoc").Reflection} reflection
 * @param {string} tag
 * @returns {boolean}
 */
function hasModifier(reflection, tag) {
  const comment = reflection.comment;
  if (comment?.modifierTags?.has(tag)) {
    return true;
  }
  if (reflection.signatures?.length) {
    const firstSig = reflection.signatures[0];
    if (firstSig?.comment?.modifierTags?.has(tag)) {
      return true;
    }
  }
  return false;
}

/**
 * @param {{ application: import("typedoc").Application }} params
 */
exports.load = function ({ application }) {
  const converter = application.converter;

  converter.on(
    Converter.EVENT_RESOLVE_BEGIN,
    /**
     * @param {import("typedoc").Context} context
     */
    (context) => {
      if (!application.options.getValue('excludeInternal')) {
        return;
      }
      const project = context.project;
      if (!project?.reflections) {
        return;
      }

      const toRemove = [];
      for (const reflection of Object.values(project.reflections)) {
        if (TAGS_TO_EXCLUDE.some((tag) => hasModifier(reflection, tag))) {
          toRemove.push(reflection);
        }
      }

      for (const reflection of toRemove) {
        project.removeReflection(reflection);
      }
    },
    100
  );
};
