import DOMPurify from 'dompurify';

import { getPaletteColor } from '@/domains/visualizations/core/chart-data-options/coloring/utils.js';
import type { SankeyChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import type { PlotOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service';
import { getLegendSettings } from '@/domains/visualizations/core/chart-options-processor/translations/legend-section';
import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config';
import { HighchartsDataPointContext } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip-utils';
import type { SeriesPointStructure } from '@/domains/visualizations/core/chart-options-processor/translations/translations-to-highcharts';
import type { Color } from '@/types';

import type { HighchartsOptionsBuilder } from '../../types';
import { getSankeyNodeColorFromMap } from '../sankey-node-colors.js';
import type { SankeyNode } from '../types.js';

/**
 * Resolves node colors: explicit node color, then seriesToColorMap, then theme palette.
 * Palette indices are stable per display name (same pattern as funnel/treemap charts).
 */
function resolveSankeyNodeColor(
  node: SankeyNode,
  paletteIndexByDisplayName: Map<string, number>,
  dataOptions: SankeyChartDataOptionsInternal,
  paletteColors: Color[] | undefined,
): string {
  if (node.color) {
    return node.color;
  }

  const displayName = node.name ?? node.id;
  const mappedColor = getSankeyNodeColorFromMap(
    node.id,
    displayName,
    dataOptions.category,
    dataOptions.seriesToColorMap,
  );
  if (mappedColor) {
    return mappedColor;
  }

  if (!paletteIndexByDisplayName.has(displayName)) {
    paletteIndexByDisplayName.set(displayName, paletteIndexByDisplayName.size);
  }

  return getPaletteColor(paletteColors, paletteIndexByDisplayName.get(displayName)!);
}

/** Sankey link data point — extends SeriesPointStructure so the array is assignable without casting. */
type SankeyDataPoint = SeriesPointStructure & {
  from: string;
  to: string;
  weight: number;
};

/** Narrowed tooltip context for Sankey — adds node/link specific fields to the base point. */
type SankeyTooltipContext = HighchartsDataPointContext & {
  point: HighchartsDataPointContext['point'] & {
    isNode: boolean;
    sum: number;
    weight: number;
    fromNode?: { name?: string };
    toNode?: { name?: string };
  };
};

/** Builds Highcharts series/chart/plot options for the Sankey chart type. */
export const sankeyHighchartsOptionsBuilder: HighchartsOptionsBuilder<'sankey'> = {
  getChart(ctx) {
    return {
      type: 'sankey',
      polar: false,
      spacing: [20, 20, 20, 20],
      alignTicks: false,
      ...(ctx.designOptions.orientation === 'vertical' ? { inverted: true } : {}),
    };
  },

  getSeries(ctx) {
    const { links, nodes } = ctx.chartData;
    const { designOptions, dataOptions, extraConfig } = ctx;
    const blurOpacity = 0.1;
    const baseOpacity = designOptions.linkOpacity ?? 0.5;
    const paletteIndexByDisplayName = new Map<string, number>();
    const paletteColors = extraConfig.themeSettings?.palette?.variantColors;

    return [
      {
        type: 'sankey',
        name: dataOptions.value.column.name,
        data: links.map((l): SankeyDataPoint => {
          const fromBlur = nodes.find((n) => n.id === l.from)?.blur;
          const toBlur = nodes.find((n) => n.id === l.to)?.blur;
          const isLinkBlurred = fromBlur === true || toBlur === true;
          const isHighlightActive = nodes.some((n) => n.blur !== undefined);
          return {
            from: l.from,
            to: l.to,
            weight: l.weight,
            ...(isHighlightActive
              ? { linkOpacity: isLinkBlurred ? blurOpacity : baseOpacity }
              : {}),
          };
        }),
        nodes: nodes.map((n) => ({
          id: n.id,
          name: n.name ?? n.id,
          color: resolveSankeyNodeColor(n, paletteIndexByDisplayName, dataOptions, paletteColors),
          ...(n.blur !== undefined ? { opacity: n.blur ? blurOpacity : 1 } : {}),
          custom: { rawValue: n.rawValue },
        })),
        linkOpacity: baseOpacity,
        curveFactor: designOptions.curveFactor ?? 0.33,
        nodePadding: designOptions.nodePadding ?? 10,
        nodeWidth: designOptions.nodeWidth ?? 20,
        // Sankey data points are always objects ({from, to, weight}), never plain numbers.
        // Setting turboThreshold to 0 disables turbo mode so error #15 is never thrown.
        turboThreshold: 0,
        ...(designOptions.nodeAlignment ? { nodeAlignment: designOptions.nodeAlignment } : {}),
      },
    ];
  },

  getAxes() {
    // Sankey series inherits axisTypes from ColumnSeries and tries to bind axes.
    // Returning undefined lets Highcharts create default (invisible) axes so
    // binding succeeds without throwing error #18.
    return { xAxis: undefined, yAxis: undefined };
  },

  getLegend(ctx) {
    return getLegendSettings(ctx.designOptions.legend);
  },

  getPlotOptions(): PlotOptions {
    return { series: {} };
  },

  getTooltip(ctx) {
    const { column, numberFormatConfig } = ctx.dataOptions.value;
    const trimmedTitle = column.title?.trim();
    const seriesName =
      trimmedTitle !== undefined && trimmedTitle.length > 0 ? trimmedTitle : column.name;
    const fmt = getCompleteNumberFormatConfig(numberFormatConfig);
    const formatValue = (v: number) => applyFormat(fmt, v);
    const formatLinkEndpointLabel = (name: string | undefined) => {
      const t = name?.trim();
      return t !== undefined && t.length > 0 ? t : '\u2014';
    };

    return {
      useHTML: true,
      formatter: function (this: HighchartsDataPointContext) {
        const ctx = this as SankeyTooltipContext;
        if (ctx.point.isNode) {
          return DOMPurify.sanitize(
            `<span style="font-size:11px">${seriesName}</span><br/>` +
              `<b>${ctx.point.name}</b>: ${formatValue(ctx.point.sum)}`,
          );
        }
        const fromLabel = formatLinkEndpointLabel(ctx.point.fromNode?.name);
        const toLabel = formatLinkEndpointLabel(ctx.point.toNode?.name);
        return DOMPurify.sanitize(
          `<span style="font-size:11px">${seriesName}</span><br/>` +
            `${fromLabel} \u2192 ${toLabel}: ` +
            `<b>${formatValue(ctx.point.weight)}</b>`,
        );
      },
    };
  },

  getExtras() {
    return {
      title: { text: null },
    };
  },
};
