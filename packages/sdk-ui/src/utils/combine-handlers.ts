import isFunction from 'lodash/isFunction';
import flow from 'lodash/flow';
import over from 'lodash/over';

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
