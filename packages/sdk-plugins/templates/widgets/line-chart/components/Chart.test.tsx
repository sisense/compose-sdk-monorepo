import React from 'react';

import type { Filter } from '@sisense/sdk-data';
import type { CustomVisualizationProps } from '@sisense/sdk-ui';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DataOptions, StyleOptions } from '../types.js';
import { Chart } from './Chart.js';

// CustomVisualization<T> has return type ReactNode (includes undefined), so TypeScript
// rejects it as a JSX element directly. Cast to a concrete ComponentType for tests.
const TestChart = Chart as unknown as React.ComponentType<Record<string, unknown>>;

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
      categories: [{ column: mockAttribute('Date') }],
      values: [{ column: mockMeasure('Revenue') }],
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

describe('Chart (line-chart template)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without error', () => {
    expect(() => render(<TestChart {...makeProps()} />)).not.toThrow();
  });

  it('passes dataSource as dataSet to LineChart', () => {
    render(<TestChart {...makeProps({ dataSource: 'MyDataSource' })} />);
    expect(lastProps()).toEqual(expect.objectContaining({ dataSet: 'MyDataSource' }));
  });

  it('maps categories columns to the category array', () => {
    const cat = mockAttribute('OrderDate');
    render(
      <TestChart
        {...makeProps({ dataOptions: { categories: [{ column: cat }], values: [], breakBy: [] } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ category: [cat] }) }),
    );
  });

  it('produces an empty category array when categories is empty', () => {
    render(
      <TestChart {...makeProps({ dataOptions: { categories: [], values: [], breakBy: [] } })} />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ category: [] }) }),
    );
  });

  it('maps values columns to the value array', () => {
    const measure = mockMeasure('Revenue');
    render(
      <TestChart
        {...makeProps({
          dataOptions: { categories: [], values: [{ column: measure }], breakBy: [] },
        })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ value: [measure] }) }),
    );
  });

  it('maps breakBy columns to the breakBy array', () => {
    const dim = mockAttribute('Category');
    render(
      <TestChart
        {...makeProps({ dataOptions: { categories: [], values: [], breakBy: [{ column: dim }] } })}
      />,
    );
    expect(lastProps()).toEqual(
      expect.objectContaining({ dataOptions: expect.objectContaining({ breakBy: [dim] }) }),
    );
  });

  it('passes filters through to LineChart unchanged', () => {
    const filters = [{ jaql: { dim: '[Commerce.Date]' } }] as unknown as Filter[];
    render(<TestChart {...makeProps({ filters })} />);
    expect(lastProps()).toEqual(expect.objectContaining({ filters }));
  });

  it('passes styleOptions through to LineChart', () => {
    const styleOptions = {
      subtype: 'line/spline',
      legend: { enabled: false },
    } as unknown as StyleOptions;
    render(<TestChart {...makeProps({ styleOptions })} />);
    expect(lastProps()).toEqual(
      expect.objectContaining({ styleOptions: expect.objectContaining(styleOptions) }),
    );
  });
});
