import isFunction from 'lodash-es/isFunction';
import flow from 'lodash-es/flow';
import over from 'lodash-es/over';

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
