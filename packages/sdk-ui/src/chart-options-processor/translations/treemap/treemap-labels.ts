import Highcharts, {
  Chart,
  OptionsLayoutAlgorithmValue,
  PlotTreegraphLevelsColorVariationOptions,
  PlotTreegraphLevelsDataLabelsOptions,
  PlotTreegraphLevelsOptions,
  PlotTreemapLevelsDataLabelsOptions,
  PlotTreemapOptions,
  Point,
  PointLabelObject,
} from '@sisense/sisense-charts';

import { prepareDataLabelsOptions } from '@/chart-options-processor/series-labels';

import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CompleteThemeSettings, TreemapSeriesLabels } from '../../../types';
import { getDarkFactor, toColor } from '../../../utils/color';
import { TreemapChartDesignOptions } from '../design-options';
import { LayoutPointResult, ParentValues, TreemapLayoutAlgorithmContext } from './types';

const LIGHT_COLOR = 'rgb(255, 255, 255)';
const DARK_COLOR = 'rgb(43, 51, 66)';
const BIG_LABEL_HEIGHT = 20;
const BIG_SPACING = 4;
const MIDDLE_SPACING = 2;
const SMALL_SPACING = 1;
const MIN_POINT_HEIGHT_FOR_BIG_LABEL = BIG_LABEL_HEIGHT * 2;
const MIN_POINT_HEIGHT_FOR_MIDDLE_LABEL = 26;
const MIN_POINT_HEIGHT_FOR_SMALL_LABEL = 20;
const MIN_POINT_WIDTH_FOR_LABEL = 35;
const BIG_LABEL_TOP_SPACING = BIG_LABEL_HEIGHT + BIG_SPACING - 2;
const DEFAULT_COLOR_VARIATION = {
  key: 'brightness',
  to: 0.15,
} as PlotTreegraphLevelsColorVariationOptions;

// eslint-disable-next-line
Highcharts.Series.types.treemap.prototype['squarifiedWithTopSpacing'] = function (
  this: TreemapLayoutAlgorithmContext,
  parent: ParentValues,
  children: PointLabelObject[],
) {
  const pxToLayoutHeight = transformPxToLayoutVertical(parent.height, this.chart.plotHeight);
  const result: LayoutPointResult[] = this.squarified(parent, children);
  const topLabelSpace = pxToLayoutHeight(BIG_LABEL_TOP_SPACING);

  return isBigLabelEnabled(this.chart)
    ? result.map((item, index) => {
        const enoughHeightForLabel =
          item.height >= pxToLayoutHeight(MIN_POINT_HEIGHT_FOR_BIG_LABEL);
        children[index].point.options.custom!.bigLabelSpacing = enoughHeightForLabel;

        if (enoughHeightForLabel) {
          item.height = item.height - topLabelSpace;
          item.y = item.y + topLabelSpace;
        }
        return item;
      })
    : result;
};

export function prepareTreemapLevels(
  dataOptions: CategoricalChartDataOptionsInternal,
  chartDesignOptions: TreemapChartDesignOptions,
  themeSettings?: CompleteThemeSettings,
) {
  const levels = createDefaultTreemapLevels();

  if (dataOptions.breakBy.length === 1) {
    levels[0].borderWidth = SMALL_SPACING;
    levels[0].borderColor = 'black';
    levels[0].layoutAlgorithm = 'strip';
    levels[0].dataLabels = levels[1].dataLabels;
  }
  if (dataOptions.breakBy.length === 2) {
    levels[1].borderWidth = SMALL_SPACING;
    levels[1].borderColor = 'black';
  }

  if (dataOptions.breakBy.some(({ isColored }) => isColored)) {
    levels[1].colorVariation = DEFAULT_COLOR_VARIATION;
    levels[2].colorVariation = DEFAULT_COLOR_VARIATION;
  }

  levels.forEach((level, index) => {
    const datalabels = level.dataLabels as PlotTreegraphLevelsDataLabelsOptions;
    if (chartDesignOptions?.labels?.category) {
      datalabels.enabled = chartDesignOptions.labels?.category?.[index]?.enabled ?? true;
    }
    if (themeSettings?.typography?.fontFamily) {
      datalabels.style = {
        ...datalabels.style,
        fontFamily: themeSettings?.typography?.fontFamily,
      };
    }
    if (chartDesignOptions.seriesLabels) {
      const seriesLabels = Array.isArray(chartDesignOptions.seriesLabels)
        ? chartDesignOptions.seriesLabels[index]
        : chartDesignOptions.seriesLabels;
      const isBigLabelCase =
        level.layoutAlgorithm === ('squarifiedWithTopSpacing' as OptionsLayoutAlgorithmValue);
      const dataLabelsOptions = isBigLabelCase
        ? prepareDataLabelsOptions({ enabled: seriesLabels?.enabled })
        : prepareDataLabelsOptions(seriesLabels);
      level.dataLabels = {
        ...datalabels,
        ...dataLabelsOptions,
        style: {
          ...datalabels.style,
          ...dataLabelsOptions.style,
        },
        formatter: prepareTreemapLabelFormatter(index, chartDesignOptions.seriesLabels),
      };
    }
  });

  return levels;
}

