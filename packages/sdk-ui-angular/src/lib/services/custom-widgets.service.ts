import { Injectable, Type } from '@angular/core';
import {
  createElement,
  type CustomWidgetComponent as CustomWidgetComponentPreact,
  type ExternalComponentAdapter,
  ExternalComponentAdapterElement,
  type ExternalComponentAdapterElementProps,
  type GenericDataOptions,
} from '@sisense/sdk-ui-preact';
import { TabberButtonsWidget } from '@sisense/sdk-ui-preact';
import { BehaviorSubject } from 'rxjs';

import type { CustomWidgetComponentProps } from '../types';
import { AngularComponentAdapter } from './angular-component-adapter';
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
    const dynamicRenderer = this.dynamicRenderer;

    /**
     * Factory function that creates an adapter for the Angular component.
     * This is called once per component mount by the ExternalComponentAdapterElement.
     */
    const createAdapter = (): ExternalComponentAdapter<Props> => {
      return new AngularComponentAdapter<Props>(dynamicRenderer, customWidget);
    };

    /**
     * Preact wrapper component that manages the Angular component lifecycle.
     * Uses ExternalComponentAdapterElement (which uses hooks internally in the correct Preact context)
     * to ensure the Angular component is:
     * - Created once on mount
     * - Updated in-place on props changes (preserving state)
     * - Properly destroyed on unmount
     */
    const CustomWidgetWrapper: CustomWidgetComponentPreact<Props> = (props: Props) => {
      const adapterElementProps: ExternalComponentAdapterElementProps<Props> = {
        adapterFactory: createAdapter,
        componentProps: props,
      };
      return createElement(ExternalComponentAdapterElement, adapterElementProps) as ReturnType<
        CustomWidgetComponentPreact<Props>
      >;
    };

    const customWidgetsMap = this.customWidgetsMap$.value;
    if (!customWidgetsMap.has(customWidgetType)) {
      customWidgetsMap.set(customWidgetType, CustomWidgetWrapper);
      this.customWidgetsMap$.next(customWidgetsMap);
    }
  }

    /**
     * Unregisters a custom widget.
     *
     * @param customWidgetType - The unique identifier for the custom widget type.
     */
    unregisterCustomWidget(customWidgetType: string): void {
      const customWidgetsMap = this.customWidgetsMap$.value;
      if (customWidgetsMap.has(customWidgetType)) {
        customWidgetsMap.delete(customWidgetType);
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
