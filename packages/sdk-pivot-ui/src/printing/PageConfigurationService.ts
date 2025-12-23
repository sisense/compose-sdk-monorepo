/* eslint-disable class-methods-use-this */
import { CONSTANTS, FORMAT, ORIENTATION } from '../components/PageForPrint/constants.js';
import { DimensionsProps } from '../components/PageForPrint/types.js';

export class PageConfigurationService {
  /** @private */
  pivotDimensions: DimensionsProps = {
    height: [],
    width: [],
  };

  /** @private */
  format: string = 'A4';

  /** @private */
  orientation: string = 'portrait';

  /** @private */
  setDefaultMinWidth: boolean = false;

  /** @private */
  defaultMinWidth: number = 26;

  /**
   * clear internal state
   *
   * @returns {void}
   * @public
   */
  clearAll() {
    this.clearHeight();
    this.clearWidth();
  }

  /**
   * clear indexed height dimensions
   *
   * @returns {void}
   * @public
   */
  clearHeight() {
    this.pivotDimensions.height = [];
  }

  /**
   * clear indexed width dimensions
   *
   * @returns {void}
   * @public
   */
  clearWidth() {
    this.pivotDimensions.width = [];
  }

  /**
   * checks if height should be added
   *
   * @returns {boolean} - result
   * @public
   */
  withHeight() {
    const { width } = this.pivotDimensions;
    return width && width.length > 0;
  }

  /**
   * checks if all requirements for page service fill completed
   *
   * @returns {boolean} - result
   * @public
   */
  isComplete() {
    const { height, width } = this.pivotDimensions;
    return height && height.length > 0 && width && width.length > 0;
  }

  /**
   * sets internal cache for width and height dimensions
   *
   * @param {DimensionsProps} dimensions - width and height dimensions
   * @param {boolean} withHeight - is height dimension should be setted
   * @returns {void}
   * @public
   */
  updateDimensions(dimensions: DimensionsProps, withHeight = false): void {
    this.pivotDimensions.width = dimensions.width;
    if (withHeight) {
      this.pivotDimensions.height = dimensions.height;
    }
  }

  /**
   * calculates normalized width by internal or param width
   *
   * @param {string} format - format of page
   * @param {string} orientation - orientation of page
   * @param {object} [options] - additional options
   * @param {number} [options.bolderWidth] - border width
   * @returns {DimensionFormat} - optimized width
   * @public
   */
  getNormalizedWidth(
    format: string = this.format,
    orientation: string = this.orientation,
    options?: { borderWidth?: number },
  ) {
    const { borderWidth = 0 } = options || {};
    const convertedFormat = this.getPageFormat(format);
    const convertedOrientation = this.getPageOrientation(orientation);
    const padding = this.getPixelsFromMM(20);
    const pageWidth =
      this.getPagePixelWidth(convertedFormat, convertedOrientation) - Math.floor(padding);
    const widthDimensionToNormalize = this.pivotDimensions.width;
    const equalWidth = Math.floor(pageWidth / widthDimensionToNormalize.length);
    if (widthDimensionToNormalize.length) {
      const totalWidth = widthDimensionToNormalize.reduce(
        (prev, next) => prev + next[1],
        borderWidth,
      );
      const widthInversion = pageWidth / totalWidth;
      let rest = 0;
      const normalizedWidth = widthDimensionToNormalize.map((element) => {
        const [index, width] = element;
        const calculatedWidthStrict = width * widthInversion;
        let calculatedWidth = Math.floor(calculatedWidthStrict);
        rest += calculatedWidthStrict - calculatedWidth;
        if (calculatedWidth <= this.defaultMinWidth || this.setDefaultMinWidth) {
          this.setDefaultMinWidth = true;
          calculatedWidth = equalWidth;
        }
        return [index, calculatedWidth];
      });
      if (normalizedWidth[0] && normalizedWidth[0][1]) {
        normalizedWidth[0][1] += Math.floor(rest);
      }
      return normalizedWidth;
    }
    return [];
  }

  /**
   * updates internal format and orientation
   *
   * @param {string} format - format of page
   * @param {string} orientation - orientation of page
   * @returns {void}
   * @public
   */
  setPageConfiguration(format?: string, orientation?: string) {
    this.clearAll();
    if (format) {
      this.format = format;
    }
    if (orientation) {
      this.orientation = orientation;
    }
  }

  /**
   * @param {string} data - raw page format to be converted
   * @returns {number} - internal format representation
   */
  getPageFormat(data: string = this.format) {
    switch (data) {
      case 'A0':
        return FORMAT.A0;

      case 'A1':
        return FORMAT.A1;

      case 'A2':
        return FORMAT.A2;

      case 'A3':
        return FORMAT.A3;

      case 'A4':
        return FORMAT.A4;

      case 'A5':
        return FORMAT.A5;

      case 'LEGAL':
        return FORMAT.LEGAL;

      case 'LETTER':
        return FORMAT.LETTER;

      case 'TABLOID':
        return FORMAT.TABLOID;

      default:
        throw new TypeError(`Unknow page format: ${data}`);
    }
  }

