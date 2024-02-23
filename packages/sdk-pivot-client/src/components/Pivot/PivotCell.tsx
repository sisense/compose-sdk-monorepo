import * as React from 'react';
import cn from 'classnames';
import {
  CONTENT,
  CONTENT_WRAPPER,
  CONTENT_INNER,
  CELL_CORNER,
  CELL_FIXED_WIDTH,
  CELL,
  CELL_SELECTED,
  CELL_DRILLED,
  CELL_SORTED,
  CELL_SORTED_ASC,
  CELL_SORTED_DESC,
  CELL_DEFAULT_SORTED_ASC,
  CELL_DEFAULT_SORTED_DESC,
  ICON_SORTING_SETTINGS,
  ICON_SORTING_SETTINGS_PERSISTENT,
  CELL_SORTED_INACTIVE,
} from '../PivotTable/classes.js';
import { SortingDirection, UserType } from '../../data-handling/constants.js';
import { ResizeColumnControl } from '../ResizeColumnControl';
import { DataBar } from '../DataBar';
import { tableType as typeOfTable } from '../PivotTable/constants.js';
import { getDefaultSortDirection } from '../../data-load/utils';
import { TreeNodeMetadata } from '../../tree-structure/types.js';
import {
  PivotTreeNode,
  PivotDataNode,
  PivotCellEvent,
  EmbedComponentProps,
} from '../../data-handling';
import { Metadata } from '../../data-handling/utils/plugins/types.js';
import { Defer, Styles, InputStyles } from '../../utils/types.js';
import { TableSize, EVENT_RANGEMINMAX_CHANGED } from '../../sizing/index.js';
import { EmbedImage } from './EmbedImage.js';
import {
  getMetadataClasses,
  getBorders,
  getUserTypeClasses,
  getMergeClasses,
  getMergedCellOffset,
  getCellSize,
  getStyleProp,
  clearCellStyles,
  clearCellContentStyles,
  clearDatabarsStyles,
  getRangeColor,
} from '../PivotCell/helpers.js';
import { SortingSettingsIcon } from './SortingSettingsIcon.js';

const MIN_RESIZE_WIDTH = 50;

const htmlExp = new RegExp('<\\/?[\\w\\s="/.\':;#-\\/\\?]+>');

const ContentTypes = {
  TEXT: 'text',
  HTML: 'html',
  COMPONENT: 'component',
};

type Props = {
  // common properties
  isDataCell: boolean;
  /** function to notify cell size changed */
  measure: Function;
  /** cell row index */
  rowIndex: number;
  /** cell column index */
  columnIndex: number;
  /** defines in cell column has predefined fixed with or not */
  fixedWidth: boolean;
  /** TD component name td | div */
  tdComponent: string;
  /** table type CORNER | COLUMNS | ROWS | DATA */
  tableType?: string;
  /** border width for virtual borders */
  borderWidth?: number;
  /** border color for borders */
  borderColor?: string;
  /** allow render any html */
  allowHtml?: boolean;
  /** reference to PivotTable component */
  parent?: Record<any, any>;
  /** on cell click event */
  onCellClick?: (cellData: PivotCellEvent) => void;
  /** on cell mouse enter event */
  onCellEnter?: (cellData: PivotCellEvent) => void;
  /** on cell mouse leave event */
  onCellLeave?: (cellData: PivotCellEvent) => void;
  /** filters highlight mode, not slice or */
  isSelectedMode?: boolean;

  tableSize?: TableSize;
  clone?: boolean;
  zoomRatio?: number;

  // for Header cell
  /** merged row/col count  */
  merge?: { colSpan?: number; rowSpan?: number };

  colSpan?: number;

  rowSpan?: number;

  colWidth?: number;

  /** cell content size  */
  styleObj: InputStyles;
  /** header tree node  */
  treeNode?: PivotTreeNode;
  /** header tree node metadata */
  metadata?: TreeNodeMetadata;
  /** column type header cell */
  onSortingMetadataUpdate?: (node: PivotTreeNode, measureNode?: PivotTreeNode) => any;
  onSortingSettingsChanged: (
    treeNode: PivotTreeNode | undefined,
    metadata: TreeNodeMetadata | undefined,
    cell: PivotCell,
  ) => void;
  getSortingPopupContainer?: () => HTMLElement;
  // for Data cell
  /** header tree node  */
  dataNode?: PivotDataNode;
  /** header tree node  */
  cellMetadata?: Metadata;
  /** related row header tree node */
  rowTreeNode?: PivotTreeNode;
  /** related row header tree node metadata */
  rowMetadata?: TreeNodeMetadata;
  /** related column header tree node */
  columnTreeNode?: PivotTreeNode;
  /** related column header tree node metadata */
  columnMetadata?: TreeNodeMetadata;
  /** related measure header tree node */
  measureTreeNode?: PivotTreeNode;
  /** embed image options */
  rowHeight?: number;
  imageColumns?: Array<number>;
  fallbackImageUrl?: string;
  addCellDomReadyPromise?: (defer?: Defer) => void;
  removeCellDomReadyPromise?: (defer?: Defer) => void;
  isMobile?: boolean;
};

