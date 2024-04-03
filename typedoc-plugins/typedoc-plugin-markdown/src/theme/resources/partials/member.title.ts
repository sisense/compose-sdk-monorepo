import { DeclarationReflection } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { backTicks } from '../../../support/elements';
import { escapeChars } from '../../../support/utils';

/**
 * @category Partials
 */
export function memberTitle(
  context: MarkdownThemeRenderContext,
  reflection: DeclarationReflection,
  typeParams = false,
): string {
  const md: string[] = [];

  md.push(`${escapeChars(reflection.name)}`);

  /** CSDK START */
  md.push(context.memberBadge(reflection));
  /** CSDK END */

  if (typeParams && reflection.typeParameters) {
    const typeParameters = reflection.typeParameters
      .map((typeParameter) => typeParameter.name)
      .join(', ');
    md.push(`${backTicks(`<${typeParameters}>`)}`);
  }

  return md.join('');
}
