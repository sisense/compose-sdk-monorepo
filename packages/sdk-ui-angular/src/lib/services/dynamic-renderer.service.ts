import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Injector,
  Type,
} from '@angular/core';
import { ComponentAdapter } from '@sisense/sdk-ui-preact';

import {
  createSisenseContextConnector,
  createThemeContextConnector,
} from '../component-wrapper-helpers';
import { getPreactComponent, type PreactComponent } from './preact-backed-component';
import { SisenseContextService } from './sisense-context.service';
import { ThemeService } from './theme.service';

/**
 * Result of rendering a dynamic component
 */
export interface RenderedComponent<Props> {
  /** The DOM element containing the rendered component */
  element: HTMLElement;
  /** Function to properly destroy the component and clean up resources */
  destroy: () => void;
  /** Applies new props to the rendered component */
  update: (props: Props) => void;
  /**
   * Reference to the Angular component instance.
   *
   * Absent for a Preact-backed Angular wrapper, which has no Angular instance — use
   * {@link update} to apply props in that case.
   */
  componentRef?: ComponentRef<any>;
}

/**
 * Service for rendering components dynamically.
 *
 * Renders regular Angular component classes, and the opaque handles produced by
 * `wrapInAngularComponent` — which stand for a Preact component and cannot be instantiated by
 * Angular itself.
 *
 * @internal
 */
@Injectable({ providedIn: 'root' })
export class DynamicRenderer {
  constructor(
    private appRef: ApplicationRef,
    private injector: Injector,
    private envInjector: EnvironmentInjector,
    private sisenseContextService: SisenseContextService,
    private themeService: ThemeService,
  ) {}

  renderComponent<Props>(component: Type<Props>, props: Props): RenderedComponent<Props> {
    const preactComponent = getPreactComponent(component);
    if (preactComponent) {
      return this.renderPreactBackedComponent(preactComponent, props);
    }

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
      update: (newProps: unknown) => {
        Object.assign(componentRef.instance as any, newProps);
        componentRef.changeDetectorRef.detectChanges();
      },
    };
  }

  /**
   * Renders the Preact component behind a Preact-backed Angular wrapper, into an element this
   * service owns.
   *
   * The Sisense and theme contexts are connected the same way the hand-written Angular wrapper
   * components connect them, so the rendered component behaves as it does inside a dashboard.
   */
  private renderPreactBackedComponent<Props>(
    preactComponent: PreactComponent<Props>,
    props: Props,
  ): RenderedComponent<Props> {
    const element = document.createElement('div');
    element.style.width = '100%';
    element.style.height = '100%';

    const componentAdapter = new ComponentAdapter(
      // the adapter renders any Preact function component; props are forwarded as they are
      preactComponent,
      [
        createSisenseContextConnector(this.sisenseContextService),
        createThemeContextConnector(this.themeService),
      ],
    );
    componentAdapter.render(element, props);

    return {
      element,
      destroy: () => componentAdapter.destroy(),
      update: (newProps: Props) => componentAdapter.render(element, newProps),
    };
  }
}
