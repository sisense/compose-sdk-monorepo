/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { render, type VNode } from 'preact';
import type { Subscription } from 'rxjs';
import { isObservable, isPromise } from './utils';
import { ContextConnector } from './context-connector';

type ContextData = any;
type ComponentBuilder = () => VNode;
type Context = {
  isReady: boolean;
  data?: ContextData;
  error?: Error;
};

/** @internal */
export class ComponentAdapter {
  private rootElement: HTMLElement;

  private contexts: Context[] = [];

  private subscriptions: Subscription[] = [];

  constructor(
    private componentBuilder: ComponentBuilder,
    private contextConnectors: ContextConnector<ContextData>[] = [],
  ) {
    this.prepareContexts();
  }

  private prepareContexts() {
    this.contextConnectors.forEach(({ prepareContext }, index) => {
      const contextStore: Context = {
        isReady: false,
        data: null,
      };
      this.contexts[index] = contextStore;
      const context = prepareContext();

      if (isObservable(context)) {
        const unsubscribe = context.subscribe({
          next: (data: ContextData) => {
            contextStore.data = data;
            contextStore.isReady = true;

            if (this.rootElement) {
              this.renderComponentWithContext(this.rootElement);
            }
          },
          error: (error: Error) => {
            contextStore.error = error;
            contextStore.isReady = true;

            if (this.rootElement) {
              this.renderComponentWithContext(this.rootElement);
            }
          },
        });
        this.subscriptions.push(unsubscribe);
      } else if (isPromise(context)) {
        context
          .then((data: ContextData) => {
            contextStore.data = data;
            contextStore.isReady = true;

            if (this.rootElement) {
              this.renderComponentWithContext(this.rootElement);
            }
          })
          .catch((error: Error) => {
            contextStore.error = error;
            contextStore.isReady = true;

            if (this.rootElement) {
              this.renderComponentWithContext(this.rootElement);
            }
          });
      } else {
        contextStore.data = context;
        contextStore.isReady = true;
      }
    });
  }

  private renderComponentWithContext(rootElement: HTMLElement) {
    const isContextsReady = this.contexts.every(({ isReady }) => isReady);

    if (!isContextsReady || !rootElement) {
      return;
    }

    const componentElement = this.componentBuilder();
    const componentWithContextElement = this.contextConnectors.reduceRight(
      (children, { renderContextProvider }, index) => {
        return renderContextProvider(
          this.contexts[index].data,
          children,
          this.contexts[index].error,
        );
      },
      componentElement,
    );

    render(componentWithContextElement, rootElement);
  }

  render(rootElement: HTMLElement) {
    // saves target root element for later postponed render
    this.rootElement = rootElement;
    this.renderComponentWithContext(rootElement);
  }

  destroy() {
    // cleans all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    // destroys rendered element
    render(null, this.rootElement);
  }
}
