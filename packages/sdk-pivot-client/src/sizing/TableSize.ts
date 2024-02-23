import EventEmitter from 'events';
import { debug } from '../utils/index.js';
import { LoggerI } from '../utils/types.js';

type Size = {
  [colIndex: number]: [number, number];
};

type SizeMap = {
  [rowIndex: number]: Size;
};

export const EVENT_NOTIFY_SIZE = 'getSize';
export const EVENT_SIZE_CHANGED = 'change';
export const EVENT_DATABARS_CHANGED = 'dataBars';
export const EVENT_RANGEMINMAX_CHANGED = 'rangeMinMax';

export class TableSize {
  private events: EventEmitter;

  private colsWidth: { [key: number]: number } = {};

  private rowsHeight: { [key: number]: number } = {};

  private initialFixedWidth: { [key: number]: number } = {};

  private dataBarsCols: Array<Array<number>> = [];

  private dataBarsColsCache: Array<number> | undefined;

  private dataBarsMinMax: Array<[number, number]> | undefined;

  private rangeMinMax: Array<[number, number]> | undefined;

  private notifyChangeTimer = 0;

  private notifySizeChangeTimer = 0;

  private notifyDataBarsChangeTimer = 0;

  private notifyRangeMinMaxChangeTimer = 0;

  private logger: LoggerI;

  constructor(dataBarsMinMax?: Array<[number, number]>, rangeMinMax?: Array<[number, number]>) {
    this.events = new EventEmitter();
    this.events.setMaxListeners(Infinity);

    this.logger = debug.create('TableSize');

    this.dataBarsMinMax = dataBarsMinMax;
    this.rangeMinMax = rangeMinMax;
  }

  updateDataBars(colIndex: number, rowIndex: number, width: number): void {
    this.dataBarsCols[colIndex] = this.dataBarsCols[colIndex] || [];
    const col = this.dataBarsCols[colIndex];
    col[rowIndex] = width;
    if (!this.dataBarsMinMax) {
      return;
    }
    this.notifyDataBarsChange();
  }

  updateDataBarsMinMax(dataBars: Array<[number, number]>): void {
    this.dataBarsMinMax = dataBars;
    this.notifyDataBarsChange();
  }

  updateRangeMinMax(rangeMinMax: Array<[number, number]>): void {
    this.rangeMinMax = rangeMinMax;
    this.notifyRangeMinMaxChange();
  }

  updateWidth(colIndex: number, width: number): void {
    this.logger.log('updateWidth', colIndex, width);
    this.colsWidth[colIndex] = width;
    this.notifySizesChange();
  }

  updateHeight(rowIndex: number, height: number): void {
    this.logger.log('updateHeight', rowIndex, height);
    this.rowsHeight[rowIndex] = height;
    this.notifySizesChange();
  }

  notifyChange(): void {
    if (this.notifyChangeTimer) {
      clearTimeout(this.notifyChangeTimer);
      this.notifyChangeTimer = 0;
    }
    this.notifyChangeTimer = window.setTimeout(() => {
      this.notifyChangeTimer = 0;
      this.events.emit(EVENT_NOTIFY_SIZE);
    });
  }

  setFixedWidth(colIndex: number, width: number): void {
    this.logger.log('setFixedWidth', colIndex, width);
    this.initialFixedWidth[colIndex] = width;
    this.notifySizesChange();
  }

  /**
   * Set initial width to columns
   *
   * @param  {Array} predefinedColumnWidth - array with predefine with data for column
   * @returns {void}
   */
  setInitialFixedWidth(predefinedColumnWidth: Array<Array<number>>): void {
    this.logger.log('setInitialFixedWidth', predefinedColumnWidth);
    if (Array.isArray(predefinedColumnWidth)) {
      predefinedColumnWidth.forEach((item) => {
        const [columnIndex, width] = item;
        this.initialFixedWidth[columnIndex] = width;
      });
    }
  }

  /**
   * Check for initial column width
   *
   * @param  {number} columnIndex - column index
   * @returns {boolean} - true - has initial width
   */
  hasInitialFixedWidth(columnIndex: number): boolean {
    return typeof this.initialFixedWidth[columnIndex] !== 'undefined';
  }

