import { TabberButtonsWidget } from '@/domains/widgets/components/tabber-buttons-widget';

import { PLUGIN_ABILITY_DEFAULTS } from '../widget-identity/ability-defaults';
import type { WidgetKey } from '../widget-identity/widget-key';
import { BUILT_IN_WIDGET_DEFINITIONS } from './built-in-definitions';
import {
  type RuntimeWidgetDefinitionSource,
  WidgetDefinitionRegistry,
} from './widget-definition-registry';

describe('WidgetDefinitionRegistry', () => {
  const createMockComponent = () => vi.fn(() => null);
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  describe('compatibility accessors', () => {
    it('should register and retrieve a component', () => {
      const registry = new WidgetDefinitionRegistry();
      const component = createMockComponent();

      registry.registerComponent('my-widget', component, 'legacy');

      expect(registry.hasComponent('my-widget')).toBe(true);
      expect(registry.getComponent('my-widget')).toBe(component);
    });

    it('should give a component registration the plugin default abilities', () => {
      const registry = new WidgetDefinitionRegistry();

      registry.registerComponent('my-widget', createMockComponent(), 'legacy');

      expect(registry.get('custom:my-widget')?.abilities).toBe(PLUGIN_ABILITY_DEFAULTS);
    });

    it('should return undefined for unregistered widget type', () => {
      const registry = new WidgetDefinitionRegistry();

      expect(registry.hasComponent('unknown')).toBe(false);
      expect(registry.getComponent('unknown')).toBeUndefined();
    });

    it('should unregister legacy entry by type name and source', () => {
      const registry = new WidgetDefinitionRegistry();
      const component = createMockComponent();

      registry.registerComponent('my-widget', component, 'legacy');
      expect(registry.hasComponent('my-widget')).toBe(true);

      registry.unregisterComponent('my-widget', 'legacy');
      expect(registry.hasComponent('my-widget')).toBe(false);
      expect(registry.getComponent('my-widget')).toBeUndefined();
    });

    it('should not unregister when source does not match', () => {
      const registry = new WidgetDefinitionRegistry();
      const component = createMockComponent();

      registry.registerComponent('my-widget', component, 'plugin');
      registry.unregisterComponent('my-widget', 'legacy');

      expect(registry.hasComponent('my-widget')).toBe(true);
      expect(registry.getComponent('my-widget')).toBe(component);
    });

    it.each<RuntimeWidgetDefinitionSource>(['plugin', 'legacy'])(
      'should resolve getComponent("x") through the custom:x key (%s)',
      (source) => {
        const registry = new WidgetDefinitionRegistry();
        const component = createMockComponent();

        registry.registerComponent('x', component, source);

        expect(registry.get('custom:x')).toMatchObject({
          key: 'custom:x',
          displayName: 'x',
          visualization: { Component: component },
        });
        expect(registry.getComponent('x')).toBe(component);
        expect(registry.getComponent('x', source)).toBe(component);
      },
    );

    it('should resolve the built-in tabber through the static map', () => {
      const registry = new WidgetDefinitionRegistry();

      expect(registry.hasComponent('tabber-buttons')).toBe(true);
      expect(registry.getComponent('tabber-buttons')).toBe(TabberButtonsWidget);
    });
  });

  describe('precedence (internal > plugin > legacy, first write wins within a tier)', () => {
    type Existing = 'none' | 'internal' | RuntimeWidgetDefinitionSource;
    type Case = {
      existing: Existing;
      incoming: RuntimeWidgetDefinitionSource;
      winner: 'existing' | 'incoming';
    };

    const cases: Case[] = [
      { existing: 'none', incoming: 'plugin', winner: 'incoming' },
      { existing: 'none', incoming: 'legacy', winner: 'incoming' },
      { existing: 'internal', incoming: 'plugin', winner: 'existing' },
      { existing: 'internal', incoming: 'legacy', winner: 'existing' },
      { existing: 'plugin', incoming: 'plugin', winner: 'existing' },
      { existing: 'plugin', incoming: 'legacy', winner: 'existing' },
      { existing: 'legacy', incoming: 'plugin', winner: 'incoming' },
      { existing: 'legacy', incoming: 'legacy', winner: 'existing' },
    ];

    it.each(cases)(
      'existing $existing + incoming $incoming: $winner wins',
      ({ existing, incoming, winner }) => {
        const registry = new WidgetDefinitionRegistry();
        const customWidgetType = existing === 'internal' ? 'tabber-buttons' : 'widget';
        const existingComponent = createMockComponent();
        const incomingComponent = createMockComponent();

        if (existing === 'plugin' || existing === 'legacy') {
          registry.registerComponent(customWidgetType, existingComponent, existing);
        }
        registry.registerComponent(customWidgetType, incomingComponent, incoming);

        const winningExistingComponent =
          existing === 'internal' ? TabberButtonsWidget : existingComponent;
        const expectedComponent =
          winner === 'incoming' ? incomingComponent : winningExistingComponent;
        const expectedSource = winner === 'incoming' || existing === 'none' ? incoming : existing;
        expect(registry.getComponent(customWidgetType)).toBe(expectedComponent);
        expect(registry.has(`custom:${customWidgetType}`, expectedSource)).toBe(true);
      },
    );

    it('should ignore a plugin on a built-in key with one [Plugin] warning', () => {
      const registry = new WidgetDefinitionRegistry();

      registry.registerComponent('tabber-buttons', createMockComponent(), 'plugin');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Plugin]'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('custom:tabber-buttons'));
      expect(registry.getComponent('tabber-buttons')).toBe(TabberButtonsWidget);
      expect(registry.hasComponent('tabber-buttons', 'plugin')).toBe(false);
    });

    it('should silently ignore the legacy tabber seed (Angular and Vue mounts)', () => {
      const registry = new WidgetDefinitionRegistry();

      registry.registerComponent('tabber-buttons', createMockComponent(), 'legacy');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
      expect(registry.hasComponent('tabber-buttons', 'legacy')).toBe(false);
      expect(registry.getComponent('tabber-buttons')).toBe(TabberButtonsWidget);
    });

    it('should store a plugin named like a built-in key under custom:<name>', () => {
      const registry = new WidgetDefinitionRegistry();
      const component = createMockComponent();

      registry.registerComponent('line', component, 'plugin');

      expect(registry.get('custom:line')?.visualization.Component).toBe(component);
      expect(registry.has('line')).toBe(false);
      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });
  });

  describe('tiers', () => {
    it('should return the static tabber definition from the internal tier', () => {
      const registry = new WidgetDefinitionRegistry();

      const definition = registry.get('custom:tabber-buttons');

      expect(definition).toBe(BUILT_IN_WIDGET_DEFINITIONS.get('custom:tabber-buttons'));
      expect(registry.has('custom:tabber-buttons', 'internal')).toBe(true);
      expect(registry.has('custom:tabber-buttons', 'plugin')).toBe(false);
    });

    it('should scope unregister to the given tier', () => {
      const registry = new WidgetDefinitionRegistry();
      registry.registerComponent('legacy-widget', createMockComponent(), 'legacy');
      registry.registerComponent('plugin-widget', createMockComponent(), 'plugin');

      registry.unregister('custom:legacy-widget', 'plugin');
      registry.unregister('custom:plugin-widget', 'legacy');
      expect(registry.has('custom:legacy-widget')).toBe(true);
      expect(registry.has('custom:plugin-widget')).toBe(true);

      registry.unregister('custom:legacy-widget', 'legacy');
      registry.unregister('custom:plugin-widget', 'plugin');
      expect(registry.has('custom:legacy-widget')).toBe(false);
      expect(registry.has('custom:plugin-widget')).toBe(false);
    });

    it.each<RuntimeWidgetDefinitionSource>(['plugin', 'legacy'])(
      'should not remove a static entry through unregister (%s)',
      (source) => {
        const registry = new WidgetDefinitionRegistry();

        registry.unregister('custom:tabber-buttons', source);
        registry.unregisterComponent('tabber-buttons', source);

        expect(registry.has('custom:tabber-buttons', 'internal')).toBe(true);
      },
    );

    it('should list each tier with getAll', () => {
      const registry = new WidgetDefinitionRegistry();
      registry.registerComponent('plugin-widget', createMockComponent(), 'plugin');
      registry.registerComponent('legacy-widget', createMockComponent(), 'legacy');

      const keysOf = (source?: 'internal' | RuntimeWidgetDefinitionSource): WidgetKey[] =>
        registry.getAll(source).map((definition) => definition.key);

      expect(keysOf('internal')).toEqual([...BUILT_IN_WIDGET_DEFINITIONS.keys()]);
      expect(keysOf('plugin')).toEqual(['custom:plugin-widget']);
      expect(keysOf('legacy')).toEqual(['custom:legacy-widget']);
      expect(keysOf()).toEqual([
        ...BUILT_IN_WIDGET_DEFINITIONS.keys(),
        'custom:plugin-widget',
        'custom:legacy-widget',
      ]);
    });

    it('should register a full definition unchanged and record its tier', () => {
      const registry = new WidgetDefinitionRegistry();
      const component = createMockComponent();

      registry.register(
        {
          key: 'custom:my-plugin',
          displayName: 'My Plugin',
          abilities: PLUGIN_ABILITY_DEFAULTS,
          dataPanel: { config: { inputs: [{ name: 'category', type: 'dimension' }] } },
          visualization: { Component: component },
        },
        'plugin',
      );

      expect(registry.get('custom:my-plugin', 'plugin')).toEqual({
        key: 'custom:my-plugin',
        displayName: 'My Plugin',
        abilities: PLUGIN_ABILITY_DEFAULTS,
        dataPanel: { config: { inputs: [{ name: 'category', type: 'dimension' }] } },
        visualization: { Component: component },
      });
      expect(registry.has('custom:my-plugin', 'legacy')).toBe(false);
    });
  });
});
