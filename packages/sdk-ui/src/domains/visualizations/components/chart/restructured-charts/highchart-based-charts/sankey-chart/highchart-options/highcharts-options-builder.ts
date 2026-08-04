import {
  colorChineseSilver,
  colorWhite,
} from '@/domains/visualizations/core/chart-data-options/coloring/consts.js';
import { getPaletteColor } from '@/domains/visualizations/core/chart-data-options/coloring/utils.js';
import type { SankeyChartDataOptionsInternal } from '@/domains/visualizations/core/chart-data-options/types.js';
import type { PlotOptions } from '@/domains/visualizations/core/chart-options-processor/chart-options-service';
import { getLegendSettings } from '@/domains/visualizations/core/chart-options-processor/translations/legend-section';
import {
  applyFormat,
  getCompleteNumberFormatConfig,
} from '@/domains/visualizations/core/chart-options-processor/translations/number-format-config';
import {
  spanSegment,
  tooltipWrapper,
} from '@/domains/visualizations/core/chart-options-processor/translations/scatter-tooltip.js';
import { HighchartsDataPointContext } from '@/domains/visualizations/core/chart-options-processor/translations/tooltip-utils';
import type { SeriesPointStructure } from '@/domains/visualizations/core/chart-options-processor/translations/translations-to-highcharts';
import type { Color } from '@/types';

import type { HighchartsOptionsBuilder } from '../../types';
import { getSankeyNodeColorFromMap } from '../sankey-node-colors.js';
import type { SankeyNode } from '../types.js';

/**
 * Resolves node colors: explicit node color, then seriesToColorMap, then theme palette.
 *
 * Palette indices are reserved by order-of-first-appearance for every node,
 * INCLUDING nodes that ultimately return an explicit color. If we only
 * assigned indices for nodes that fall through to the palette, then picking
 * a color for one node would shift the palette for every node that appears
 * after it — causing unrelated nodes to change color whenever the user
 * customises one. Reserving the slot up front keeps the mapping stable.
 */
function resolveSankeyNodeColor(
  node: SankeyNode,
  paletteIndexByDisplayName: Map<string, number>,
  dataOptions: SankeyChartDataOptionsInternal,
  paletteColors: Color[] | undefined,
): string {
  const displayName = node.name ?? node.id;
  if (!paletteIndexByDisplayName.has(displayName)) {
    paletteIndexByDisplayName.set(displayName, paletteIndexByDisplayName.size);
  }

  if (node.color) {
    return node.color;
  }

  const mappedColor = getSankeyNodeColorFromMap(
    node.id,
    displayName,
    dataOptions.category,
    dataOptions.seriesToColorMap,
  );
  if (mappedColor) {
    return mappedColor;
  }

  return getPaletteColor(paletteColors, paletteIndexByDisplayName.get(displayName)!);
}

/** Sankey link data point — extends SeriesPointStructure so the array is assignable without casting. */
type SankeyDataPoint = SeriesPointStructure & {
  from: string;
  to: string;
  weight: number;
  linkOpacity?: number;
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
      inverted: ctx.designOptions.orientation === 'vertical',
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
            linkOpacity: isHighlightActive && isLinkBlurred ? blurOpacity : baseOpacity,
          };
        }),
        nodes: nodes.map((n) => ({
          id: n.id,
          name: n.name ?? n.id,
          color: resolveSankeyNodeColor(n, paletteIndexByDisplayName, dataOptions, paletteColors),
          // Same as links: always set opacity so updates clear prior blur state.
          opacity: n.blur === true ? blurOpacity : 1,
          custom: { rawValue: n.rawValue },
        })),
        linkOpacity: baseOpacity,
        curveFactor: designOptions.curveFactor ?? 0.33,
        nodePadding: designOptions.nodePadding ?? 10,
        nodeWidth: designOptions.nodeWidth ?? 20,
        minLinkWidth: designOptions.minLinkWidth ?? 1,
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
      animation: false,
      backgroundColor: colorWhite,
      borderColor: colorChineseSilver,
      borderRadius: 10,
      borderWidth: 1,
      useHTML: true,
      formatter: function (this: HighchartsDataPointContext) {
        const ctx = this as SankeyTooltipContext;
        if (ctx.point.isNode) {
          return tooltipWrapper(
            `${seriesName}<br/>` +
              `${ctx.point.name}: ${spanSegment(formatValue(ctx.point.sum), ctx.point.color)}`,
          );
        }
        const fromLabel = formatLinkEndpointLabel(ctx.point.fromNode?.name);
        const toLabel = formatLinkEndpointLabel(ctx.point.toNode?.name);
        return tooltipWrapper(
          `${seriesName}<br/>` +
            `${fromLabel} \u2192 ${toLabel}: ` +
            `${spanSegment(formatValue(ctx.point.weight), ctx.point.color)}`,
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
