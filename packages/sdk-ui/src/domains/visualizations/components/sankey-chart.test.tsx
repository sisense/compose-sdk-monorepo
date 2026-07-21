/** @vitest-environment jsdom */
import type { Data } from '@sisense/sdk-data';
import { render } from '@testing-library/react';

import { withBlurredRows } from '../../../__test-helpers__';
import { HighchartsOptions } from '../core/chart-options-processor/chart-options-service';
import { Chart } from './chart';

// Mocks highcharts so JSDOM tests do not hit Highcharts init failures in this environment
vi.mock('highcharts-react-official', async () => {
  const { MockedHighchartsReact }: typeof import('../../../__test-helpers__') =
    await vi.importActual('../../../__test-helpers__');
  return {
    default: MockedHighchartsReact,
  };
});

const dataSet: Data = {
  columns: [
    { name: 'Source', type: 'string' },
    { name: 'Target', type: 'string' },
    { name: 'Quantity', type: 'number' },
  ],
  rows: [
    ['A', 'X', 10],
    ['B', 'Y', 5],
    ['C', 'X', 3],
  ],
};

const sourceCategory = {
  name: 'Source',
  type: 'string',
};

const targetCategory = {
  name: 'Target',
  type: 'string',
};

const quantityMeasure = {
  column: { name: 'Quantity', aggregation: 'sum' },
  showOnRightAxis: false,
};

type SankeyLinkOptions = { from: string; to: string; linkOpacity?: number };
type SankeyNodeOptions = { id: string; opacity?: number };
type SankeySeriesOptions = {
  data: SankeyLinkOptions[];
  nodes: SankeyNodeOptions[];
};

function getSankeySeries(options: HighchartsOptions | undefined): SankeySeriesOptions {
  const series = options?.series?.[0];
  if (!series || typeof series !== 'object') {
    throw new Error('Expected sankey series options');
  }

  const candidate = series as { data?: unknown; nodes?: unknown };
  if (!Array.isArray(candidate.data) || !Array.isArray(candidate.nodes)) {
    throw new Error('Expected sankey series to include data and nodes arrays');
  }

  return {
    data: candidate.data as SankeyLinkOptions[],
    nodes: candidate.nodes as SankeyNodeOptions[],
  };
}

describe('Sankey Chart', () => {
  it('renders a sankey via Chart with highlight blur on nodes and links', async () => {
    let highchartsOptions: HighchartsOptions | undefined;

    const chartProps = {
      chartType: 'sankey' as const,
      dataOptions: {
        category: [sourceCategory, targetCategory],
        value: quantityMeasure,
      },
      onBeforeRender: (options: HighchartsOptions) => {
        highchartsOptions = options;
        return options;
      },
    };

    const { findByTestId, rerender } = render(
      <Chart {...chartProps} dataSet={withBlurredRows(dataSet, [1])} />,
    );

    expect(await findByTestId('chart-root')).toBeInTheDocument();
    expect(highchartsOptions).toBeDefined();

    const { data: links, nodes } = getSankeySeries(highchartsOptions);

    expect(links).toHaveLength(3);
    expect(links.find((link) => link.from === '0__A' && link.to === '1__X')?.linkOpacity).toBe(0.5);
    expect(links.find((link) => link.from === '0__B' && link.to === '1__Y')?.linkOpacity).toBe(0.1);
    expect(links.find((link) => link.from === '0__C' && link.to === '1__X')?.linkOpacity).toBe(0.5);

    expect(nodes).toHaveLength(5);
    expect(nodes.find((node) => node.id === '0__A')?.opacity).toBe(1);
    expect(nodes.find((node) => node.id === '0__B')?.opacity).toBe(0.1);
    expect(nodes.find((node) => node.id === '0__C')?.opacity).toBe(1);
    expect(nodes.find((node) => node.id === '1__X')?.opacity).toBe(1);
    expect(nodes.find((node) => node.id === '1__Y')?.opacity).toBe(0.1);

    // Clear highlights and assert previously blurred nodes/links reset opacity
    highchartsOptions = undefined;
    rerender(<Chart {...chartProps} dataSet={withBlurredRows(dataSet, [])} />);

    expect(highchartsOptions).toBeDefined();
    const { data: updatedLinks, nodes: updatedNodes } = getSankeySeries(highchartsOptions);

    expect(updatedLinks).toHaveLength(3);
    updatedLinks.forEach((link) => expect(link.linkOpacity).toBe(0.5));
    expect(updatedNodes).toHaveLength(5);
    updatedNodes.forEach((node) => expect(node.opacity).toBe(1));
  });
});
