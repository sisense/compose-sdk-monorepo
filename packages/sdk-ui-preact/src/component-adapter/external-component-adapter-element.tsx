import { useEffect, useLayoutEffect, useRef } from 'preact/hooks';

/**
 * Interface for an adapter that manages an external component's lifecycle.
 * This is used to bridge components from external frameworks (e.g., Angular, Vue)
 * into the Preact rendering context.
 *
 * @internal
 */
export interface ExternalComponentAdapter<Props> {
  /**
   * Mounts the external component into the container element.
   * Called once when the wrapper component mounts.
   */
  mount(container: HTMLElement, props: Props): void;

  /**
   * Updates props on the existing external component.
   * Called whenever props change after initial mount.
   */
  update(props: Props): void;

  /**
   * Destroys the external component and cleans up resources.
   * Called when the wrapper component unmounts.
   */
  destroy(): void;

  /**
   * Returns whether the adapter has an active component instance.
   */
  isActive(): boolean;
}

/**
 * Factory function type that creates an adapter instance.
 * The factory is called once per component mount.
 *
 * @internal
 */
export type AdapterFactory<Props> = () => ExternalComponentAdapter<Props>;

/**
 * Props for the ExternalComponentAdapterElement component.
 *
 * @internal
 */
export interface ExternalComponentAdapterElementProps<Props> {
  /** Factory function to create the adapter */
  adapterFactory: AdapterFactory<Props>;
  /** Props to pass to the wrapped component */
  componentProps: Props;
}

/**
 * A Preact component that wraps an external framework component using an adapter pattern.
 * This component:
 * - Creates the adapter once on mount using the factory
 * - Calls update() on the adapter when props change
 * - Calls destroy() when unmounting
 *
 * This allows external framework components to be efficiently updated in-place
 * rather than being destroyed and recreated on every prop change.
 *
 * @internal
 */
export const ExternalComponentAdapterElement = <Props,>({
  adapterFactory,
  componentProps,
}: ExternalComponentAdapterElementProps<Props>) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const adapterRef = useRef<ExternalComponentAdapter<Props> | null>(null);
  const isMountedRef = useRef(false);

  // Create and mount the external component once
  useLayoutEffect(() => {
    if (!containerRef.current || isMountedRef.current) {
      return;
    }

    // Create adapter using factory and mount
    adapterRef.current = adapterFactory();
    adapterRef.current.mount(containerRef.current, componentProps);
    isMountedRef.current = true;

    // Cleanup: destroy the external component on unmount
    return () => {
      adapterRef.current?.destroy();
      adapterRef.current = null;
      isMountedRef.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty deps = only on mount/unmount

  // Update props on the existing external component
  useEffect(() => {
    if (adapterRef.current?.isActive()) {
      adapterRef.current.update(componentProps);
    }
  }, [componentProps]);

  // Render container div that will hold the external component
  return <div ref={containerRef} style="width: 100%; height: 100%"></div>;
};
