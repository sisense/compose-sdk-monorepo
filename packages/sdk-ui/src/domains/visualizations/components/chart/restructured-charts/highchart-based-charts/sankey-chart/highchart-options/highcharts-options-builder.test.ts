import { TFunction } from 'i18next';
import { describe, expect, it, vi } from 'vitest';

import { SankeyChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types';
import { SankeyChartDesignOptions } from '@/domains/visualizations/core/chart-options-processor/translations/design-options';
import { HighchartsDataPointContext } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip-utils';
import { getDefaultThemeSettings } from '@/infra/contexts/theme-provider/default-theme-settings';

import { BuildContext } from '../../types.js';
import { SankeyChartData } from '../types.js';
import { sankeyHighchartsOptionsBuilder } from './highcharts-options-builder.js';

function callSankeyTooltipFormatter(
  tooltip: ReturnType<typeof sankeyHighchartsOptionsBuilder.getTooltip>,
  context: HighchartsDataPointContext,
): string {
  expect(tooltip).toBeDefined();
  const formatter = tooltip?.formatter;
  expect(formatter).toBeDefined();
  const result = formatter!.call(context);
  expect(result).toBeTypeOf('string');
  return result as string;
}

const extraConfig = {
  translate: vi.fn((key: string) => key) as unknown as TFunction,
  themeSettings: getDefaultThemeSettings(),
  dateFormatter: vi.fn(() => 'formatted-date'),
  accessibilityEnabled: false,
  defaultNumberFormattingEnabled: false,
};

const baseChartData: SankeyChartData = {
  type: 'sankey',
  links: [
    { from: 'A', to: 'B', weight: 10 },
    { from: 'B', to: 'C', weight: 4 },
  ],
  nodes: [{ id: 'A', name: 'Alpha' }, { id: 'B', color: '#00aa00' }, { id: 'C' }],
};

const baseDataOptions = {
  value: {
    column: { name: 'measure_id', type: 'numeric', title: 'Revenue' },
  },
} as unknown as SankeyChartDataOptionsInternal;

const baseDesignOptions = {
  orientation: 'horizontal' as const,
  linkOpacity: 0.4,
  curveFactor: 0.25,
  nodePadding: 8,
  nodeWidth: 18,
  legend: { enabled: false },
} as SankeyChartDesignOptions;

function createContext(
  overrides: Partial<{
    chartData: SankeyChartData;
    dataOptions: SankeyChartDataOptionsInternal;
    designOptions: SankeyChartDesignOptions;
  }> = {},
): BuildContext<'sankey'> {
  return {
    chartData: overrides.chartData ?? baseChartData,
    dataOptions: overrides.dataOptions ?? baseDataOptions,
    designOptions: { ...baseDesignOptions, ...overrides.designOptions },
    extraConfig,
  };
}

describe('sankeyHighchartsOptionsBuilder', () => {
  describe('getChart', () => {
    it('does not invert when orientation is horizontal', () => {
      const chart = sankeyHighchartsOptionsBuilder.getChart(createContext());
      expect(chart.type).toBe('sankey');
      // Emit `inverted` explicitly — `chart.update()` treats omitted props as "no change",
      // so toggling from vertical→horizontal would otherwise leave the chart stuck inverted.
      expect(chart.inverted).toBe(false);
    });

    it('inverts when orientation is vertical', () => {
      const chart = sankeyHighchartsOptionsBuilder.getChart(
        createContext({ designOptions: { ...baseDesignOptions, orientation: 'vertical' } }),
      );
      expect(chart.inverted).toBe(true);
    });
  });

  describe('getSeries', () => {
    it('maps links and nodes with defaults for optional styling', () => {
      const series = sankeyHighchartsOptionsBuilder.getSeries(createContext());
      expect(series).toHaveLength(1);
      const s = series[0] as Record<string, unknown>;
      expect(s.type).toBe('sankey');
      expect(s.name).toBe('measure_id');
      expect(s.data).toEqual([
        { from: 'A', to: 'B', weight: 10, linkOpacity: 0.4 },
        { from: 'B', to: 'C', weight: 4, linkOpacity: 0.4 },
      ]);
      expect(s.nodes).toEqual([
        {
          id: 'A',
          name: 'Alpha',
          color: '#00cee6',
          opacity: 1,
          custom: { rawValue: undefined },
        },
        { id: 'B', name: 'B', color: '#00aa00', opacity: 1, custom: { rawValue: undefined } },
        // C gets palette[2], not palette[1]: B reserves its palette slot even though it has
        // an explicit color, so customising one node never shifts the colors of others.
        { id: 'C', name: 'C', color: '#6eda55', opacity: 1, custom: { rawValue: undefined } },
      ]);
      expect(s.linkOpacity).toBe(0.4);
      expect(s.curveFactor).toBe(0.25);
      expect(s.nodePadding).toBe(8);
      expect(s.nodeWidth).toBe(18);
      expect(s.minLinkWidth).toBe(1);
      expect(s.nodeAlignment).toBeUndefined();
    });

    it('includes nodeAlignment when set on design options', () => {
      const series = sankeyHighchartsOptionsBuilder.getSeries(
        createContext({ designOptions: { ...baseDesignOptions, nodeAlignment: 'center' } }),
      );
      expect((series[0] as { nodeAlignment?: string }).nodeAlignment).toBe('center');
    });

    it('falls back to defaults when design numeric options are omitted', () => {
      const series = sankeyHighchartsOptionsBuilder.getSeries(
        createContext({
          designOptions: {
            ...baseDesignOptions,
            linkOpacity: undefined,
            curveFactor: undefined,
            nodePadding: undefined,
            nodeWidth: undefined,
          },
        }),
      );
      const s = series[0] as Record<string, unknown>;
      expect(s.linkOpacity).toBe(0.5);
      expect(s.curveFactor).toBe(0.33);
      expect(s.nodePadding).toBe(10);
      expect(s.nodeWidth).toBe(20);
      expect(s.minLinkWidth).toBe(1);
    });

    it('dims blurred nodes/links when highlight is active', () => {
      const chartData: SankeyChartData = {
        type: 'sankey',
        links: [
          { from: 'A', to: 'X', weight: 10 },
          { from: 'B', to: 'X', weight: 4 },
        ],
        nodes: [
          { id: 'A', name: 'A', blur: false },
          { id: 'B', name: 'B', blur: true },
          { id: 'X', name: 'X', blur: false },
        ],
      };
      const series = sankeyHighchartsOptionsBuilder.getSeries(createContext({ chartData }));
      const s = series[0] as Record<string, unknown>;
      const data = s.data as { from: string; linkOpacity: number }[];
      const nodes = s.nodes as { id: string; opacity: number }[];
      expect(data.find((l) => l.from === 'A')?.linkOpacity).toBe(0.4);
      expect(data.find((l) => l.from === 'B')?.linkOpacity).toBe(0.1);
      expect(nodes.find((n) => n.id === 'A')?.opacity).toBe(1);
      expect(nodes.find((n) => n.id === 'B')?.opacity).toBe(0.1);
    });

    it('dims link when destination node is blurred (toBlur)', () => {
      const chartData: SankeyChartData = {
        type: 'sankey',
        links: [
          { from: 'A', to: 'X', weight: 10 },
          { from: 'A', to: 'Y', weight: 4 },
        ],
        nodes: [
          { id: 'A', name: 'A', blur: false },
          { id: 'X', name: 'X', blur: false },
          { id: 'Y', name: 'Y', blur: true },
        ],
      };
      const series = sankeyHighchartsOptionsBuilder.getSeries(createContext({ chartData }));
      const s = series[0] as Record<string, unknown>;
      const data = s.data as { to: string; linkOpacity: number }[];
      const nodes = s.nodes as { id: string; opacity: number }[];
      expect(data.find((l) => l.to === 'X')?.linkOpacity).toBe(0.4);
      expect(data.find((l) => l.to === 'Y')?.linkOpacity).toBe(0.1);
      expect(nodes.find((n) => n.id === 'X')?.opacity).toBe(1);
      expect(nodes.find((n) => n.id === 'Y')?.opacity).toBe(0.1);
    });

    it('always emits full opacity when highlight is cleared (chart.update-safe)', () => {
      const series = sankeyHighchartsOptionsBuilder.getSeries(createContext());
      const s = series[0] as Record<string, unknown>;
      const data = s.data as { linkOpacity: number }[];
      const nodes = s.nodes as { opacity: number }[];
      data.forEach((l) => expect(l.linkOpacity).toBe(0.4));
      nodes.forEach((n) => expect(n.opacity).toBe(1));
    });

    it('assigns theme palette colors to nodes without explicit colors', () => {
      const chartData: SankeyChartData = {
        type: 'sankey',
        links: [{ from: '0__A', to: '1__X', weight: 1 }],
        nodes: [
          { id: '0__A', name: 'A' },
          { id: '1__X', name: 'X' },
          { id: '1__Y', name: 'Y' },
        ],
      };
      const series = sankeyHighchartsOptionsBuilder.getSeries(createContext({ chartData }));
      const s = series[0] as Record<string, unknown>;
      const nodeColors = (s.nodes as { name: string; color: string }[]).map((n) => [
        n.name,
        n.color,
      ]);
      expect(nodeColors).toEqual([
        ['A', '#00cee6'],
        ['X', '#9b9bd7'],
        ['Y', '#6eda55'],
      ]);
    });

    it('prefers seriesToColorMap over palette when node has no pre-set color', () => {
      const chartData: SankeyChartData = {
        type: 'sankey',
        links: [{ from: '0__A', to: '1__X', weight: 1 }],
        nodes: [
          { id: '0__A', name: 'A' },
          { id: '1__X', name: 'X' },
        ],
      };
      const dataOptions = {
        ...baseDataOptions,
        category: [
          { column: { name: 'Source', type: 'text' } },
          { column: { name: 'Target', type: 'text' } },
        ],
        seriesToColorMap: { A: '#ff0000' },
      } as unknown as SankeyChartDataOptionsInternal;
      const series = sankeyHighchartsOptionsBuilder.getSeries(
        createContext({ chartData, dataOptions }),
      );
      const s = series[0] as Record<string, unknown>;
      const nodes = s.nodes as { name: string; color: string }[];
      expect(nodes.find((n) => n.name === 'A')?.color).toBe('#ff0000');
      // X gets palette[1], not palette[0]: A reserves its palette slot even though
      // it resolves via seriesToColorMap, so customising one node never shifts others.
      expect(nodes.find((n) => n.name === 'X')?.color).toBe('#9b9bd7');
    });

    it('supports MultiColumnValueToColorMap keyed by category column', () => {
      const chartData: SankeyChartData = {
        type: 'sankey',
        links: [{ from: '0__A', to: '1__X', weight: 1 }],
        nodes: [
          { id: '0__A', name: 'A' },
          { id: '1__X', name: 'X' },
        ],
      };
      const dataOptions = {
        ...baseDataOptions,
        category: [
          { column: { name: 'Source', type: 'text' } },
          { column: { name: 'Target', type: 'text' } },
        ],
        seriesToColorMap: {
          Source: { A: '#ff0000' },
          Target: { X: '#00ff00' },
        },
      } as unknown as SankeyChartDataOptionsInternal;
      const series = sankeyHighchartsOptionsBuilder.getSeries(
        createContext({ chartData, dataOptions }),
      );
      const s = series[0] as Record<string, unknown>;
      const nodes = s.nodes as { id: string; color: string }[];
      expect(nodes.find((n) => n.id === '0__A')?.color).toBe('#ff0000');
      expect(nodes.find((n) => n.id === '1__X')?.color).toBe('#00ff00');
    });
  });

  describe('getAxes', () => {
    it('returns undefined axes for Highcharts compatibility', () => {
      expect(sankeyHighchartsOptionsBuilder.getAxes(createContext())).toEqual({
        xAxis: undefined,
        yAxis: undefined,
      });
    });
  });

  describe('getLegend', () => {
    it('delegates to legend settings from design options', () => {
      const legend = sankeyHighchartsOptionsBuilder.getLegend(
        createContext({ designOptions: { ...baseDesignOptions, legend: { enabled: true } } }),
      );
      expect(legend?.enabled).toBe(true);
    });
  });

  describe('getPlotOptions', () => {
    it('returns minimal series options (node label alignment is set globally via applyHighchartOverrides)', () => {
      expect(sankeyHighchartsOptionsBuilder.getPlotOptions(createContext())).toEqual({
        series: {},
      });
    });
  });

  describe('getTooltip', () => {
    it('applies the same tooltip chrome as other chart types', () => {
      const tooltip = sankeyHighchartsOptionsBuilder.getTooltip(createContext());
      expect(tooltip).toMatchObject({
        animation: false,
        backgroundColor: '#FFFFFF',
        borderColor: '#CCCCCC',
        borderRadius: 10,
        borderWidth: 1,
        useHTML: true,
      });
    });

    it('formats node tooltip with measure title and sum', () => {
      const tooltip = sankeyHighchartsOptionsBuilder.getTooltip(createContext());
      const html = callSankeyTooltipFormatter(tooltip, {
        series: { name: 's', color: '#111' },
        x: '',
        y: 0,
        point: {
          name: 'Alpha',
          color: '#111',
          isNode: true,
          sum: 1250.5,
        },
      } as HighchartsDataPointContext);
      expect(html).toContain('Revenue');
      expect(html).toContain('Alpha');
      expect(html).toMatch(/1[.,]25K|1250/);
      // Reuses the shared tooltipWrapper markup instead of hand-rolled HTML.
      expect(html).toContain('min-width: 100px');
    });

    it('formats link tooltip with endpoints and weight', () => {
      const tooltip = sankeyHighchartsOptionsBuilder.getTooltip(createContext());
      const html = callSankeyTooltipFormatter(tooltip, {
        series: { name: 's', color: '#111' },
        x: '',
        y: 0,
        point: {
          name: '',
          color: '#111',
          isNode: false,
          weight: 42,
          fromNode: { name: 'East' },
          toNode: { name: 'West' },
        },
      } as HighchartsDataPointContext);
      expect(html).toContain('East');
      expect(html).toContain('West');
      expect(html).toContain('42');
    });

    it('still formats link tooltip when endpoint names are missing', () => {
      const tooltip = sankeyHighchartsOptionsBuilder.getTooltip(createContext());
      const html = callSankeyTooltipFormatter(tooltip, {
        series: { name: 's', color: '#111' },
        x: '',
        y: 0,
        point: {
          name: '',
          color: '#111',
          isNode: false,
          weight: 7,
          fromNode: {},
          toNode: {},
        },
      } as HighchartsDataPointContext);
      expect(html).toContain('7');
      expect(html).toMatch(/\u2192|→/);
      expect(html).toContain('\u2014');
    });

    it('uses column.name when title is missing', () => {
      const dataOptions = {
        value: { column: { name: 'only_name', type: 'numeric' } },
      } as unknown as SankeyChartDataOptionsInternal;
      const tooltip = sankeyHighchartsOptionsBuilder.getTooltip(createContext({ dataOptions }));
      const html = callSankeyTooltipFormatter(tooltip, {
        series: { name: 's', color: '#111' },
        x: '',
        y: 0,
        point: {
          name: 'N',
          color: '#111',
          isNode: true,
          sum: 1,
        },
      } as HighchartsDataPointContext);
      expect(html).toContain('only_name');
    });

    it('uses column.name when title is only whitespace', () => {
      const dataOptions = {
        value: { column: { name: 'fallback_measure', type: 'numeric', title: '   ' } },
      } as unknown as SankeyChartDataOptionsInternal;
      const tooltip = sankeyHighchartsOptionsBuilder.getTooltip(createContext({ dataOptions }));
      const html = callSankeyTooltipFormatter(tooltip, {
        series: { name: 's', color: '#111' },
        x: '',
        y: 0,
        point: {
          name: 'N',
          color: '#111',
          isNode: true,
          sum: 1,
        },
      } as HighchartsDataPointContext);
      expect(html).toContain('fallback_measure');
      // The raw whitespace-only title must not leak through as the rendered label.
      expect(html).not.toContain('   <br');
    });
  });

  describe('getExtras', () => {
    it('hides chart title', () => {
      expect(sankeyHighchartsOptionsBuilder.getExtras(createContext())).toEqual({
        title: { text: null },
      });
    });
  });
});
