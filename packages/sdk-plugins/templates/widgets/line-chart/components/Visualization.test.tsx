import React from 'react';

import type { Filter } from '@sisense/sdk-data';
import type { CustomVisualizationProps } from '@sisense/sdk-ui';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DataOptions, StyleOptions } from '../types.js';
import { Visualization, VisualizationProps } from './Visualization.js';

const TestVisualization = Visualization as React.FC<VisualizationProps>;

const { mockLineChart } = vi.hoisted(() => ({
  mockLineChart: vi.fn<(...args: unknown[]) => null>(() => null),
}));

vi.mock('@sisense/sdk-ui', () => ({
  LineChart: mockLineChart,
}));

const mockAttribute = (name: string) => ({ name, type: 'text-attribute' });
const mockMeasure = (name: string) => ({ name, aggregation: 'sum' });

function makeProps(overrides: Record<string, unknown> = {}) {
  return {
    dataSource: 'SampleECommerce',
    dataOptions: {
      category: [{ column: mockAttribute('Date') }],
      value: [{ column: mockMeasure('Revenue') }],
      breakBy: [],
    },
    filters: [],
    styleOptions: {},
    ...overrides,
  } as unknown as CustomVisualizationProps<DataOptions, StyleOptions>;
}

// React 19 passes `undefined` as the second argument to functional components,
// so assertions target only the first argument (props) via mock.lastCall![0].
// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
const lastProps = () => mockLineChart.mock.lastCall![0] as Record<string, unknown>;

describe('Visualization (line-chart template)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without error', () => {
    expect(() => render(<TestVisualization {...makeProps()} />)).not.toThrow();
  });

  it('passes dataSource as dataSet to LineChart', () => {
    render(<TestVisualization {...makeProps({ dataSource: 'MyDataSource' })} />);
    expect(lastProps()).toEqual(expect.objectContaining({ dataSet: 'MyDataSource' }));
  });

  it('maps category column to the category array', () => {
    const cat = mockAttribute('OrderDate');
    const categoryOption = { column: cat, dateFormat: 'yyyy-MM' };
    render(
      <TestVisualization
        {...makeProps({ dataOptions: { category: [categoryOption], value: [], breakBy: [] } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({
        dataOptions: expect.objectContaining({ category: [categoryOption] }),
      }),
    );
  });

  it('produces an empty category array when category is empty', () => {
    render(
      <TestVisualization
        {...makeProps({ dataOptions: { category: [], value: [], breakBy: [] } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ category: [] }) }),
    );
  });

  it('maps values columns to the value array', () => {
    const measure = mockMeasure('Revenue');
    const valueOption = {
      column: measure,
      numberFormatConfig: { name: 'Numbers', kilo: true },
      color: { type: 'uniform', color: '#ff0000' },
    };
    render(
      <TestVisualization
        {...makeProps({
          dataOptions: { category: [], value: [valueOption], breakBy: [] },
        })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({
        dataOptions: expect.objectContaining({ value: [valueOption] }),
      }),
    );
  });

  it('maps breakBy columns to the breakBy array', () => {
    const dim = mockAttribute('Category');
    const breakByOption = { column: dim, color: { type: 'uniform', color: '#00ff00' } };
    render(
      <TestVisualization
        {...makeProps({ dataOptions: { category: [], value: [], breakBy: [breakByOption] } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({
        dataOptions: expect.objectContaining({ breakBy: [breakByOption] }),
      }),
    );
  });

  it('passes filters through to LineChart unchanged', () => {
    const filters = [{ jaql: { dim: '[Commerce.Date]' } }] as unknown as Filter[];
    render(<TestVisualization {...makeProps({ filters })} />);
    expect(lastProps()).toEqual(expect.objectContaining({ filters }));
  });

  it('passes styleOptions through to LineChart', () => {
    const styleOptions = {
      subtype: 'line/spline',
      legend: { enabled: false },
    } as unknown as StyleOptions;
    render(<TestVisualization {...makeProps({ styleOptions })} />);
    expect(lastProps()).toEqual(
      expect.objectContaining({ styleOptions: expect.objectContaining(styleOptions) }),
    );
  });

  it('uses empty category array when category is undefined', () => {
    render(
      <TestVisualization
        {...makeProps({ dataOptions: { category: undefined, value: [], breakBy: [] } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ category: [] }) }),
    );
  });

  it('uses empty value array when value is undefined', () => {
    render(
      <TestVisualization
        {...makeProps({ dataOptions: { category: [], value: undefined, breakBy: [] } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ value: [] }) }),
    );
  });

  it('uses empty breakBy array when dataOptions.breakBy is undefined', () => {
    render(
      <TestVisualization
        {...makeProps({ dataOptions: { category: [], value: [], breakBy: undefined } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ breakBy: [] }) }),
    );
  });
});
