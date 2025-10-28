import { Injectable, Type } from '@angular/core';
import {
  createWrapperElement,
  type CustomWidgetComponent as CustomWidgetComponentPreact,
  type CustomWidgetComponentProps,
  type GenericDataOptions,
} from '@sisense/sdk-ui-preact';
import { TabberButtonsWidget } from '@sisense/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';

import { DynamicRenderer } from './dynamic-renderer.service';

/** Re-export related types */
export type { CustomWidgetComponentProps, GenericDataOptions };

/**
 * Type representing an Angular component class that can be used as a user-defined custom widget.
 */
export type CustomWidgetComponent<
  Props extends CustomWidgetComponentProps = CustomWidgetComponentProps,
> = Type<Props>;

/**
 * Service for working with custom widgets.
 *
 * @group Dashboards
 */
@Injectable({
  providedIn: 'root',
})
export class CustomWidgetsService {
  /** @internal */
  customWidgetsMap$: BehaviorSubject<Map<string, CustomWidgetComponentPreact<any>>>;

  constructor(
    /** @internal */
    private dynamicRenderer: DynamicRenderer,
  ) {
    this.customWidgetsMap$ = new BehaviorSubject(
      new Map<string, CustomWidgetComponentPreact<any>>([['tabber-buttons', TabberButtonsWidget]]),
    );
  }

  /**
   * Registers a new custom widget.
   *
   * @param customWidgetType - The unique identifier for the custom widget type.
   * @param customWidget - The custom widget component class to register.
   */
  registerCustomWidget<Props extends CustomWidgetComponentProps = CustomWidgetComponentProps>(
    customWidgetType: string,
    customWidget: CustomWidgetComponent<Props>,
  ): void {
    const customWidgetPreactComponent: CustomWidgetComponentPreact<Props> = (props: Props) => {
      const renderedComponent = this.dynamicRenderer.renderComponent(customWidget, props);
      return createWrapperElement(renderedComponent.element as HTMLDivElement, () =>
        renderedComponent.destroy(),
      );
    };

    const customWidgetsMap = this.customWidgetsMap$.value;
    if (!customWidgetsMap.has(customWidgetType)) {
      customWidgetsMap.set(customWidgetType, customWidgetPreactComponent);
      this.customWidgetsMap$.next(customWidgetsMap);
    }
  }

  /**
   * Checks if a custom widget is registered.
   *
   * @param customWidgetType - The type of the custom widget.
   * @returns True if the custom widget is registered, false otherwise.
   */
  hasCustomWidget(customWidgetType: string): boolean {
    return this.customWidgetsMap$.value.has(customWidgetType);
  }
}
