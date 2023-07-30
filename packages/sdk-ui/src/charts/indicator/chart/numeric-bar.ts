/* eslint-disable max-lines-per-function */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IndicatorLegacyChartDataOptions } from '../indicator_legacy_chart_data_options.js';
import {
  BaseMeasure,
  FitSecondaryMeasure,
  FitTitleMeasure,
  FitValueMeasure,
  LegacyIndicatorChartOptions,
  NumericBarOptions,
} from '../types.js';
import { IndicatorHelper } from './indicator-helper.js';
const $indicatorHelper = new IndicatorHelper();

/**
 * Returns rounded downwards number with specified number of decimals.
 */
const getFloorValue = function (
  value: number,
  measure: { value: number; decimals: number },
): number {
  return $indicatorHelper.floor(value * measure.value, measure.decimals);
};

type RelativeSize = {
  key: string;
  value: number;
  decimals: number;
};
type MeasuresObject = Record<string, RelativeSize>;

/**
 * Returns measures object.
 */
function getMeasuresObject(measureKeys: string[], relativeSizes: RelativeSize[]): MeasuresObject {
  const measures: MeasuresObject = {};

  measureKeys.forEach((key) => {
    relativeSizes.some(function (item) {
      if (item.key === key) {
        measures[key] = item;
        return true;
      }
      return false;
    });
  });

  return measures;
}

type BaseMeasureOptions = {
  maxWidth: number;
  maxHeight: number;
  showTitle: boolean;
  showSecondary: boolean;
  bracketThickness: number;
};

/**
 * Returns the biggest possible base measure from the given options.
 */
function getBiggestPossibleBaseMeasure(
  measures: MeasuresObject,
  allPossibleSizes: BaseMeasure[],
  options: BaseMeasureOptions,
): BaseMeasure | null {
  const { showTitle, showSecondary, maxHeight, maxWidth, bracketThickness } = options;

  for (let sizeIndex = 0; sizeIndex < allPossibleSizes.length; sizeIndex++) {
    const sizeItem = allPossibleSizes[sizeIndex];
    const height = sizeItem.value;

    const indicatorMargin = getFloorValue(height, measures.indicatorMargin);

    let neededHeight = height + indicatorMargin;

    if (showTitle) {
      const titleSectionHeight = getFloorValue(height, measures.titleSectionHeight);

      neededHeight += titleSectionHeight;
    }

    if (showSecondary) {
      const secSectionHeight = getFloorValue(height, measures.secSectionHeight);

      neededHeight += secSectionHeight;
    }

    const isSmallestAvailableSize = sizeIndex === allPossibleSizes.length - 1;

    if (neededHeight <= maxHeight || isSmallestAvailableSize) {
      const width = getFloorValue(height, measures.numericMinWidth);
      const horizontalMargins = indicatorMargin * 2;
      const neededWidth = width + bracketThickness * 2 + horizontalMargins;

      if (neededWidth <= maxWidth || isSmallestAvailableSize) {
        return {
          ...sizeItem,
          maxWidth: maxWidth - horizontalMargins,
          maxHeight: maxHeight - indicatorMargin,
        };
      }
    }
  }

  return null;
}

export class NumericBar {
  /**
   * Returns base measure data.
   *
   * @param {object} data
   * @param {object} options
   * @param {HTMLElement} container
   * @returns {BaseMeasure|null}
   */
  getBaseMeasure(
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions,
    container: HTMLElement,
  ): BaseMeasure | null {
    const numericBarOptions = options as NumericBarOptions;
    const allPossibleSizes = 'sizes' in numericBarOptions ? numericBarOptions.sizes : [];
    const relativeSizes = numericBarOptions.relativeSizes;
    const measureKeys = numericBarOptions.measureKeys.concat();
    const maxWidth = Math.floor(container.clientWidth);
    const maxHeight = Math.floor(container.clientHeight);
    const measures: MeasuresObject = getMeasuresObject(
      measureKeys,
      relativeSizes as RelativeSize[],
    );

    return getBiggestPossibleBaseMeasure(measures, allPossibleSizes, {
      maxWidth,
      maxHeight,
      showTitle: data.showTitle,
      showSecondary: data.showSecondary,
      bracketThickness: numericBarOptions.bracketThickness,
    });
  }

