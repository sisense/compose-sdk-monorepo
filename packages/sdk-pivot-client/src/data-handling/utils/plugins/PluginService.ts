/* eslint-disable no-underscore-dangle */
import { validate } from './validator.js';
import { getDimensionMetadata, getMeasureMetadata } from './getters.js';
import { clearGlobal } from '../../../components/PivotCell/helpers.js';
import { PanelType, PluginsTypesFields, ListOfPanelTypes } from '../../constants.js';
import { JaqlRequest } from '../../../data-load/types.js';
import { PivotTreeNode } from '../../types.js';
import {
  DimensionMetadata,
  Metadata,
  CellItem,
  MeasureMetadata,
  PluginConfig,
  GlobalStyles,
} from './types.js';

const DEFAULT_CONTENT_TYPE = 'text';

export class PluginService {
  /**
   * Handlers to apply for pivot cells
   *
   * @private
   * */
  plugins: Array<PluginConfig> = [];

  /** @private global plugins config */
  globalStyles?: GlobalStyles;

  /** @private */
  jaql: JaqlRequest;

  /**
   * Object to store indexes for data groups
   */
  private indexHelper: {
    measuresLevel: number;
    columnStartFrom: number;
    rowStartFrom: number;
  };

  /**
   * Cache columns metadata after handling column tree node
   *
   * @private
   * */
  columnsMetadata: Array<{ metadata: Array<DimensionMetadata>; type: Array<string> }> = [];

  metadataCache: Map<string, Metadata> = new Map();

  constructor(plugins: Array<any>, jaql: JaqlRequest, globalStyles?: GlobalStyles) {
    this.plugins = plugins;
    this.jaql = jaql;
    this.globalStyles = globalStyles;
    this.indexHelper = {
      measuresLevel: this.getMeasuresLevel(),
      columnStartFrom: 0,
      rowStartFrom: 0,
    };
    if (this.globalStyles) {
      this.globalStyles = clearGlobal(this.globalStyles);
    }
  }

  /**
   * Get array of panels by type
   *
   * @param {ListOfPanelTypes} jaqlPanel - type of panels to return measures|columns|rows
   * @returns {Array<any>} row level of measures in column tree
   */
  getJaqlPanels(jaqlPanel: ListOfPanelTypes) {
    if (!this.jaql) {
      throw new Error('No Jaql in Plugin service!');
    }
    return this.jaql.metadata.filter((el) => el.panel === jaqlPanel);
  }

  /**
   * Calculate level of measures in column tree
   *
   * @returns {number} row level of measures in column tree
   */
  getMeasuresLevel(): number {
    const columnPanels = this.getJaqlPanels(PanelType.COLUMNS);
    const measurePanels = this.getJaqlPanels(PanelType.MEASURES);
    return measurePanels.length > 1 ? columnPanels.length : 0;
  }

  /**
   * Get count of row panels
   *
   * @returns {void}
   */
  getRowsColumnLength() {
    const rowsPanels = this.getJaqlPanels(PanelType.ROWS);
    return rowsPanels.length;
  }

  /**
   * Get count of row panels
   *
   * @param {Array<string>} types - array of types from current cell
   * @returns {void}
   */
  // eslint-disable-next-line class-methods-use-this
  getTotalTypes(types: Array<string>): Array<any> {
    const totalTypes = types.filter(
      (el) => el === PluginsTypesFields.SUB_TOTAL || el === PluginsTypesFields.GRAND_TOTAL,
    );
    // make array of unique types
    if (totalTypes && totalTypes.length) {
      return totalTypes.filter((value, index, self) => self.indexOf(value) === index);
    }
    return [];
  }

  /**
   * Calculate measure index and get panel metadata
   *
   * @param {number} index - measure index in row
   * @returns {MeasureMetadata} measure metadata
   */
  getMeasureMetaByIndex(index: number): MeasureMetadata | undefined {
    const measurePanels = this.getJaqlPanels(PanelType.MEASURES);

    if (measurePanels.length === 1) {
      return getMeasureMetadata(measurePanels[0]);
    }
    const measureIndex = index % measurePanels.length;
    return getMeasureMetadata(measurePanels[measureIndex]);
  }

  resetRowStartFrom() {
    this.indexHelper.rowStartFrom = 1;
  }

  public applyToColumns(columnTreeChildren: Array<PivotTreeNode>) {
    if (columnTreeChildren.length === 0) {
      return;
    }

    if (this.indexHelper.columnStartFrom === 0) {
      this.indexHelper.columnStartFrom = this.getRowsColumnLength();
    }

    this._applyToColumns(columnTreeChildren, { row: -1 });
  }

