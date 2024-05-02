/* eslint-disable @typescript-eslint/ban-types */
import EventEmitter from 'events';
import * as React from 'react';
import ReactDOM from 'react-dom';
import ReactDOMClient from 'react-dom/client';
import isEqual from 'lodash/isEqual.js';
import {
  EVENT_DATA_CHUNK_LOADED,
  EVENT_GRAND_CHUNK_LOADED,
  EVENT_TOTAL_ROWS_COUNT,
  EVENT_TOTAL_COLUMNS_COUNT,
  EVENT_PROGRESS_ERROR,
} from '../data-handling/DataService.js';
import { Pivot } from '../components/Pivot';
import { PivotCell } from '../components/Pivot/PivotCell.js';
import { LoadingCanceledError } from '../errors/index.js';
import { throttle, getChangedProps } from '../utils/index.js';
import { PivotI } from '../components/Pivot/types.js';
import { JaqlRequest, SortDetails } from '../data-load/types.js';
import { AllDataInfo, DataServiceI, PivotTreeNode } from '../data-handling';
import { TreeServiceI, ColumnsCount, TreeNodeMetadata } from '../tree-structure/types.js';
import { createPivotTreeNode, jaqlProcessor } from '../data-handling/utils/index.js';
import { getDefaultSortDirection } from '../data-load/utils';
import {
  SimpleSortingSettingsPopup,
  ComplexSortingSettingsPopup,
} from '../components/SortingSettings';
import { SortingSettingsItem } from '../data-handling/utils/jaqlProcessor.js';
import { PaginationOptions } from '../components/PaginationPanel';

function getListOfColumnNamesForTitle(treeNode: PivotTreeNode) {
  let node = treeNode;
  const titleBuilder: string[] = [];

  // eslint-disable-next-line no-constant-condition
  while (true) {
    if (node.content && typeof node.content !== typeof React.Component) {
      titleBuilder.push(node.content);
    } else {
      titleBuilder.push(node.value!);
    }

    if (node.parent) {
      node = node.parent;
    } else {
      break;
    }
  }

  return titleBuilder.reverse();
}

export type TranslatedMessages = {
  clearSorting: string;
  selectToSort: string;
  sortBy: string;
  sort: string;
  subtotals: string;
  apply: string;
  cancel: string;
  ascAZ: string;
  descZA: string;
  asc19: string;
  desc91: string;
};

export type Props = {
  width: number;
  height: number;
  isPaginated: boolean;
  isAutoHeight: boolean;
  itemsCount: number;
  loadedItemsCount: number;
  totalItemsCount: number;
  totalRecordsCount: number;
  limitReached: boolean;
  columnsCount: number;
  totalColumnsCount: number;
  itemsPerPage: number;
  isAllDataLoaded: boolean;
  activePage: number;
  className?: string;
  isFullWidth: boolean;
  isFixedEnabled: boolean;
  borderWidth?: number;
  borderColor?: string;
  dataBars?: Array<[string, string]>;
  rangeMinMax?: Array<[string, string]>;
  getSortingPopupMessages: () => TranslatedMessages;
  getSortingPopupContainer?: () => HTMLElement;
  isMobile?: boolean;
  paginationOptions?: PaginationOptions;
  onGetInitialData?: () => void;
  onMoreLoadingFinish?: () => void;
  onPageChange?: (props: { selected: number }) => void;
  onItemsPerPageChange?: (itemsPerPage: number) => void;
  onEmptyChange?: (isEmpty: boolean) => void;
  onSortingMetadataUpdate?: (sortDetails: SortDetails) => void;
  onSortingSettingsChanged: InstanceType<typeof Pivot>['props']['onSortingSettingsChanged'];
  onTotalHeightChange?: (totalHeight: number) => void;
  onGridUpdated?: () => void;
  onDomReady?: () => void;
  onUpdatePredefinedColumnWidth?: (
    horizontalLastLevelsNodes: Array<PivotTreeNode>,
    resizedColumnWidth?: Array<number>,
  ) => Array<Array<number>>;
  rowHeight?: number;
  imageColumns?: Array<number>;
  fallbackImageUrl?: string;
};

export const EVENT_QUERY_START = 'queryStart';
export const EVENT_QUERY_END = 'queryEnd';
export const EVENT_LOADING_START = 'loadingStart';
export const EVENT_LOADING_END = 'loadingFinish';

