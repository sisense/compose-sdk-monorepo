/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable complexity */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/restrict-template-expressions */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
import { IndicatorHelper } from './indicator-helper.js';
import { NumericSimple } from './numeric-simple.js';
import { NumericBar } from './numeric-bar.js';
import { Gauge } from './gauge.js';
import { Ticker } from './ticker.js';
import { IndicatorLegacyChartDataOptions } from '../indicator_legacy_chart_data_options.js';
import { LegacyIndicatorChartOptions, LegacyIndicatorChartTypes } from '../types.js';

const $indicatorHelper = new IndicatorHelper();
const $numericSimple = new NumericSimple();
const $numericBar = new NumericBar();
const $gauge = new Gauge();
const $ticker = new Ticker();

export class Indicator {
  /**
   * Returns render service according to the passed indicator type.
   *
   * @param type
   * @returns
   */
  getService(type: LegacyIndicatorChartTypes) {
    // eslint-disable-next-line default-case
    switch (type) {
      case 'numericSimple':
        return $numericSimple;
      case 'numericBar':
        return $numericBar;
      case 'gauge':
        return $gauge;
      case 'ticker':
        return $ticker;
    }
  }

  /**
   * Main method for rendering indicator.
   *
   * @param {HTMLElement} canvas
   * @param {object} legacyDataOptions
   * @param {object} options
   * @param {HTMLElement} container
   */
  render(
    canvas: HTMLCanvasElement,
    legacyDataOptions: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions,
    container: HTMLElement,
  ) {
    const typeService = this.getService(legacyDataOptions.type);
    const baseMeasure =
      'getBaseMeasure' in typeService
        ? typeService.getBaseMeasure(legacyDataOptions, options, container)
        : undefined;

    // if we don't have baseMeasure, it means there isn't enough space to render usual types =>
    // render ticker indicator
    if (!baseMeasure) {
      // const type = 'ticker';
      // instance.type = type;
      // options = instance.getOptions(type);
      // this.setTextOptions(options);
      // typeService = this.getService(type);
      // typeService.render(canvas, legacyDataOptions, options, container);
      return;
    }

    this.calculateRelativeSizes(legacyDataOptions, options, baseMeasure.value);
    this.setTextOptions(options, baseMeasure.size);
    (typeService as NumericSimple | NumericBar | Gauge).render(
      canvas,
      legacyDataOptions,
      options,
      baseMeasure,
    );
  }

  /**
   * Calculates relative sizes based on the base size value.
   *
   * @param {object} legacyDataOptions
   * @param {object} options
   * @param {number} baseValue
   */
  calculateRelativeSizes(
    legacyDataOptions: IndicatorLegacyChartDataOptions,
    options: LegacyIndicatorChartOptions,
    baseValue: number,
  ) {
    const { relativeSizes } = options;

    relativeSizes.forEach(function (item) {
      let originalValue: number;
      if ('dataKey' in item && 'values' in item && item.dataKey in legacyDataOptions) {
        originalValue = item.values[legacyDataOptions[item.dataKey]];
      } else if ('value' in item) {
        originalValue = item.value;
      } else {
        throw new Error('Invalid relative size options');
      }

      const value = originalValue * baseValue;

      options[item.key] = $indicatorHelper.floor(value, item.decimals);
    });
  }

  /**
   * Sets text options.
   *
   * @param {object} options
   * @param {string} size
   */
  setTextOptions(options: LegacyIndicatorChartOptions, size: string) {
    options.textKeys.forEach(function (key) {
      const textOptions = options[key];
      const fontStyle = textOptions.fontStyle ? `${textOptions.fontStyle} ` : '';
      const fontVariant = textOptions.fontVariant ? `${textOptions.fontVariant} ` : '';
      const fontWeight = textOptions.fontWeight ? `${textOptions.fontWeight} ` : '';
      const fontSize = `${Number.parseFloat(
        (textOptions.fontSizes && textOptions.fontSizes[size]) ||
          textOptions.fontSize ||
          (options as any).fontSize,
      )}px `;
      const fontFamily = textOptions.fontFamily || options.fontFamily;
      const { color } = textOptions;

      options[`${key}Font`] = fontStyle + fontVariant + fontWeight + fontSize + fontFamily;
      options[`${key}Color`] = color;
    });
  }
}