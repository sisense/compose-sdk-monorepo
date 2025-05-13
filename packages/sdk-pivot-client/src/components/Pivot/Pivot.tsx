import * as React from 'react';
import cn from 'classnames';
import debounce from 'lodash-es/debounce.js';
import { PivotTable, DimensionsProps } from '../PivotTable/PivotTable.js';
import { PaginationOptions, PaginationPanel } from '../PaginationPanel';
import { debug, createCallbackMemoizer, getChangedProps } from '../../utils/index.js';
import { getDefaultSortDirection } from '../../data-load/utils';
import { PIVOT, PIVOT_MULTIGRID, PIVOT_OVERLAY } from './classes.js';
import { LoggerI, Defer } from '../../utils/types.js';
import { PivotI } from './types.js';
import { PivotTreeNode, PivotCellEvent } from '../../data-handling';
import { SortDetails } from '../../data-load/types.js';
import { TreeServiceI } from '../../tree-structure';
import { Metadata } from '../../data-handling/utils/plugins/types.js';
import { PivotStylingWrapper, PivotFillOptionsProps } from './PivotStylingWrapper';
import { EmotionCacheProvider } from '../../emotion-cache-provider.js';

type Props = {
  // global
  className?: string;
  isPaginated: boolean;
  overlay?: boolean;
  width: number;
  height: number;
  onTotalHeightChange?: (totalHeight: number) => void;

  // PivotTable
  borderWidth?: number;
  borderColor?: string;
  fontFamily?: string;
  textColor?: string;
  backgroundColor?: string;
  fillColor?: string;
  additionalFillColor?: string;
  fillOptions?: PivotFillOptionsProps;
  scrollBarsMargin?: number;
  isAutoHeight: boolean;
  isFullWidth: boolean;
  isFixedEnabled: boolean;
  dataBars?: Array<[string, string]>;
  rangeMinMax?: Array<[string, string]>;
  isMobile?: boolean;
  getSortingPopupContainer?: () => HTMLElement;
  onGetInitialData?: () => void;
  onGetMoreData?: () => void;
  onInitLoadingFinish?: () => void;
  onMoreLoadingFinish?: () => void;
  onSortingMetadataUpdate?: (sortDetails: SortDetails) => any;
  onSortingSettingsChanged: InstanceType<typeof PivotTable>['props']['onSortingSettingsChanged'];
  onEmptyChange?: (isEmpty: boolean) => void;
  onGridUpdated?: () => void;
  onDomReady?: () => void;
  onUpdatePredefinedColumnWidth?: (
    horizontalLastLevelsNodes: Array<PivotTreeNode>,
    resizedColumnWidth?: Array<number>,
  ) => Array<Array<number>>;
  onCellClick?: (cellData: PivotCellEvent) => void;
  onCellEnter?: (cellData: PivotCellEvent) => void;
  onCellLeave?: (cellData: PivotCellEvent) => void;

  // PaginationPanel
  navigationPrimaryColor?: string;
  navigationSecondaryColor?: string;
  selectionColor?: string;
  itemsCount: number;
  totalItemsCount: number;
  totalRecordsCount: number;
  limitReached: boolean;
  columnsCount: number;
  totalColumnsCount: number;
  itemsPerPage: number;
  activePage: number;
  isAllDataLoaded?: boolean;
  allowHtml?: boolean;
  paginationOptions?: PaginationOptions;
  onPageChange?: (change: { selected: number }) => void;
  isSelectedMode?: boolean;
  rowHeight?: number;
  imageColumns?: Array<number>;
  fallbackImageUrl?: string;
  addCellDomReadyPromise?: (defer?: Defer) => void;
  removeCellDomReadyPromise?: (defer?: Defer) => void;
};

type State = {
  pivotHeight: number;
  pivotTableHeight?: number;
  paginationPanelHeight?: number;
};

export class Pivot extends React.PureComponent<Props, State> implements PivotI {
  logger: LoggerI;

