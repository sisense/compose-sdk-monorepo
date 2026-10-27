import { expectTypeOf } from 'vitest';

import type { WidgetProps } from '../components/widget/types';
import { WidgetDefinitionRegistry } from '../widget-definitions/widget-definition-registry';
import { abilitiesOf, abilitiesOfKey, type WidgetAbilitiesLookup } from './abilities';
import {
  PLUGIN_ABILITY_DEFAULTS,
  WIDGET_DATA_KINDS,
  WIDGET_INTERACTIONS,
  withAbilityOverrides,
} from './ability-defaults';
import { BUILT_IN_WIDGET_DESCRIPTORS } from './descriptors';
import type { BuiltInWidgetKey, WidgetAbilities, WidgetInteraction } from './types';
import type { WidgetKey } from './widget-key';

const BUILT_IN_KEYS = Object.keys(BUILT_IN_WIDGET_DESCRIPTORS) as BuiltInWidgetKey[];

const ABILITY_FIELDS = ['data', 'interactions', 'highlights', 'drilldown', 'layout'] as const;

const MATRIX_HEADER = [
  'key',
  'data',
  'interactions',
  'highlights',
  'drilldown',
  'autoHeight',
  'defaultSize',
] as const;

const flag = (value: boolean): string => (value ? 'yes' : '-');

/** Renders one abilities value as the cells of a matrix row. */
const toMatrixCells = (name: string, abilities: WidgetAbilities): readonly string[] => [
  name,
  abilities.data,
  abilities.interactions.join(', ') || '-',
  flag(abilities.highlights),
  flag(abilities.drilldown),
  flag(abilities.layout.autoHeight),
  `${abilities.layout.defaultSize.width}x${abilities.layout.defaultSize.height}`,
];

/** Renders rows of cells as a table with padded columns. */
const toTable = (rows: readonly (readonly string[])[]): string => {
  const widths = MATRIX_HEADER.map((_, column) =>
    Math.max(...rows.map((row) => row[column].length)),
  );
  return rows
    .map((row) =>
      row
        .map((cell, column) => cell.padEnd(widths[column]))
        .join(' | ')
        .trimEnd(),
    )
    .join('\n');
};

const lookupOf = (entries: Readonly<Record<string, WidgetAbilities>>): WidgetAbilitiesLookup => ({
  get: (key: WidgetKey) => (key in entries ? { abilities: entries[key] } : undefined),
});

