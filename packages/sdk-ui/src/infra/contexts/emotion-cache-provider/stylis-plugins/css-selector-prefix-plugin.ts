import type { Element, Middleware } from 'stylis';
import { KEYFRAMES } from 'stylis';

/**
 * Creates a Stylis plugin that prepends a CSS selector prefix to every rule.
 *
 * Given configured prefix, for example "#sdk-root", a compiled rule like ".css-abc { color: red }"
 * becomes "#sdk-root .css-abc { color: red }", increasing its specificity so
 * that library styles win over same-specificity rules from the host application.
 *
 * Operating at the Stylis (CSS compilation) layer means all CSS is covered —
 * template strings, interpolation functions, object styles, and keyframe
 * declarations — without any changes to the styled-component call sites.
 *
 * @param prefix - An ancestor CSS selector, e.g. `'#sdk-scope'` or `'.my-app'`.
 *   Must match an element that wraps all library components in the DOM.
 * @returns A Stylis v4 middleware function compatible with `@emotion/cache`'s
 *   `stylisPlugins` option.
 */
export function createCssSelectorPrefixPlugin(prefix: string): Middleware {
  return (element: Element) => {
    if (element.type === 'rule' && element.root?.type !== KEYFRAMES) {
      element.props = (element.props as string[]).map((selector) => `${prefix} ${selector}`);
    }
  };
}