export const EVENT_SORT_UPDATE = 'sortUpdate';
export const EVENT_SORTING_SETTINGS_CHANGED = 'sortingSettingsChanged';
export const EVENT_PAGE_CHANGE = 'pageChange';
export const EVENT_EMPTY_CHANGE = 'emptyChange';
export const EVENT_TOTAL_HEIGHT_CHANGE = 'totalHeightChange';

export const EVENT_DOM_READY = 'domReady';
export const EVENT_FIRST_PAGE_RENDERED = 'firstPageRendered';
export const EVENT_TOTAL_WIDGET_RENDERED = 'totalWidgetRendered';
export { EVENT_PROGRESS_ERROR } from '../data-handling/DataService.js';

export type SortingSettingsChangePayload = {
  type: 'simple' | 'complex';
  settings: SortingSettingsItem[];
  sortDetails: SortDetails;
  isSingleRowTree: boolean;
};

const DEFAULT_ACTIVE_PAGE = 0;

type AppearanceState = {
  isFirstPageRendered?: boolean;
  isGrandTotalRowRendered?: boolean;
  isTotalRowsCountRendered?: boolean;
  isReceivedRowsCountCalculated?: boolean;
};

const INITIAL_APPEARANCE_STATE: AppearanceState = {
  isFirstPageRendered: false,
  isGrandTotalRowRendered: false,
  isTotalRowsCountRendered: false,
  isReceivedRowsCountCalculated: false,
};

export class PivotBuilder {
  /**
   * EventEmitter instance
   */
  private events: EventEmitter;

  /**
   * DOM element to insert component
   */
  private domElem?: Element;

  /**
   * Pivot component instance reference
   */
  private pivot?: PivotI;

  /**
   * DataServiceI instance
   */
  private dataService?: DataServiceI;

  /** Active tree service for paginated mod */
  private currentRowsTreeService?: TreeServiceI;

  /** Load page progress state */
  private isLoadPageInProgress = false;

  /** Flag for saving first page render state */
  private isFirstPageRenderInProgress = false;

  /** onDataChunkReceived throttle wrapper */
  private readonly onDataChunkReceivedThrottle: Function;

  /** Loaded total items count */
  private loadedItemsCount?: number;

  /** Finished total items count */
  private totalItemsCount = 0;

  /** Finished total CSV records count */
  private totalRecordsCount? = 0;

  /** Total columns count */
  private totalColumnsCount? = 0;

  /** Columns count */
  private columnsCount? = 0;

  /** Rows limit reached or not */
  private limitReached? = false;

  /** builder appearance state */
  private appearanceState: AppearanceState = { ...INITIAL_APPEARANCE_STATE };

  /** Current component properties */
  private props: Props;

  /** React root DOM element for rendering the Pivot Table */
  private rootDom: ReactDOMClient.Root;

  /**
   * @param {DataServiceI} dataService - data service instance
   * @param {object} [defaultProps] - default options
   * @param {EventEmitter} [events] - EventEmitter instance
   */
  constructor(
    dataService?: DataServiceI,
    defaultProps?: Record<string, any>,
    events: EventEmitter = new EventEmitter(),
  ) {
    this.events = events;
    if (dataService) {
      this.registerDataServiceListeners(dataService);
      this.dataService = dataService;
    }

    this.props = {
      className: '',
      width: 800,
      height: 400,
      isPaginated: true,
      isAutoHeight: false,
      itemsCount: 0,
      loadedItemsCount: 0,
      totalItemsCount: 0,
      totalRecordsCount: 0,
      limitReached: false,
      totalColumnsCount: 0,
      columnsCount: 0,
      itemsPerPage: 25,
      activePage: DEFAULT_ACTIVE_PAGE,
      isFullWidth: false,
      isFixedEnabled: true,
      isAllDataLoaded: false,
      getSortingPopupMessages: () => ({
        // default captions
        clearSorting: 'Clear sorting',
        selectToSort: 'Select column (level) to sort:',
        sortBy: 'Sort by',
        sort: 'Sort',
        subtotals: '(Subtotals)',
        apply: 'Apply',
        cancel: 'Cancel',
        ascAZ: 'Ascending (A-Z)',
        descZA: 'Descending (Z-A)',
        asc19: 'Ascending (1-9)',
        desc91: 'Descending (9-1)',
      }),
      paginationOptions: undefined,
      onGetInitialData: () => {},
      onMoreLoadingFinish: this.onMoreLoadingFinish,
      onPageChange: this.onPageChange,
      onItemsPerPageChange: this.onItemsPerPageChange,
      onSortingSettingsChanged: this.handleSortingSettingsChanged,
      onSortingMetadataUpdate: this.onSortingMetadataUpdate,
      onEmptyChange: this.onEmptyChange,
      onTotalHeightChange: this.onTotalHeightChange,
      onGridUpdated: this.onGridUpdated,
      onDomReady: this.onDomReady,
      ...defaultProps,
    };

    this.onDataChunkReceivedThrottle = throttle((loadedCount: number) => {
      const { activePage } = this.props;
      let loadedItemsCount = loadedCount;
      if (this.loadedItemsCount && this.loadedItemsCount > loadedCount) {
        loadedItemsCount = this.loadedItemsCount;
      }
      this.updateProps({
        itemsCount: loadedItemsCount,
        activePage: activePage > -1 ? activePage : 0,
      });
    }, 500);
  }

