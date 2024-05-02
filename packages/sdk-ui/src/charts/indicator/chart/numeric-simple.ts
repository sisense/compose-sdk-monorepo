/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { IndicatorLegacyChartDataOptions } from '../indicator-legacy-chart-data-options';
import {
  BaseMeasure,
  FitSecondaryMeasure,
  FitTitleMeasure,
  FitValueMeasure,
  LegacyIndicatorChartOptions,
  NumericSimpleOptions,
} from '../types';
import { IndicatorHelper } from './indicator-helper';
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
  skin: 'horizontal' | 'vertical';
  borderWidth: number;
};

/**
 * Returns the biggest possible base measure from the given options.
 */
function getBiggestPossibleBaseMeasure(
  measures: MeasuresObject,
  allPossibleSizes: BaseMeasure[],
  options: BaseMeasureOptions,
): BaseMeasure | null {
  const { showTitle, showSecondary, skin, maxHeight, maxWidth, borderWidth } = options;

  for (let sizeIndex = 0; sizeIndex < allPossibleSizes.length; sizeIndex++) {
    const sizeItem = allPossibleSizes[sizeIndex];
    const height = sizeItem.value;
    const bottomMargin = getFloorValue(height, measures.valueSectionMarginBottom);
    const indicatorVerticalMargin = getFloorValue(height, measures.indicatorVerticalMargin);
    const verticalMargins = indicatorVerticalMargin * 2;
    let neededHeight = height + bottomMargin + verticalMargins;

    if (showTitle && skin === 'vertical') {
      const titleSectionHeight = getFloorValue(height, measures.titleSectionHeight);
      neededHeight += titleSectionHeight;
    }

    if (showSecondary) {
      const secSectionHeight = getFloorValue(height, measures.secSectionHeight);
      const topMargin = getFloorValue(height, measures.secSectionMarginTop);
      neededHeight += secSectionHeight + topMargin + (borderWidth || 0);
    }

    if (neededHeight <= maxHeight) {
      const width = getFloorValue(height, measures.numericMinWidth);
      const indicatorHorizontalMargin = getFloorValue(height, measures.indicatorHorizontalMargin);
      const horizontalMargins = indicatorHorizontalMargin * 2;
      const neededWidth = width + horizontalMargins;

      if (neededWidth <= maxWidth) {
        return {
          ...sizeItem,
          maxWidth: maxWidth - horizontalMargins,
          maxHeight: maxHeight - verticalMargins,
        };
      }
    }
  }

  return null;
}

