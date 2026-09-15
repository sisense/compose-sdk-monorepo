import { type MarkdownToJSX, RuleType } from 'markdown-to-jsx';

/** The only rules that render as markup; everything else collapses to its text. */
const EMPHASIS_RULES: ReadonlySet<string> = new Set([
  RuleType.text,
  RuleType.textEscaped,
  RuleType.textBolded,
  RuleType.textEmphasized,
  RuleType.breakLine,
]);

/**
 * Markdown options for narrative text: emphasis only. The text originates from a language model and
 * the contract allows `**bold**` alone, so raw HTML stays inert, links and strikethrough collapse to
 * their words, inline code to its text, and images render nothing.
 * @internal
 */
export const NARRATIVE_MARKDOWN_OPTIONS: MarkdownToJSX.Options = {
  disableParsingRawHTML: true,
  forceInline: true,
  renderRule(next, node, renderChildren, state) {
    if (EMPHASIS_RULES.has(node.type)) {
      return next();
    }
    if ('children' in node && node.children) {
      return renderChildren(node.children, state);
    }
    if ('text' in node) {
      return node.text;
    }
    return null;
  },
};
