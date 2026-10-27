import type { FunctionComponent } from 'react';

import { expectTypeOf } from 'vitest';

import type { DesignPanel } from '@/infra/plugins/widget-plugins/types';
import type { LineChartProps, PivotTableProps } from '@/props';
import type { LineStyleOptions, PieStyleOptions } from '@/types';

import { BUILT_IN_WIDGET_DESCRIPTORS } from '../widget-identity/descriptors';
import type { WidgetKey } from '../widget-identity/widget-key';
import { eraseWidgetDefinition } from './erase-widget-definition';
import type { ErasedWidgetDefinition, VisualizationLikeProps, WidgetDefinition } from './types';

const lineBody: FunctionComponent<LineChartProps> = () => null;
const lineDesignPanel: DesignPanel<LineStyleOptions> = () => null;
const pieDesignPanel: DesignPanel<PieStyleOptions> = () => null;

describe('widget definition types', () => {
  it('accepts a strict body and design panel pairing', () => {
    const definition: WidgetDefinition<LineChartProps> = {
      key: 'line',
      displayName: 'Line',
      abilities: BUILT_IN_WIDGET_DESCRIPTORS.line.abilities,
      visualization: { Component: lineBody },
      designPanel: { Component: lineDesignPanel },
    };

    expect(definition.designPanel?.Component).toBe(lineDesignPanel);
  });

  it('rejects a design panel of another chart type', () => {
    const definition: WidgetDefinition<LineChartProps> = {
      key: 'line',
      displayName: 'Line',
      abilities: BUILT_IN_WIDGET_DESCRIPTORS.line.abilities,
      visualization: { Component: lineBody },
      // @ts-expect-error a pie design panel cannot edit line style options
      designPanel: { Component: pieDesignPanel },
    };

    expect(definition.key).toBe('line');
  });

  it('accepts pivot table props as visualization props', () => {
    expectTypeOf<PivotTableProps>().toMatchTypeOf<VisualizationLikeProps>();

    const pivotBody: FunctionComponent<PivotTableProps> = () => null;
    const definition: WidgetDefinition<PivotTableProps> = {
      key: 'pivot',
      displayName: 'Pivot',
      abilities: BUILT_IN_WIDGET_DESCRIPTORS.pivot.abilities,
      visualization: { Component: pivotBody },
    };

    expect(definition.visualization.Component).toBe(pivotBody);
  });

  it('erases every strict definition', () => {
    const strict: WidgetDefinition<LineChartProps> = {
      key: 'line',
      displayName: 'Line',
      abilities: BUILT_IN_WIDGET_DESCRIPTORS.line.abilities,
      visualization: { Component: lineBody },
      designPanel: { Component: lineDesignPanel },
    };

    const erased = eraseWidgetDefinition(strict);

    expectTypeOf(erased).toEqualTypeOf<ErasedWidgetDefinition>();
    expect(erased).toBe(strict);
  });

  it('rejects a strict definition where an erased one is expected', () => {
    const strict: WidgetDefinition<LineChartProps> = {
      key: 'line',
      displayName: 'Line',
      abilities: BUILT_IN_WIDGET_DESCRIPTORS.line.abilities,
      visualization: { Component: lineBody },
    };

    // @ts-expect-error strict definitions are erased only through eraseWidgetDefinition
    const erased: ErasedWidgetDefinition = strict;

    expect(erased).toBe(strict);
  });
});

describe('WidgetKey', () => {
  it('accepts built-in keys and custom: keys', () => {
    expectTypeOf<'line'>().toMatchTypeOf<WidgetKey>();
    expectTypeOf<'pivot'>().toMatchTypeOf<WidgetKey>();
    expectTypeOf<'custom:foo'>().toMatchTypeOf<WidgetKey>();

    const keys: readonly WidgetKey[] = ['line', 'pivot', 'custom:foo'];

    expect(keys).toEqual(['line', 'pivot', 'custom:foo']);
  });

  it('rejects bare strings', () => {
    expectTypeOf<'foo'>().not.toMatchTypeOf<WidgetKey>();
    expectTypeOf<string>().not.toMatchTypeOf<WidgetKey>();

    // @ts-expect-error a bare custom widget type is not a registry key
    const key: WidgetKey = 'tabber-buttons';

    expect(key).toBe('tabber-buttons');
  });
});