export function prepareTreemapLabelFormatter(level: number, seriesLabels: TreemapSeriesLabels) {
  const seriesLabelsOptions = Array.isArray(seriesLabels) ? seriesLabels[level] : seriesLabels;
  const {
    prefix = '',
    suffix = '',
    backgroundColor = '#e6e6e6',
    textStyle,
    align,
    borderColor,
    borderWidth,
    padding,
    rotation = 0,
    xOffset = 0,
    yOffset = 0,
  } = seriesLabelsOptions ?? {};

  return function treemapLabelFormatter(this: PointLabelObject): string {
    const isDarkBG =
      getDarkFactor(toColor(this.color as string)) > 0.4 && !this.point.options?.custom?.blur;
    const { width } = getPointSize(this.point);

    if (!isEnoughSpaceForLabel(this.point)) {
      return '';
    }

    if (isBigLabelCase(this.point)) {
      return `<div
              style="
                box-sizing: border-box;
                position: absolute;
                overflow: hidden;
                text-overflow: ellipsis;
                padding: ${padding ?? 3}px;
                width:${width - BIG_SPACING}px;
                max-width:${width - BIG_SPACING}px;
                max-height: ${BIG_LABEL_HEIGHT}px;
                height: ${BIG_LABEL_HEIGHT}px;
                background: ${backgroundColor};
                color: ${textStyle?.color ?? DARK_COLOR};
                top: ${-BIG_LABEL_HEIGHT + yOffset}px;
                left: ${BIG_SPACING / 2 + xOffset}px;
                text-align: ${align ?? 'center'};
                transform: rotate(${rotation}deg);
                border: ${borderColor ?? 'none'} ${borderWidth ?? 0}px solid;
                ${textStyle?.fontSize ? `font-size: ${textStyle.fontSize}px;` : ''}
                ${textStyle?.fontWeight ? `font-weight: ${textStyle.fontWeight};` : ''}
                ${textStyle?.fontFamily ? `font-family: ${textStyle.fontFamily};` : ''}
                ${textStyle?.fontStyle ? `font-style: ${textStyle.fontStyle};` : ''}
                "
           >${prefix}${this.key}${suffix}</div>`;
    }

    const color = textStyle?.color ?? (isDarkBG ? LIGHT_COLOR : DARK_COLOR);
    return `<div style="fill:${color};">${prefix}${this.key}${suffix}</div>`;
  };
}

function createDefaultTreemapLevels(): PlotTreegraphLevelsOptions[] {
  return [
    {
      level: 1,
      borderWidth: BIG_SPACING,
      borderColor: 'white',
      layoutAlgorithm: 'squarifiedWithTopSpacing' as OptionsLayoutAlgorithmValue,
      dataLabels: {
        useHTML: true,
        enabled: true,
        align: 'left',
        verticalAlign: 'top',
        allowOverlap: true,
        padding: 0,
        style: {
          fontSize: '14px',
        },
      },
    },
    {
      level: 2,
      borderWidth: MIDDLE_SPACING,
      borderColor: 'white',
      dataLabels: {
        enabled: true,
        align: 'left',
        verticalAlign: 'top',
        style: {
          fontSize: '14px',
        },
      },
    },
    {
      level: 3,
      borderColor: 'black',
      borderWidth: SMALL_SPACING,
      dataLabels: {
        enabled: true,
        align: 'center',
        verticalAlign: 'middle',
        style: {
          fontSize: '13px',
        },
      },
    },
  ];
}

function isBigLabelCase(point: Point): boolean {
  return point.options?.custom?.levelsCount !== 1 && point.options?.custom?.level === 1;
}

function isEnoughSpaceForLabel(point: Point): boolean {
  const { height, width } = getPointSize(point);
  const { level } = point.options.custom!;

  if (isBigLabelCase(point)) {
    return Boolean(point.options.custom!.bigLabelSpacing);
  }
  if (level !== 3) {
    return height >= MIN_POINT_HEIGHT_FOR_MIDDLE_LABEL && width >= MIN_POINT_WIDTH_FOR_LABEL;
  }

  return height >= MIN_POINT_HEIGHT_FOR_SMALL_LABEL && width >= MIN_POINT_WIDTH_FOR_LABEL;
}

function transformPxToLayoutVertical(layoutHeight: number, plotBoxHeightInPx: number) {
  return (pixels: number) => {
    const ratio = plotBoxHeightInPx / layoutHeight;
    return pixels / ratio;
  };
}

function isBigLabelEnabled(chart: Chart) {
  const series = (chart.options.series?.[0] ?? {}) as PlotTreemapOptions;
  const dataLabel = (series?.levels?.[0]?.dataLabels ?? {}) as PlotTreemapLevelsDataLabelsOptions;
  return dataLabel.enabled ?? true;
}

function getPointSize(point: Point) {
  return {
    width: (point.shapeArgs?.width ?? 0) as number,
    height: (point.shapeArgs?.height ?? 0) as number,
  };
}
