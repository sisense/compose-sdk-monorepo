import flow from 'lodash-es/flow';
import isFunction from 'lodash-es/isFunction';
import over from 'lodash-es/over';

type AnyFunction = (...args: any[]) => any;

export function combineHandlers<Handler extends AnyFunction>(
  handlers: (Handler | undefined)[],
  chainHandlers = false,
): Handler {
  const validHandlers = handlers.filter((handler): handler is Handler => isFunction(handler));

  if (chainHandlers) {
    return flow(validHandlers) as Handler;
  }

  return over(validHandlers) as Handler;
}