  destroy() {
    // @ts-ignore
    this.onDataChunkReceivedThrottle.cancel();
    if (this.dataService) {
      // eslint-disable-next-line prefer-destructuring
      const dataService = this.dataService;
      this.destroyDataServiceListeners(dataService);
    }
    if (this.domElem) {
      // See notes in the render() method
      try {
        this.rootDom.unmount();
      } catch (e) {
        ReactDOM.unmountComponentAtNode(this.domElem);
      }
    }
    if (this.currentRowsTreeService) {
      this.currentRowsTreeService.destroy();
      this.currentRowsTreeService = undefined;
    }
    this.pivot = undefined;
  }

  on(eventName: string, callback: (...args: Array<any>) => void) {
    this.events.on(eventName, callback);
  }

  off(eventName: string, callback: (...args: Array<any>) => void) {
    this.events.removeListener(eventName, callback);
  }

  emit(eventName: string, ...rest: Array<any>): void {
    const args = [eventName, ...rest];
    // @ts-ignore
    this.events.emit(...args);
  }

  /**
   * Render Pivot component into DOM element
   *
   * @param {Element} domElem - DOM element to render
   * @param {object} newProps - Pivot 2 props
   * @returns {void}
   */
  render(domElem: Element, newProps: Record<string, any>) {
    this.domElem = domElem;
    const nextProps = {
      ...this.props,
      ...newProps,
      // reference: https://stackoverflow.com/a/55823466/2425556
      ref: (ref: Pivot) => (this.pivot = ref),
    };

    const reactElement = React.createElement(Pivot, nextProps, null);

    // ReactDOM.render is no longer supported in React 18. Use ReactDOMClient.createRoot instead
    // See https://react.dev/blog/2022/03/08/react-18-upgrade-guide#updates-to-client-rendering-apis

    // However, Preact somehow doesn't support createRoot yet
    // See https://stackoverflow.com/questions/76202653/issue-using-preact-with-react-18-based-component

    // As a workaround for Vue and Angular, fall back to ReactDOM.render when ReactDOMClient.createRoot fails.
    try {
      if (!this.rootDom) {
        this.rootDom = ReactDOMClient.createRoot(this.domElem);
      }
      this.rootDom.render(reactElement);
    } catch (e) {
      ReactDOM.render(reactElement, this.domElem);
    }

    this.props = nextProps;
  }

  /**
   * Update data service instance
   *
   * @param {DataServiceI} dataService - new data service instance
   * @returns {void}
   */
  updateDataService(dataService?: DataServiceI) {
    if (this.dataService) {
      const oldDataService = this.dataService;
      this.destroyDataServiceListeners(oldDataService);
    }
    this.dataService = dataService;
    // @ts-ignore
    this.onDataChunkReceivedThrottle.cancel();
    if (this.dataService) {
      const newDataService = this.dataService;
      this.resetAppearanceState();
      this.registerDataServiceListeners(newDataService);
    }
  }

