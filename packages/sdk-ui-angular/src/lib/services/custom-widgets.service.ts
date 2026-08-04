import { Injectable, Type } from '@angular/core';
import {
  type CustomWidgetComponent as CustomWidgetComponentPreact,
  type GenericDataOptions,
} from '@sisense/sdk-ui-preact';
import { TabberButtonsWidget } from '@sisense/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';

import type { CustomWidgetComponentProps } from '../types';
import { ComponentTranslator } from './component-translator.service';

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
    private componentTranslator: ComponentTranslator,
  ) {
    this.customWidgetsMap$ = new BehaviorSubject(
      new Map<string, CustomWidgetComponentPreact<any>>([
        // The built-in widget is stored in the type-erased custom-widget map.
        ['tabber-buttons', TabberButtonsWidget as CustomWidgetComponentPreact<any>],
      ]),
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
    const customWidgetsMap = this.customWidgetsMap$.value;
    if (!customWidgetsMap.has(customWidgetType)) {
      // Wrap the Angular component in a preact component that manages its lifecycle
      // (created once on mount, updated in-place on props change, destroyed on unmount).
      customWidgetsMap.set(
        customWidgetType,
        this.componentTranslator.toPreactComponent(customWidget),
      );
      this.customWidgetsMap$.next(customWidgetsMap);
    }
  }

  /**
   * Unregisters a custom widget for the given type name.
   *
   * @param customWidgetType - The unique identifier for the custom widget type.
   */
  unregisterCustomWidget(customWidgetType: string): void {
    const customWidgetsMap = this.customWidgetsMap$.value;
    if (customWidgetsMap.delete(customWidgetType)) {
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
