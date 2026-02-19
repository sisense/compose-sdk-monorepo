import type { CompleteThemeSettings, CustomSisenseContext } from '@sisense/sdk-ui-preact';
import type { ExternalComponentAdapter } from '@sisense/sdk-ui-preact';
import { type App, type Component, createApp, type DefineComponent, h, ref, type Ref } from 'vue';

import { customWidgetsContextKey } from '../providers/custom-widgets-provider/custom-widgets-context';
import { sisenseContextKey } from '../providers/sisense-context-provider/sisense-context';
import { themeContextConfigKey } from '../providers/theme-provider/theme-context';

type AnyObject = Record<string, any>;

/**
 * Adapter class that manages the lifecycle of a Vue component
 * rendered within a Preact context. This provides efficient updates
 * by reusing the component instance instead of recreating it on every
 * props change.
 *
 * Implements ExternalComponentAdapter interface to be compatible with
 * the ExternalComponentAdapterElement in sdk-ui-preact.
 *
 * @internal
 */
export class VueComponentAdapter<Props extends AnyObject>
  implements ExternalComponentAdapter<Props>
{
  private app: App | null = null;
  private container: HTMLElement | null = null;
  private isDestroyed = false;
  private propsRef: Ref<Props> | null = null;

  constructor(
    private componentClass: Component<Props> | DefineComponent<Props>,
    private contexts: {
      sisenseContext: Ref<CustomSisenseContext>;
      themeContext: Ref<CompleteThemeSettings>;
      customWidgetsContext: Ref<any>;
    },
  ) {}

  /**
   * Mounts the Vue component into the container element.
   * This should only be called once when the Preact wrapper mounts.
   *
   * @param container - The DOM element to mount the Vue component into
   * @param props - Initial props to pass to the component
   */
  mount(container: HTMLElement, props: Props): void {
    if (this.app || this.isDestroyed) {
      return;
    }

    this.container = container;
    this.propsRef = ref(props) as Ref<Props>;

    // Create a wrapper component that renders the actual component with reactive props
    const WrapperComponent = {
      setup: () => {
        return () => h(this.componentClass as any, this.propsRef!.value);
      },
    };

    // Create new Vue app
    this.app = createApp(WrapperComponent);

    // Provide all parent contexts to the new app
    this.app.provide(sisenseContextKey, this.contexts.sisenseContext);
    this.app.provide(themeContextConfigKey, this.contexts.themeContext);
    this.app.provide(customWidgetsContextKey, this.contexts.customWidgetsContext);

    // Mount the app to the container
    this.app.mount(container);
  }

  /**
   * Updates the props on the existing Vue component instance.
   * This triggers Vue's reactivity system to re-render the component
   * without destroying and recreating it.
   *
   * @param props - New props to apply to the component
   */
  update(props: Props): void {
    if (!this.propsRef || this.isDestroyed) {
      return;
    }

    // Update props reactively - Vue's reactivity will handle the re-render
    this.propsRef.value = props;
  }

  /**
   * Destroys the Vue component and cleans up resources.
   * This should be called when the Preact wrapper unmounts.
   */
  destroy(): void {
    if (this.isDestroyed) {
      return;
    }

    this.isDestroyed = true;

    if (this.app) {
      this.app.unmount();
      this.app = null;
    }

    this.container = null;
    this.propsRef = null;
  }

  /**
   * Returns whether the adapter has an active component instance.
   */
  isActive(): boolean {
    return this.app !== null && !this.isDestroyed;
  }
}