  /**
   * Registers data service events handlers
   *
   * @param {DataService} dataService - data service instance
   * @returns {void}
   */
  registerDataServiceListeners(dataService: DataServiceI) {
    dataService.on(EVENT_DATA_CHUNK_LOADED, this.onDataChunkReceived);
    dataService.on(EVENT_GRAND_CHUNK_LOADED, this.onGrandChunkReceived);
    dataService.on(EVENT_TOTAL_ROWS_COUNT, this.onTotalRowsChunkReceived);
    dataService.on(EVENT_TOTAL_COLUMNS_COUNT, this.onTotalColumnsChunkReceived);
    dataService.on(EVENT_PROGRESS_ERROR, this.onProgressError);
  }

  /**
   * Destroys data service events handlers
   *
   * @param {DataService} dataService - data service instance
   * @returns {void}
   */
  destroyDataServiceListeners(dataService: DataServiceI) {
    dataService.off(EVENT_DATA_CHUNK_LOADED, this.onDataChunkReceived);
    dataService.off(EVENT_GRAND_CHUNK_LOADED, this.onGrandChunkReceived);
    dataService.off(EVENT_TOTAL_ROWS_COUNT, this.onTotalRowsChunkReceived);
    dataService.off(EVENT_TOTAL_COLUMNS_COUNT, this.onTotalColumnsChunkReceived);
    dataService.off(EVENT_PROGRESS_ERROR, this.onProgressError);
  }

  /**
   * returns pivot's configuration
   *
   * @returns {Props} - current props with callbacks and configurations
   */
  getCurrentState(): Props {
    return { ...this.props };
  }

  /**
   * Start JAQL loading
   *
   * @param {JaqlRequest} jaql - JAQL request to load
   * @returns {void}
   */
  updateJaql(jaql?: JaqlRequest) {
    this.totalItemsCount = 0;
    this.totalColumnsCount = 0;
    this.totalRecordsCount = 0;
    this.columnsCount = 0;
    this.limitReached = false;
    this.loadedItemsCount = undefined;
    this.updateProps({
      totalItemsCount: this.totalItemsCount,
      totalColumnsCount: this.totalColumnsCount,
      totalRecordsCount: this.totalRecordsCount,
      columnsCount: this.columnsCount,
      limitReached: this.limitReached,
    });
    this.loadInitData(jaql);
  }

  /**
   * Update component width/height
   *
   * @param {object} newProps - component changed properties
   * @returns {void}
   */
  updateProps(newProps: Record<string, any>) {
    if (!this.domElem) {
      return;
    }
    const nextProps = {
      ...this.props,
      ...newProps,
      // reference: https://stackoverflow.com/a/55823466/2425556
      ref: (ref: Pivot) => (this.pivot = ref),
    };
    const changedProps = getChangedProps(this.props, nextProps);
    if (
      typeof changedProps.isPaginated !== 'undefined' ||
      typeof changedProps.itemsPerPage !== 'undefined'
    ) {
      this.totalItemsCount = 0;
      this.totalRecordsCount = 0;
      this.loadedItemsCount = undefined;
      this.loadInitData(undefined, nextProps as Props);
    }

    const reactElement = React.createElement(Pivot, nextProps, null);

    // See notes in the render() method
    try {
      this.rootDom.render(reactElement);
    } catch (e) {
      ReactDOM.render(reactElement, this.domElem);
    }

    this.props = nextProps;
  }

