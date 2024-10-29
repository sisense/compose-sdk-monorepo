import { DeclarationReflection } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';

/** CSDK START */

function getShortDescriptionText(reflection: DeclarationReflection): string | undefined {
  const tag = 'shortDescription';

  const shortDescriptionTag =
    reflection.comment?.blockTags.find((blockTag) => blockTag.tag === `@${tag}`) ||
    reflection.signatures?.[0].comment?.blockTags.find((blockTag) => blockTag.tag === `@${tag}`);

  if (shortDescriptionTag) {
    const textPart = shortDescriptionTag.content.find((part) => part.kind === 'text');
    return textPart?.text;
  }

  return undefined;
}

/**
 * Generate quick summary
 *
 * @category Partials
 */
export function memberShortDescription(
  context: MarkdownThemeRenderContext,
  reflection: DeclarationReflection,
): string {
  const md: string[] = [];

  const shortDescription = getShortDescriptionText(reflection);

  if (shortDescription) {
    md.push(` - ${shortDescription}`);
  }

  return md.join('');
}

/** CSDK END */
