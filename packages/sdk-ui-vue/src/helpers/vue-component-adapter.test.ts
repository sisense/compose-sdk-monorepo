import { describe, expect, it, vi } from 'vitest';
import { ref } from 'vue';

import { VueComponentAdapter } from './vue-component-adapter';

describe('VueComponentAdapter', () => {
  const mockContexts = {
    sisenseContext: ref({
      isInitialized: false,
      app: undefined,
      tracking: {
        enabled: true,
        packageName: 'sdk-ui-vue',
      },
      errorBoundary: {
        showErrorBox: true,
      },
    }),
    themeContext: ref({} as any),
    customWidgetsContext: ref({ customWidgetsMap: new Map() }),
  };

  it('should create an adapter instance', () => {
    const mockComponent = { setup: () => () => null };
    const adapter = new VueComponentAdapter(mockComponent, mockContexts);

    expect(adapter).toBeDefined();
    expect(adapter.isActive()).toBe(false);
  });

  it('should mount a Vue component', () => {
    const mockComponent = { setup: () => () => null };
    const adapter = new VueComponentAdapter(mockComponent, mockContexts);
    const container = document.createElement('div');
    const props = { testProp: 'value' };

    adapter.mount(container, props);

    expect(adapter.isActive()).toBe(true);
  });

  it('should update props without recreating the component', () => {
    const setupSpy = vi.fn(() => () => null);
    const mockComponent = { setup: setupSpy };
    const adapter = new VueComponentAdapter(mockComponent, mockContexts);
    const container = document.createElement('div');

    adapter.mount(container, { testProp: 'initial' });
    expect(setupSpy).toHaveBeenCalledTimes(1);

    adapter.update({ testProp: 'updated' });
    // setup should still only be called once (component not recreated)
    expect(setupSpy).toHaveBeenCalledTimes(1);
    expect(adapter.isActive()).toBe(true);
  });

  it('should destroy the component', () => {
    const mockComponent = { setup: () => () => null };
    const adapter = new VueComponentAdapter(mockComponent, mockContexts);
    const container = document.createElement('div');
    document.body.appendChild(container);

    adapter.mount(container, { testProp: 'value' });
    expect(adapter.isActive()).toBe(true);

    adapter.destroy();
    expect(adapter.isActive()).toBe(false);

    document.body.removeChild(container);
  });

  it('should not mount if already mounted', () => {
    const setupSpy = vi.fn(() => () => null);
    const mockComponent = { setup: setupSpy };
    const adapter = new VueComponentAdapter(mockComponent, mockContexts);
    const container = document.createElement('div');

    adapter.mount(container, { testProp: 'value' });
    expect(setupSpy).toHaveBeenCalledTimes(1);

    // Try to mount again
    adapter.mount(container, { testProp: 'value2' });
    expect(setupSpy).toHaveBeenCalledTimes(1); // Should not mount again
  });

  it('should not update if not mounted', () => {
    const mockComponent = { setup: () => () => null };
    const adapter = new VueComponentAdapter(mockComponent, mockContexts);

    // Try to update without mounting first
    adapter.update({ testProp: 'updated' });
    expect(adapter.isActive()).toBe(false);
  });

  it('should not update after destroy', () => {
    const mockComponent = { setup: () => () => null };
    const adapter = new VueComponentAdapter(mockComponent, mockContexts);
    const container = document.createElement('div');

    adapter.mount(container, { testProp: 'value' });
    adapter.destroy();

    adapter.update({ testProp: 'updated' });
    expect(adapter.isActive()).toBe(false);
  });
});
