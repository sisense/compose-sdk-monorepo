/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable max-lines */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable sonarjs/cognitive-complexity */
import { IndicatorLegacyChartDataOptions } from '../indicator-legacy-chart-data-options.js';
import {
  BaseMeasure,
  FitSecondaryMeasure,
  FitTitleMeasure,
  FitValueMeasure,
  GaugeOptions,
  LegacyIndicatorChartOptions,
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

/**
 * Returns the biggest possible base measure.
 */
function getBiggestPossibleBaseMeasure(
  measures: MeasuresObject,
  gaugeHeights: BaseMeasure[],
  options: { maxWidth: number; maxHeight: number; showTitle: boolean; showSecondary: boolean },
): BaseMeasure | null {
  const { maxWidth, maxHeight, showTitle, showSecondary } = options;
  for (let index = 0; index < gaugeHeights.length; index++) {
    const item = gaugeHeights[index];
    const gaugeHeight = item.value;
    const valueSectionHeight = getFloorValue(
      gaugeHeight,
      measures.valueSectionHeight as { value: number; decimals: number },
    );
    const indicatorMargin = getFloorValue(
      gaugeHeight,
      measures.indicatorMargin as { value: number; decimals: number },
    );
    const verticalMargins = Math.ceil(indicatorMargin * 1.5);
    let neededHeight = gaugeHeight + valueSectionHeight + verticalMargins;

    if (showTitle) {
      const titleSectionHeight = getFloorValue(gaugeHeight, measures.titleSectionHeight);

      neededHeight += titleSectionHeight;
    }

    if (showSecondary) {
      const secSectionHeight = getFloorValue(gaugeHeight, measures.secSectionHeight);

      neededHeight += secSectionHeight;
    }

    if (neededHeight <= maxHeight) {
      const gaugeWidth = getFloorValue(gaugeHeight, measures.gaugeWidth);
      const bracketWidth = getFloorValue(gaugeHeight, measures.bracketWidth);
      const horizontalMargins = indicatorMargin * 2;
      const neededWidth = gaugeWidth + bracketWidth * 2 + horizontalMargins;

      if (neededWidth <= maxWidth) {
        return {
          ...item,
          maxWidth: maxWidth - horizontalMargins,
          maxHeight: maxHeight - verticalMargins,
        };
      }
    }
  }
  return null;
}

export class Gauge {
  /**
   * Returns base measure data.
   */
  getBaseMeasure(
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions,
    container: HTMLElement,
  ): BaseMeasure | null {
    const gaugeOptions = options as GaugeOptions;
    const gaugeHeights = 'gaugeHeights' in gaugeOptions ? gaugeOptions.gaugeHeights : undefined;
    if (!gaugeHeights) {
      return null;
    }
    const relativeSizes = gaugeOptions.relativeSizes;
    const measureKeys = gaugeOptions.measureKeys.concat();
    const maxWidth = Math.floor(container.clientWidth);
    const maxHeight = Math.floor(container.clientHeight);
    const measures: MeasuresObject = getMeasuresObject(
      measureKeys,
      relativeSizes as RelativeSize[],
    );
    return getBiggestPossibleBaseMeasure(measures, gaugeHeights, {
      maxWidth,
      maxHeight,
      showTitle: data.showTitle,
      showSecondary: data.showSecondary,
    });
  }

  /**
   * Renders indicator gauge widget.
   *
   * @param {HTMLElement} canvas
   * @param {object} data
   * @param {object} options
   * @param {object} baseMeasure
   */
  render(
    canvas: HTMLCanvasElement,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
    baseMeasure: BaseMeasure,
  ) {
    const ctx = canvas.getContext('2d')!;
    let canvasWidth = 0;
    let canvasHeight;

    options.gaugeHeight = baseMeasure.value;
    options.size = baseMeasure.size;
    options.maxWidth = baseMeasure.maxWidth;
    options.maxHeight = baseMeasure.maxHeight;
    options.offsetY = 0;

    canvasHeight = options.gaugeHeight + options.valueSectionHeight;

    if (data.showTitle) {
      options.fitTitleMeasure = this.getFitTitleMeasure(ctx, data, options);
      canvasHeight += options.titleSectionHeight;
    }

    options.fitValueMeasure = this.getFitValueMeasure(ctx, data, options);

    if (data.showSecondary) {
      options.fitSecondaryMeasure = this.getFitSecondaryMeasure(ctx, data, options);
      canvasHeight += options.secSectionHeight;
    }

    canvasWidth = this.getCanvasWidth(data, options);

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
    let canvasWidth = options.gaugeWidth + options.bracketWidth * 2;
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
    // eslint-disable-next-line no-console
    this.clearCanvas(ctx, options);

    if (data.showTitle) {
      this.drawTitle(ctx, options);
    }

    this.drawGauge(ctx, data, options);
    this.drawValue(ctx, data, options);

    if (data.showSecondary) {
      this.drawSecondary(ctx, options);
    }

    this.drawBrackets(ctx, data, options);
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
    ctx.fillText(
      options.fitTitleMeasure.string,
      options.width / 2,
      (options.titleSectionHeight - options.titleBottomMargin) / 2,
    );

    options.offsetY += options.titleSectionHeight;
  }

  /**
   * Draws the gauge section.
   *
   * @param ctx
   * @param data
   * @param options
   */
  drawGauge(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions | any,
    options: LegacyIndicatorChartOptions | any,
  ) {
    options.gaugeCenterX = options.width / 2;
    options.gaugeCenterY = options.offsetY + options.gaugeHeight - options.gaugeBottomMargin;
    options.needleAngle = this.getNeedleAngle(data, options);

    if (data.skin === 2 && data.conditions && data.conditions.length) {
      this.drawConditionalDial(ctx, data, options);
    } else {
      this.drawSimpleDial(ctx, data, options);
    }

    if (data.showTicks && options.size !== 'micro') {
      this.drawTicks(ctx, data, options);
    }

    this.drawNeedle(ctx, options);

    if (data.showLabels && options.size !== 'micro') {
      this.drawLabels(ctx, data, options);
    }

    options.offsetY += options.gaugeHeight;
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
    ctx.fillStyle = options.valueColor;
    ctx.fillRect(
      1,
      options.offsetY,
      options.width - options.bracketThickness * 2,
      options.valueSectionHeight,
    );
    ctx.font = options.valueFont;
    ctx.fillStyle = 'white';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(
      options.fitValueMeasure.string,
      options.width / 2,
      options.offsetY + options.valueSectionHeight / 2,
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
    const y = data.showTitle ? (options.titleSectionHeight - options.titleBottomMargin) / 2 : 0;

    ctx.strokeStyle = options.bracketColor;
    ctx.beginPath();
    ctx.moveTo(options.bracketWidth + 0.5, y + 0.5);
    ctx.lineTo(0.5, y + 0.5);
    ctx.lineTo(0.5, options.height - 0.5);

    if (data.showSecondary) {
      ctx.lineTo(options.bracketWidth + 0.5, options.height - 0.5);
    }

    ctx.stroke();
    ctx.moveTo(options.width - (options.bracketWidth + 0.5), y + 0.5);
    ctx.lineTo(options.width - 0.5, y + 0.5);
    ctx.lineTo(options.width - 0.5, options.height - 0.5);

    if (data.showSecondary) {
      ctx.lineTo(options.width - (options.bracketWidth + 0.5), options.height - 0.5);
    }

    ctx.stroke();
    ctx.closePath();
  }

  /**
   * Returns the gauge needle angle.
   *
   * @param data
   * @param options
   */
  getNeedleAngle(
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    const min = +data.min.data;
    const max = +data.max.data;
    const value = +(data.value.data || 0);

    if (value < min) {
      return options.startAngle - options.overDegrees;
    } else if (value > max) {
      return options.endAngle + options.overDegrees;
    }

    return this.getAngle(options, value, min, max);
  }

  /**
   * Returns the angle according to the passed value, min and max arguments.
   *
   * @param options
   * @param value
   * @param min
   * @param max
   */
  getAngle(
    options: LegacyIndicatorChartOptions | any,
    value: number,
    min: number,
    max: number,
  ): number {
    const anglePerUnit = (options.endAngle - options.startAngle) / (max - min);

    return (value - min) * anglePerUnit + options.startAngle;
  }

  /**
   * Draws conditional dial section.
   *
   * @param ctx
   * @param data
   * @param options
   */
  drawConditionalDial(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions | any,
    options: LegacyIndicatorChartOptions | any,
  ) {
    const conditions = data.conditions;
    const min = +data.min.data;
    const max = +data.max.data;
    const arcStartAngleRad = $indicatorHelper.degToRad(options.startAngle + 180);
    const arcEndAngleRad = $indicatorHelper.degToRad(options.endAngle + 180);
    let i;
    const getAngleBinded = (value: number) => {
      return this.getAngle(options, value, min, max);
    };

    this.drawArc(ctx, options, arcStartAngleRad, arcEndAngleRad, options.defaultDialColor);

    for (i = conditions.length - 1; i >= 0; i--) {
      const condition = conditions[i];
      let value = +condition.data;
      let angle;
      let angleRad1 = NaN;
      let angleRad2 = NaN;
      let angleRad3 = NaN;
      let angleRad4 = NaN;
      const offset = 0.25;

      // eslint-disable-next-line default-case
      switch (condition.operator) {
        case '<':
          if (value <= min) {
            break;
          }
          value = value > max ? max : value;
          angle = getAngleBinded(value);
          angleRad1 = arcStartAngleRad;
          angleRad2 = $indicatorHelper.degToRad(angle + 180);
          break;
        case '>':
          if (value >= max) {
            break;
          }
          value = value < min ? min : value;
          angle = getAngleBinded(value);
          angleRad1 = $indicatorHelper.degToRad(angle + 180);
          angleRad2 = arcEndAngleRad;
          break;
        case '≤':
          if (value < min) {
            break;
          }
          value = value > max ? max : value;
          angle = getAngleBinded(value);
          angleRad1 = arcStartAngleRad;
          angleRad2 = $indicatorHelper.degToRad(
            angle + (angle + offset <= options.endAngle ? offset : 0) + 180,
          );
          break;
        case '≥':
          if (value > max) {
            break;
          }
          value = value < min ? min : value;
          angle = getAngleBinded(value);
          angleRad1 = $indicatorHelper.degToRad(
            angle - (angle - offset >= options.startAngle ? offset : 0) + 180,
          );
          angleRad2 = arcEndAngleRad;
          break;
        case '=':
          if (value < min || value > max) {
            break;
          }
          angle = getAngleBinded(value);
          angleRad1 = $indicatorHelper.degToRad(
            angle - (angle - offset >= options.startAngle ? offset : 0) + 180,
          );
          angleRad2 = $indicatorHelper.degToRad(
            angle + (angle + offset <= options.endAngle ? offset : 0) + 180,
          );
          break;
        case '≠':
          if (value < min || value > max) {
            angleRad1 = arcStartAngleRad;
            angleRad2 = arcEndAngleRad;
          } else if (value === min || value === max) {
            const isMin = value === min;
            angleRad1 = $indicatorHelper.degToRad(options.startAngle + (isMin ? offset : 0) + 180);
            angleRad2 = $indicatorHelper.degToRad(options.endAngle - (isMin ? 0 : offset) + 180);
          } else {
            angle = getAngleBinded(value);
            angleRad1 = arcStartAngleRad;
            angleRad2 = $indicatorHelper.degToRad(
              angle - (angle - offset >= options.startAngle ? offset : 0) + 180,
            );
            angleRad3 = $indicatorHelper.degToRad(
              angle + (angle + offset <= options.endAngle ? offset : 0) + 180,
            );
            angleRad4 = arcEndAngleRad;
          }
      }

      if (!isNaN(angleRad1) && !isNaN(angleRad2)) {
        this.drawArc(ctx, options, angleRad1, angleRad2, condition.color);
      }

      if (!isNaN(angleRad3) && !isNaN(angleRad4)) {
        this.drawArc(ctx, options, angleRad3, angleRad4, condition.color);
      }
    }
  }

  /**
   * Draws simple dial section.
   *
   * @param ctx
   * @param data
   * @param options
   */
  drawSimpleDial(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    const arcStartAngleRad = $indicatorHelper.degToRad(options.startAngle + 180);
    const needleAngleRad = $indicatorHelper.degToRad(options.needleAngle + 180);
    const arcEndAngleRad = $indicatorHelper.degToRad(options.endAngle + 180);

    if (options.needleAngle > options.startAngle && options.needleAngle < options.endAngle) {
      this.drawArc(ctx, options, arcStartAngleRad, needleAngleRad, options.valueColor);

      ctx.globalAlpha = options.gaugeOpacity;

      this.drawArc(ctx, options, needleAngleRad, arcEndAngleRad, options.valueColor);
    } else {
      if (options.needleAngle <= options.startAngle) {
        ctx.globalAlpha = options.gaugeOpacity;
      }

      this.drawArc(ctx, options, arcStartAngleRad, arcEndAngleRad, options.valueColor);
    }

    ctx.globalAlpha = 1;
  }

  /**
   * Draws the gauge arc section.
   *
   * @param ctx
   * @param options
   * @param startAngleRad
   * @param endAngleRad
   * @param color
   */
  drawArc(
    ctx: CanvasRenderingContext2D,
    options: LegacyIndicatorChartOptions | any,
    startAngleRad: number,
    endAngleRad: number,
    color: string,
  ): void {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(
      options.gaugeCenterX,
      options.gaugeCenterY,
      options.outerArcRadius,
      startAngleRad,
      endAngleRad,
    );
    ctx.arc(
      options.gaugeCenterX,
      options.gaugeCenterY,
      options.innerArcRadius,
      endAngleRad,
      startAngleRad,
      true,
    );
    ctx.fill();
  }

  /**
   * Draws the gauge ticks.
   *
   * @param ctx
   * @param data
   * @param options
   */
  drawTicks(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    const minTickAngle = options.startAngle;
    const maxTickAngle = options.endAngle;
    const increment = options.tickDegreesIncrement;
    const needleAngle = options.needleAngle;
    let tickAngle;

    for (tickAngle = minTickAngle; tickAngle <= maxTickAngle; tickAngle += increment) {
      const tickAngleRad = $indicatorHelper.degToRad(tickAngle);
      const x = options.gaugeCenterX - options.lengthToTick * Math.cos(tickAngleRad);
      const y = options.gaugeCenterY - options.lengthToTick * Math.sin(tickAngleRad);
      const isSmaller = needleAngle < minTickAngle;
      const isTickActive =
        needleAngle >= tickAngle - increment / 2 && needleAngle < tickAngle + increment / 2;
      const isBigger = tickAngle === maxTickAngle && needleAngle >= tickAngle;

      ctx.fillStyle = (!isSmaller && isTickActive) || isBigger ? data.color : options.tickColor;
      ctx.beginPath();
      ctx.arc(x, y, options.tickRadius, 0, 2 * Math.PI);
      ctx.fill();
    }
  }

  /**
   * Draws the gauge needle.
   *
   * @param {object} ctx
   * @param {object} options
   */
  drawNeedle(ctx: CanvasRenderingContext2D, options: LegacyIndicatorChartOptions | any) {
    const needleAngleRad = $indicatorHelper.degToRad(options.needleAngle);

    ctx.fillStyle = options.needleColor;
    ctx.save();
    ctx.translate(options.gaugeCenterX, options.gaugeCenterY);
    ctx.rotate(needleAngleRad);
    ctx.translate(-options.gaugeCenterX, -options.gaugeCenterY);
    ctx.beginPath();
    ctx.arc(
      options.gaugeCenterX,
      options.gaugeCenterY,
      options.needleBaseRadius,
      0.5 * Math.PI,
      1.5 * Math.PI,
      true,
    );
    ctx.lineTo(options.gaugeCenterX - options.needleLength, options.gaugeCenterY);
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draws the gauge labels.
   *
   * @param ctx
   * @param data
   * @param options
   */
  drawLabels(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    ctx.font = options.labelFont;
    ctx.fillStyle = options.labelColor;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(data.min.text, options.gaugeCenterX - options.labelMargin, options.gaugeCenterY);
    ctx.textAlign = 'left';
    ctx.fillText(data.max.text, options.gaugeCenterX + options.labelMargin, options.gaugeCenterY);
  }
}