type State = {
  isDrilled?: boolean;
  isSelected?: boolean;
  sortIconShouldBeVisible?: boolean;
  sortingPopup: JSX.Element | null;
  merge?: { colSpan?: number; rowSpan?: number };
  isEmbedImage?: boolean;
  backgroundColor?: string;
};

export class PivotCell extends React.PureComponent<Props, State> {
  cellEl: HTMLDivElement | undefined;

  metadataClassName?: string;

  virtualBorderStyle?: Styles;

  cellStyle?: Styles | boolean;

  cellContentStyle?: Styles;

  databarStyle?: Styles;

  cachedHtml?: { data: string; html: any };

  timeoutId?: NodeJS.Timeout | number;

  isMouseInCell?: boolean;

  static defaultProps = {
    isDataCell: false,
    fixedWidth: false,
    borderWidth: 1,
    onSortingMetadataUpdate: () => {},
  };

  constructor(props: Props) {
    super(props);

    this.state = {
      isDrilled: false,
      isSelected: this.getSelectStatus(),
      sortIconShouldBeVisible: false,
      sortingPopup: null,
      merge: props.merge ? props.merge : { colSpan: props.colSpan, rowSpan: props.rowSpan },
      isEmbedImage: this.getIsEmbedImageStatus(props),
    };
  }

  componentDidMount(): void {
    if (this.props.tableSize) {
      this.props.tableSize.notifyChange();

      this.props.tableSize.on(EVENT_RANGEMINMAX_CHANGED, this.onRangeMinMaxChange);

      const data = this.props.tableSize.getRangeMinMax();
      if (data) {
        this.onRangeMinMaxChange(data);
      }
    }
    this.dataBarsCheck();
    // eslint-disable-next-line max-lines
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props): void {
    // const changedProps = getChangedProps(this.props, nextProps);
    // console.log(changedProps);
    if (
      this.props.metadata !== nextProps.metadata ||
      this.props.rowMetadata !== nextProps.rowMetadata ||
      this.props.columnMetadata !== nextProps.columnMetadata ||
      this.props.rowIndex !== nextProps.rowIndex ||
      this.props.columnIndex !== nextProps.columnIndex ||
      this.props.fixedWidth !== nextProps.fixedWidth
    ) {
      this.metadataClassName = undefined;
    }

    if (
      this.props.borderWidth !== nextProps.borderWidth ||
      this.props.borderColor !== nextProps.borderColor ||
      this.props.colWidth !== nextProps.colWidth
    ) {
      this.virtualBorderStyle = undefined;
      this.cellStyle = undefined;
      this.cellContentStyle = undefined;
      this.databarStyle = undefined;
    }

    if (
      this.props.isDataCell !== nextProps.isDataCell ||
      this.props.treeNode !== nextProps.treeNode ||
      this.props.dataNode !== nextProps.dataNode ||
      getStyleProp(this.props) !== getStyleProp(nextProps)
    ) {
      this.cellStyle = undefined;
      this.cellContentStyle = undefined;
      this.databarStyle = undefined;
      this.setState({
        isSelected: false,
        backgroundColor: undefined,
      });
    }

    if (this.props.tableSize !== nextProps.tableSize) {
      if (this.props.tableSize) {
        this.props.tableSize.off(EVENT_RANGEMINMAX_CHANGED, this.onRangeMinMaxChange);
      }
      if (nextProps.tableSize) {
        nextProps.tableSize.on(EVENT_RANGEMINMAX_CHANGED, this.onRangeMinMaxChange);

        const data = nextProps.tableSize.getRangeMinMax();
        if (data) {
          this.onRangeMinMaxChange(data, nextProps);
        }
      }
    }

    if (
      this.props.merge !== nextProps.merge ||
      this.props.colSpan !== nextProps.colSpan ||
      this.props.rowSpan !== nextProps.rowSpan
    ) {
      this.cellStyle = undefined;
      this.cellContentStyle = undefined;
      this.databarStyle = undefined;
      this.setState({
        merge: nextProps.merge
          ? nextProps.merge
          : { colSpan: nextProps.colSpan, rowSpan: nextProps.rowSpan },
      });
    }

    const nextNode = nextProps.isDataCell ? nextProps.dataNode : nextProps.treeNode;
    if (
      this.props.isSelectedMode &&
      nextNode &&
      nextNode.state &&
      // @ts-ignore
      !nextNode.state.sliced
    ) {
      this.select('isSelected');
    }

    if (
      this.props.imageColumns !== nextProps.imageColumns ||
      this.props.treeNode !== nextProps.treeNode
    ) {
      this.setState({
        isEmbedImage: this.getIsEmbedImageStatus(nextProps),
      });
    }
  }