  /**
   * Loading initial page
   *
   * @param {JaqlRequest} [jaql] - JAQL to load, or 'null' if use cached data
   * @param {Props} [props] - Pivot props
   * @returns {void}
   * @private
   */
  loadInitData(jaql?: JaqlRequest, props: Props = this.props) {
    // Workaround to prevent double loading of the same data in React Strict mode
    if (this.dataService?.getJaql()?.queryGuid === jaql?.queryGuid) {
      return;
    }

    const { dataService } = this;
    const { isPaginated, itemsPerPage } = props;
    const pageSize = isPaginated ? itemsPerPage : undefined;

    // @ts-ignore
    this.onDataChunkReceivedThrottle.cancel();

    if (!dataService) {
      if (this.pivot) {
        this.pivot.initialize();
      }
      if (this.currentRowsTreeService) {
        this.currentRowsTreeService.destroy();
        this.currentRowsTreeService = undefined;
      }
      return;
    }

    this.updateProps({
      itemsCount: 0,
      totalItemsCount: 0,
      totalColumnsCount: 0,
      totalRecordsCount: 0,
      columnsCount: 0,
      activePage: DEFAULT_ACTIVE_PAGE,
      isAllDataLoaded: false,
      limitReached: false,
    });
    this.currentRowsTreeService = undefined;

    this.isLoadPageInProgress = false;
    this.isFirstPageRenderInProgress = false;

    this.showLoading();
    this.events.emit(EVENT_QUERY_START);

    dataService
      .loadData(jaql, { pageSize, isPaginated })
      .then(
        ({ rowsTreeService, columnsTreeService, cornerTreeService, isLastPage, cellsMetadata }) => {
          this.events.emit(EVENT_QUERY_END);
          if (this.loadedItemsCount !== null) {
            this.updateProps({
              itemsCount: this.loadedItemsCount,
              totalItemsCount: this.totalItemsCount,
              totalRecordsCount: this.totalRecordsCount,
              limitReached: this.limitReached,
              activePage: DEFAULT_ACTIVE_PAGE,
              isAllDataLoaded: true,
            });
          }
          if (this.pivot) {
            this.isFirstPageRenderInProgress = true;
            this.pivot.initialize(rowsTreeService, columnsTreeService, cornerTreeService, {
              isLastPage,
              cellsMetadata,
            });
            this.currentRowsTreeService = rowsTreeService;
          }
        },
      )
      .catch((err) => {
        if (err instanceof LoadingCanceledError) {
          return;
        }
        throw err;
      });

    dataService
      .loadAllData()
      .then((options: AllDataInfo) => {
        this.totalItemsCount = options.totalItemsCount;
        this.loadedItemsCount = options.loadedRowsCount;
        this.totalRecordsCount = options.totalRecordsCount;
        this.limitReached = options.limitReached;
        if (options.columnsCount && options.totalColumnsCount) {
          this.columnsCount = options.columnsCount;
          this.totalColumnsCount = options.totalColumnsCount;
        }
        const propsToUpdate = { isAllDataLoaded: true, ...options };
        this.updateProps(propsToUpdate);
        this.setAppearanceState({ isReceivedRowsCountCalculated: true });
      })
      .catch((err) => {
        if (err instanceof LoadingCanceledError) {
          return;
        }
        throw err;
      });
  }

  /**
   * Load appropriate page in case of paging
   *
   * @param {number} page - page to load
   * @returns {void}
   * @private
   */
  loadPageData(page: number) {
    if (this.isLoadPageInProgress || !this.props.isPaginated) {
      return;
    }
    const { dataService } = this;

    if (!dataService) {
      // eslint-disable-next-line no-console
      console.warn('DataService instance not defined');
      return;
    }

    this.isLoadPageInProgress = true;
    this.showLoading();
    this.events.emit(EVENT_QUERY_START);
    // eslint-disable-next-line promise/catch-or-return
    dataService
      .getSelectedPageData(page, this.props.itemsPerPage)
      .then(
        ({ rowsTreeService, columnsTreeService, cornerTreeService, isLastPage, cellsMetadata }) => {
          this.events.emit(EVENT_QUERY_END);
          this.isLoadPageInProgress = false;
          if (this.pivot) {
            this.pivot.initialize(rowsTreeService, columnsTreeService, cornerTreeService, {
              isLastPage,
              cellsMetadata,
            });
            this.currentRowsTreeService = rowsTreeService;
          }
          this.updateProps({
            activePage: page,
          });
        },
      );
  }

  /**
   * Show loading indication
   *
   * @returns {void}
   * @private
   */
  showLoading() {
    this.emit(EVENT_LOADING_START);
  }

  /**
   * Hide loading indication
   *
   * @returns {void}
   * @private
   */
  hideLoading() {
    this.emit(EVENT_LOADING_END);
  }

  onDataChunkReceived = (loadedCount: number) => {
    this.onDataChunkReceivedThrottle(loadedCount);
  };