export class NumericSimple {
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
    const numericSimpleOptions = options as NumericSimpleOptions;
    const allPossibleSizes = 'sizes' in numericSimpleOptions ? numericSimpleOptions.sizes : [];
    const relativeSizes = numericSimpleOptions.relativeSizes;
    const measureKeys = numericSimpleOptions.measureKeys.concat();
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
      skin: data.skin as 'horizontal' | 'vertical',
      borderWidth: 'borderWidth' in numericSimpleOptions ? numericSimpleOptions.borderWidth : 0,
    });
  }

  /**
   * Renders indicator numeric simple widget.
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

    canvasHeight = options.height;

    options.fitValueMeasure = this.getFitValueMeasure(ctx, data, options);

    if (data.showTitle) {
      options.fitTitleMeasure = this.getFitTitleMeasure(ctx, data, options);
      canvasHeight += data.skin === 'vertical' ? options.titleSectionHeight : 0;
    }

    if (data.showSecondary) {
      options.fitSecondaryMeasure = this.getFitSecondaryMeasure(ctx, data, options);
      canvasHeight +=
        options.valueSectionMarginBottom +
        options.secSectionHeight +
        options.secSectionMarginTop +
        options.borderWidth;
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
  ): FitTitleMeasure | undefined {
    const isHorizontal = data.skin === 'horizontal';
    const titleMaxWidth =
      options.maxWidth -
      (isHorizontal ? options.fitValueMeasure.width + options.valueSectionMarginRight : 0);

    if (isHorizontal && titleMaxWidth + options.titleSectionMinWidth <= 0) {
      return;
    }

    const fitTitleMeasure: Partial<FitTitleMeasure> = $indicatorHelper.getFitStringMeasure(
      ctx,
      data.title.text,
      titleMaxWidth,
      options.titleFont,
    );

    fitTitleMeasure.width += isHorizontal ? options.valueSectionMarginRight : 0;
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
    const fitValueMeasure: Partial<FitValueMeasure> = $indicatorHelper.getFitStringMeasure(
      ctx,
      data.value.text,
      options.maxWidth,
      options.valueFont,
    );

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
    const secondaryReservedWidth = options.secDividerWidth;
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
    let canvasWidth;
    const titleMeasure = options.fitTitleMeasure;
    const valueMeasure = options.fitValueMeasure;
    const secondaryMeasure = options.fitSecondaryMeasure;
    const useMaxWidth = options.fitMeasures.some(
      (item: { key: string; dataKey: string; prop: string }) => {
        const measure = options[item.key];
        const dataObj = data[item.dataKey];

        return !!(measure && dataObj && measure[item.prop] !== dataObj.text);
      },
    );

    if (useMaxWidth) {
      return options.maxWidth;
    }

    if (data.skin === 'vertical') {
      const isTitleMeasureActive = titleMeasure && titleMeasure.width > valueMeasure.width;
      let activeMeasure = isTitleMeasureActive ? titleMeasure : valueMeasure;
      const isSecondaryMeasureActive =
        secondaryMeasure && secondaryMeasure.width > activeMeasure.width;

      activeMeasure = isSecondaryMeasureActive ? secondaryMeasure : activeMeasure;
      canvasWidth = activeMeasure.width;
    } else {
      canvasWidth = valueMeasure.width;

      if (titleMeasure) {
        canvasWidth += titleMeasure.width;
      }

      if (secondaryMeasure && secondaryMeasure.width > canvasWidth) {
        canvasWidth = secondaryMeasure.width;
      }
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
    this.drawValue(ctx, data, options);

    if (data.showTitle) {
      this.drawTitle(ctx, data, options);
    }

    if (data.showSecondary) {
      this.drawSecondary(ctx, options);
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
   * @param data
   * @param options
   */
  drawTitle(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    if (
      !options.fitTitleMeasure ||
      (data.skin === 'horizontal' &&
        options.fitValueMeasure.string !== data[options.fitValueMeasure.key].text)
    ) {
      return;
    }

    ctx.font = options.titleFont;
    ctx.fillStyle = options.titleColor;

    if (data.skin === 'vertical') {
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(
        options.fitTitleMeasure.string,
        options.width / 2,
        options.titleSectionHeight / 2,
      );
    } else {
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      ctx.fillText(
        options.fitTitleMeasure.string,
        options.fitValueMeasure.width + options.valueSectionMarginRight,
        options.titleSectionMarginTop,
      );
    }
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
    const isVertical = data.skin === 'vertical';

    ctx.fillStyle = options.valueColor || data.color;
    ctx.font = options.valueFont;
    ctx.textAlign = isVertical ? 'center' : 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      options.fitValueMeasure.string,
      isVertical ? options.width / 2 : 0,
      (data.showTitle && isVertical ? options.titleSectionHeight : 0) +
        options.valueSectionHeight / 2,
    );
  }

  /**
   * Draws the secondary section.
   *
   * @param ctx
   * @param options
   */
  drawSecondary(ctx: CanvasRenderingContext2D, options: LegacyIndicatorChartOptions | any) {
    let y = options.height - options.secSectionHeight / 2;

    ctx.font = options.secondaryTitleFont;
    ctx.fillStyle = options.secondaryTitleColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(options.fitSecondaryMeasure.titleString, 0, y);

    ctx.font = options.secondaryValueFont;
    ctx.fillStyle = options.secondaryValueColor;
    ctx.textAlign = 'right';
    ctx.fillText(options.fitSecondaryMeasure.valueString, options.width, y);

    ctx.strokeStyle = options.borderColor;
    ctx.beginPath();

    y =
      options.height - options.secSectionHeight - options.secSectionMarginTop - options.borderWidth;

    ctx.moveTo(0, y);
    ctx.lineTo(options.width, y);
    ctx.stroke();
  }
}