  /**
   * Apply plugins to columns values and cache metadata for measure handler
   *
   * @param {Array<any>} columnTreeChildren - measure index in row
   * @param {object} indexes - measure index in row
   * @returns {void}
   */
  private _applyToColumns(columnTreeChildren: Array<PivotTreeNode>, indexes: { row: number }) {
    columnTreeChildren.forEach((item: PivotTreeNode, index) => {
      const { dimensionsMeta, type } = getDimensionMetadata(item, this.jaql);
      type.push(PluginsTypesFields.MEMBER);

      let rowIndex = indexes.row >= 0 ? indexes.row + 1 : 0;
      if (rowIndex >= this.indexHelper.rowStartFrom) {
        this.indexHelper.rowStartFrom = rowIndex + 1;
      }
      if (item.metadataType === PanelType.MEASURES) {
        rowIndex = this.indexHelper.measuresLevel;
      }

      let colIndex = index === 0 ? 0 : 1;
      colIndex += this.indexHelper.columnStartFrom;

      const metadata: Metadata = {
        type,
        rowIndex,
        colIndex,
        index: item.jaqlIndex,
        columns: dimensionsMeta,
      };

      if (item.metadataType === PanelType.MEASURES) {
        metadata.measure = this.getMeasureMetaByIndex(item.index || 0);
      }

      const cellItem: CellItem = {
        value: item.value || '',
        content: item.content || '',
        contentType: item.contentType || DEFAULT_CONTENT_TYPE,
        style: item.style || {},
        store: item.store || {},
        state: item.state,
      };

      this.applyGlobal(cellItem);
      this.apply(metadata, cellItem);

      this.addToMetadata(metadata, cellItem, metadata.rowIndex, metadata.colIndex);

      Object.assign(item, cellItem);
      this.indexHelper.columnStartFrom = colIndex;
      if (item.children) {
        const parentIndex = {
          row: rowIndex,
          column: colIndex,
        };
        this._applyToColumns(item.children, parentIndex);
      } else {
        this.columnsMetadata.push({ type, metadata: dimensionsMeta });
      }
      return true;
    });
  }

  /**
   * Apply plugins to corner tree headers
   *
   * @param {any} cornerTree - measure index in row
   * @returns {void}
   */
  applyToHeaders(cornerTree: PivotTreeNode) {
    if (!cornerTree || !cornerTree.children || cornerTree.children.length === 0) {
      return;
    }
    cornerTree.children.forEach((item: PivotTreeNode) => {
      const { dimensionsMeta } = getDimensionMetadata(item, this.jaql);

      const metadata: Metadata = {
        type: [PluginsTypesFields.MEMBER],
        rowIndex: 0,
        colIndex: item.index || 0,
        index: item.jaqlIndex,
        rows: dimensionsMeta,
      };
      const cellItem: CellItem = {
        value: item.value,
        content: item.content || '',
        contentType: item.contentType || DEFAULT_CONTENT_TYPE,
        style: item.style ? item.style : {},
        store: item.store || {},
        // eslint-disable-next-line max-lines
        state: item.state,
      };

      this.applyGlobal(cellItem);
      this.apply(metadata, cellItem);
      this.addToMetadata(metadata, cellItem, metadata.rowIndex, metadata.colIndex);

      Object.assign(item, cellItem);
    });
  }

  applyToRows(rowTreeChildren: Array<PivotTreeNode>) {
    if (rowTreeChildren.length === 0) {
      return;
    }

    const rows = this.getJaqlPanels(PanelType.ROWS);
    const measures = this.getJaqlPanels(PanelType.MEASURES);
    const columns = this.getJaqlPanels(PanelType.COLUMNS);
    this.indexHelper.rowStartFrom = PluginService.getRowStartFromForPage(
      rows.length,
      measures.length,
      columns.length,
    );

    this._applyToRows(rowTreeChildren);
  }

  static getRowStartFromForPage(
    numberOfRows: number,
    numberOfMeasures: number,
    numberOfColumns: number,
  ): number {
    if (numberOfRows === 0 && numberOfColumns === 0) {
      return 0;
    }
    const result = numberOfColumns + (numberOfMeasures === 0 ? 0 : 1);
    if (result === 0) {
      return 1;
    }
    return result;
  }