  componentDidUpdate(): void {
    if (this.props.tableSize) {
      this.props.tableSize.notifyChange();
    }
    this.dataBarsCheck();
  }

  componentWillUnmount() {
    this.metadataClassName = undefined;
    this.virtualBorderStyle = undefined;
    this.cellStyle = undefined;
    this.cellContentStyle = undefined;
    this.databarStyle = undefined;
    if (this.props.tableSize) {
      this.props.tableSize.off(EVENT_RANGEMINMAX_CHANGED, this.onRangeMinMaxChange);
    }
  }

  dataBarsCheck() {
    const { tableSize, columnIndex, rowIndex } = this.props;

    const hasDataBars = this.hasDataBars();
    if (hasDataBars && this.cellEl && tableSize) {
      let size = 0;
      const inner = this.cellEl.querySelector<HTMLDivElement>(`.${CONTENT_INNER}`);
      if (inner) {
        size = inner.offsetWidth;
      }
      tableSize.updateDataBars(columnIndex, rowIndex, size);
    }
  }

  getSelectStatus(): boolean {
    let node;
    if (this.props.columnTreeNode) {
      node = this.props.dataNode;
    } else if (this.props.treeNode) {
      node = this.props.treeNode;
    }

    return !!(
      this.props.isSelectedMode &&
      node &&
      node.state &&
      // @ts-ignore
      node.state.selected
    );
  }

  getIsEmbedImageStatus(props: Props): boolean {
    const { isDataCell, tableType, imageColumns } = props;
    const { columnIndex } = this.props;
    if (!isDataCell) {
      return !!(
        tableType === typeOfTable.ROWS &&
        imageColumns &&
        imageColumns.includes(columnIndex)
      );
    }
    return false;
  }

  /**
   * Mark cell as selected
   *
   * @param {string} key - key of state object
   *
   * @returns {void}
   */
  select(key: keyof State): void {
    const newProp = {
      [key]: true,
    };
    this.setState((prevState) => ({
      ...prevState,
      ...newProp,
    }));
  }

  /**
   * Mark cell as unselected
   *
   * @param {string} key - key of state object
   *
   * @returns {void}
   */
  unselect(key: keyof State): void {
    const newProp = {
      [key]: false,
    };
    this.setState((prevState) => ({
      ...prevState,
      ...newProp,
    }));
  }

