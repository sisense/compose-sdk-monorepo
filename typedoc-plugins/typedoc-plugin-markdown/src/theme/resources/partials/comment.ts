import { Comment } from 'typedoc';
import { MarkdownThemeRenderContext } from '../..';
import { bold, heading } from '../../../support/elements';
import {
  camelToTitleCase,
  convertHtmlToJsxInCommentContent,
  encodeAngleBracketsOutsideCodeBlocks,
  escapeAngleBrackets,
} from '../../../support/utils';

/**
 * @category Partials
 */
export function comment(
  context: MarkdownThemeRenderContext,
  comment: Comment,
  headingLevel?: number,
  showSummary = true,
  showTags = true,
): string {
  const md: string[] = [];

  if (showSummary && comment.summary?.length > 0) {
    md.push(context.commentParts(comment.summary));
  }

  if (showTags && comment.blockTags?.length) {
    const tags = comment.blockTags
      .filter((tag) => tag.tag !== '@returns' && tag.tag !== '@shortDescription')
      .map((tag) => {
        const tagName = tag.tag.substring(1);
        const tagText = camelToTitleCase(tagName);

        /** CSDK START */
        if (tagName === 'deprecated') {
          const tagDeprecated = ['::: warning Deprecated'];
          tagDeprecated.push(context.commentParts(tag.content));
          tagDeprecated.push(':::');
          return tagDeprecated.join('\n');
        }
        /** CSDK END */

        const tagMd = [headingLevel ? heading(headingLevel, tagText) : bold(tagText)];
        tagMd.push(context.commentParts(tag.content));
        return tagMd.join('\n\n');
      });
    md.push(tags.join('\n\n'));
  }

  const commentStr = md.join('\n\n');
  const convertToJsx = context.options.getValue('convertHtmlToJsxInComments') as boolean;
  const escapeAll = context.options.getValue('escapeHtmlInComments') as boolean;
  if (convertToJsx) {
    const imgMarkdownSyntax = context.options.getValue('imgMarkdownSyntax') as boolean;
    const { text, jsxBlocks } = convertHtmlToJsxInCommentContent(commentStr, { imgMarkdownSyntax });
    let output = encodeAngleBracketsOutsideCodeBlocks(text);
    jsxBlocks.forEach((jsx, i) => {
      const placeholder = `\u0001JSX_${i}_\u0001`;
      output = output.replace(placeholder, () => jsx);
    });
    // Rewrite guide links for Docusaurus: /guides/sdk/ -> /docs/compose-sdk/
    output = output.replace(/guides\/sdk/g, 'docs/compose-sdk');
    // Use .md extension in links for Docusaurus
    output = output.replace(/\.html/g, '.md');
    return output;
  }
  if (escapeAll) {
    return encodeAngleBracketsOutsideCodeBlocks(commentStr);
  }
  return escapeAngleBrackets(commentStr);
}
