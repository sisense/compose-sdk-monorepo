import { type FunctionComponent, type VNode } from 'preact';
import type { Observable } from 'rxjs';
import { createElement } from '../render';

export type ContextConnector<T> = {
  prepareContext: () => T | Promise<T> | Observable<T>;
  renderContextProvider: (contextData: T, children: VNode, error?: Error) => VNode;
};

type AbstractContextProviderProps = { context?: any; error?: Error };

export function createContextProviderRenderer<T extends AbstractContextProviderProps>(
  provider: FunctionComponent<T>,
) {
  return (contextData: T['context'], children: VNode, error?: Error) => {
    return createElement(provider, { context: contextData, error } as T, children);
  };
}
