import { type App, createApp } from 'vue';
import type { Component, DefineComponent } from 'vue';

type AnyObject = Record<string, any>;

/**
 * Result of rendering a dynamic component
 */
export interface RenderedComponent {
  /** The DOM element containing the rendered component */
  element: HTMLElement;
  /** Function to properly destroy the component and clean up resources */
  destroy: () => void;
  /** Reference to the Vue app instance */
  app: App<Element>;
}

export function renderComponent<Props extends AnyObject>(
  Component: Component<Props> | DefineComponent<Props>,
  props: Props,
): RenderedComponent {
  const container = document.createElement('div');
  container.style.width = '100%';
  container.style.height = '100%';

  // Create a new Vue app and mount it to the child element
  const app = createApp(Component, props);
  app.mount(container);

  // Create destroy function
  const destroy = () => {
    // Remove the container from the DOM
    container.remove();
    // Unmount the Vue app
    app.unmount();
  };

  return {
    element: container,
    app,
    destroy,
  };
}