  columnWidth = ({ index }: { index: number }) => {
    const isInitialExist = this.initialFixedWidth[index] !== undefined;
    if (isInitialExist) return this.initialFixedWidth[index];
    return this.colsWidth[index] || Number.NaN;
  };

  rowHeight = ({ index }: { index: number }) => this.rowsHeight[index] || Number.NaN;

  hasPendingChanges() {
    return !!(this.notifyChangeTimer || this.notifySizeChangeTimer);
  }

  fitWidths(totalWidth: number) {
    const widths: Array<Array<number>> = [];
    Object.keys(this.colsWidth).forEach((key) => {
      const index = parseInt(key, 10);
      widths.push([index, this.columnWidth({ index })]);
    });
    const actualWidth = widths.reduce((t, [, w = 0] = []) => t + w, 0);
    const newWidths = widths.map(([i, width]) => {
      const newWidth = Math.floor((totalWidth * width) / actualWidth);
      return [i, newWidth];
    });
    this.setInitialFixedWidth(newWidths);
    this.notifySizesChange();
  }

  /**
   * @returns {void}
   * @private
   */
  private notifySizesChange() {
    if (this.notifySizeChangeTimer) {
      clearTimeout(this.notifySizeChangeTimer);
      this.notifySizeChangeTimer = 0;
    }
    this.notifySizeChangeTimer = window.setTimeout(() => {
      this.notifySizeChangeTimer = 0;
      const colsWidth: { [key: number]: number } = {};
      Object.keys(this.colsWidth).forEach((indexStr) => {
        const index = parseInt(indexStr, 10);
        let width = this.colsWidth[index];
        const fixedWidth = this.initialFixedWidth[index];
        if (typeof fixedWidth === 'number') {
          width = fixedWidth;
        }
        colsWidth[index] = width;
      });

      this.colsWidth = colsWidth;

      this.events.emit(EVENT_SIZE_CHANGED, this.colsWidth, this.rowsHeight);
    });
  }

  private notifyDataBarsChange() {
    if (this.notifyDataBarsChangeTimer) {
      clearTimeout(this.notifyDataBarsChangeTimer);
      this.notifyDataBarsChangeTimer = 0;
    }
    this.notifyDataBarsChangeTimer = window.setTimeout(() => {
      this.notifyDataBarsChangeTimer = 0;
      this.dataBarsColsCache = this.dataBarsCols.map((rows) =>
        rows.reduce((prev, val) => (prev > val ? prev : val), 0),
      );

      this.events.emit(EVENT_DATABARS_CHANGED, {
        colsWidth: this.dataBarsColsCache,
        minMaxs: this.dataBarsMinMax,
      });
    });
  }

  private notifyRangeMinMaxChange() {
    if (this.notifyRangeMinMaxChangeTimer) {
      // eslint-disable-next-line max-lines
      clearTimeout(this.notifyRangeMinMaxChangeTimer);
      this.notifyRangeMinMaxChangeTimer = 0;
    }
    this.notifyRangeMinMaxChangeTimer = window.setTimeout(() => {
      this.notifyRangeMinMaxChangeTimer = 0;

      this.events.emit(EVENT_RANGEMINMAX_CHANGED, {
        // eslint-disable-next-line max-lines
        rangeMinMax: this.rangeMinMax,
      });
    });
  }

  getDataBars(): { colsWidth: Array<number>; minMaxs: Array<[number, number]> } | undefined {
    if (!this.dataBarsMinMax || !this.dataBarsColsCache) {
      return undefined;
    }
    return {
      colsWidth: this.dataBarsColsCache,
      minMaxs: this.dataBarsMinMax,
    };
  }

  getRangeMinMax(): { rangeMinMax: Array<[number, number]> } | undefined {
    if (!this.rangeMinMax) {
      return undefined;
    }
    return {
      rangeMinMax: this.rangeMinMax,
    };
  }

  on(event: string | symbol, listener: (...args: any[]) => void): void {
    this.events.on(event, listener);
  }

  off(event: string | symbol, listener: (...args: any[]) => void): void {
    this.events.off(event, listener);
  }
}
export default TableSize;
