/* eslint-disable max-params */
/* eslint-disable @typescript-eslint/restrict-plus-operands */
export class IndicatorHelper {
  /**
   * Converts degrees to radians.
   *
   * @param {number} angle
   * @returns {number}
   */
  degToRad(angle: number): number {
    return (angle * Math.PI) / 180;
  }

  /**
   * Returns fit string measure.
   *
   * @param {object} ctx
   * @param {string} string
   * @param {number} maxWidth
   * @param {string} font
   * @returns {object}
   */
  getFitStringMeasure(
    ctx: CanvasRenderingContext2D,
    string: string,
    maxWidth: number,
    font: string,
  ) {
    ctx.font = font;

    let width = this.getStringWidth(ctx, string);
    const ellipsis = '…';
    const ellipsisWidth = this.getStringWidth(ctx, ellipsis);

    if (width <= maxWidth) {
      return {
        string: string,
        width: width,
      };
    }

    if (ellipsisWidth >= maxWidth) {
      return {
        string: ellipsis,
        width: ellipsisWidth,
      };
    }

    do {
      string = string.slice(0, string.length - 1);
      width = this.getStringWidth(ctx, string);
    } while (width + ellipsisWidth > maxWidth);

    return {
      string: string + ellipsis,
      width: width + ellipsisWidth,
    };
  }

  /**
   * Returns string width.
   *
   * @param {object} ctx
   * @param {string} string
   * @returns {number}
   */
  getStringWidth(ctx: CanvasRenderingContext2D, string: string) {
    return Math.ceil(ctx.measureText(string).width);
  }

  /**
   * Rounds a number downward to its nearest integer with specified number of decimals.
   *
   * @param {number} value
   * @param {number} decimals
   * @returns {number}
   */
  floor(value: number, decimals: number) {
    decimals = typeof decimals === 'number' ? decimals : 0;

    const multiplier = Math.pow(10, decimals);

    return Math.round(value * multiplier) / multiplier;
  }

  /**
   * Sets canvas width and height considering device pixel ratio.
   *
   * @param {HTMLElement} canvas
   * @param {CanvasRenderingContext2D} ctx
   * @param {number} width
   * @param {number} height
   */
  setCanvasSizes(
    canvas: HTMLCanvasElement,
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
  ) {
    const dpr = window.devicePixelRatio || 1;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
  }
}
