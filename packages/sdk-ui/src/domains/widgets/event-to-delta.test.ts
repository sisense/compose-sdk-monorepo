import { createAttribute } from '@sisense/sdk-data';

import * as DM from '@/__test-helpers__/sample-ecommerce';

import {
  ChartWidgetDrilldownSelectionsChangedEvent,
  PivotTableWidgetDrilldownSelectionsChangedEvent,
  WidgetTitleChangedEvent,
} from './change-events';
import type { WidgetProps } from './components/widget/types';
import { widgetChangeEventToDelta } from './event-to-delta';

const ageRange = createAttribute({
  name: 'Age Range',
  type: 'text-attribute',
  expression: '[Commerce.Age Range]',
});

const chartWidgetProps: WidgetProps = {
  id: 'chart-1',
  widgetType: 'chart',
  chartType: 'column',
  dataOptions: {
    category: [DM.Commerce.Gender],
    value: [],
  },
  drilldownOptions: {
    drilldownPaths: [DM.Commerce.AgeRange],
    drilldownSelections: [],
  },
};

const pivotWidgetProps: WidgetProps = {
  id: 'pivot-1',
  widgetType: 'pivot',
  dataOptions: {
    rows: [DM.Commerce.Gender],
    values: [],
  },
  drilldownOptions: {
    drilldownTarget: { dataOptionName: 'rows', dataOptionIndex: 0 },
    drilldownSelections: [],
  },
};

describe('widgetChangeEventToDelta', () => {
  it('should reduce ChartWidget drilldownSelections/changed event to delta', () => {
    const event: ChartWidgetDrilldownSelectionsChangedEvent = {
      type: 'drilldownSelections/changed',
      payload: [
        {
          points: [{ categoryValue: 'Male' }],
          nextDimension: ageRange,
        },
      ],
    };

    const delta = widgetChangeEventToDelta(event, chartWidgetProps);

    expect(delta).toEqual({
      drilldownOptions: {
        drilldownPaths: [DM.Commerce.AgeRange],
        drilldownSelections: [
          {
            points: [{ categoryValue: 'Male' }],
            nextDimension: ageRange,
          },
        ],
      },
    });
  });

  it('should reduce PivotTableWidget drilldownSelections/changed event to delta', () => {
    const target = { dataOptionName: 'rows' as const, dataOptionIndex: 0 };
    const event: PivotTableWidgetDrilldownSelectionsChangedEvent = {
      type: 'drilldownSelections/changed',
      payload: {
        target,
        selections: [
          {
            points: [{ categoryValue: 'Male' }],
            nextDimension: ageRange,
          },
        ],
      },
    };

    const delta = widgetChangeEventToDelta(event, pivotWidgetProps);

    expect(delta).toEqual({
      drilldownOptions: {
        drilldownTarget: { dataOptionName: 'rows', dataOptionIndex: 0 },
        drilldownSelections: [
          {
            points: [{ categoryValue: 'Male' }],
            nextDimension: ageRange,
          },
        ],
      },
    });
  });

  it('should return empty object when chart event (array payload) is passed for pivot widget', () => {
    const chartEvent: ChartWidgetDrilldownSelectionsChangedEvent = {
      type: 'drilldownSelections/changed',
      payload: [
        {
          points: [{ categoryValue: 'Male' }],
          nextDimension: ageRange,
        },
      ],
    };

    const delta = widgetChangeEventToDelta(chartEvent, pivotWidgetProps);

    expect(delta).toEqual({});
  });

  it('should return empty object when pivot event (object payload) is passed for chart widget', () => {
    const pivotEvent: PivotTableWidgetDrilldownSelectionsChangedEvent = {
      type: 'drilldownSelections/changed',
      payload: {
        target: { dataOptionName: 'rows', dataOptionIndex: 0 },
        selections: [
          {
            points: [{ categoryValue: 'Male' }],
            nextDimension: ageRange,
          },
        ],
      },
    };

    const delta = widgetChangeEventToDelta(pivotEvent, chartWidgetProps);

    expect(delta).toEqual({});
  });

  it('should reduce title/changed event to delta for chart widget', () => {
    const event: WidgetTitleChangedEvent = {
      type: 'title/changed',
      payload: { title: 'New Chart Title' },
    };

    const delta = widgetChangeEventToDelta(event, chartWidgetProps);

    expect(delta).toEqual({ title: 'New Chart Title' });
  });

  it('should reduce title/changed event to delta for pivot widget', () => {
    const event: WidgetTitleChangedEvent = {
      type: 'title/changed',
      payload: { title: 'New Pivot Title' },
    };

    const delta = widgetChangeEventToDelta(event, pivotWidgetProps);

    expect(delta).toEqual({ title: 'New Pivot Title' });
  });

  it('should return empty object for TextWidget (no drilldown support)', () => {
    const textWidgetProps: WidgetProps = {
      id: 'text-1',
      widgetType: 'text',
      styleOptions: {
        html: '<p>Test</p>',
        vAlign: 'valign-middle',
        bgColor: '#fff',
      },
    };

    const event: ChartWidgetDrilldownSelectionsChangedEvent = {
      type: 'drilldownSelections/changed',
      payload: [],
    };

    const delta = widgetChangeEventToDelta(event, textWidgetProps);

    expect(delta).toEqual({});
  });
});
