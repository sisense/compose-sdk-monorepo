import { describe, expect, it } from 'vitest';

import { buildModuleGraph } from './build-module-graph.js';
import type { ApiField, Module } from './types.js';

const noopField = (): ApiField<unknown, null> => ({
  createRegistry: () => null,
  register: () => {},
});

const makeModule = (overrides: Partial<Module> & Pick<Module, 'name'>): Module => ({
  version: '1.0.0',
  ...overrides,
});

describe('buildModuleGraph', () => {
  describe('flatten via includes', () => {
    it('expands transitively included modules', () => {
      const queryModule = makeModule({ name: 'query' });
      const modelsModule = makeModule({ name: 'models', includes: [queryModule] });
      const widgetsModule = makeModule({ name: 'widgets', includes: [modelsModule] });

      const graph = buildModuleGraph([widgetsModule]);
      const names = graph.map((entry) => entry.module.name);

      expect(names).toEqual(expect.arrayContaining(['widgets', 'models', 'query']));
      expect(names).toHaveLength(3);
    });

    it('deduplicates modules included from multiple paths', () => {
      const query = makeModule({ name: 'query' });
      const models = makeModule({ name: 'models', includes: [query] });
      const filters = makeModule({ name: 'filters', includes: [query] });
      const dashboard = makeModule({ name: 'dashboard', includes: [models, filters] });

      const graph = buildModuleGraph([dashboard]);
      const names = graph.map((entry) => entry.module.name);

      expect(names.filter((name) => name === 'query')).toHaveLength(1);
      expect(names).toHaveLength(4);
    });

    it('throws when two modules share a name but differ in version', () => {
      const a = makeModule({ name: 'shared', version: '1.0.0' });
      const b = makeModule({ name: 'shared', version: '2.0.0' });

      expect(() => buildModuleGraph([a, b])).toThrow(/Conflicting versions for "shared"/);
    });
  });

  describe('requires validation', () => {
    it('throws when a hard requirement is missing', () => {
      const dependent = makeModule({ name: 'consumer', requires: ['producer'] });

      expect(() => buildModuleGraph([dependent])).toThrow(
        /"consumer" requires "producer", but it is not registered/,
      );
    });

    it('does not throw when a soft requirement is missing', () => {
      const dependent = makeModule({
        name: 'consumer',
        requires: [{ name: 'producer', optional: true }],
      });

      const graph = buildModuleGraph([dependent]);
      expect(graph).toHaveLength(1);
      expect(graph[0].missingOptionalTargets.has('producer')).toBe(true);
    });

    it('throws when a hard requirement version range is not satisfied', () => {
      const producer = makeModule({ name: 'producer', version: '1.5.0' });
      const consumer = makeModule({
        name: 'consumer',
        requires: [{ name: 'producer', requiredVersion: '^2.0.0' }],
      });

      expect(() => buildModuleGraph([producer, consumer])).toThrow(
        /requires "producer" version \^2\.0\.0/,
      );
    });

    it('treats version-incompatible soft requirements as missing', () => {
      const producer = makeModule({ name: 'producer', version: '1.5.0' });
      const consumer = makeModule({
        name: 'consumer',
        requires: [{ name: 'producer', requiredVersion: '^2.0.0', optional: true }],
      });

      const graph = buildModuleGraph([producer, consumer]);
      const consumerEntry = graph.find((entry) => entry.module.name === 'consumer');
      expect(consumerEntry?.missingOptionalTargets.has('producer')).toBe(true);
    });

    it('accepts a hard requirement when version range is satisfied', () => {
      const producer = makeModule({ name: 'producer', version: '2.5.1' });
      const consumer = makeModule({
        name: 'consumer',
        requires: [{ name: 'producer', requiredVersion: '^2.0.0' }],
      });

      expect(() => buildModuleGraph([producer, consumer])).not.toThrow();
    });
  });

  describe('integrations validation', () => {
    it('throws when integrations target a module not declared in requires', () => {
      const producer = makeModule({
        name: 'producer',
        api: { foo: noopField() },
      });
      const consumer = makeModule({
        name: 'consumer',
        // No `requires`, but tries to integrate.
        integrations: { producer: { foo: 1 } },
      });

      expect(() => buildModuleGraph([producer, consumer])).toThrow(
        /"consumer" has integrations to "producer" but does not declare it in "requires"/,
      );
    });

    it('throws when integrations contribute to an unknown api field', () => {
      const producer = makeModule({
        name: 'producer',
        api: { knownField: noopField() },
      });
      const consumer = makeModule({
        name: 'consumer',
        requires: ['producer'],
        integrations: { producer: { unknownField: 1 } },
      });

      expect(() => buildModuleGraph([producer, consumer])).toThrow(
        /"consumer" contributes to unknown field "unknownField" of "producer"/,
      );
    });

    it('skips field validation when target is a missing optional requirement', () => {
      const consumer = makeModule({
        name: 'consumer',
        requires: [{ name: 'producer', optional: true }],
        integrations: { producer: { whatever: 1 } },
      });

      // Missing optional → contributions are silently dropped, no throw.
      expect(() => buildModuleGraph([consumer])).not.toThrow();
    });
  });

  describe('topological ordering', () => {
    it('places required modules before their consumers', () => {
      const producer = makeModule({ name: 'producer' });
      const consumer = makeModule({ name: 'consumer', requires: ['producer'] });

      // Pass consumer first to confirm sorting is independent of input order.
      const graph = buildModuleGraph([consumer, producer]);
      const names = graph.map((entry) => entry.module.name);

      expect(names.indexOf('producer')).toBeLessThan(names.indexOf('consumer'));
    });

    it('throws on circular dependencies', () => {
      const a = makeModule({ name: 'a', requires: ['b'] });
      const b = makeModule({ name: 'b', requires: ['a'] });

      expect(() => buildModuleGraph([a, b])).toThrow(/Circular dependency/);
    });
  });
});
