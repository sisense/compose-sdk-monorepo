import * as React from 'react';

import { PivotCellEvent, PivotDataNode, PivotTreeNode } from '../../data-handling';
import { PanelType } from '../../data-handling/constants.js';
import { createPivotTreeNode } from '../../data-handling/utils/index.js';
import { Metadata } from '../../data-handling/utils/plugins/types.js';
import { EVENT_SIZE_CHANGED, TableSize } from '../../sizing/index.js';
import { TreeNodeMetadata, TreeServiceI } from '../../tree-structure/types.js';
import { debug } from '../../utils/index.js';
import { Defer, LoggerI, Styles } from '../../utils/types.js';
import { CustomScroll } from '../CustomScroll/index.js';
import { MouseWheelCatcher } from '../MouseWheelCatcher/index.js';
import { PivotCell } from '../Pivot/index.js';
import {
  MULTIGRID,
  MULTIGRID_NEW,
  MULTIGRID_NO_COLUMNS,
  MULTIGRID_NO_CORNER,
  MULTIGRID_NO_FIXED_LEFT,
  MULTIGRID_NO_ROWS,
  TABLEGRID,
  TABLEGRID_BOTTOM,
  TABLEGRID_COLUMNS,
  TABLEGRID_CORNER,
  TABLEGRID_DATA,
  TABLEGRID_FIXED,
  TABLEGRID_LEFT,
  TABLEGRID_RIGHT,
  TABLEGRID_ROWS,
  TABLEGRID_TOP,
} from './classes.js';
import { tableType as typeOfTable } from './constants.js';
import { CellRenderProps, PivotInnerTable } from './PivotInnerTable.js';

export type DimensionsProps = {
  width: Array<any>;
  height: Array<any>;
};

type Props = {
  className?: string;
  width: number;
  height: number;
  borderWidth?: number;
  borderColor?: string;
  scrollBarsMargin: number;
  isSelectedMode?: boolean;
  isFullWidth?: boolean;
  isFixedEnabled?: boolean;
  isMobile?: boolean;
  allowHtml?: boolean;
  dataBars?: Array<[string, string]>;
  rangeMinMax?: Array<[string, string]>;
  getSortingPopupContainer?: () => HTMLElement;
  onGetInitialData?: () => void;
  onInitLoadingFinish?: () => void;
  onTotalSizeChange?: (height: number) => void;
  onGridUpdated?: () => void;
  onDomReady?: () => void;
  onUpdatePredefinedColumnWidth?: (
    horizontalLastLevelsNodes: Array<PivotTreeNode>,
    resizedColumnWidth?: Array<number>,
  ) => Array<Array<number>>;
  onSortingMetadataUpdate?: (node: PivotTreeNode, measureNode?: PivotTreeNode) => any;
  onSortingSettingsChanged: InstanceType<typeof PivotCell>['props']['onSortingSettingsChanged'];
  onCellClick?: (cellData: PivotCellEvent) => void;
  onCellEnter?: (cellData: PivotCellEvent) => void;
  onCellLeave?: (cellData: PivotCellEvent) => void;
  rowHeight?: number;
  imageColumns?: Array<number>;
  fallbackImageUrl?: string;
  addCellDomReadyPromise?: (defer?: Defer) => void;
  removeCellDomReadyPromise?: (defer?: Defer) => void;
};

type State = {
  tableSize: TableSize;
  widths: { [colIndex: number]: number };
  heights: { [colIndex: number]: number };
  borderWidth: number;
  isResizeInProgress: boolean;
  rowsTreeService?: TreeServiceI;
  columnsTreeService?: TreeServiceI;
  cornerTreeService?: TreeServiceI;
  zoomRatio: number;
};

/**
 * Fix border width with zoom,
 * get 1.333px actual size for defined 1px
 *
 * @param {number} borderWidth - border width
 * @returns {number} - fixed border width
 */
function getActualBorderWidth(borderWidth: number): number {
  if (!document) {
    return borderWidth;
  }
  const div = document.createElement('div');
  if (div.getBoundingClientRect) {
    div.style.width = '1px';
    div.style.height = '1px';
    div.style.boxSizing = 'content-box';
    div.style.border = `solid ${borderWidth}px black`;
    document.body.appendChild(div);
    const res = div.getBoundingClientRect();
    document.body.removeChild(div);
    const fixedBorderWidth = (res.width - 1) / 2;
    return fixedBorderWidth;
  }
  return borderWidth;
}

