import { ConditionalType } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { italic } from '../../../support/elements';

/**
 * @category Partials
 */
export function conditionalType(
  context: MarkdownThemeRenderContext,
  conditionalType: ConditionalType,
): string {
  const md: string[] = [];
  if (conditionalType.checkType) {
    md.push(context.someType(conditionalType.checkType));
  }
  md.push(italic('extends'));
  if (conditionalType.extendsType) {
    md.push(context.someType(conditionalType.extendsType));
  }
  md.push('?');
  if (conditionalType.trueType) {
    md.push(context.someType(conditionalType.trueType));
  }
  md.push(':');
  if (conditionalType.falseType) {
    md.push(context.someType(conditionalType.falseType));
  }
  return md.join(' ');
}
