import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Injector,
  Type,
} from '@angular/core';

/**
 * Result of rendering a dynamic component
 */
export interface RenderedComponent {
  /** The DOM element containing the rendered component */
  element: HTMLElement;
  /** Function to properly destroy the component and clean up resources */
  destroy: () => void;
  /** Reference to the Angular component instance */
  componentRef: ComponentRef<any>;
}

/**
 * Service for rendering components dynamically.
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class DynamicRenderer {
  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector,
  ) {}

  renderComponent<Props>(component: Type<Props>, props: Props): RenderedComponent {
    const componentRef = createComponent(component, {
      environmentInjector: this.envInjector,
      elementInjector: this.injector,
    });

    // Apply props to the component instance
    Object.assign(componentRef.instance as any, props);

    // Attach the component to the application
    this.appRef.attachView(componentRef.hostView);

    // Get the DOM element
    const domElem = (componentRef.hostView as any).rootNodes[0] as HTMLElement;

    // Create destroy function
    const destroy = () => {
      // Detach from application
      this.appRef.detachView(componentRef.hostView);

      // Destroy the component
      componentRef.destroy();
    };

    return {
      element: domElem,
      componentRef,
      destroy,
    };
  }
}
