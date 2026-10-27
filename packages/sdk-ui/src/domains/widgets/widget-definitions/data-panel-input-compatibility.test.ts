import { expectTypeOf } from 'vitest';

import { toWidgetDefinition } from '@/infra/plugins/widget-plugins/to-widget-definition';

import type { DataPanelInput } from './widget-metadata';

/*
 * Editor hosts that predate the widened fields read only `type` from an input and ignore every
 * other field. These tests pin the SDK side of that contract: `type` keeps its two values, and the
 * inputs a plugin declares reach a host unchanged.
 */

const widenedDimensionInputs: DataPanelInput[] = [
  { name: 'columns', type: 'dimension', acceptsBoth: { mixed: true } },
  { name: 'x', type: 'dimension', acceptsBoth: { mixed: false }, cardinality: 'single' },
  { name: 'category', type: 'dimension', canColor: true, canColorMembers: true, maxItems: 3 },
  { name: 'date', type: 'dimension', dataTypes: ['datetime'], itemCapabilities: ['continuous'] },
  { name: 'breakBy', type: 'dimension', allowDimensionColor: true, coloringModes: ['single'] },
  {
    name: 'details',
    type: 'dimension',
    visibleWhen: {
      all: [{ slot: 'category', minItems: 1 }, { not: { path: 'chartType', equals: 'pie' } }],
    },
  },
  { name: 'geo', type: 'dimension', autoPopulated: true, description: 'Filled by the host' },
  { name: 'rows', type: 'dimension', canSort: true, maxSortedItems: 1 },
];

const widenedMeasureInputs: DataPanelInput[] = [
  {
    name: 'value',
    type: 'measure',
    itemCapabilities: ['y2Axis', 'seriesType', 'dataBars', 'nullAsZero'],
  },
  {
    name: 'range',
    type: 'measure',
    allowRange: true,
    coloringModes: ['single', 'range', 'condition'],
  },
  { name: 'comparisonValue', type: 'measure', acceptsConstant: true, cardinality: 'single' },
];

const pluginWithInputs = (inputs: DataPanelInput[]) => ({
  name: 'widened',
  displayName: 'Widened',
  visualization: { Component: () => null },
  dataPanel: { config: { inputs } },
});

describe('DataPanelInput compatibility with hosts that read only type', () => {
  it('keeps type to exactly a dimension or a measure', () => {
    expectTypeOf<DataPanelInput['type']>().toEqualTypeOf<'dimension' | 'measure'>();
    const types = new Set([...widenedDimensionInputs, ...widenedMeasureInputs].map((i) => i.type));
    expect([...types].sort()).toEqual(['dimension', 'measure']);
  });

  it('hands every widened input to the host with its type unchanged', () => {
    const inputs = [...widenedDimensionInputs, ...widenedMeasureInputs];
    const definition = toWidgetDefinition(pluginWithInputs(inputs), 'my-plugin');

    expect(definition.dataPanel?.config?.inputs?.map(({ name, type }) => ({ name, type }))).toEqual(
      inputs.map(({ name, type }) => ({ name, type })),
    );
  });

  it('passes the widened fields through without rewriting them', () => {
    const inputs = [...widenedDimensionInputs, ...widenedMeasureInputs];
    const definition = toWidgetDefinition(pluginWithInputs(inputs), 'my-plugin');

    expect(definition.dataPanel?.config?.inputs).toEqual(inputs);
  });
});
