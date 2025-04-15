/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { createElement, render } from 'preact';

import { ContextConnector } from './context-connector';
import type { AnyComponentFunction, Context, ContextData } from './types';
import { Subscription } from './utils';

/** @internal */
export class ComponentAdapter<Component extends AnyComponentFunction> {
  private rootElement: HTMLElement;

  private contexts: Context[] = [];

  private subscriptions: Subscription[] = [];

  private props: Parameters<Component>[0];

  constructor(
    private component: Component,
    private contextConnectors: ContextConnector<ContextData>[] = [],
  ) {
    this.prepareContexts();
  }

  private prepareContexts() {
    this.contextConnectors.forEach(({ propsObserver }, index) => {
      const contextStore: Context = {
        isReady: false,
        data: null,
      };
      this.contexts[index] = contextStore;

      const subscription = propsObserver.subscribe((data: ContextData) => {
        contextStore.data = data;
        contextStore.isReady = true;

        if (this.rootElement) {
          this.renderComponentWithContext(this.rootElement, this.props);
        }
      });
      this.subscriptions.push(subscription);
    });
  }

  private renderComponentWithContext(rootElement: HTMLElement, props: Parameters<Component>[0]) {
    const isContextsReady = this.contexts.every(({ isReady }) => isReady);

    if (!isContextsReady || !rootElement) {
      return;
    }

    const componentElement = createElement(this.component, props, props?.children);
    const componentWithContextElement = this.contextConnectors.reduceRight(
      (children, { providerComponent }, index) => {
        return createElement(providerComponent, this.contexts[index].data, children);
      },
      componentElement,
    );

    render(componentWithContextElement, rootElement);
  }

  render(rootElement: HTMLElement, props: Parameters<Component>[0]) {
    // saves target root element for later postponed render
    this.rootElement = rootElement;
    this.props = props;
    this.renderComponentWithContext(rootElement, props);
  }

  destroy() {
    // cleans all subscriptions
    this.subscriptions.forEach((sub) => sub.unsubscribe());
    this.subscriptions.length = 0;
    this.contexts.length = 0;
    if (this.rootElement) {
      // destroys rendered element
      render(null, this.rootElement);
    }
  }
}
