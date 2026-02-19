import flow from 'lodash-es/flow';
import isFunction from 'lodash-es/isFunction';
import over from 'lodash-es/over';

import { RenderTitleHandler, RenderToolbarHandler, TextWidgetRenderToolbarHandler } from '@/types';

type AnyFunction = (...args: any[]) => any;

export function combineHandlers<Handler extends AnyFunction>(
  handlers: (Handler | undefined)[],
  chainHandlers = false,
): Handler {
  const validHandlers = handlers.filter((handler) => isFunction(handler)) as Handler[];

  if (chainHandlers) {
    return flow(validHandlers) as Handler;
  }

  return over(validHandlers) as Handler;
}

/**
 * Compose multiple RenderToolbarHandler functions into one.
 * Each handler gets a chance to modify the toolbar.
 * If it returns `null`, the previous toolbar is passed to the next handler.
 */
export function composeToolbarHandlers(
  ...handlers: (RenderToolbarHandler | undefined)[]
): RenderToolbarHandler {
  return (onRefresh, defaultToolbar) => {
    return handlers.reduce((currentToolbar, handler) => {
      if (!handler) return currentToolbar;
      return handler(onRefresh, currentToolbar) ?? currentToolbar;
    }, defaultToolbar);
  };
}

/**
 * Compose multiple TextWidgetRenderToolbarHandler functions into one.
 * Each handler gets a chance to modify the toolbar.
 * If it returns `null`, the previous toolbar is passed to the next handler.
 */
export function composeTextWidgetToolbarHandlers(
  ...handlers: (TextWidgetRenderToolbarHandler | undefined)[]
): TextWidgetRenderToolbarHandler {
  return (defaultToolbar) => {
    return handlers.reduce((currentToolbar, handler) => {
      if (!handler) return currentToolbar;
      return handler(currentToolbar) ?? currentToolbar;
    }, defaultToolbar);
  };
}

/**
 * Compose multiple RenderTitleHandler functions into one.
 * Each handler gets a chance to modify the title.
 * If it returns `null`, the previous tile is passed to the next handler.
 */
export function composeTitleHandlers(
  ...handlers: (RenderTitleHandler | undefined)[]
): RenderTitleHandler {
  return (defaultTitle) => {
    return handlers.reduce((currentTitle, handler) => {
      if (!handler) return currentTitle;
      const result = handler(currentTitle);
      return result !== null ? result : currentTitle;
    }, defaultTitle);
  };
}
