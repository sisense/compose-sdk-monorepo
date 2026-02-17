import { ComponentRef, reflectComponentType, Type } from '@angular/core';
import { type ExternalComponentAdapter } from '@sisense/sdk-ui-preact';

import { DynamicRenderer } from './dynamic-renderer.service';

/**
 * Adapter class that manages the lifecycle of an Angular component
 * rendered within a Preact context. This provides efficient updates
 * by reusing the component instance instead of recreating it on every
 * props change.
 *
 * This pattern mirrors how `ComponentAdapter` works for regular Preact
 * components, ensuring consistent behavior between regular widgets
 * and custom Angular widgets.
 *
 * Implements ExternalComponentAdapter interface to be compatible with
 * the ExternalComponentAdapterElement in sdk-ui-preact.
 *
 * @internal
 */
export class AngularComponentAdapter<Props> implements ExternalComponentAdapter<Props> {
  private componentRef: ComponentRef<any> | null = null;

  private element: HTMLElement | null = null;

  private isDestroyed = false;

  /** Set of property names declared as @Input() on the component */
  private inputNames: Set<string>;

  constructor(private dynamicRenderer: DynamicRenderer, private componentClass: Type<Props>) {
    // Extract input names from component metadata (supports both property names and aliases)
    const mirror = reflectComponentType(componentClass);
    this.inputNames = new Set(
      mirror?.inputs.flatMap((input) => [input.propName, input.templateName]) ?? [],
    );
  }

  /**
   * Mounts the Angular component into the container element.
   * This should only be called once when the Preact wrapper mounts.
   *
   * @param container - The DOM element to mount the Angular component into
   * @param props - Initial props to pass to the component
   */
  mount(container: HTMLElement, props: Props): void {
    if (this.componentRef || this.isDestroyed) {
      return;
    }

    const rendered = this.dynamicRenderer.renderComponent(this.componentClass, props);
    container.appendChild(rendered.element);
    this.componentRef = rendered.componentRef;
    this.element = rendered.element;
  }

  /**
   * Updates the props on the existing Angular component instance.
   * Uses ComponentRef.setInput() for @Input properties to ensure proper
   * change detection, OnPush component marking, and ngOnChanges lifecycle
   * hook execution. Uses direct assignment for non-input properties
   * (e.g., event callbacks).
   *
   * @param props - New props to apply to the component
   */
  update(props: Props): void {
    if (!this.componentRef || this.isDestroyed) {
      return;
    }

    let hasDirectAssignments = false;

    Object.keys(props as Record<string, unknown>).forEach((key) => {
      const value = props[key as keyof Props];

      if (this.inputNames.has(key)) {
        // Use setInput() for @Input properties - triggers ngOnChanges and marks OnPush as dirty
        this.componentRef!.setInput(key, value);
      } else {
        // Direct assignment for non-input properties (e.g., callbacks)
        this.componentRef!.instance[key] = value;
        hasDirectAssignments = true;
      }
    });

    // Trigger change detection only if we had direct assignments
    if (hasDirectAssignments) {
      this.componentRef.changeDetectorRef.detectChanges();
    }
  }

  /**
   * Destroys the Angular component and cleans up resources.
   * This should be called when the Preact wrapper unmounts.
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    if (this.componentRef) {
      this.componentRef.destroy();
      this.componentRef = null;
    }

    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
    this.element = null;
  }

  /**
   * Returns whether the adapter has an active component instance.
   */
  isActive(): boolean {
    return this.componentRef !== null && !this.isDestroyed;
  }
}