  onGrandChunkReceived = (grandRow: PivotTreeNode) => {
    const { isPaginated } = this.props;
    if (isPaginated && this.currentRowsTreeService && !this.currentRowsTreeService.hasGrandTotals) {
      this.currentRowsTreeService.extend(grandRow);
      this.currentRowsTreeService.hasGrandTotals = true;
      if (this.pivot) {
        this.pivot.addMore(this.currentRowsTreeService, true);
      }
    }
    this.setAppearanceState({ isGrandTotalRowRendered: true });
  };

  onTotalRowsChunkReceived = (data: any) => {
    const { rowsCount, queryRowsCount, limitReached = false } = data;
    this.updateProps({
      totalItemsCount: rowsCount,
      totalRecordsCount: queryRowsCount,
      limitReached,
    });
    this.setAppearanceState({ isTotalRowsCountRendered: true });
  };

  onTotalColumnsChunkReceived = (data: ColumnsCount) => {
    const { columnsCount, totalColumnsCount } = data;
    this.columnsCount = columnsCount;
    this.totalColumnsCount = totalColumnsCount;
    this.updateProps({ columnsCount, totalColumnsCount });
  };

  onProgressError = (error: Error) => {
    this.emit(EVENT_PROGRESS_ERROR, error);
  };

  onSortingMetadataUpdate = (sortDetails: SortDetails) => {
    const isSingleRowTree = this.dataService ? this.dataService.isSingleRowTree() : false;
    this.emit(EVENT_SORT_UPDATE, sortDetails, { isSingleRowTree });
  };

  private showSimpleSortingPopup(
    sortDetails: SortDetails,
    cell: PivotCell,
    isSingleRowTree: boolean,
    titleOfPopUp: string[],
  ): void {
    const jaql = this.dataService && this.dataService.getJaql();
    if (!jaql) {
      return;
    }

    const metadataPanels = jaqlProcessor.getMetadataPanels(jaql);
    const dataTypes = jaqlProcessor.getDataTypes(metadataPanels);
    const currentSortingSettings = jaqlProcessor.mapWidgetJaqlToSimpleSortingSettings(
      metadataPanels,
      sortDetails,
      dataTypes,
    );

    if (currentSortingSettings === undefined) {
      return; // nothing to sort;
    }

    const onSortingSettingsUpdate = (settings: typeof currentSortingSettings): void => {
      cell.setSortingPopup(null);

      if (isEqual(currentSortingSettings, settings)) {
        return; // do nothing;
      }

      this.emit(EVENT_SORTING_SETTINGS_CHANGED, {
        type: 'simple',
        settings: [settings],
        sortDetails,
        isSingleRowTree,
      });
    };

    const sortingPopup = React.createElement(SimpleSortingSettingsPopup, {
      titleOfPopUp,
      currentSortingSettings,
      onSortingSettingsUpdate,
      messages: this.props.getSortingPopupMessages(),
    });

    cell.setSortingPopup(sortingPopup);
  }

  private showComplexSortingPopup(
    sortDetails: SortDetails,
    cell: PivotCell,
    isSingleRowTree: boolean,
    titleOfPopUp: string[],
  ): void {
    const jaql = this.dataService && this.dataService.getJaql();
    if (!jaql) {
      return;
    }
    const currentSortingSettings = jaqlProcessor.mapWidgetJaqlToComplexSortingSettings(
      jaql,
      sortDetails,
    );

    const onSortingSettingsUpdate = (settings: SortingSettingsItem[]): void => {
      cell.setSortingPopup(null);

      if (isEqual(currentSortingSettings, settings)) {
        return; // do nothing;
      }

      this.emit(EVENT_SORTING_SETTINGS_CHANGED, {
        type: 'complex',
        settings,
        sortDetails,
        isSingleRowTree,
      });
    };

    const sortingPopup = React.createElement(ComplexSortingSettingsPopup, {
      titleOfPopUp,
      currentSortingSettings,
      onSortingSettingsUpdate,
      onCrossIconClick: () => cell.setSortingPopup(null),
      messages: this.props.getSortingPopupMessages(),
    });

    cell.setSortingPopup(sortingPopup);
  }