/**
 * Get last level nodes from treeService
 *
 * @param {object} props - tree services
 * @returns {Array<PivotTreeNode>} - horizontal last levels nodes
 * @private
 */
function getHorizontalLastLevelsNodes(props: {
  rowsTreeService?: TreeServiceI;
  columnsTreeService?: TreeServiceI;
  cornerTreeService?: TreeServiceI;
}): Array<PivotTreeNode> {
  let cornerJaqlIndexes: Array<PivotTreeNode> = [];
  let columnsJaqlIndexes: Array<PivotTreeNode> = [];

  if (props.cornerTreeService) {
    cornerJaqlIndexes = props.cornerTreeService.getLastLevelNodes();
  }
  if (props.columnsTreeService) {
    columnsJaqlIndexes = props.columnsTreeService.getLastLevelNodes();
  }

  return [...cornerJaqlIndexes, ...columnsJaqlIndexes].map((item) => createPivotTreeNode(item));
}

export class PivotTable extends React.PureComponent<Props, State> {
  logger: LoggerI;

  data: Array<Array<any>> = [];

  cellsMetadata: Map<string, Metadata> = new Map();

  cornerTable: Array<Array<any>> = [];

  columnsTable: Array<Array<any>> = [];

  rowsTable: Array<Array<any>> = [];

  dataBars: Array<[number, number]> = [];

  rangeMinMax: Array<[number, number]> = [];

  fixRowsCount = 0;

  fixColsCount = 0;

  rowsCount = 0;

  colsCount = 0;

  scrollContainer?: CustomScroll;

  leftContainer?: HTMLElement;

  topContainer?: HTMLElement;

  rightContainer?: HTMLElement;

  resetScroll?: boolean;

  isMainGridUpdateSkiped = false;

  isFullWidthRefreshed = false;

  isDomReadyTriggered = false;

  domReadyTriggerTime = 0;

  measure: Function;

  styleObj: Styles;

  cellDomReadyPromises?: Array<Promise<any>>;

  prevDataBars: Array<[string, string]> | undefined;

  prevRangeMinMax: Array<[string, string]> | undefined;

  static defaultProps = {
    borderWidth: 1,
    borderColor: '',
    isFullWidth: false,
    isFixedEnabled: true,
  };

  constructor(props: Props) {
    super(props);

    this.logger = debug.create('PivotTable');
    const zoomRatio = window.devicePixelRatio || 1;
    this.state = {
      tableSize: this.createTableSize(),
      widths: {},
      heights: {},
      borderWidth: getActualBorderWidth(props.borderWidth || 1),
      isResizeInProgress: false,
      rowsTreeService: undefined,
      columnsTreeService: undefined,
      cornerTreeService: undefined,
      zoomRatio,
    };

    this.measure = () => {};
    this.styleObj = {};

    this.resetScroll = false;

    if (props.dataBars && props.dataBars.length) {
      this.notifyDataBars(props.dataBars);
    }

    if (props.rangeMinMax && props.rangeMinMax.length) {
      this.notifyRangeMinMax(props.rangeMinMax);
    }
  }

