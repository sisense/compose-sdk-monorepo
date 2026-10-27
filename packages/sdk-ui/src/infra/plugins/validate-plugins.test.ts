import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { Plugin } from './types.js';
import { getValidPlugins } from './validate-plugins.js';

describe('getValidPlugins', () => {
  describe('version compatibility', () => {
    it('should accept plugins when SDK satisfies caret range (^) - allows minor and patch updates', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '^2.9.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.9.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.9.5')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.10.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.20.0')).toHaveLength(1);

      expect(getValidPlugins(plugins, '2.8.9')).toHaveLength(0);
      expect(getValidPlugins(plugins, '3.0.0')).toHaveLength(0);
      expect(getValidPlugins(plugins, '1.9.0')).toHaveLength(0);
    });

    it('should accept plugins when SDK satisfies tilde range (~) - allows only patch updates', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '~2.9.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.9.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.9.5')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.9.99')).toHaveLength(1);

      expect(getValidPlugins(plugins, '2.10.0')).toHaveLength(0);
      expect(getValidPlugins(plugins, '2.8.9')).toHaveLength(0);
      expect(getValidPlugins(plugins, '3.0.0')).toHaveLength(0);
    });

    it('should accept plugins when SDK matches exact version', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '2.20.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.20.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.20.1')).toHaveLength(0);
      expect(getValidPlugins(plugins, '2.19.0')).toHaveLength(0);
    });

    it('should accept plugins when SDK satisfies >= operator', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '>=2.9.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.9.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.9.1')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.10.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '3.0.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.8.9')).toHaveLength(0);
    });

    it('should accept plugins when SDK satisfies > operator', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '>2.9.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.9.0')).toHaveLength(0);
      expect(getValidPlugins(plugins, '2.9.1')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.10.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '3.0.0')).toHaveLength(1);
    });

    it('should accept plugins when SDK satisfies <= operator', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '<=2.9.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.9.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.8.9')).toHaveLength(1);
      expect(getValidPlugins(plugins, '1.0.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.9.1')).toHaveLength(0);
      expect(getValidPlugins(plugins, '2.10.0')).toHaveLength(0);
    });

    it('should accept plugins when SDK satisfies < operator', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '<2.9.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.9.0')).toHaveLength(0);
      expect(getValidPlugins(plugins, '2.8.9')).toHaveLength(1);
      expect(getValidPlugins(plugins, '1.0.0')).toHaveLength(1);
    });

    it('should accept plugin when SDK satisfies any of multiple version ranges (OR)', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '^2.9.0 || ^3.0.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.9.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.20.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '3.0.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '3.5.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '1.0.0')).toHaveLength(0);
      expect(getValidPlugins(plugins, '4.0.0')).toHaveLength(0);
    });

    it('should accept plugin when SDK satisfies AND range (space-separated comparators)', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '>1.2.3 <=2.3.1',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '1.2.4')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.0.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.3.1')).toHaveLength(1);
      expect(getValidPlugins(plugins, '1.2.3')).toHaveLength(0);
      expect(getValidPlugins(plugins, '2.3.2')).toHaveLength(0);
      expect(getValidPlugins(plugins, '3.0.0')).toHaveLength(0);
    });

    it('should accept plugin when SDK satisfies combined AND and OR range', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '>1.2.3 <=2.3.1 || ^3.0.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.0.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.3.1')).toHaveLength(1);
      expect(getValidPlugins(plugins, '3.0.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '3.5.0')).toHaveLength(1);
      expect(getValidPlugins(plugins, '1.2.3')).toHaveLength(0);
      expect(getValidPlugins(plugins, '2.3.2')).toHaveLength(0);
    });

    it('should normalize prerelease SDK version to x.y.z for comparison', () => {
      const plugins: Plugin[] = [
        {
          name: 'test-plugin',
          version: '1.0.0',
          requiredApiVersion: '^2.9.0',
          pluginType: 'widget',
        },
      ];

      expect(getValidPlugins(plugins, '2.20.0-alpha.1')).toHaveLength(1);
      expect(getValidPlugins(plugins, '2.20.0-beta.2')).toHaveLength(1);
      expect(getValidPlugins(plugins, '3.0.0-rc.1')).toHaveLength(0);

      const exactPlugin: Plugin[] = [
        { name: 'exact', version: '1.0.0', requiredApiVersion: '2.20.0', pluginType: 'widget' },
      ];
      expect(getValidPlugins(exactPlugin, '2.20.0-alpha.1')).toHaveLength(1);
    });
  });

  describe('duplicate plugin names', () => {
    it('should return only first occurrence when duplicates exist', () => {
      const plugins: Plugin[] = [
        { name: 'duplicate', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'duplicate', version: '2.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'unique', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
      ];

      const valid = getValidPlugins(plugins, '2.20.0');

      expect(valid).toHaveLength(2);
      expect(valid[0].name).toBe('duplicate');
      expect(valid[0].version).toBe('1.0.0');
      expect(valid[1].name).toBe('unique');
    });

    it('should keep first occurrence of duplicate and filter second', () => {
      const plugins: Plugin[] = [
        { name: 'dup', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'dup', version: '2.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
      ];

      const valid = getValidPlugins(plugins, '2.20.0');

      expect(valid).toHaveLength(1);
      expect(valid[0].version).toBe('1.0.0');
    });
  });

  describe('combined validation', () => {
    it('should return only valid plugins and first of duplicates', () => {
      const plugins: Plugin[] = [
        { name: 'valid', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        {
          name: 'invalid-version',
          version: '1.0.0',
          requiredApiVersion: '^3.0.0',
          pluginType: 'widget',
        },
        { name: 'duplicate', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'duplicate', version: '2.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
      ];

      const valid = getValidPlugins(plugins, '2.20.0');

      expect(valid).toHaveLength(2);
      expect(valid[0].name).toBe('valid');
      expect(valid[1].name).toBe('duplicate');
      expect(valid[1].version).toBe('1.0.0');
    });

    it('should return empty array for empty plugins', () => {
      expect(getValidPlugins([], '2.20.0')).toEqual([]);
    });
  });

  describe('return value', () => {
    it('should return only valid plugins when some are invalid', () => {
      const plugins: Plugin[] = [
        { name: 'valid1', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'invalid', version: '1.0.0', requiredApiVersion: '^3.0.0', pluginType: 'widget' },
        { name: 'valid2', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
      ];

      const valid = getValidPlugins(plugins, '2.20.0');

      expect(valid).toHaveLength(2);
      expect(valid[0].name).toBe('valid1');
      expect(valid[1].name).toBe('valid2');
    });
  });

  describe('console warnings for invalid plugins', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    it('should log warnings for invalid plugins when calling getValidPlugins', () => {
      const plugins: Plugin[] = [
        { name: 'valid', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'invalid', version: '1.0.0', requiredApiVersion: '^3.0.0', pluginType: 'widget' },
      ];

      getValidPlugins(plugins, '2.20.0');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('[Plugin]'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('invalid'));
    });

    it('should not log when all plugins are valid', () => {
      const plugins: Plugin[] = [
        { name: 'valid1', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'valid2', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
      ];

      getValidPlugins(plugins, '2.20.0');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('should log for each invalid plugin (version and duplicate)', () => {
      const plugins: Plugin[] = [
        {
          name: 'invalid-version',
          version: '1.0.0',
          requiredApiVersion: '^3.0.0',
          pluginType: 'widget',
        },
        { name: 'dup', version: '1.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
        { name: 'dup', version: '2.0.0', requiredApiVersion: '^2.0.0', pluginType: 'widget' },
      ];

      getValidPlugins(plugins, '2.20.0');

      expect(consoleWarnSpy).toHaveBeenCalledTimes(2);
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('requires API versions'));
      expect(consoleWarnSpy).toHaveBeenCalledWith(expect.stringContaining('duplicated'));
    });
  });
  describe('data slot rules', () => {
    let consoleWarnSpy: ReturnType<typeof vi.spyOn>;

    beforeEach(() => {
      consoleWarnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
      consoleWarnSpy.mockRestore();
    });

    const withInputs = (inputs: unknown[]): Plugin => ({
      name: 'slots-plugin',
      version: '1.0.0',
      requiredApiVersion: '^2.0.0',
      pluginType: 'widget',
      customWidget: {
        name: 'slots',
        displayName: 'Slots',
        visualization: { Component: () => null },
        // Simulates a manifest from untyped code or a newer SDK version.
        dataPanel: { config: { inputs: inputs as never } },
      },
    });

    it('keeps the plugin and warns about a condition it cannot read', () => {
      const plugins = [
        withInputs([
          { name: 'goal', type: 'measure', visibleWhen: { path: 'styleOptions.size', gt: 5 } },
        ]),
      ];

      expect(getValidPlugins(plugins, '2.20.0')).toHaveLength(1);
      expect(consoleWarnSpy).toHaveBeenCalledTimes(1);
      expect(consoleWarnSpy).toHaveBeenCalledWith(
        expect.stringContaining('"slots-plugin": data slot "goal"'),
      );
    });

    it.each([{}, 'inputs', [null], [42, { name: 'goal', visibleWhen: { gt: 1 } }]])(
      'does not throw on malformed inputs %j',
      (inputs) => {
        expect(getValidPlugins([withInputs(inputs as unknown[])], '2.20.0')).toHaveLength(1);
      },
    );

    it('does not warn about slots that follow every rule', () => {
      const plugins = [
        withInputs([
          { name: 'value', type: 'measure' },
          { name: 'goal', type: 'measure', visibleWhen: { slot: 'value', minItems: 1 } },
        ]),
      ];

      getValidPlugins(plugins, '2.20.0');

      expect(consoleWarnSpy).not.toHaveBeenCalled();
    });

    it('keeps the plugin and warns once per broken slot rule, naming the plugin and the slot', () => {
      const plugins = [
        withInputs([
          { name: 'size', type: 'measure', maxItems: 0 },
          { name: 'break-by', type: 'dimension' },
          { name: 'filters', type: 'dimension' },
          { name: 'width', type: 'measure', displayName: 'size' },
        ]),
      ];

      expect(getValidPlugins(plugins, '2.20.0')).toHaveLength(1);
      expect(consoleWarnSpy.mock.calls.map(([message]) => message)).toEqual([
        '[Plugin] "slots-plugin": data slot "size" has maxItems 0; maxItems must be a whole number of at least 1.',
        '[Plugin] "slots-plugin": data slot "break-by" has a name that is not camelCase; saved widgets load its items under "breakBy".',
        '[Plugin] "slots-plugin": data slot "filters" has a name reserved by hosts; choose another name.',
        '[Plugin] "slots-plugin": data slot "width" has the displayName "size", which is the name of another data slot.',
      ]);
    });
  });
});