  pivotTable?: PivotTable;

  paginationPanel?: PaginationPanel;

  forceNotifyAboutHeightChange = false;

  onEmptyChangeMemoizer = createCallbackMemoizer();

  onTotalHeightChangeMemoizer = createCallbackMemoizer();

  pivotContainer?: HTMLElement;

  childrenReadyStateInitial = {
    pivotDomReady: false,
    paginationDomReady: false,
    isDebouncing: false,
  };

  childrenReadyState = this.childrenReadyStateInitial;

  private domReadyEvent = debounce(() => this.onDomReadyEvent(), 500);

  static defaultProps = {
    isAutoHeight: false,
    isFullWidth: false,
    isFixedEnabled: true,
    isPaginated: false,
    overlay: false,
    itemsCount: 0,
    totalItemsCount: 0,
    totalRecordsCount: 0,
    limitReached: false,
    totalColumnsCount: 0,
    columnsCount: 0,
    itemsPerPage: 0,
    borderWidth: 1,
    scrollBarsMargin: 9,
  };

  constructor(props: Props) {
    super(props);

    this.logger = debug.create('Pivot');

    this.state = {
      pivotHeight: props.height,
    };
  }

  componentDidMount(): void {
    const { onEmptyChange } = this.props;
    if (onEmptyChange) {
      this.onEmptyChangeMemoizer({
        callback: ({ isEmpty }: { isEmpty: boolean }) => {
          onEmptyChange(isEmpty);
        },
        indices: {
          isEmpty: !(this.pivotTable && this.pivotTable.hasContent()),
        },
      });
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props): void {
    const changedProps = getChangedProps(this.props, nextProps);
    if (
      typeof changedProps.width !== 'undefined' ||
      typeof changedProps.height !== 'undefined' ||
      typeof changedProps.isAutoHeight !== 'undefined' ||
      typeof changedProps.isPaginated !== 'undefined' ||
      typeof changedProps.itemsCount !== 'undefined' ||
      typeof changedProps.itemsPerPage !== 'undefined'
    ) {
      this.forceNotifyAboutHeightChange = true;
      this.setState({
        pivotHeight: this.calculatePivotHeight({
          isAutoHeight: nextProps.isAutoHeight,
          holderHeight: nextProps.height,
        }),
      });
    }
  }

  componentDidUpdate(): void {
    const { onEmptyChange, onTotalHeightChange, scrollBarsMargin = 0 } = this.props;

    if (onEmptyChange) {
      this.onEmptyChangeMemoizer({
        callback: ({ isEmpty }: { isEmpty: boolean }) => {
          onEmptyChange(isEmpty);
        },
        indices: {
          isEmpty: !(this.pivotTable && this.pivotTable.hasContent()),
          // eslint-disable-next-line max-lines
        },
      });
    }

    if (onTotalHeightChange && this.isPaginationReady()) {
      const { pivotTableHeight, paginationPanelHeight } = this.state;
      if (this.forceNotifyAboutHeightChange) {
        this.forceNotifyAboutHeightChange = false;
        if (
          typeof pivotTableHeight !== 'undefined' &&
          typeof paginationPanelHeight !== 'undefined'
        ) {
          const total = pivotTableHeight + paginationPanelHeight + scrollBarsMargin;
          onTotalHeightChange(total);
        }
      } else {
        this.onTotalHeightChangeMemoizer({
          callback: (
            {
              tableHeight,
              paginationHeight,
            }: {
              tableHeight: number;
              paginationHeight: number;
            } = { tableHeight: 0, paginationHeight: 0 },
          ) => {
            const total = tableHeight + paginationHeight + scrollBarsMargin;
            onTotalHeightChange(total);
          },
          indices: {
            tableHeight: pivotTableHeight,
            paginationHeight: paginationPanelHeight,
          },
        });
      }
    }
  }

  componentWillUnmount(): void {
    this.pivotTable = undefined;
    this.paginationPanel = undefined;
  }

  initialize(
    newRowsTreeService?: TreeServiceI,
    newColumnsTreeService?: TreeServiceI,
    newCornerTreeService?: TreeServiceI,
    options?: { isLastPage?: boolean; cellsMetadata?: Map<string, Metadata> },
  ): void {
    if (this.pivotTable) {
      this.pivotTable.initialize(
        newRowsTreeService,
        newColumnsTreeService,
        newCornerTreeService,
        options,
      );
    }
  }

  addMore(newRowsTreeService?: TreeServiceI, isLastPage = false): void {
    if (this.pivotTable && newRowsTreeService) {
      this.pivotTable.addMore(newRowsTreeService, isLastPage);
    }
  }

  getDimensions(): DimensionsProps {
    if (this.pivotTable) {
      return this.pivotTable.getDimensions();
    }
    return { width: [], height: [] };
  }

  /**
   * Defines if pagination panel is already rendered and we know his size
   *
   * @returns {boolean} - true - ready, rendered
   */
  isPaginationReady(): boolean {
    const { paginationPanelHeight } = this.state;
    const hasPaginationHeight =
      typeof paginationPanelHeight === 'number' && paginationPanelHeight >= 0;
    const paginationReady = this.props.isPaginated ? hasPaginationHeight : true;

    this.childrenReadyState = {
      ...this.childrenReadyState,
      paginationDomReady: paginationReady,
      isDebouncing: true,
    };

    this.domReadyEvent();

    return paginationReady;
  }

  /**
   * Calculates PivotTable height according to isAutoHeight and isPaginated rules and so on
   *
   * @param {boolean} options - partial props and state
   * @param {boolean} options.isAutoHeight - isAutoHeight condition
   * @param {number} options.holderHeight - holder height
   * @param {number|null} options.pivotTableHeight - real pivot height
   * @param {number|null} options.paginationPanelHeight - pivot navigator height
   * @returns {number} - final height
   * @private
   */
  calculatePivotHeight({
    isAutoHeight = this.props.isAutoHeight,
    holderHeight = this.props.height,
    pivotTableHeight = this.state.pivotTableHeight || 0,
    paginationPanelHeight = this.state.paginationPanelHeight || 0,
  }: {
    isAutoHeight?: boolean;
    holderHeight?: number;
    pivotTableHeight?: number;
    paginationPanelHeight?: number;
  }): number {
    const { scrollBarsMargin = 0 } = this.props;
    const initialHeight = holderHeight - paginationPanelHeight;
    const initialAutoHeight = initialHeight ? initialHeight - scrollBarsMargin : 1;
    return isAutoHeight ? pivotTableHeight || initialAutoHeight : initialHeight;
  }

  /**
   * Triggers onDomReady event when Pivot and Pagination are both rendered
   *
   * @returns {void}
   */
  onDomReadyEvent() {
    if (
      this.childrenReadyState.pivotDomReady &&
      this.childrenReadyState.paginationDomReady &&
      this.childrenReadyState.isDebouncing
    ) {
      // stop the debounce function
      this.domReadyEvent.cancel();
      // reset state
      this.childrenReadyState = { ...this.childrenReadyStateInitial };
      // both child components are ready, trigger onDomReady
      const { onDomReady } = this.props;
      if (onDomReady) {
        onDomReady();
      }
    }
  }

  onPivotDomReady = () => {
    this.childrenReadyState = {
      ...this.childrenReadyState,
      pivotDomReady: true,
      isDebouncing: true,
    };
    this.domReadyEvent();
  };

  pivotTableRef = (ref: PivotTable | null): void => {
    if (ref) {
      this.pivotTable = ref;
    }
  };

  paginationPanelRef = (ref: PaginationPanel | null): void => {
    if (ref) {
      this.paginationPanel = ref;
    }
  };

  onPaginationHeightChange = (paginationPanelHeight: number): void => {
    this.setState({
      paginationPanelHeight,
      pivotHeight: this.calculatePivotHeight({ paginationPanelHeight }),
    });
  };

  onTableTotalSizeChange = (pivotTableHeight: number): void => {
    this.setState({
      pivotTableHeight,
      pivotHeight: this.calculatePivotHeight({ pivotTableHeight }),
    });
  };

  onSortingMetadataUpdate = (treeNode: PivotTreeNode, measureNode?: PivotTreeNode): void => {
    const { measurePath, dir } = treeNode;
    const sortDetails = {
      measurePath,
      dir: dir || getDefaultSortDirection(treeNode),
      field: measureNode ? measureNode.jaqlIndex : treeNode.jaqlIndex,
    };
    if (this.props.onSortingMetadataUpdate) {
      this.props.onSortingMetadataUpdate(sortDetails);
    }
  };

  setPivotContainerRef = (ref: HTMLElement | null): void => {
    if (ref && this.pivotContainer !== ref) {
      this.pivotContainer = ref;
      this.forceUpdate();
    }
  };

  render(): React.ReactElement {
    const {
      className,
      fontFamily,
      textColor,
      backgroundColor,
      fillColor,
      additionalFillColor,
      fillOptions,
      navigationPrimaryColor,
      navigationSecondaryColor,
      selectionColor,
      isPaginated,
      overlay,
      itemsCount,
      itemsPerPage,
      paginationOptions,
      totalItemsCount,
      totalRecordsCount,
      limitReached,
      totalColumnsCount,
      columnsCount,
      scrollBarsMargin = 0,
      rowHeight,
      imageColumns,
      fallbackImageUrl,
      dataBars,
      rangeMinMax,
      isMobile,
      addCellDomReadyPromise,
      removeCellDomReadyPromise,
      ...rest
    } = this.props;
    const { pivotHeight } = this.state;

    return (
      <EmotionCacheProvider>
        <PivotStylingWrapper
          fontFamily={fontFamily}
          textColor={textColor}
          backgroundColor={backgroundColor}
          fillColor={fillColor}
          additionalFillColor={additionalFillColor}
          fillOptions={fillOptions}
          navigationPrimaryColor={navigationPrimaryColor}
          navigationSecondaryColor={navigationSecondaryColor}
          selectionColor={selectionColor}
        >
          <div className={cn(PIVOT, `${PIVOT}--new`, className)} ref={this.setPivotContainerRef}>
            {this.pivotContainer && (
              <PivotTable
                {...rest}
                className={PIVOT_MULTIGRID}
                rowHeight={rowHeight}
                imageColumns={imageColumns}
                fallbackImageUrl={fallbackImageUrl}
                addCellDomReadyPromise={addCellDomReadyPromise}
                removeCellDomReadyPromise={removeCellDomReadyPromise}
                onSortingMetadataUpdate={this.onSortingMetadataUpdate}
                onSortingSettingsChanged={this.props.onSortingSettingsChanged}
                ref={this.pivotTableRef}
                height={pivotHeight}
                onTotalSizeChange={this.onTableTotalSizeChange}
                scrollBarsMargin={scrollBarsMargin}
                dataBars={dataBars}
                rangeMinMax={rangeMinMax}
                isMobile={isMobile}
                onDomReady={this.onPivotDomReady}
              />
            )}
            {isPaginated ? (
              <PaginationPanel
                {...rest}
                ref={this.paginationPanelRef}
                itemsCount={itemsCount}
                itemsPerPage={itemsPerPage}
                options={paginationOptions}
                totalItemsCount={totalItemsCount}
                limitReached={limitReached}
                limitCount={totalRecordsCount}
                totalColumnsCount={totalColumnsCount}
                columnsCount={columnsCount}
                onHeightChange={this.onPaginationHeightChange}
                style={{
                  fontFamily,
                }}
              />
            ) : null}
            {overlay ? <div className={PIVOT_OVERLAY} /> : null}
          </div>
        </PivotStylingWrapper>
      </EmotionCacheProvider>
    );
  }
}

export default Pivot;