  componentDidMount(): void {
    window.addEventListener('resize', this.onResize);
    if (this.props.onGetInitialData) {
      this.props.onGetInitialData();
    }
    if (this.resetScroll && this.scrollContainer && this.scrollContainer.view) {
      this.resetScroll = false;
      this.scrollContainer.view.scrollTop = 0;
      this.scrollContainer.view.scrollLeft = 0;
      if (this.topContainer) {
        this.topContainer.classList.remove('active');
      }
      if (this.leftContainer) {
        this.leftContainer.classList.remove('active');
      }
      if (this.rightContainer) {
        this.rightContainer.classList.remove('active');
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Readonly<Props>) {
    if (nextProps.borderWidth !== this.props.borderWidth) {
      const zoomRatio = window.devicePixelRatio || 1;
      this.setState({
        borderWidth: getActualBorderWidth(nextProps.borderWidth || 1),
        zoomRatio,
      });
    }
  }

  componentDidUpdate(): void {
    if (this.resetScroll && this.scrollContainer && this.scrollContainer.view) {
      this.resetScroll = false;
      this.scrollContainer.view.scrollTop = 0;
      this.scrollContainer.view.scrollLeft = 0;
      if (this.topContainer) {
        this.topContainer.classList.remove('active');
      }
      if (this.leftContainer) {
        this.leftContainer.classList.remove('active');
      }
      if (this.rightContainer) {
        this.rightContainer.classList.remove('active');
      }
    }

    if (this.props.dataBars !== this.prevDataBars) {
      this.prevDataBars = this.props.dataBars;
      this.notifyDataBars(this.props.dataBars);
    }

    if (this.props.rangeMinMax !== this.prevRangeMinMax) {
      this.prevRangeMinMax = this.props.rangeMinMax;
      this.notifyRangeMinMax(this.props.rangeMinMax);
    }
  }

  componentWillUnmount(): void {
    window.removeEventListener('resize', this.onResize);
  }

  initialize(
    newRowsTreeService?: TreeServiceI,
    newColumnsTreeService?: TreeServiceI,
    newCornerTreeService?: TreeServiceI,
    options?: { isLastPage?: boolean; cellsMetadata?: Map<string, Metadata> | null },
  ): void {
    const { cellsMetadata = new Map() } = options || {};
    if (cellsMetadata !== null) {
      this.cellsMetadata = cellsMetadata;
    }
    this.isDomReadyTriggered = false;
    this.isFullWidthRefreshed = false;
    this.resetScroll = true;
    const treeServices = {
      rowsTreeService: newRowsTreeService,
      columnsTreeService: newColumnsTreeService,
      cornerTreeService: newCornerTreeService,
    };
    this.initTableSize(treeServices);
    const tableSize = this.createTableSize();
    const horizontalLastLevelsNodes = getHorizontalLastLevelsNodes(treeServices);
    if (this.props.onUpdatePredefinedColumnWidth) {
      const initialColumnWidth = this.props.onUpdatePredefinedColumnWidth(
        horizontalLastLevelsNodes,
        undefined,
      );

      tableSize.setInitialFixedWidth(initialColumnWidth);
    }

    this.cellDomReadyPromises = undefined;
    if (!newRowsTreeService && !newColumnsTreeService) {
      this.cellDomReadyPromises = [];
    }

    this.setState({
      tableSize,
      ...treeServices,
    });
  }

  addMore(newRowsTreeService: TreeServiceI, isLastPage: boolean): void {
    return this.initialize(
      newRowsTreeService,
      this.state.columnsTreeService,
      this.state.cornerTreeService,
      {
        isLastPage,
        cellsMetadata: null,
      },
    );
  }

  notifyDataBars(dataBars?: Array<[string, string]>): void {
    this.dataBars = (dataBars || []).map((item) => {
      if (!item) {
        return item;
      }
      const [min, max] = item;
      return [parseFloat(min), parseFloat(max)];
    });
    if (this.state && this.state.tableSize) {
      this.state.tableSize.updateDataBarsMinMax(this.dataBars);
    }
  }

  notifyRangeMinMax(rangeMinMax?: Array<[string, string]>): void {
    this.rangeMinMax = (rangeMinMax || []).map((item) => {
      if (!item) {
        return item;
      }
      const [min, max] = item;
      return [parseFloat(min), parseFloat(max)];
    });
    if (this.state && this.state.tableSize) {
      this.state.tableSize.updateRangeMinMax(this.rangeMinMax);
    }
  }

  createTableSize(): TableSize {
    if (this.state && this.state.tableSize) {
      this.state.tableSize.off(EVENT_SIZE_CHANGED, this.onChange);
    }
    const tableSize = new TableSize(this.dataBars, this.rangeMinMax);
    tableSize.on(EVENT_SIZE_CHANGED, this.onChange);
    return tableSize;
  }

  hasContent() {
    return !(this.rowsCount === 0 && this.colsCount === 0);
  }

  getDimensions(): DimensionsProps {
    const defaultSize = {
      getTreeChildLength: () => 0,
      getTreeDeepsLength: () => 0,
    };
    const {
      columnsTreeService = defaultSize,
      cornerTreeService = defaultSize,
      rowsTreeService = defaultSize,
    } = this.state;
    if (rowsTreeService) {
      let columnsLength =
        columnsTreeService === undefined ? 0 : columnsTreeService.getTreeChildLength();
      if (cornerTreeService) {
        columnsLength += cornerTreeService.getTreeChildLength();
      }

      const rowsLength =
        rowsTreeService.getTreeChildLength() +
        (columnsTreeService === undefined ? 0 : columnsTreeService.getTreeDeepsLength());
      return {
        height: Array.from({ length: rowsLength }, (key, index) => [
          index,
          this.getRowHeight(index),
        ]),
        width: Array.from({ length: columnsLength }, (key, index) => [
          index,
          this.getColumnWidth(index),
        ]),
      };
    }
    return { height: [], width: [] };
  }

  getColumnWidth(columnIndex: number): number {
    return this.state.tableSize.columnWidth({ index: columnIndex });
  }

  /**
   * Returns row height from cellMeasurerCache
   *
   * @param {number} rowIndex - column index
   * @returns {number} - column width
   */
  getRowHeight(rowIndex: number): number {
    return this.state.tableSize.rowHeight({ index: rowIndex });
  }

  initTableSize(props: {
    rowsTreeService?: TreeServiceI;
    columnsTreeService?: TreeServiceI;
    cornerTreeService?: TreeServiceI;
  }) {
    this.data = [];
    if (props.rowsTreeService) {
      this.data = props.rowsTreeService.extractData(props.columnsTreeService);
    }

    this.rowsCount = 0;
    this.colsCount = 0;

    this.fixRowsCount = 0;
    this.fixColsCount = 0;

    this.cornerTable = [];
    if (props.cornerTreeService) {
      this.cornerTable = props.cornerTreeService.getGrid();
      this.fixRowsCount = this.cornerTable.length;
      this.rowsCount += this.fixRowsCount;
      if (this.cornerTable[0]) {
        this.fixColsCount = this.cornerTable[0].length;
        this.colsCount += this.fixColsCount;
      }
    }

    this.columnsTable = [];
    if (props.columnsTreeService) {
      this.columnsTable = props.columnsTreeService.getGrid();
      if (this.columnsTable[0]) {
        this.colsCount += this.columnsTable[0].length;
      }
      if (!props.cornerTreeService) {
        this.fixRowsCount = this.columnsTable.length;
        this.rowsCount += this.fixRowsCount;
      }
    }

    this.rowsTable = [];
    if (props.rowsTreeService) {
      this.rowsTable = props.rowsTreeService.getGrid();
      this.rowsCount += this.rowsTable.length;
    }

    // console.log('this.rowsCount', this.rowsCount);
    // console.log('this.colsCount', this.colsCount);
    // console.log('this.fixRowsCount', this.fixRowsCount);
    // console.log('this.fixColsCount', this.fixColsCount);
    // console.log('this.cornerTable', this.cornerTable);
    // console.log('this.columnsTable', this.columnsTable);
    // console.log('this.rowsTable', this.rowsTable);
    // console.log('this.data', this.data);
  }

  resizeColumnStart(): void {
    this.setState({ isResizeInProgress: true });
  }

  resizeColumn(
    columnsAndWidths: Array<Array<number>>,
    // eslint-disable-next-line no-unused-vars
    cellPosition: { columnIndex: number },
    // eslint-disable-next-line no-unused-vars
    changes: { width?: boolean; height?: boolean },
  ): void {
    const [index, width] = columnsAndWidths[0];
    this.state.tableSize.setFixedWidth(index, width);
  }

  resizeColumnEnd(width: number, columnIndex: number): void {
    this.setState({ isResizeInProgress: false });
    const resizeWidthParams = [columnIndex, width];
    const horizontalLastLevelsNodes = getHorizontalLastLevelsNodes(this.state);
    if (this.props.onUpdatePredefinedColumnWidth) {
      const resizeColumnsWidth = this.props.onUpdatePredefinedColumnWidth(
        horizontalLastLevelsNodes,
        resizeWidthParams,
      );
      this.state.tableSize.setInitialFixedWidth(resizeColumnsWidth);
      this.state.tableSize.notifyChange();
    } else {
      this.state.tableSize.setFixedWidth(columnIndex, width);
    }
  }

  /**
   * Notify table about cell 'domready' promise to wait
   *
   * @param {Defer} defer - defer object
   * @returns {void}
   */
  addCellDomReadyPromise = (defer?: Defer): void => {
    this.cellDomReadyPromises = this.cellDomReadyPromises || [];
    if (defer) {
      this.cellDomReadyPromises.push(defer.promise);
    }
  };

  removeCellDomReadyPromise = (defer?: Defer): void => {
    this.cellDomReadyPromises = this.cellDomReadyPromises || [];
    if (defer) {
      // eslint-disable-next-line max-len
      this.cellDomReadyPromises = this.cellDomReadyPromises.filter((p) => p !== defer.promise);
    }
  };

  onChange = (
    widthChanges: { [colIndex: number]: number },
    heightChanges: { [rowIndex: number]: number },
  ) => {
    this.setState({
      widths: widthChanges,
      heights: heightChanges,
    });

    if (this.topContainer) {
      this.topContainer.classList.add('active');
    }
    if (this.leftContainer) {
      this.leftContainer.classList.add('active');
    }
    if (this.rightContainer) {
      this.rightContainer.classList.add('active');
    }
    if (this.isMainGridUpdateSkiped) {
      this.isMainGridUpdateSkiped = false;
      this.onMainGridUpdated();
    }
  };

  onResize = () => {
    const zoomRatio = window.devicePixelRatio || 1;
    if (this.state.zoomRatio !== zoomRatio) {
      this.setState({
        zoomRatio,
        borderWidth: getActualBorderWidth(this.props.borderWidth || 1),
      });
    }
  };

  onScroll = (event: React.SyntheticEvent) => {
    const scrollTarget = event.target as HTMLDivElement;

    const top = scrollTarget.scrollTop;
    const left = scrollTarget.scrollLeft;

    if (this.leftContainer) {
      this.leftContainer.scrollTop = top;
    }

    if (this.topContainer) {
      this.topContainer.scrollLeft = left;
    }

    if (this.scrollContainer && this.scrollContainer.view) {
      this.scrollContainer.view.scrollTop = top;
    }
  };

  onMouseScroll = (event: React.SyntheticEvent, dir: number) => {
    const WHEEL_STEP = 40;
    let scrollTop = 0;
    // eslint-disable-next-line no-unused-vars
    const scrollLeft = 0;

    let newScrollTop = 0;
    // eslint-disable-next-line no-unused-vars
    const newScrollLeft = 0;

    if (this.scrollContainer && this.scrollContainer.view) {
      const { offsetHeight, scrollHeight } = this.scrollContainer.view;
      scrollTop = this.scrollContainer.view.scrollTop;

      newScrollTop = scrollTop + -dir * WHEEL_STEP;

      if (dir > 0) {
        // scroll up
        if (newScrollTop > 0) {
          event.preventDefault();
        }
      } else {
        // scroll down
        // eslint-disable-next-line no-lonely-if
        if (newScrollTop < scrollHeight - offsetHeight) {
          event.preventDefault();
        }
      }

      this.scrollContainer.view.scrollTop = newScrollTop;
    }
  };

  onMainGridUpdated = () => {
    if (this.state.tableSize.hasPendingChanges()) {
      this.isMainGridUpdateSkiped = true;
      return;
    }
    this.isMainGridUpdateSkiped = false;

    if (this.props.onGridUpdated) {
      this.props.onGridUpdated();
    }
    if (this.props.onInitLoadingFinish && !this.isDomReadyTriggered) {
      this.props.onInitLoadingFinish();
    }
    if (this.props.onTotalSizeChange && this.scrollContainer && this.scrollContainer.view) {
      const table = this.scrollContainer.view.children[0];
      const height = table.scrollHeight + this.props.scrollBarsMargin;
      this.props.onTotalSizeChange(height);
    }
    if (this.props.isFullWidth && !this.isDomReadyTriggered && !this.isFullWidthRefreshed) {
      this.isFullWidthRefreshed = true;
      const { width, scrollBarsMargin = 0 } = this.props;
      const { tableSize } = this.state;
      tableSize.fitWidths(width - scrollBarsMargin);
      return;
    }

    if (this.props.onDomReady && this.cellDomReadyPromises && !this.isDomReadyTriggered) {
      this.isDomReadyTriggered = true;
      const { onDomReady } = this.props;
      const domReadyTriggerTime = new Date().getTime();

      Promise.all(this.cellDomReadyPromises)
        .catch((err) => {
          this.logger.warn(`Cell "domready" promise rejected with "${err.message}"`);
        })
        .then(() => {
          if (this.domReadyTriggerTime !== domReadyTriggerTime) {
            return;
          }
          onDomReady();
        });
      this.domReadyTriggerTime = domReadyTriggerTime;
    }
  };

  // eslint-disable-next-line sonarjs/cognitive-complexity,max-lines-per-function
  cellRenderer = (props: CellRenderProps) => {
    const { type, clone, rowIndex, colIndex, isMobile, colWidth: colWidthExplicit } = props;
    const { borderWidth, tableSize } = this.state;
    const { columnWidth } = tableSize;
    const addCellDomReadyPromise = this.props.addCellDomReadyPromise || this.addCellDomReadyPromise;
    const removeCellDomReadyPromise =
      this.props.removeCellDomReadyPromise || this.removeCellDomReadyPromise;

    let tableType = type;

    let treeService;

    let curRowIndex = rowIndex;
    let curColIndex = colIndex;

    let itemMetadata;

    let dataNode: PivotDataNode | undefined;

    let rowTreeNode: PivotTreeNode | undefined;
    let rowMetadata: TreeNodeMetadata | undefined;
    let columnTreeNode: PivotTreeNode | undefined;
    let columnMetadata: TreeNodeMetadata | undefined;
    let measureTreeNode: PivotTreeNode | undefined;

    let treeNode: PivotTreeNode | undefined;
    let metadata;

    let columnsOffset = 0;
    let rowsOffset = 0;
    let mergedCellWidth;

    let keyToGetItemMetadata;

    if (rowIndex >= this.fixRowsCount && colIndex >= this.fixColsCount) {
      // data
      curColIndex -= this.fixColsCount;
      curRowIndex -= this.fixRowsCount;
      try {
        dataNode = this.data[curRowIndex][curColIndex];
      } catch (err) {
        throw new Error(`cellRenderer can't find data item for ${rowIndex}-${curColIndex}`);
      }
      keyToGetItemMetadata = `${curRowIndex + this.fixRowsCount}-${
        curColIndex + this.fixColsCount
      }`;
      itemMetadata = this.cellsMetadata.get(keyToGetItemMetadata);
      if (this.state.rowsTreeService) {
        rowMetadata = this.state.rowsTreeService.getMetadata(curRowIndex, Infinity);
        const lastLevelNodes = this.state.rowsTreeService.getLastLevelNodes();
        rowTreeNode = createPivotTreeNode(lastLevelNodes[curRowIndex]);
      }

      if (this.state.columnsTreeService) {
        columnMetadata = this.state.columnsTreeService.getMetadata(Infinity, curColIndex);
        const lastLevelNodes = this.state.columnsTreeService.getLastLevelNodes();
        columnTreeNode = createPivotTreeNode(lastLevelNodes[curColIndex]);
        if (columnTreeNode && columnTreeNode.metadataType === PanelType.MEASURES) {
          // if last node is measure, save it and find parent
          measureTreeNode = columnTreeNode;
          if (columnTreeNode.parent) {
            columnTreeNode = createPivotTreeNode(columnTreeNode.parent);
          }
        } else if (columnMetadata) {
          if (columnMetadata.valueNode) {
            measureTreeNode = createPivotTreeNode(columnMetadata.valueNode);
          }
        }
      }
    } else if (colIndex >= this.fixColsCount) {
      tableType = typeOfTable.COLUMNS;
      // columns
      treeService = this.state.columnsTreeService;
      curColIndex -= this.fixColsCount;
      columnsOffset = this.fixColsCount;
    } else if (rowIndex >= this.fixRowsCount) {
      tableType = typeOfTable.ROWS;
      // rows
      treeService = this.state.rowsTreeService;
      curRowIndex -= this.fixRowsCount;
      rowsOffset = this.fixRowsCount;
    } else {
      tableType = typeOfTable.CORNER;
      // corner
      treeService = this.state.cornerTreeService;
    }

    if (treeService) {
      const treeNodeItem = treeService.getTreeNode(curRowIndex, curColIndex);
      treeNode = treeNodeItem ? createPivotTreeNode(treeNodeItem) : undefined;
      metadata = treeService.getMetadata(curRowIndex, curColIndex);

      keyToGetItemMetadata = `${curRowIndex}-${curColIndex}`;
      if (colIndex >= this.fixColsCount) {
        // columns
        keyToGetItemMetadata = `${curRowIndex}-${curColIndex + this.fixColsCount}`;
      } else if (rowIndex >= this.fixRowsCount) {
        // rows
        keyToGetItemMetadata = `${curRowIndex + this.fixRowsCount}-${curColIndex}`;
      }
      itemMetadata = this.cellsMetadata.get(keyToGetItemMetadata);

      mergedCellWidth = treeService.getMainCellWidth(
        curRowIndex,
        curColIndex,
        columnWidth,
        borderWidth,
        { columnsOffset, offsetTop: rowsOffset },
      );
    }

    const store = (treeNode || dataNode || {}).store || {};
    this.addCellDomReadyPromise(store.domReadyDefer || store.domReadyDeffer);

    let merge: { colSpan?: number; rowSpan?: number } = {};
    let isNull = false;
    let colWidth = columnWidth({ index: colIndex });
    let fixedWidth = false;

    if (treeService && treeService.isChildren(curRowIndex, curColIndex)) {
      isNull = true;
    } else if (treeService && treeService.hasChildren(curRowIndex, curColIndex)) {
      merge = treeService.getMainCellSpans(curRowIndex, curColIndex);
      if (mergedCellWidth) {
        colWidth = mergedCellWidth;
      }
    }

    const fw = this.state.tableSize.hasInitialFixedWidth(colIndex);

    if (fw || clone) {
      fixedWidth = true;
    }

    // Prevents rows header table flickering during sorting by setting non-NaN column width size.
    if (fixedWidth && isNaN(colWidth) && colWidthExplicit) {
      colWidth = colWidthExplicit;
    }

    if (isNull) {
      return null;
    }
    return (
      <PivotCell
        key={keyToGetItemMetadata}
        isDataCell={!!dataNode}
        tdComponent="td"
        measure={this.measure}
        onSortingMetadataUpdate={this.props.onSortingMetadataUpdate}
        styleObj={this.styleObj}
        onSortingSettingsChanged={this.props.onSortingSettingsChanged}
        getSortingPopupContainer={this.props.getSortingPopupContainer}
        borderWidth={borderWidth}
        borderColor={this.props.borderColor}
        dataNode={dataNode}
        cellMetadata={itemMetadata}
        metadata={metadata}
        treeNode={treeNode}
        rowIndex={rowIndex}
        columnIndex={colIndex}
        tableType={tableType}
        rowTreeNode={rowTreeNode}
        rowMetadata={rowMetadata}
        columnTreeNode={columnTreeNode}
        columnMetadata={columnMetadata}
        measureTreeNode={measureTreeNode}
        parent={this}
        fixedWidth={fixedWidth}
        tableSize={this.state.tableSize}
        isSelectedMode={this.props.isSelectedMode}
        allowHtml={this.props.allowHtml}
        onCellClick={this.props.onCellClick}
        onCellEnter={this.props.onCellEnter}
        onCellLeave={this.props.onCellLeave}
        {...merge}
        colWidth={colWidth}
        clone={clone}
        zoomRatio={this.state.zoomRatio}
        rowHeight={this.props.rowHeight}
        imageColumns={this.props.imageColumns}
        fallbackImageUrl={this.props.fallbackImageUrl}
        addCellDomReadyPromise={addCellDomReadyPromise}
        removeCellDomReadyPromise={removeCellDomReadyPromise}
        isMobile={isMobile}
      />
    );
  };

  scrollContainerRef = (ref: CustomScroll | null) => {
    if (ref) {
      this.scrollContainer = ref;

      if (this.resetScroll && this.scrollContainer && this.scrollContainer.view) {
        this.resetScroll = false;
        this.scrollContainer.view.scrollTop = 0;
        this.scrollContainer.view.scrollLeft = 0;
      }
    }
  };

  leftContainerRef = (ref: HTMLDivElement | null) => {
    if (ref) {
      this.leftContainer = ref;
    }
  };

  topContainerRef = (ref: HTMLDivElement | null) => {
    if (ref) {
      this.topContainer = ref;
    }
  };

  rightContainerRef = (ref: HTMLDivElement | null) => {
    if (ref) {
      this.rightContainer = ref;
    }
  };

  render() {
    const { widths, heights, borderWidth, rowsTreeService, columnsTreeService, cornerTreeService } =
      this.state;
    const { width, height, borderColor, scrollBarsMargin, className, isFixedEnabled, isMobile } =
      this.props;
    const { rowsCount, colsCount, fixRowsCount, fixColsCount } = this;

    const scrollStyle = { width, height };

    const tableHeight = scrollStyle.height - scrollBarsMargin;
    const tableWidth = scrollStyle.width - scrollBarsMargin;

    let fWidth = 0;
    let fHeight = 0;

    if (widths[0]) {
      fWidth = Array.from(Array(fixColsCount)).reduce(
        (prev, cur, index) => prev + widths[index],
        0,
      );
      fWidth += borderWidth || 1;
      fHeight = Array.from(Array(fixRowsCount)).reduce(
        (prev, cur, index) => prev + heights[index],
        0,
      );
      fHeight += borderWidth || 1;
    }
    fWidth = Math.ceil(fWidth);
    fHeight = Math.ceil(fHeight);

    const noFixedLeftCN = fWidth / tableWidth > 0.75 ? MULTIGRID_NO_FIXED_LEFT : '';
    let noClasses = '';
    if (fixRowsCount === 0 && fixColsCount === 0) {
      noClasses += `${MULTIGRID_NO_ROWS} ${MULTIGRID_NO_COLUMNS} ${MULTIGRID_NO_CORNER}`;
    } else if (fixColsCount === 0) {
      noClasses += `${MULTIGRID_NO_ROWS} ${MULTIGRID_NO_CORNER}`;
    }

    return (
      <MouseWheelCatcher
        onMouseScroll={this.onMouseScroll}
        className={`${MULTIGRID} ${MULTIGRID_NEW} ${noFixedLeftCN} ${noClasses} ${className}`}
      >
        <CustomScroll
          ref={this.scrollContainerRef}
          style={scrollStyle}
          scrollOffset={scrollBarsMargin}
          onScroll={this.onScroll}
        >
          <div className={`${TABLEGRID} ${TABLEGRID_DATA} ${TABLEGRID_BOTTOM} ${TABLEGRID_RIGHT}`}>
            <PivotInnerTable
              type={typeOfTable.DATA}
              rowsCount={rowsCount}
              colsCount={colsCount}
              widths={widths}
              heights={heights}
              rowsTreeService={rowsTreeService}
              columnsTreeService={columnsTreeService}
              cornerTreeService={cornerTreeService}
              borderWidth={borderWidth}
              borderColor={borderColor}
              tableSize={this.state.tableSize}
              cellRenderer={this.cellRenderer}
              zoomRatio={this.state.zoomRatio}
              onGridUpdated={this.onMainGridUpdated}
              isMobile={isMobile}
            />
          </div>
        </CustomScroll>
        {isFixedEnabled ? (
          <>
            <div
              ref={this.leftContainerRef}
              className={`${TABLEGRID} ${TABLEGRID_FIXED} ${TABLEGRID_ROWS} ${TABLEGRID_BOTTOM} ${TABLEGRID_LEFT}`}
              style={{ width: fWidth, height: tableHeight }}
            >
              <PivotInnerTable
                clone
                type={typeOfTable.ROWS}
                rowsCount={rowsCount}
                colsCount={fixColsCount}
                widths={widths}
                heights={heights}
                rowsTreeService={rowsTreeService}
                borderWidth={borderWidth}
                borderColor={borderColor}
                tableSize={this.state.tableSize}
                cellRenderer={this.cellRenderer}
                zoomRatio={this.state.zoomRatio}
                isMobile={isMobile}
              />
            </div>

            <div
              ref={this.topContainerRef}
              className={`${TABLEGRID} ${TABLEGRID_FIXED} ${TABLEGRID_COLUMNS} ${TABLEGRID_TOP} ${TABLEGRID_RIGHT}`}
              style={{ height: fHeight, width: tableWidth }}
            >
              <PivotInnerTable
                clone
                type={typeOfTable.COLUMNS}
                rowsCount={fixRowsCount}
                colsCount={colsCount}
                widths={widths}
                heights={heights}
                columnsTreeService={columnsTreeService}
                borderWidth={borderWidth}
                borderColor={borderColor}
                tableSize={this.state.tableSize}
                cellRenderer={this.cellRenderer}
                zoomRatio={this.state.zoomRatio}
                isMobile={isMobile}
              />
            </div>

            <div
              ref={this.rightContainerRef}
              className={`${TABLEGRID} ${TABLEGRID_FIXED} ${TABLEGRID_CORNER} ${TABLEGRID_TOP} ${TABLEGRID_LEFT}`}
              style={{ width: fWidth, height: fHeight }}
            >
              <PivotInnerTable
                clone
                type={typeOfTable.CORNER}
                rowsCount={fixRowsCount}
                colsCount={fixColsCount}
                widths={widths}
                heights={heights}
                cornerTreeService={cornerTreeService}
                borderWidth={borderWidth}
                borderColor={borderColor}
                tableSize={this.state.tableSize}
                cellRenderer={this.cellRenderer}
                zoomRatio={this.state.zoomRatio}
                isMobile={isMobile}
              />
            </div>
          </>
        ) : null}
      </MouseWheelCatcher>
    );
  }
}

export default PivotTable;
