import { WidgetDefinitionRegistry } from '@/domains/widgets/widget-definitions/widget-definition-registry';
import { abilitiesOfKey } from '@/domains/widgets/widget-identity/abilities';
import { PLUGIN_ABILITY_DEFAULTS } from '@/domains/widgets/widget-identity/ability-defaults';
import { BUILT_IN_WIDGET_DESCRIPTORS } from '@/domains/widgets/widget-identity/descriptors';

import { toWidgetDefinition } from './to-widget-definition';
import type { AnyWidgetPlugin } from './types';

type CustomWidget = NonNullable<AnyWidgetPlugin['customWidget']>;

const customWidgetOf = (name: string, overrides: Partial<CustomWidget> = {}): CustomWidget => ({
  name,
  displayName: name,
  visualization: { Component: () => null },
  ...overrides,
});

const registryWith = (...customWidgets: CustomWidget[]): WidgetDefinitionRegistry => {
  const registry = new WidgetDefinitionRegistry();
  customWidgets.forEach((customWidget) =>
    registry.register(toWidgetDefinition(customWidget, `${customWidget.name}-plugin`), 'plugin'),
  );
  return registry;
};

describe('toWidgetDefinition', () => {
  let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    consoleWarnSpy.mockRestore();
  });

  it('keys the definition custom:<name> and gives it the plugin defaults', () => {
    const customWidget = customWidgetOf('my-widget');
    const definition = toWidgetDefinition(customWidget, 'my-plugin');

    expect(definition.key).toBe('custom:my-widget');
    expect(definition.abilities).toEqual(PLUGIN_ABILITY_DEFAULTS);
    expect(definition.visualization.Component).toBe(customWidget.visualization.Component);
  });

  describe('abilitiesOfKey over a plugin registry', () => {
    it('returns the descriptor abilities for built-in keys', () => {
      const registry = registryWith(customWidgetOf('my-widget'));

      expect(abilitiesOfKey('table', registry)).toBe(BUILT_IN_WIDGET_DESCRIPTORS.table.abilities);
    });

    it('returns the partial abilities of a registered plugin merged over the defaults', () => {
      const registry = registryWith(
        customWidgetOf('static-widget', { abilities: { data: 'none', interactions: [] } }),
      );

      expect(abilitiesOfKey('custom:static-widget', registry)).toEqual({
        ...PLUGIN_ABILITY_DEFAULTS,
        data: 'none',
        interactions: [],
      });
    });

    it('returns the plugin defaults for an unknown plugin', () => {
      const registry = registryWith(customWidgetOf('my-widget'));

      expect(abilitiesOfKey('custom:other-widget', registry)).toBe(PLUGIN_ABILITY_DEFAULTS);
    });

    it('ignores an invalid manifest value with a warning naming the plugin', () => {
      const abilities = {
        drilldown: 'sometimes',
        highlights: false,
      } as unknown as CustomWidget['abilities'];
      const registry = registryWith(customWidgetOf('odd-widget', { abilities }));

      expect(abilitiesOfKey('custom:odd-widget', registry)).toEqual({
        ...PLUGIN_ABILITY_DEFAULTS,
        highlights: false,
      });
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining(
          'Plugin "odd-widget-plugin" declares invalid widget abilities (drilldown)',
        ),
      );
    });
  });
});
