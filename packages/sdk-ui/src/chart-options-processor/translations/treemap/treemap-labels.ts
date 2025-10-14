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

import { CategoricalChartDataOptionsInternal } from '../../../chart-data-options/types';
import { CompleteThemeSettings } from '../../../types';
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

  levels.forEach((level, index) => {
    const datalabels = level.dataLabels as PlotTreegraphLevelsDataLabelsOptions;
    if (chartDesignOptions?.labels?.category) {
      datalabels.enabled = chartDesignOptions.labels?.category?.[index]?.enabled ?? true;
    }
    if (themeSettings?.typography?.fontFamily) {
      datalabels.style!.fontFamily = themeSettings?.typography?.fontFamily;
    }
  });

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

  return levels;
}

export function treemapLabelFormatter(this: PointLabelObject): string {
  const isDarkBG =
    getDarkFactor(toColor(this.color as string)) > 0.4 && !this.point.options?.custom?.blur;
  const { width } = getPointSize(this.point);

  if (!isEnoughSpaceForLabel(this.point)) {
    return '';
  }

  if (isBigLabelCase(this.point)) {
    return `<div
              style="
                width:${width - BIG_SPACING}px;
                height: ${BIG_LABEL_HEIGHT}px;
                background: #e6e6e6;
                color: ${DARK_COLOR};
                padding: 3px;
                position: absolute;
                top: -${BIG_LABEL_HEIGHT}px;
                text-align: center;
                overflow: hidden;
                text-overflow: ellipsis;
                left: ${BIG_SPACING / 2}px;
                "
           >${this.key}</div>`;
  }

  return `<div style="fill:${isDarkBG ? LIGHT_COLOR : DARK_COLOR};">${this.key}</div>`;
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
        formatter: treemapLabelFormatter,
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
        formatter: treemapLabelFormatter,
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
        formatter: treemapLabelFormatter,
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
