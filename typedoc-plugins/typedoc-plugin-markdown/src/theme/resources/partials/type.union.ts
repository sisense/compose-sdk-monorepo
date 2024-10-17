import { UnionType } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';

/**
 * @category Partials
 */
export function unionType(context: MarkdownThemeRenderContext, unionType: UnionType): string {
  return (
    unionType.types
      /** CSDK START */
      // workaround for https://github.com/TypeStrong/typedoc/issues/2751
      .sort((a, b) => (a.toString() < b.toString() ? -1 : 1))
      /** CSDK END */
      .map((unionType) => context.someType(unionType))
      .join(` \\| `)
  );
}