  handleSortingSettingsChanged = (
    treeNode: PivotTreeNode | undefined,
    metadata: TreeNodeMetadata | undefined,
    cell: PivotCell,
  ) => {
    if (!treeNode || treeNode.dir === undefined) {
      return;
    }

    const measureNode =
      metadata && metadata.valueNode ? createPivotTreeNode(metadata.valueNode) : undefined;

    const sortDetails: SortDetails = {
      measurePath: treeNode.measurePath,
      dir: treeNode.dir || getDefaultSortDirection(treeNode),
      field: measureNode ? measureNode.jaqlIndex : treeNode.jaqlIndex,
    };

    const isClickedOnRow =
      treeNode.metadataType === 'rows' && treeNode.jaqlIndex === sortDetails.field;
    const isSingleRowTree = this.dataService ? this.dataService.isSingleRowTree() : false;
    const shouldShowSimple = isClickedOnRow || isSingleRowTree;
    const titleOfPopUp = getListOfColumnNamesForTitle(treeNode);

    if (shouldShowSimple) {
      this.showSimpleSortingPopup(sortDetails, cell, isSingleRowTree, titleOfPopUp);
    } else {
      this.showComplexSortingPopup(sortDetails, cell, isSingleRowTree, titleOfPopUp);
    }
  };

  onMoreLoadingFinish = () => {
    this.hideLoading();
  };

  onPageChange = (args: { selected: number }) => {
    this.emit(EVENT_PAGE_CHANGE);
    this.loadPageData(args.selected);
  };

  onItemsPerPageChange = (itemsPerPage: number) => {
    this.updateProps({
      activePage: DEFAULT_ACTIVE_PAGE,
      itemsPerPage,
    });
  };

  onEmptyChange = (isEmpty: boolean) => {
    this.emit(EVENT_EMPTY_CHANGE, isEmpty);
  };

  onTotalHeightChange = (totalHeight: number) => {
    this.emit(EVENT_TOTAL_HEIGHT_CHANGE, totalHeight);
  };

  onDomReady = () => {
    this.emit(EVENT_DOM_READY);
  };

  onGridUpdated = () => {
    if (this.isFirstPageRenderInProgress) {
      this.isFirstPageRenderInProgress = false;
      this.setAppearanceState({ isFirstPageRendered: true });
    }

    this.hideLoading();
  };

  /**
   * Handles appearance state updating
   *
   * @param {AppearanceState} prevState - prev appearance state
   * @param {AppearanceState} nextState - next appearance state
   * @returns {void}
   */
  onAppearanceStateUpdated(prevState: AppearanceState, nextState: AppearanceState) {
    if (!prevState.isFirstPageRendered && nextState.isFirstPageRendered) {
      this.emit(EVENT_FIRST_PAGE_RENDERED);
    }
    if (!this.isTotallyRendered(prevState) && this.isTotallyRendered(nextState)) {
      this.emit(EVENT_TOTAL_WIDGET_RENDERED);
    }
  }

  /**
   * Setter for pivot builder appearance state
   *
   * @param {AppearanceState} appearanceState - appearance state properties to update
   * @returns {void}
   */
  setAppearanceState(appearanceState: AppearanceState = {}) {
    const prevState = Object.freeze({ ...this.appearanceState });
    const nextState = Object.freeze({ ...this.appearanceState, ...appearanceState });
    this.onAppearanceStateUpdated(prevState, nextState);
    this.appearanceState = nextState;
  }

  /**
   * Resets pivot builder appearance state
   *
   * @returns {void}
   */
  resetAppearanceState() {
    const prevState = Object.freeze({ ...this.appearanceState });
    const nextState = Object.freeze({ ...INITIAL_APPEARANCE_STATE });
    this.onAppearanceStateUpdated(prevState, nextState);
    this.appearanceState = nextState;
  }

  /**
   * Checks if pivot widget totally rendered
   *
   * @param {AppearanceState} [state] - appearance state
   * @returns {boolean} - is totally rendered flag
   */
  isTotallyRendered(state: AppearanceState = this.appearanceState) {
    const jaql = (this.dataService && this.dataService.getJaql()) || {
      grandTotals: { rows: undefined },
    };
    const hasGrandTotalRow = !!(jaql.grandTotals && jaql.grandTotals.rows);
    return (
      state.isFirstPageRendered &&
      state.isTotalRowsCountRendered &&
      state.isReceivedRowsCountCalculated &&
      (!hasGrandTotalRow || state.isGrandTotalRowRendered)
    );
  }
}

export default PivotBuilder;