  /**
   * Get cell select status
   *
   * @returns {boolean} - return isSelected value
   */
  isDrilled(): boolean | undefined {
    return this.state.isDrilled;
  }

  hasDataBars(): boolean {
    const { tableType, rowTreeNode, columnTreeNode, measureTreeNode } = this.props;

    if (tableType !== typeOfTable.DATA) {
      return false;
    }
    if (!measureTreeNode || !measureTreeNode.databars) {
      return false;
    }
    if (
      rowTreeNode &&
      (rowTreeNode.userType === UserType.SUB_TOTAL || rowTreeNode.userType === UserType.GRAND_TOTAL)
    ) {
      return false;
    }
    if (
      columnTreeNode &&
      (columnTreeNode.userType === UserType.SUB_TOTAL ||
        columnTreeNode.userType === UserType.GRAND_TOTAL)
    ) {
      return false;
    }
    return true;
  }

  /**
   * Calculates new className string for cell or use cached one
   *
   * @returns {string} - class names
   * @private
   */
  getClassName(): string | undefined {
    const {
      isDataCell,
      rowIndex,
      columnIndex,
      metadata,
      rowMetadata,
      columnMetadata,
      treeNode,
      rowTreeNode,
      columnTreeNode,
      fixedWidth,
      tableType = '',
    } = this.props;
    const { merge } = this.state;

    if (this.metadataClassName === undefined) {
      const cellRowClassName = `${CELL}--row-${rowIndex}`;
      const cellColumnClassName = `${CELL}--col-${columnIndex}`;
      let mergeClasses = '';
      let metadataClassName = '';
      let userType = '';
      if (isDataCell) {
        metadataClassName = `
                    ${getMetadataClasses(rowMetadata, CELL, 'row')}
                    ${getMetadataClasses(columnMetadata, CELL, 'col')}
                `.trim();
        userType = `
                    ${getUserTypeClasses(rowTreeNode, CELL, 'row')}
                    ${getUserTypeClasses(columnTreeNode, CELL, 'col')}
                `.trim();
        mergeClasses = `
                    ${getMergeClasses(merge, CELL, 'row')}
                    ${getMergeClasses(merge, CELL, 'col')}
                `.trim();
      } else {
        metadataClassName = getMetadataClasses(metadata, CELL);
        userType = getUserTypeClasses(treeNode, CELL);
        mergeClasses = getMergeClasses(merge, CELL);
      }

      this.metadataClassName = cn(
        CELL,
        `${CELL}--new`,
        `${CELL}--${tableType}`,
        cellRowClassName,
        cellColumnClassName,
        metadataClassName,
        userType,
        mergeClasses,
        fixedWidth ? CELL_FIXED_WIDTH : '',
      );
    }
    return this.metadataClassName;
  }

  /**
   * Calculates new cell style object or use cached one
   *
   * @returns {object | boolean} - style object
   * @private
   */
  getCellStyle(): Styles | boolean | undefined {
    if (this.cellStyle === undefined) {
      const {
        treeNode,
        rowTreeNode,
        columnTreeNode,
        metadata,
        rowMetadata,
        columnMetadata,
        tableType = '',
      } = this.props;
      const { merge, backgroundColor } = this.state;
      const borders = getBorders(tableType, {
        metadata,
        rowMetadata,
        columnMetadata,
        treeNode,
        rowTreeNode,
        columnTreeNode,
        merge,
      });
      const nodeStyle = getStyleProp(this.props);
      this.cellStyle = clearCellStyles(nodeStyle);
      this.cellStyle.borderWidth = this.props.borderWidth;
      if (this.cellStyle.borderColor === undefined) {
        delete this.cellStyle.borderColor;
      }
      if (!borders.b) {
        if (this.cellStyle.borderColor) {
          this.cellStyle.borderTopColor = this.cellStyle.borderColor;
          this.cellStyle.borderLeftColor = this.cellStyle.borderColor;
          this.cellStyle.borderRightColor = this.cellStyle.borderColor;
          delete this.cellStyle.borderColor;
        }
        this.cellStyle.borderBottomColor = 'transparent';
      }
      if (backgroundColor && !this.cellStyle.backgroundColor) {
        this.cellStyle.backgroundColor = backgroundColor;
      }
    }

    return this.cellStyle;
  }

