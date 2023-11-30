/* eslint-disable max-lines */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
/* eslint-disable sonarjs/cognitive-complexity */
/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable complexity */
/* eslint-disable max-lines-per-function */
/* eslint-disable max-depth */
import { IndicatorLegacyChartDataOptions } from '../indicator-legacy-chart-data-options';
import { LegacyIndicatorChartOptions, TickerOptions } from '../types';
import { IndicatorHelper } from './indicator-helper';
const $indicatorHelper = new IndicatorHelper();

export class Ticker {
  /**
   * Renders indicator ticker widget.
   *
   * @param {HTMLElement} canvas
   * @param {object} data
   * @param {object} options
   * @param {HTMLElement} container
   */
  render(
    canvas: HTMLCanvasElement,
    data: IndicatorLegacyChartDataOptions,
    options: TickerOptions,
    container: HTMLElement,
  ) {
    const ctx = canvas.getContext('2d')!;
    const maxWidth = Math.floor(container.clientWidth) - options.horizontalMargin * 2;
    const sectionMinWidth = options.sectionMinWidth;
    let canvasWidth = 0;
    let titleMinWidth = 0;
    let secTitleMinWidth = 0;
    let secValueMinWidth = 0;
    let titleWidth = 0;
    let secTitleWidth = 0;
    let neededWidth;

    ctx.font = options.valueFont!;

    neededWidth = $indicatorHelper.getStringWidth(ctx, data.value.text);
    options.offsetX = 0;
    data.title.text += ':';

    if (data.secondaryTitle) {
      data.secondaryTitle.text += ':';
    }

    if (data.showTitle) {
      ctx.font = options.titleFont!;

      titleWidth = $indicatorHelper.getStringWidth(ctx, data.title.text);
      titleMinWidth = titleWidth < sectionMinWidth ? titleWidth : sectionMinWidth;
      neededWidth += titleMinWidth + options.textPadding;
    }

    if (data.showSecondary) {
      ctx.font = options.secondaryValueFont!;

      const secValueWidth = $indicatorHelper.getStringWidth(ctx, data.secondary.text);

      secValueMinWidth = secValueWidth < sectionMinWidth ? secValueWidth : sectionMinWidth;
      neededWidth += secValueMinWidth;

      ctx.font = options.secondaryTitleFont || '';

      secTitleWidth = $indicatorHelper.getStringWidth(ctx, data.secondaryTitle.text);
      secTitleMinWidth = secTitleWidth < sectionMinWidth ? secTitleWidth : sectionMinWidth;
      neededWidth +=
        secTitleMinWidth +
        options.horizontalPadding * 2 +
        options.dividerWidth +
        options.textPadding;
    }

    if (data.type === 'gauge') {
      const tickerBarWidth =
        options.barWidth + options.horizontalPadding * 2 + options.dividerWidth;

      neededWidth += tickerBarWidth;
      options.showTickerBar = neededWidth <= maxWidth;
      canvasWidth += options.showTickerBar ? tickerBarWidth : 0;
    }

    canvasWidth += data.showTitle ? options.textPadding : 0;
    canvasWidth += data.showSecondary
      ? options.horizontalPadding * 2 + options.dividerWidth + options.textPadding
      : 0;
    const valueMaxWidth =
      maxWidth - canvasWidth - titleMinWidth - secTitleMinWidth - secValueMinWidth;
    options.fitValueMeasure = $indicatorHelper.getFitStringMeasure(
      ctx,
      data.value.text,
      valueMaxWidth,
      options.valueFont!,
    );
    canvasWidth += options.fitValueMeasure.width;

    if (data.showSecondary) {
      const secValueMaxWidth = maxWidth - canvasWidth - titleMinWidth - secTitleMinWidth;
      let secTitleMaxWidth;

      options.fitSecValueMeasure = $indicatorHelper.getFitStringMeasure(
        ctx,
        data.secondary.text,
        secValueMaxWidth,
        options.secondaryValueFont!,
      );
      canvasWidth += options.fitSecValueMeasure.width;
      const freeWidth = maxWidth - canvasWidth;
      const freeWidthHalf = freeWidth / 2;

      if (data.showTitle) {
        if (titleWidth + secTitleWidth > freeWidth) {
          if (titleWidth > freeWidthHalf && secTitleWidth > freeWidthHalf) {
            secTitleMaxWidth = freeWidthHalf;
          } else if (secTitleWidth > freeWidthHalf && titleWidth <= freeWidthHalf) {
            secTitleMaxWidth = freeWidth - titleWidth;
          } else {
            secTitleMaxWidth = secTitleWidth;
          }
        } else {
          secTitleMaxWidth = secTitleWidth;
        }
      } else {
        secTitleMaxWidth = freeWidth;
      }

      options.fitSecTitleMeasure = $indicatorHelper.getFitStringMeasure(
        ctx,
        data.secondaryTitle.text,
        secTitleMaxWidth,
        options.secondaryTitleFont!,
      );
      canvasWidth += options.fitSecTitleMeasure.width;
    }

    if (data.showTitle) {
      const titleMaxWidth = maxWidth - canvasWidth;

      options.fitTitleMeasure = $indicatorHelper.getFitStringMeasure(
        ctx,
        data.title.text,
        titleMaxWidth,
        options.titleFont!,
      );
      canvasWidth += options.fitTitleMeasure.width;
    }

    options.width = canvasWidth;

    $indicatorHelper.setCanvasSizes(canvas, ctx, canvasWidth, options.height);
    this.draw(ctx, data, options);
  }

