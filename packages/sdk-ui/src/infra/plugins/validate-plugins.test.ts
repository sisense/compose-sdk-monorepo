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
});