  /**
   * Calculates new cell conent style object or use cached one
   *
   * @returns {object} - style object
   * @private
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  getCellContentStyle(): Styles | undefined {
    if (this.cellContentStyle === undefined) {
      const { fixedWidth, styleObj, colWidth, rowHeight, tableType } = this.props;
      const nodeStyle = getStyleProp(this.props);
      this.cellContentStyle = clearCellContentStyles(nodeStyle);

      if ((fixedWidth || this.state.isEmbedImage) && (styleObj.width !== undefined || colWidth)) {
        // force set width for fixedWidth cells and for 'embedImages' cells
        this.cellContentStyle = this.cellContentStyle || {};
        this.cellContentStyle.width = getCellSize(
          styleObj.width || colWidth,
          this.props.borderWidth,
        );
      }
      if (rowHeight && (tableType === typeOfTable.ROWS || tableType === typeOfTable.DATA)) {
        this.cellContentStyle = this.cellContentStyle || {};
        this.cellContentStyle.height = rowHeight;
      }
      if (!rowHeight && this.state.isEmbedImage) {
        this.cellContentStyle = this.cellContentStyle || {};
        this.cellContentStyle.lineHeight = 0;
      }
      if (this.state.isEmbedImage) {
        this.cellContentStyle.borderRight = `solid ${this.props.borderWidth || 1}px transparent`;
      }
    }
    return this.cellContentStyle;
  }

  /**
   * Calculates new cell content style object or use cached one
   *
   * @returns {object} - style object
   * @private
   */
  getDatabarsStyle(): Styles | undefined {
    if (this.databarStyle === undefined) {
      const nodeStyle = getStyleProp(this.props);
      this.databarStyle = clearDatabarsStyles(nodeStyle);
    }
    return this.databarStyle;
  }