  /**
   * Draws indicator ticker widget.
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

    if (data.type === 'gauge' && options.showTickerBar) {
      this.drawTickerBar(ctx, data, options);
      this.drawDivider(ctx, options);
    }

    ctx.textBaseline = 'middle';

    if (data.showTitle) {
      this.drawTitle(ctx, options);
    }

    this.drawValue(ctx, data, options);

    if (data.showSecondary) {
      this.drawDivider(ctx, options);
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
   * Draws the ticker bar section.
   *
   * @param {object} ctx
   * @param {object} data
   * @param {object} options
   */
  drawTickerBar(
    ctx: CanvasRenderingContext2D,
    data: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions | any,
  ) {
    const min = +data.min.data;
    const max = +data.max.data;
    const value = +(data.value?.data || 0);
    const y = Math.round((options.height - options.barHeight) / 2);
    let markerX;

    ctx.fillStyle = data.color;

    if (value <= min) {
      ctx.globalAlpha = options.barOpacity;
      ctx.fillRect(options.offsetX, y, options.barWidth, options.barHeight);

      markerX = 0;
    } else if (value >= max) {
      ctx.fillRect(options.offsetX, y, options.barWidth, options.barHeight);

      markerX = options.barWidth - options.tickerBarWidth;
    } else {
      const percent = (value - Math.abs(min)) / (max - min);
      const activeBarWidth = options.barWidth * percent;

      ctx.fillRect(options.offsetX, y, activeBarWidth, options.barHeight);
      ctx.globalAlpha = options.barOpacity;
      ctx.fillRect(
        options.offsetX + activeBarWidth,
        y,
        options.barWidth - activeBarWidth,
        options.barHeight,
      );

      if (activeBarWidth > options.barWidth - options.tickerBarWidth) {
        markerX = options.barWidth - options.tickerBarWidth;
      } else if (activeBarWidth < options.tickerBarWidth) {
        markerX = 0;
      } else {
        markerX = activeBarWidth - 1;
      }
    }

    ctx.globalAlpha = 1;
    ctx.fillStyle = options.barHandleColor;
    ctx.fillRect(
      options.offsetX + markerX,
      Math.round((options.height - options.tickerBarHeight) / 2),
      options.tickerBarWidth,
      options.tickerBarHeight,
    );

    options.offsetX += options.barWidth;
  }

  /**
   * Draws the divider.
   *
   * @param ctx
   * @param options
   */
  drawDivider(ctx: CanvasRenderingContext2D, options: LegacyIndicatorChartOptions | any) {
    ctx.fillStyle = options.dividerColor;
    ctx.fillRect(
      options.offsetX + options.horizontalPadding,
      Math.round((options.height - options.dividerHeight) / 2),
      options.dividerWidth,
      options.dividerHeight,
    );

    options.offsetX += options.horizontalPadding * 2 + options.dividerWidth;
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
    ctx.fillText(options.fitTitleMeasure.string, options.offsetX, Math.floor(options.height / 2));

    options.offsetX += options.fitTitleMeasure.width + options.textPadding;
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
    ctx.font = options.valueFont;
    ctx.fillStyle = options.valueColor || data.color;
    ctx.fillText(options.fitValueMeasure.string, options.offsetX, Math.floor(options.height / 2));

    options.offsetX += options.fitValueMeasure.width;
  }

  /**
   * Draws the secondary section.
   *
   * @param ctx
   * @param options
   */
  drawSecondary(ctx: CanvasRenderingContext2D, options: LegacyIndicatorChartOptions | any) {
    ctx.font = options.secondaryTitleFont;
    ctx.fillStyle = options.secondaryTitleColor;
    ctx.fillText(
      options.fitSecTitleMeasure.string,
      options.offsetX,
      Math.floor(options.height / 2),
    );

    options.offsetX += options.fitSecTitleMeasure.width + options.textPadding;

    ctx.font = options.secondaryValueFont;
    ctx.fillStyle = options.secondaryValueColor;
    ctx.fillText(
      options.fitSecValueMeasure.string,
      options.offsetX,
      Math.floor(options.height / 2),
    );
  }
}