describe('widget abilities', () => {
  it('declares complete abilities on every descriptor', () => {
    expectTypeOf<
      (typeof BUILT_IN_WIDGET_DESCRIPTORS)[BuiltInWidgetKey]['abilities']
    >().toEqualTypeOf<WidgetAbilities>();

    BUILT_IN_KEYS.forEach((key) => {
      const { abilities } = BUILT_IN_WIDGET_DESCRIPTORS[key];
      expect(Object.keys(abilities).sort()).toEqual([...ABILITY_FIELDS].sort());
      expect(Object.keys(abilities.layout).sort()).toEqual(['autoHeight', 'defaultSize']);
      expect(WIDGET_DATA_KINDS).toContain(abilities.data);
      abilities.interactions.forEach((interaction) =>
        expect(WIDGET_INTERACTIONS).toContain(interaction),
      );
    });
  });

  it('lists every value of the ability unions', () => {
    expectTypeOf<(typeof WIDGET_DATA_KINDS)[number]>().toEqualTypeOf<WidgetAbilities['data']>();
    expectTypeOf<(typeof WIDGET_INTERACTIONS)[number]>().toEqualTypeOf<WidgetInteraction>();
    expect(new Set(WIDGET_DATA_KINDS).size).toBe(WIDGET_DATA_KINDS.length);
    expect(new Set(WIDGET_INTERACTIONS).size).toBe(WIDGET_INTERACTIONS.length);
  });

  it('freezes declared abilities deeply', () => {
    [...BUILT_IN_KEYS.map((key) => BUILT_IN_WIDGET_DESCRIPTORS[key].abilities)].forEach(
      (abilities) => {
        expect(Object.isFrozen(abilities)).toBe(true);
        expect(Object.isFrozen(abilities.interactions)).toBe(true);
        expect(Object.isFrozen(abilities.layout)).toBe(true);
        expect(Object.isFrozen(abilities.layout.defaultSize)).toBe(true);
      },
    );
    expect(Object.isFrozen(PLUGIN_ABILITY_DEFAULTS)).toBe(true);
  });

  it('matches the abilities matrix of every built-in key and a default plugin', () => {
    const matrix = toTable([
      MATRIX_HEADER,
      ...BUILT_IN_KEYS.map((key) => toMatrixCells(key, abilitiesOfKey(key))),
      toMatrixCells(
        'custom:tabber-buttons',
        abilitiesOfKey('custom:tabber-buttons', new WidgetDefinitionRegistry()),
      ),
      toMatrixCells('custom:<plugin>', abilitiesOfKey('custom:any-plugin')),
    ]);

    expect(`\n${matrix}\n`).toMatchInlineSnapshot(`
      "
      key                   | data    | interactions                                           | highlights | drilldown | autoHeight | defaultSize
      line                  | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      area                  | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      bar                   | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      column                | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      polar                 | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      streamgraph           | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      pie                   | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      funnel                | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      treemap               | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      sunburst              | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      sankey                | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      scatter               | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      indicator             | query   | dataPointClick                                         | -          | -         | -          | 200x200
      kpi                   | query   | dataPointClick, dataPointContextMenu                   | -          | -         | -          | 400x400
      boxplot               | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      scattermap            | query   | dataPointClick                                         | yes        | -         | -          | 400x400
      areamap               | query   | dataPointClick                                         | yes        | -         | -          | 400x400
      calendar-heatmap      | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | -         | -          | 400x400
      arearange             | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | yes       | -          | 400x400
      table                 | query   | -                                                      | -          | -         | yes        | 400x500
      pivot                 | query   | dataPointClick, dataPointContextMenu                   | yes        | yes       | yes        | 400x500
      text                  | none    | widgetClick                                            | -          | -         | -          | 400x400
      narrative             | none    | -                                                      | -          | -         | yes        | 400x400
      filter                | members | -                                                      | -          | -         | -          | 400x400
      custom:tabber-buttons | none    | -                                                      | -          | -         | -          | 512x32
      custom:<plugin>       | query   | dataPointClick, dataPointContextMenu, dataPointsSelect | yes        | -         | -          | 400x400
      "
    `);
  });
});

describe('abilitiesOfKey', () => {
  it('returns the descriptor abilities for a built-in key, ignoring the registry', () => {
    const registry = lookupOf({ line: PLUGIN_ABILITY_DEFAULTS });

    expect(abilitiesOfKey('line', registry)).toBe(BUILT_IN_WIDGET_DESCRIPTORS.line.abilities);
    expect(abilitiesOfKey('pivot')).toBe(BUILT_IN_WIDGET_DESCRIPTORS.pivot.abilities);
  });

  it('returns the registered abilities for a custom key', () => {
    const registered = withAbilityOverrides(PLUGIN_ABILITY_DEFAULTS, { data: 'none' });

    expect(abilitiesOfKey('custom:static', lookupOf({ 'custom:static': registered }))).toBe(
      registered,
    );
  });

  it('returns the plugin defaults for an unknown plugin or without a registry', () => {
    expect(abilitiesOfKey('custom:unknown', lookupOf({}))).toBe(PLUGIN_ABILITY_DEFAULTS);
    expect(abilitiesOfKey('custom:unknown')).toBe(PLUGIN_ABILITY_DEFAULTS);
  });
});

describe('abilitiesOf', () => {
  it('resolves the key from the widget props', () => {
    const registered = withAbilityOverrides(PLUGIN_ABILITY_DEFAULTS, { highlights: false });
    const registry = lookupOf({ 'custom:my-widget': registered });
    const chart = { id: 'a', widgetType: 'chart', chartType: 'table' } as WidgetProps;
    const pivot = { id: 'b', widgetType: 'pivot' } as WidgetProps;
    const custom = { id: 'c', widgetType: 'custom', customWidgetType: 'my-widget' } as WidgetProps;

    expect(abilitiesOf(chart, registry)).toBe(BUILT_IN_WIDGET_DESCRIPTORS.table.abilities);
    expect(abilitiesOf(pivot, registry)).toBe(BUILT_IN_WIDGET_DESCRIPTORS.pivot.abilities);
    expect(abilitiesOf(custom, registry)).toBe(registered);
  });
});
