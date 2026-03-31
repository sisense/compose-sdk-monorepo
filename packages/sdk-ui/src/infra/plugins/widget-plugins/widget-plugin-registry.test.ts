import { describe, expect, it } from 'vitest';

import { WidgetPluginRegistry } from './widget-plugin-registry.js';

describe('WidgetPluginRegistry', () => {
  const createMockComponent = () => vi.fn(() => null);

  it('should register and retrieve a component', () => {
    const registry = new WidgetPluginRegistry();
    const component = createMockComponent();

    registry.register('my-widget', component, 'legacy');

    expect(registry.has('my-widget')).toBe(true);
    expect(registry.getComponent('my-widget')).toBe(component);
  });

  it('should return undefined for unregistered widget type', () => {
    const registry = new WidgetPluginRegistry();

    expect(registry.has('unknown')).toBe(false);
    expect(registry.getComponent('unknown')).toBeUndefined();
  });

  it('should unregister legacy entry by type name and source', () => {
    const registry = new WidgetPluginRegistry();
    const component = createMockComponent();

    registry.register('my-widget', component, 'legacy');
    expect(registry.has('my-widget')).toBe(true);

    registry.unregister('my-widget', 'legacy');
    expect(registry.has('my-widget')).toBe(false);
    expect(registry.getComponent('my-widget')).toBeUndefined();
  });

  it('should not unregister when source does not match', () => {
    const registry = new WidgetPluginRegistry();
    const component = createMockComponent();

    registry.register('my-widget', component, 'plugin');
    registry.unregister('my-widget', 'legacy');

    expect(registry.has('my-widget')).toBe(true);
    expect(registry.getComponent('my-widget')).toBe(component);
  });

  it('should apply first-write-wins within same source (legacy)', () => {
    const registry = new WidgetPluginRegistry();
    const componentA = createMockComponent();
    const componentB = createMockComponent();

    registry.register('widget', componentA, 'legacy');
    registry.register('widget', componentB, 'legacy');

    expect(registry.getComponent('widget')).toBe(componentA);
  });

  it('should apply first-write-wins within same source (plugin)', () => {
    const registry = new WidgetPluginRegistry();
    const componentA = createMockComponent();
    const componentB = createMockComponent();

    registry.register('widget', componentA, 'plugin');
    registry.register('widget', componentB, 'plugin');

    expect(registry.getComponent('widget')).toBe(componentA);
  });

  it('should let plugin registration take priority over legacy', () => {
    const registry = new WidgetPluginRegistry();
    const legacyComponent = createMockComponent();
    const pluginComponent = createMockComponent();

    registry.register('widget', legacyComponent, 'legacy');
    registry.register('widget', pluginComponent, 'plugin');

    expect(registry.getComponent('widget')).toBe(pluginComponent);
  });

  it('should ignore legacy registration when plugin already registered', () => {
    const registry = new WidgetPluginRegistry();
    const pluginComponent = createMockComponent();
    const legacyComponent = createMockComponent();

    registry.register('widget', pluginComponent, 'plugin');
    registry.register('widget', legacyComponent, 'legacy');

    expect(registry.getComponent('widget')).toBe(pluginComponent);
  });

  it('should allow legacy to overwrite when no existing entry', () => {
    const registry = new WidgetPluginRegistry();
    const component = createMockComponent();

    registry.register('widget', component);

    expect(registry.getComponent('widget')).toBe(component);
  });
});
