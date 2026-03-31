import React from 'react';

import type { Filter } from '@sisense/sdk-data';
import type { CustomVisualizationProps } from '@sisense/sdk-ui';
import { render } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import type { DataOptions, StyleOptions } from '../types.js';
import { Chart } from './Chart.js';

// CustomVisualization<T> has return type ReactNode (includes undefined), so TypeScript
// rejects it as a JSX element directly. Cast to a concrete ComponentType for tests.
const TestChart = Chart as React.ComponentType<any>;

const { mockLineChart } = vi.hoisted(() => ({ mockLineChart: vi.fn(() => null) }));

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

describe('Chart (line-chart template)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders without error', () => {
    expect(() => render(<TestChart {...makeProps()} />)).not.toThrow();
  });

  it('passes dataSource as dataSet to LineChart', () => {
    render(<TestChart {...makeProps({ dataSource: 'MyDataSource' })} />);
    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({ dataSet: 'MyDataSource' }),
      expect.anything(),
    );
  });

  it('maps categories columns to the category array', () => {
    const cat = mockAttribute('OrderDate');
    render(
      <TestChart
        {...makeProps({ dataOptions: { categories: [{ column: cat }], values: [], breakBy: [] } })}
      />,
    );
    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({
        dataOptions: expect.objectContaining({ category: [cat] }),
      }),
      expect.anything(),
    );
  });

  it('produces an empty category array when categories is empty', () => {
    render(
      <TestChart {...makeProps({ dataOptions: { categories: [], values: [], breakBy: [] } })} />,
    );
    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({
        dataOptions: expect.objectContaining({ category: [] }),
      }),
      expect.anything(),
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
    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({
        dataOptions: expect.objectContaining({ value: [measure] }),
      }),
      expect.anything(),
    );
  });

  it('maps breakBy columns to the breakBy array', () => {
    const dim = mockAttribute('Category');
    render(
      <TestChart
        {...makeProps({ dataOptions: { categories: [], values: [], breakBy: [{ column: dim }] } })}
      />,
    );
    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({
        dataOptions: expect.objectContaining({ breakBy: [dim] }),
      }),
      expect.anything(),
    );
  });

  it('passes filters through to LineChart unchanged', () => {
    const filters = [{ jaql: { dim: '[Commerce.Date]' } }] as unknown as Filter[];
    render(<TestChart {...makeProps({ filters })} />);
    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({ filters }),
      expect.anything(),
    );
  });

  it('passes styleOptions through to LineChart', () => {
    const styleOptions = {
      subtype: 'line/spline',
      legend: { enabled: false },
    } as unknown as StyleOptions;
    render(<TestChart {...makeProps({ styleOptions })} />);
    expect(mockLineChart).toHaveBeenCalledWith(
      expect.objectContaining({ styleOptions: expect.objectContaining(styleOptions) }),
      expect.anything(),
    );
  });
});