  /**
   * Renders indicator numeric bar widget.
   *
   * @param canvas
   * @param data
   * @param options
   * @param baseMeasure
   */
  render(
    canvas: HTMLCanvasElement,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
    baseMeasure: BaseMeasure,
  ) {
    const ctx = canvas.getContext('2d')!;
    let canvasHeight;

    options.height = baseMeasure.value;
    options.maxWidth = baseMeasure.maxWidth;
    options.maxHeight = baseMeasure.maxHeight;
    options.offsetY = 0;

    canvasHeight = options.height;

    if (data.showTitle) {
      options.fitTitleMeasure = this.getFitTitleMeasure(ctx, data, options);
      canvasHeight += options.titleSectionHeight;
    }

    options.fitValueMeasure = this.getFitValueMeasure(ctx, data, options);

    if (data.showSecondary) {
      options.fitSecondaryMeasure = this.getFitSecondaryMeasure(ctx, data, options);
      canvasHeight += options.secSectionHeight;
    }

    const canvasWidth = this.getCanvasWidth(data, options);

    options.width = canvasWidth;
    options.height = canvasHeight;

    $indicatorHelper.setCanvasSizes(canvas, ctx, canvasWidth, canvasHeight);
    this.draw(ctx, data, options);
  }

  /**
   * Returns fit title measure data.
   *
   * @param ctx
   * @param data
   * @param options
   */
  getFitTitleMeasure(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ): FitTitleMeasure {
    const titleReservedWidth = options.bracketWidth * 2 + options.titleHorizontalMargin * 2;
    const titleMaxWidth = options.maxWidth - titleReservedWidth;
    const fitTitleMeasure: Partial<FitTitleMeasure> = $indicatorHelper.getFitStringMeasure(
      ctx,
      data.title.text,
      titleMaxWidth,
      options.titleFont,
    );

    fitTitleMeasure.width! += titleReservedWidth;
    fitTitleMeasure.key = 'title';

    return fitTitleMeasure as FitTitleMeasure;
  }

  /**
   * Returns fit value measure data.
   *
   * @param ctx
   * @param data
   * @param options
   */
  getFitValueMeasure(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ): FitValueMeasure {
    const valueReservedWidth = options.bracketThickness * 2;
    const valueMaxWidth = options.maxWidth - valueReservedWidth;
    const fitValueMeasure: Partial<FitValueMeasure> = $indicatorHelper.getFitStringMeasure(
      ctx,
      data.value.text,
      valueMaxWidth,
      options.valueFont,
    );

    fitValueMeasure.width! += valueReservedWidth;
    fitValueMeasure.key = 'value';

    return fitValueMeasure as FitValueMeasure;
  }

  /**
   * Returns fit value measure data.
   *
   * @param ctx
   * @param data
   * @param options
   */
  getFitSecondaryMeasure(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ): FitSecondaryMeasure {
    const secondaryReservedWidth = options.bracketWidth * 2 + options.secDividerWidth;
    const secondaryMaxWidth = options.maxWidth - secondaryReservedWidth;
    const secondaryValueMaxWidth = secondaryMaxWidth - options.secTitleMinWidth;
    const fitSecValueMeasure = $indicatorHelper.getFitStringMeasure(
      ctx,
      data.secondary.text,
      secondaryValueMaxWidth,
      options.secondaryValueFont,
    );
    const secondaryTitleMaxWidth = secondaryMaxWidth - fitSecValueMeasure.width;
    const fitSecTitleMeasure = $indicatorHelper.getFitStringMeasure(
      ctx,
      data.secondaryTitle.text,
      secondaryTitleMaxWidth,
      options.secondaryTitleFont,
    );

    return {
      width: fitSecTitleMeasure.width + fitSecValueMeasure.width + secondaryReservedWidth,
      titleString: fitSecTitleMeasure.string,
      valueString: fitSecValueMeasure.string,
      key: 'secondary',
    };
  }