  /**
   * Apply plugins to rows panels
   *
   * @param {Array<PivotTreeNode>} rowTreeChildren - measure index in row
   * @returns {void}
   */
  private _applyToRows(rowTreeChildren: Array<PivotTreeNode>) {
    rowTreeChildren.forEach((item, index) => {
      const { dimensionsMeta, type } = getDimensionMetadata(item, this.jaql);
      type.push(PluginsTypesFields.MEMBER);
      const colIndex = item.level ? item.level : 0;

      const rowIndex =
        index === 0 ? this.indexHelper.rowStartFrom : this.indexHelper.rowStartFrom + 1;

      const metadata: Metadata = {
        type,
        rowIndex,
        colIndex,
        index: item.jaqlIndex,
        rows: dimensionsMeta,
      };

      const cellItem: CellItem = {
        value: item.value,
        content: item.content || '',
        contentType: item.contentType || DEFAULT_CONTENT_TYPE,
        style: item.style || {},
        store: item.store || {},
        state: item.state,
      };

      this.applyGlobal(cellItem);
      this.apply(metadata, cellItem);
      this.addToMetadata(metadata, cellItem, metadata.rowIndex, metadata.colIndex);

      this.indexHelper.rowStartFrom = rowIndex;

      if (item.children) {
        this._applyToRows(item.children);
      } else if (item.data && item.data.length) {
        this.applyToValues(
          item.data,
          { type, metadata: dimensionsMeta },
          { rowIndex, colIndex: this.getRowsColumnLength() },
        );
      }

      Object.assign(item, cellItem);
      return true;
    });
  }

  /**
   * Apply plugins to value panels
   *
   * @param {Array<any>} values - measure index in row
   * @param {object} rowData - row data
   * @param {Array<string>} rowData.type - row types
   * @param {Array<DimensionMetadata>} rowData.metadata - metadata of current row
   * @param {object} indexes - parent indexes in tree
   * @param {number} indexes.rowIndex - current row index
   * @param {number} indexes.colIndex - colIndex of last row cell to calculate value cell index
   * @returns {void}
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  applyToValues(
    values: Array<any>,
    rowData: { type: Array<string>; metadata: Array<DimensionMetadata> },
    indexes: { rowIndex: number; colIndex: number },
  ) {
    if (!values.length) {
      return;
    }
    values.forEach((item, index) => {
      const type = [PluginsTypesFields.VALUE];
      const colData = this.columnsMetadata[index];
      if (!colData) {
        return;
      }
      const totalTypes = this.getTotalTypes([...rowData.type, ...colData.type]);
      const measureMetadata = this.getMeasureMetaByIndex(index);
      const metadata = {
        type: type.concat(totalTypes),
        rows: rowData.metadata,
        columns: colData.metadata,
        measure: measureMetadata,
        colIndex: index + indexes.colIndex,
        rowIndex: indexes.rowIndex,
        index: measureMetadata && measureMetadata.index ? measureMetadata.index : 0,
      };
      let cellItem: CellItem = {
        value: item,
        content: item,
        contentType: DEFAULT_CONTENT_TYPE,
        style: {},
        store: (item && item.store) || {},
        state: (item && item.state) || undefined,
      };
      if (item !== null && item !== undefined && typeof item === 'object') {
        cellItem = {
          value: item.value ? item.value : null,
          content: item.content || '',
          contentType: item.contentType || DEFAULT_CONTENT_TYPE,
          style: item.style || {},
          store: item.store || {},
          state: item.state,
        };
      }

      this.applyGlobal(cellItem);
      this.apply(metadata, cellItem);
      this.addToMetadata(metadata, cellItem, metadata.rowIndex, metadata.colIndex);
      values[index] = cellItem;
    });
  }

  /**
   * Add cell metadata to map for click/hover APIs
   *
   * @param {Metadata} metadata - cell metadata
   * @param {CellItem} cellItem - cell content
   * @param {number} rowIndex - cell row index
   * @param {number} colIndex - cell column index
   * @returns {void}
   */
  addToMetadata(metadata: Metadata, cellItem: CellItem, rowIndex: number, colIndex: number) {
    const cacheMeta = {
      cellData: {
        value: cellItem.value,
        content: cellItem.content,
      },
      ...metadata,
    };
    this.metadataCache.set(`${rowIndex}-${colIndex}`, cacheMeta);
  }

  /**
   * Apply global config to cells
   *
   * @param {CellItem} item - cell item to update by plugin
   * @returns {void}
   */
  applyGlobal(item: CellItem) {
    const { globalStyles } = this;
    if (!globalStyles) {
      return;
    }
    item.style = { ...item.style, ...globalStyles };
  }

  /**
   * Apply plugins to rows panels
   *
   * @param {Metadata} metadata - cell metadata
   * @param {CellItem} item - cell item to update by plugin
   * @returns {void}
   */
  apply(metadata: Metadata, item: CellItem) {
    if (this.plugins && this.plugins.length) {
      this.plugins.forEach((plugin: PluginConfig) => {
        const valid = validate(plugin.target, metadata);
        if (valid) {
          const pluginHandler = plugin.handler;
          pluginHandler(metadata, item);
        }
      });
    }
  }
}

export default PluginService;