  /**
   * @param {string} data - raw page orientation to be converted
   * @returns {number} converted orientation
   */
  getPageOrientation(data: string = this.orientation) {
    switch (data) {
      case 'portrait':
        return ORIENTATION.PORTRAIT;

      case 'landscape':
        return ORIENTATION.LANDSCAPE;

      default:
        throw new TypeError(`Unknow page orientation: ${data}`);
    }
  }

  /**
   * @param {number} pageFormat - converted page format
   * @param {number} pageOrientation - converted page orientation
   * @returns {number} - height in mm by format and orientation
   */
  getPageMMHeight(pageFormat: number, pageOrientation: number) {
    switch (pageFormat) {
      case FORMAT.A0:
        return pageOrientation === ORIENTATION.PORTRAIT ? 1189 : 841;

      case FORMAT.A1:
        return pageOrientation === ORIENTATION.PORTRAIT ? 841 : 594;

      case FORMAT.A2:
        return pageOrientation === ORIENTATION.PORTRAIT ? 594 : 420;

      case FORMAT.A3:
        return pageOrientation === ORIENTATION.PORTRAIT ? 420 : 297;

      case FORMAT.A4:
        return pageOrientation === ORIENTATION.PORTRAIT ? 297 : 210;

      case FORMAT.A5:
        return pageOrientation === ORIENTATION.PORTRAIT ? 210 : 148;

      case FORMAT.LEGAL:
        return pageOrientation === ORIENTATION.PORTRAIT ? 355.6 : 215.9;

      case FORMAT.LETTER:
        return pageOrientation === ORIENTATION.PORTRAIT ? 279.4 : 215.9;

      case FORMAT.TABLOID:
        return pageOrientation === ORIENTATION.PORTRAIT ? 431.8 : 279.4;
      default:
        // eslint-disable-next-line no-console
        console.warn('Unknown page format');
        return 0;
    }
  }

  /**
   * @param {number} pageFormat - converted page format
   * @param {number} pageOrientation - converted page orientation
   * @returns {number} - page height in px
   */
  getPagePixelHeight(pageFormat?: number, pageOrientation?: number) {
    const format = typeof pageFormat === 'number' ? pageFormat : this.getPageFormat(this.format);
    const orientation =
      typeof pageOrientation === 'number'
        ? pageOrientation
        : this.getPageOrientation(this.orientation);
    return (this.getPageMMHeight(format, orientation) * CONSTANTS.DPI) / CONSTANTS.MM_PER_INCH;
  }

  /**
   * @param {number} pageFormat - converted page format
   * @param {number} pageOrientation - converted page orientation
   * @returns {number} - page width in px
   */
  getPagePixelWidth(pageFormat?: number, pageOrientation?: number) {
    const format = typeof pageFormat === 'number' ? pageFormat : this.getPageFormat(this.format);
    const orientation =
      typeof pageOrientation === 'number'
        ? pageOrientation
        : this.getPageOrientation(this.orientation);
    return (
      (this.getPageMMHeight(
        format,
        orientation === ORIENTATION.PORTRAIT ? ORIENTATION.LANDSCAPE : ORIENTATION.PORTRAIT,
      ) *
        CONSTANTS.DPI) /
      CONSTANTS.MM_PER_INCH
    );
  }

  /**
   * Returns pixels from mm.
   *
   * @param {number} mm - dimension
   * @returns {number} - px per mm ratio
   */
  getPixelsFromMM(mm: number) {
    return Math.floor((mm * CONSTANTS.DPI) / CONSTANTS.MM_PER_INCH);
  }

  /**
   * calculates pages by internal height and configuration
   *
   * @param {number} start - fixed rows
   * @returns {Array<{start: number, stop: number}>} - pages indexes
   * @public
   */
  calculatePages(start: number): Array<{ start: number; stop: number }> {
    const { height: dimensionHeight } = this.pivotDimensions;
    const format = this.getPageFormat(this.format);
    const orientation = this.getPageOrientation(this.orientation);
    const fixedRows = dimensionHeight.slice(0, start).reduce((prev, next) => prev + next[1], 20);
    const height =
      this.getPagePixelHeight(format, orientation) -
      fixedRows -
      CONSTANTS.FOOTER_HEIGHT -
      CONSTANTS.HEADER_HEIGHT -
      Math.floor(this.getPixelsFromMM(20));
    const rows = dimensionHeight.slice(start);
    let tempHeight = 0;
    let currentPage = -1;
    let currentStart = 0;
    let currentStop = 0;
    const pages: Array<{ start: number; stop: number }> = [];

    rows.forEach((el, index) => {
      const [, value] = el;
      currentStop += 1;
      if (tempHeight + value > height) {
        currentPage += 1;
        currentStart = index;
        pages[currentPage] = {
          start: currentStart,
          stop: 0,
        };
        tempHeight = value;
      } else {
        if (currentPage === -1) {
          currentPage += 1;
          pages[currentPage] = {
            start: currentStart,
            stop: 0,
          };
        }
        tempHeight += value;
      }
      pages[currentPage].stop = currentStop;
    });
    if (
      pages[currentPage].start >= pages[currentPage].stop ||
      typeof pages[currentPage].stop === 'undefined'
    ) {
      pages.length -= 1;
    }

    return pages;
  }
}

export default PageConfigurationService;
