/**
 * Exposes the {@link load} function that is called by TypeDoc to bootstrap the plugin.
 * @module
 */
import { Application } from 'typedoc';
import * as options from './options/config';
import { generateDocs, render } from './renderer';

// This is the main plugin function
export function load(app: Application) {
  /**
   * add options
   */
  Object.values(options).forEach((option) => {
    app.options.addDeclaration({
      ...option,
      help: `[typedoc-plugin-diff-packages] ${option.help}`,
    });
  });

  /**
   * Apply custom renderer methods (there should probably be a better solution to this)
   * See {@link plugin/renderer}.
   */
  Object.defineProperty(app, 'generateDocs', { value: generateDocs });

  Object.defineProperty(app.renderer, 'render', {
    value: render,
  });
}