  /**
   * Returns canvas width.
   *
   * @param data
   * @param options
   */
  getCanvasWidth(
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ): number {
    let canvasWidth = options.numericMinWidth + options.bracketThickness * 2;
    const titleMeasure = options.fitTitleMeasure;
    const valueMeasure = options.fitValueMeasure;
    const isTitleMeasureActive = titleMeasure && titleMeasure.width > valueMeasure.width;
    let activeMeasure = isTitleMeasureActive ? titleMeasure : valueMeasure;
    const secondaryMeasure = options.fitSecondaryMeasure;
    const isSecondaryMeasureActive =
      secondaryMeasure && secondaryMeasure.width > activeMeasure.width;
    let useMaxWidth;

    activeMeasure = isSecondaryMeasureActive ? secondaryMeasure : activeMeasure;

    if (isSecondaryMeasureActive) {
      useMaxWidth =
        activeMeasure.titleString !== data.secondaryTitle.text ||
        activeMeasure.valueString !== data.secondary.text;
    } else {
      useMaxWidth = activeMeasure.string !== data[activeMeasure.key].text;
    }

    if (useMaxWidth) {
      canvasWidth = options.maxWidth;
    } else if (activeMeasure.width > canvasWidth) {
      canvasWidth = activeMeasure.width;
    }

    return canvasWidth;
  }

  /**
   * Draws indicator numeric bar widget.
   *
   * @param ctx
   * @param data
   * @param options
   */
  draw(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    this.clearCanvas(ctx, options);

    if (data.showTitle) {
      this.drawTitle(ctx, options);
    }

    this.drawValue(ctx, data, options);

    if (data.showSecondary) {
      this.drawSecondary(ctx, options);
    }

    if (data.showTitle || data.showSecondary) {
      this.drawBrackets(ctx, data, options);
    }
  }

  /**
   * Clears the canvas.
   *
   * @param ctx
   * @param options
   */
  clearCanvas(ctx: CanvasRenderingContext2D, options: LegacyIndicatorChartOptions | any) {
    ctx.fillStyle = options.backgroundColor;
    ctx.fillRect(0, 0, options.width, options.height);
  }

  /**
   * Draws the title section.
   *
   * @param ctx
   * @param options
   */
  drawTitle(ctx: CanvasRenderingContext2D, options: LegacyIndicatorChartOptions | any) {
    ctx.font = options.titleFont;
    ctx.fillStyle = options.titleColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.fitTitleMeasure.string, options.width / 2, options.titleSectionHeight / 2);

    options.offsetY += options.titleSectionHeight;
  }

  /**
   * Draws the value section.
   *
   * @param ctx
   * @param data
   * @param options
   */
  drawValue(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    const y = options.offsetY;

    ctx.fillStyle = data.color;
    ctx.fillRect(1, y, options.width - options.bracketThickness * 2, options.valueSectionHeight);
    ctx.font = options.valueFont;
    ctx.fillStyle = options.valueColor;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      options.fitValueMeasure.string,
      options.width / 2,
      y + options.valueSectionHeight / 2,
    );
  }

  /**
   * Draws the secondary section.
   *
   * @param ctx
   * @param options
   */
  drawSecondary(ctx: CanvasRenderingContext2D, options: LegacyIndicatorChartOptions | any) {
    const y = options.height - options.secBottomMargin;

    ctx.font = options.secondaryTitleFont;
    ctx.fillStyle = options.secondaryTitleColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.fitSecondaryMeasure.titleString, options.bracketWidth, y);

    ctx.font = options.secondaryValueFont;
    ctx.fillStyle = options.secondaryValueColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    ctx.fillText(options.fitSecondaryMeasure.valueString, options.width - options.bracketWidth, y);
  }

  /**
   * Draws the left and right brackets.
   *
   * @param ctx
   * @param data
   * @param options
   */
  drawBrackets(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    ctx.strokeStyle = options.bracketColor;
    ctx.beginPath();

    if (data.showTitle) {
      ctx.moveTo(options.bracketWidth + 0.5, 0.5);
      ctx.lineTo(0.5, 0.5);
    } else {
      ctx.moveTo(0.5, 0.5);
    }

    ctx.lineTo(0.5, options.height - 0.5);

    if (data.showSecondary) {
      ctx.lineTo(options.bracketWidth + 0.5, options.height - 0.5);
    }

    ctx.stroke();

    if (data.showTitle) {
      ctx.moveTo(options.width - (options.bracketWidth + 0.5), 0.5);
      ctx.lineTo(options.width - 0.5, 0.5);
    } else {
      ctx.moveTo(options.width - 0.5, 0.5);
    }

    ctx.lineTo(options.width - 0.5, options.height - 0.5);

    if (data.showSecondary) {
      ctx.lineTo(options.width - (options.bracketWidth + 0.5), options.height - 0.5);
    }

    ctx.stroke();
    ctx.closePath();
  }
}
