import { DeclarationReflection } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';

/** CSDK START */

function hasTag(reflection: DeclarationReflection, tag: string): boolean {
  // Functions store modifiers in the signature, so we need to check the first signature
  return (
    reflection?.comment?.modifierTags.has(`@${tag}`) ||
    reflection?.signatures?.[0].comment?.modifierTags.has(`@${tag}`) ||
    false
  );
}

/**
 * Generate badges for the @alpha and @beta tags
 *
 * @category Partials
 */
export function memberBadge(
  context: MarkdownThemeRenderContext,
  reflection: DeclarationReflection,
): string {
  const md: string[] = [];

  if (hasTag(reflection, 'fusionEmbed')) {
    md.push(' <Badge type="fusionEmbed" text="Fusion Embed" />');
  }

  if (hasTag(reflection, 'alpha')) {
    md.push(' <Badge type="alpha" text="Alpha" />');
  }

  if (hasTag(reflection, 'beta')) {
    md.push(' <Badge type="beta" text="Beta" />');
  }

  return md.join('');
}

/** CSDK END */