  getContentNode() {
    const { colWidth, styleObj, isDataCell, dataNode, treeNode, borderWidth } = this.props;
    const node = isDataCell ? dataNode : treeNode;
    const data = node ? node.content || node.value : '';
    const store = (node || {}).store || {};
    const contentType = (node || {}).contentType || ContentTypes.TEXT;

    // contentType is set by plugins, allowHtml is from configuration service
    if (
      typeof data === 'string' &&
      (contentType === ContentTypes.HTML || (this.props.allowHtml && htmlExp.test(data)))
    ) {
      return <div className={CONTENT_INNER} dangerouslySetInnerHTML={this.createMarkup(data)} />;
    }
    // change content to image
    if (this.state.isEmbedImage) {
      const { rowHeight, fallbackImageUrl } = this.props;
      return (
        <EmbedImage
          imageUrl={data}
          fallbackImageUrl={fallbackImageUrl}
          rowHeight={rowHeight}
          addCellDomReadyPromise={this.props.addCellDomReadyPromise}
          removeCellDomReadyPromise={this.props.removeCellDomReadyPromise}
        />
      );
    }

    if (contentType === ContentTypes.COMPONENT) {
      const { domReadyDefer, ...restProps } = store;
      const EmbedComponent: React.ComponentType<EmbedComponentProps> = data;
      return (
        <div className={CONTENT_INNER}>
          <EmbedComponent
            {...restProps}
            width={getCellSize(styleObj.width || colWidth, borderWidth)}
            domReadyDefer={domReadyDefer}
          />
        </div>
      );
    }

    // DEBUG - hardcode number format for alpha release
    // return <div className={CONTENT_INNER}>{data}</div>;
    return (
      <div className={CONTENT_INNER}>
        {isNaN(data)
          ? data
          : new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 2 }).format(
              data,
            )}
      </div>
    );
  }

  onCellClick = (event: React.MouseEvent): void => {
    const {
      isDataCell,
      dataNode,
      treeNode,
      columnTreeNode,
      rowTreeNode,
      measureTreeNode,
      cellMetadata,
      onCellClick,
    } = this.props;

    let node;
    if (columnTreeNode) {
      node = dataNode;
    } else if (treeNode) {
      node = treeNode;
    }

    if (onCellClick) {
      const cell: PivotCellEvent = {
        event,
        isDataCell,
        dataNode: node,
        rowTreeNode,
        columnTreeNode,
        measureTreeNode,
        cellMetadata,
        cell: this,
      };

      onCellClick(cell);
    }
  };

  onCellEnter = (event: React.MouseEvent): void => {
    const { onCellEnter, cellMetadata } = this.props;
    const cell: any = {
      domEvent: event,
      metadata: cellMetadata,
      cell: cellMetadata ? cellMetadata.cellData : undefined,
    };
    if (this.isMouseInCell) {
      return;
    }

    if (this.timeoutId) {
      clearTimeout(this.timeoutId as NodeJS.Timeout);
      this.timeoutId = undefined;
    }

    event.persist();
    this.timeoutId = setTimeout(() => {
      if (onCellEnter) {
        onCellEnter(cell);
      }
      this.timeoutId = undefined;
      this.isMouseInCell = true;
    }, 100);
  };

  onCellLeave = (event: React.MouseEvent): void => {
    const { onCellLeave, cellMetadata } = this.props;
    const cell: any = {
      domEvent: event,
      metadata: cellMetadata,
      cell: cellMetadata ? cellMetadata.cellData : undefined,
    };

    if (this.timeoutId) {
      clearTimeout(this.timeoutId as NodeJS.Timeout);
      this.timeoutId = undefined;
    }

    event.persist();
    if (onCellLeave && this.isMouseInCell) {
      onCellLeave(cell);
      this.isMouseInCell = false;
    }
  };

  onResizeStartHandler = (): number => {
    const { parent } = this.props;
    const { merge } = this.state;

    if (parent && parent.resizeColumnStart) {
      parent.resizeColumnStart();
    }

    const lastColumnIndex = this.props.columnIndex + getMergedCellOffset(merge);
    let widthFromCache = 0;
    if (parent && parent.getColumnWidth) {
      widthFromCache = parent.getColumnWidth(lastColumnIndex);
    }

    return widthFromCache;
  };

  onResizeHandler = (widthAfterResize: number): void => {
    const { parent, columnIndex } = this.props;
    const { merge } = this.state;

    if (parent && parent.resizeColumn) {
      const lastColumnIndex = columnIndex + getMergedCellOffset(merge);
      const finalWidthAfterResize = Math.max(MIN_RESIZE_WIDTH, widthAfterResize);
      const columnsAndWidths = [[lastColumnIndex, finalWidthAfterResize]];
      const cellPosition = { columnIndex: lastColumnIndex };
      const changes = { width: true };

      parent.resizeColumn(columnsAndWidths, cellPosition, changes);
    }
  };

  onResizeEndHandler = (widthAfterResize: number): void => {
    const { parent, columnIndex } = this.props;
    const { merge } = this.state;

    if (parent && parent.resizeColumnEnd) {
      const lastColumnIndex = columnIndex + getMergedCellOffset(merge);
      const finalWidthAfterResize = Math.max(MIN_RESIZE_WIDTH, widthAfterResize);

      parent.resizeColumnEnd(finalWidthAfterResize, lastColumnIndex);
    }
  };

  onRangeMinMaxChange = (data: { rangeMinMax: Array<Array<number>> }, props = this.props): void => {
    const { dataNode, measureTreeNode } = props;
    const backgroundColor = getRangeColor(data.rangeMinMax, dataNode, measureTreeNode);
    if (!backgroundColor) {
      return;
    }
    this.cellStyle = undefined;
    this.setState({ backgroundColor });
  };

  // TODO: use React.ReactComponentElement instead JSX.Element
  setSortingPopup = (sortingPopup: JSX.Element | null): void => {
    const sortIconShouldBeVisible = sortingPopup !== null;

    this.setState((prevState) => ({
      ...prevState,
      sortIconShouldBeVisible,
      sortingPopup,
    }));
  };

  handleSortingIconClick = (
    e: React.SyntheticEvent<HTMLSpanElement, MouseEvent | KeyboardEvent>,
  ) => {
    e.preventDefault();
    e.stopPropagation();

    this.props.onSortingSettingsChanged(this.props.treeNode, this.props.metadata, this);
  };

  createMarkup = (data: any) => {
    if (!this.cachedHtml || data !== this.cachedHtml.data) {
      this.cachedHtml = {
        data,
        html: { __html: data },
      };
    }
    return this.cachedHtml.html;
  };

  onCellRef = (ref: HTMLDivElement | null) => {
    if (ref) {
      this.cellEl = ref;
    }
  };

  // eslint-disable-next-line max-lines-per-function,sonarjs/cognitive-complexity
  render() {
    const { isDataCell, treeNode, tableType, tdComponent, isMobile } = this.props;
    const { merge } = this.state;

    const cellStyle = this.getCellStyle();
    const contentStyle = this.getCellContentStyle();
    const databarStyle = this.getDatabarsStyle();
    let className = this.getClassName() || '';
    let isCellSorted = false;
    if (treeNode) {
      isCellSorted = typeof treeNode.dir !== 'undefined';
      className = isCellSorted ? `${className} ${CELL_SORTED}` : className;

      if (isMobile) {
        className = `${className} ${CELL_SORTED_INACTIVE}`;
      }

      let additionalClassName = '';
      if (treeNode.dir) {
        additionalClassName =
          treeNode.dir === SortingDirection.ASC ? CELL_SORTED_ASC : CELL_SORTED_DESC;
      } else if (isCellSorted && !treeNode.dir) {
        const defaultSortDirection = getDefaultSortDirection(treeNode);
        additionalClassName =
          defaultSortDirection === SortingDirection.ASC
            ? CELL_DEFAULT_SORTED_ASC
            : CELL_DEFAULT_SORTED_DESC;
      }

      className = `${className} ${additionalClassName}`;
      const { sortIconShouldBeVisible } = this.state;
      if (sortIconShouldBeVisible) {
        className = `${className} ${ICON_SORTING_SETTINGS_PERSISTENT}`;
      }
    }

    const isCellResizeable = tableType === typeOfTable.CORNER || tableType === typeOfTable.COLUMNS;

    const hasDataBars = this.hasDataBars();

    const isSelected = this.state.isSelected && !isDataCell ? CELL_SELECTED : '';
    const isDrilled = this.state.isDrilled ? CELL_DRILLED : '';

    const contentNode = this.getContentNode();

    let sortingIcon = null;
    if (isCellSorted) {
      sortingIcon = (
        <SortingSettingsIcon
          // onRequestClose={() => this.setSortingPopup(null)}
          onClick={this.handleSortingIconClick}
          onKeyPress={this.handleSortingIconClick}
          sortingPopup={this.state.sortingPopup}
          className={ICON_SORTING_SETTINGS}
          getTooltipContainer={this.props.getSortingPopupContainer}
        />
      );
    }

    return React.createElement(
      tdComponent,
      {
        ref: this.onCellRef,
        onClick: this.onCellClick,
        onContextMenu: this.onCellClick,
        onMouseEnter: this.onCellEnter,
        onMouseLeave: this.onCellLeave,
        className: cn(className, isDrilled, isSelected),
        style: cellStyle,
        colSpan: merge ? merge.colSpan : undefined,
        rowSpan: merge ? merge.rowSpan : undefined,
      },
      [
        <div className={CELL_CORNER} key="corner">
          {sortingIcon}
          {isCellResizeable && (
            <ResizeColumnControl
              onResizeStart={this.onResizeStartHandler}
              onResize={this.onResizeHandler}
              onResizeEnd={this.onResizeEndHandler}
            />
          )}
          {hasDataBars && (
            <DataBar
              columnIndex={this.props.columnIndex}
              tableSize={this.props.tableSize}
              dataNode={this.props.dataNode}
              style={databarStyle}
            />
          )}
        </div>,
        <div className={CONTENT} style={contentStyle} key="content">
          <div className={CONTENT_WRAPPER}>{contentNode}</div>
        </div>,
      ],
    );
  }
}

export default PivotCell;
