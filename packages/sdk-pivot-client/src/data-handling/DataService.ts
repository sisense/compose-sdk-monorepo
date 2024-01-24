/* eslint-disable @typescript-eslint/ban-types */
/* eslint-disable max-lines */
import EventEmitter from 'events';
import { MessageType } from '../data-load/constants.js';
import { PanelType, UserType } from './constants.js';
import { TreeService } from '../tree-structure/index.js';
import { treeNode } from '../tree-structure/utils/index.js';
import { LoadingCanceledError } from '../errors/index.js';
import { DivergenceComparator } from './DivergenceComparator.js';
import {
  pivotTransforms,
  jaqlProcessor,
  createPivotTreeNode,
  // PluginService,
} from './utils/index.js';
import { debug, cloneObject, throttle, findIndex } from '../utils/index.js';
import { LoggerI } from '../utils/types.js';
import { TreeServiceI, TreeNode, HeaderTreeNode } from '../tree-structure/types.js';
import { DataLoadServiceI, JaqlRequest, JaqlPanel } from '../data-load/types.js';
// import { GlobalStyles, PluginConfig } from './utils/plugins/types';
import { DataServiceI, PivotTreeNode, PivotDataNode, InitPageData, AllDataInfo } from './types.js';

export type NodesChunk = {
  list: Array<TreeNode>;
  size: number;
  ready: boolean;
  handled: boolean;
};

type PanelField = { id?: string; index?: number };

const getJaqlComposition = (
  jaql: JaqlRequest | undefined,
  rawMetadata: Array<JaqlPanel>,
): JaqlRequest => {
  const processedJaql = jaql || { metadata: [], grandTotals: null };
  let { metadata } = processedJaql;
  metadata = metadata.map((panel: JaqlPanel) => {
    const field: PanelField = panel.field || {};
    // find format to compose from rawMetadata by field.index
    const samePanel = rawMetadata.find(
      ({ field: rawField }: JaqlPanel) => rawField && rawField.index === field.index,
    );
    const format = samePanel ? samePanel.format : null;
    return format ? { ...panel, format } : panel;
  });

  return { ...processedJaql, metadata };
};

export const DEFAULT_PAGE_SIZE = 100;
export const EVENT_DATA_LOAD = 'dataLoad';
export const EVENT_DATA_CHUNK_LOADED = 'dataChunkLoaded';
export const EVENT_DATABAR_CHUNK_LOADED = 'dataBarChunkLoaded';
export const EVENT_RANGEMINMAX_CHUNK_LOADED = 'rangeMinMaxChunkLoaded';
export const EVENT_GRAND_CHUNK_LOADED = 'grandChunkLoaded';
export const EVENT_DATA_FINISH_CHUNK_LOADED = 'dataFinishChunkLoaded';
export const EVENT_FINISH_CHUNK_LOADED = 'finishChunkLoaded';
export const EVENT_PROGRESS_ERROR = 'progressError';
export const EVENT_HEADER_CELL_FORMAT = 'headerCellFormat';
export const EVENT_DATA_CELL_FORMAT = 'dataCellFormat';
export const EVENT_TOTAL_ROWS_COUNT = 'totalRowsCountLoaded';
export const EVENT_TOTAL_COLUMNS_COUNT = 'totalColumnsCountLoaded';
export const NODES_CHUNK_SIZE_MAX = 1000;

// TODO Review if throttling is needed
export const THROTTLE_TIME_MS = 0;

type Options = {
  throttle: Function;
  throttleTime: number;
  // PluginService: typeof PluginService;
  skipInternalColorFormatting: boolean;
  subtotalsForSingleRow: boolean;
};

export type DataServiceOptions = Partial<Options>;

const defaultOptions = {
  throttle,
  throttleTime: THROTTLE_TIME_MS,
  // PluginService,
  skipInternalColorFormatting: false,
  subtotalsForSingleRow: false,
};

export class DataService implements DataServiceI {
  /** Logger instance */
  logger: LoggerI;

  /**
   *
   *
   * @private
   * EventEmitter instance
   */
  events: EventEmitter;

  /**
   *
   *
   * @private
   *
   * DataLoadServiceI instance
   */
  loadService: DataLoadServiceI;

  /**
   *
   *
   * @private
   *
   * configuration options object
   */
  options: Options;

  /**
   *
   *
   * @private
   *
   * loaded data chunks group
   */
  tempDataChunks: Array<NodesChunk> = [];

  /**
   *
   * @private
   *
   * last not handled data chunks group index
   */
  lastNotHandledChunkIndex = 0;

  /**
   *
   * @private
   *
   * last ready but not handled data chunks group index
   */
  lastReadyNotHandledChunkIndex = 0;

  /**
   *
   * @private
   *
   * Current rows nodes
   */
  rowsGrand?: PivotTreeNode = undefined;

  /**
   *
    @private */
  rowsTreeService?: TreeServiceI = undefined;

  /**
   *
    @private */
  columnsTreeService?: TreeServiceI = undefined;

  /**
   *
    @private */
  cornerTreeService?: TreeServiceI = undefined;

  /**
    @private */
  pageSize: number = DEFAULT_PAGE_SIZE;

  /**
   *
    @private */
  isPaginated = false;

  /**
   *
   * @private
   *
   * number of loaded pages
   */
  loadedPagesCount = 0;

  /**
   *
   * @private
   *
   * state for "loadData" method
   */
  isLoadInProgress = false;

  /**
   *
    @private */
  loadPromiseResolve?: Function;

  /**
   *
    @private */
  loadPromiseReject?: Function;

  /**
   *
    @private */
  loadPromiseCache?: InitPageData;

  /**
   *
    @private */
  loadAllPromise?: Promise<any> = undefined;

  /**
   *
    @private */
  loadAllPromiseResolve?: Function = undefined;

  /**
   *
    @private */
  loadAllPromiseReject?: Function = undefined;

  /**
   *
   * @private
   *
   * defines if all data is loaded
   */
  isWholeDataLoaded = false;

  /**
   *
   * @private
   *
   * defines that data finish event is happened
   */
  hasDataFinishEvent = false;

  /**
   *
   * @private
   *
   * defines that data handler in progress
   */
  isDataHandlerThrottled = false;

  /**
   *
   * @private
   *
   * throttled data handler
   */
  onDataHandlerThrottle: (data: any) => void;

  /**
   *
   * @private
   *
   * jaql request pure metadata
   */
  metadata: Array<JaqlPanel> = [];

  dataBars: Array<[string, string]> | undefined;

  rangeMinMax: Array<[string, string]> | undefined;

  /**
   *
   * @private
   *
   * service for items indexation divergence
   */
  divergenceComparator: DivergenceComparator = new DivergenceComparator();

  /**
   *
   * @private
   *
   * service to apply customers plugins
   */
  // pluginService?: PluginService;

  /**
   *
    @private */
  rawJaql?: JaqlRequest = undefined;

  /**
   *
   * @private
   *
   * triggered events data storage
   */
  triggeredEventsData: { [key: string]: any } = {};

  /**
   *
   * @private
   *
   * plugins handlers
   */
  // callPlugins: Array<PluginConfig> = [];

  /**
   *
   * @private
   *
   * plugins global styles
   */
  // globalStyles?: GlobalStyles;

  /**
   *
   * @private
   *
   * actual data columns count
   */
  columnsCount?: number;

  /**
   *
   * @private
   *
   * total data columns count
   */
  totalColumnsCount?: number;

  /**
   *
   * @private
   *
   * actual data rows count
   */
  rowsCount?: number;

  /**
   *
   * @private
   *
   * total data rows count
   */
  totalRowsCount?: number;

  /**
   *
   * @private
   *
   * total CVS records count
   */
  totalRecordsCount?: number;

  /**
   *
   * @private
   *
   * is rows limit reached
   */
  limitReached?: boolean;

  // eslint-disable-next-line max-lines-per-function
  constructor(
    loadService: DataLoadServiceI,
    events?: EventEmitter,
    options?: Partial<Options>,
    logger?: LoggerI,
  ) {
    this.loadService = loadService;
    this.events = events || new EventEmitter();
    this.logger = logger || debug.create('DataService');
    this.options = { ...defaultOptions, ...options };
    this.attachEvent();

    this.onDataHandlerThrottle = this.options.throttle(() => {
      const chunkIndex = findIndex(
        this.tempDataChunks,
        (item: NodesChunk) => item.ready && !item.handled,
        this.lastReadyNotHandledChunkIndex,
      );
      if (chunkIndex === -1) {
        return;
      }
      this.lastReadyNotHandledChunkIndex = chunkIndex;
      const chunk: NodesChunk = this.tempDataChunks[chunkIndex];

      const rows = this.preProcessTree(chunk.list, PanelType.ROWS);
      const modifiedRows = this.modifyTree(rows, PanelType.ROWS);
      this.postProcessTree(modifiedRows, { skipFormatEvent: true });
      this.postProcessData(modifiedRows, { skipFormatEvent: true });
      const wrappedModifiedRows = treeNode.wrapInRootNode(modifiedRows);
      if (this.rowsTreeService) {
        this.rowsTreeService.extend(wrappedModifiedRows);
      } else {
        this.rowsTreeService = new TreeService(wrappedModifiedRows, true);
      }

      this.emit(EVENT_DATA_CHUNK_LOADED, this.getLoadedElementsCount());

      chunk.handled = true;

      const nextChunkIndex = findIndex(
        this.tempDataChunks,
        (item: NodesChunk) => !item.handled,
        this.lastNotHandledChunkIndex,
      );
      if (nextChunkIndex !== -1) {
        this.lastNotHandledChunkIndex = nextChunkIndex;
        // setImmediate(this.onDataHandlerThrottle);
      } else {
        this.isDataHandlerThrottled = false;
      }

      if (this.hasDataFinishEvent && this.tempDataChunks.length) {
        const chunkLast = this.tempDataChunks[this.tempDataChunks.length - 1];
        chunkLast.ready = true;
      }

      if (this.hasDataFinishEvent && nextChunkIndex === -1) {
        this.finishRequest();
        this.checkLoadPromise();
      } else {
        this.checkLoadPromise();
      }
    }, this.options.throttleTime);
  }

  destroy() {
    this.detachEvent();
    this.rowsGrand = undefined;
    this.rowsTreeService = undefined;
    this.columnsTreeService = undefined;
    this.cornerTreeService = undefined;
    this.tempDataChunks = [];
    this.lastNotHandledChunkIndex = 0;
    this.lastReadyNotHandledChunkIndex = 0;
    this.events.removeAllListeners();
  }

  /**
   * Subscribe to event notification
   *
   * @param {string} eventName - event name to subscribe
   * @param {Function} callback - event handler
   * @returns {void}
   */
  on(eventName: string, callback: (...args: any[]) => void): void {
    this.events.on(eventName, callback);
    if (this.triggeredEventsData[eventName]) {
      this.triggeredEventsData[eventName].forEach((payload: Array<any>) => {
        setImmediate(() => {
          this.events.emit(eventName, ...payload);
        });
      });
      delete this.triggeredEventsData[eventName];
    }
  }

  /**
   * Emits event with payload
   *
   * @param {string} eventName - event name to emit
   * @param {Array<any>} payload - event payload
   * @returns {void}
   */
  emit(eventName: string, ...payload: Array<any>): void {
    const eventListeners = this.events.listeners(eventName);
    if (eventListeners.length === 0) {
      this.triggeredEventsData[eventName] = this.triggeredEventsData[eventName] || [];
      this.triggeredEventsData[eventName].push(payload);
    } else {
      this.events.emit(eventName, ...payload);
    }
  }

  /**
   * Unsubscribe from event notification
   *
   * @param {string} eventName - event name to unsubscribe from
   * @param {Function} callback - event handler
   * @returns {void}
   */
  off(eventName: string, callback: (...args: any[]) => void): void {
    this.events.removeListener(eventName, callback);
    if (this.triggeredEventsData[eventName]) {
      delete this.triggeredEventsData[eventName];
    }
  }

  /**
   * Initialize start data loading
   *
   * @param {JaqlRequest} [jaql] - JAQL request object
   * @param {object} [options] - additional options
   * @param {number} [options.pageSize=100] - page size to wait
   * @param {boolean} [options.isPaginated=false] - defines which type of treeService to return,
   * partial or paginated
   * @param {Array<JaqlPanel>} [options.metadata] - jaql's metadata
   * @param {boolean} [options.cacheResult=false] - cache result for next call or not
   * @returns {Promise<any>} - promise with initial data to render
   */
  // eslint-disable-next-line max-lines-per-function,sonarjs/cognitive-complexity
  loadData(
    jaql?: JaqlRequest,
    options?: {
      pageSize?: number;
      isPaginated?: boolean;
      metadata?: Array<JaqlPanel>;
      cacheResult?: boolean;
    },
  ): Promise<InitPageData> {
    // console.log('loadData', jaql, options);
    const {
      pageSize = DEFAULT_PAGE_SIZE,
      isPaginated = false,
      cacheResult = false,
      metadata,
    } = options || {};
    const pageSizeIsNotChanged = this.pageSize === pageSize;
    this.clearLoadAllPromise();
    if (jaql) {
      this.clearCache();
      // TODO review this
      // this.onDataHandlerThrottle.cancel();
    }
    this.pageSize = pageSize;
    this.isPaginated = isPaginated;
    this.emit(EVENT_DATA_LOAD);

    if (this.loadPromiseCache && pageSizeIsNotChanged) {
      const loadPromise = Promise.resolve(this.loadPromiseCache);
      this.loadPromiseCache = undefined;
      return loadPromise;
    }

    this.isLoadInProgress = true;
    if (jaql) {
      this.metadata = metadata || [];
      this.rawJaql = getJaqlComposition(jaql, this.metadata);
      // console.log('getJaqlComposition', jaql, this.metadata, this.rawJaql);
      // this.initPluginService(this.rawJaql);
      this.loadService
        .load(jaql)
        .then((data) => {
          if (data === null || data === undefined) {
            return;
          }
          const isDataNotExist = !('data' in data);
          const isDataTransferFinished = data.dataFinish[0];

          if (isDataTransferFinished && isDataNotExist) {
            // eslint-disable-next-line no-throw-literal
            throw {
              error: {
                error: true,
                details: 'metadata undefined.',
              },
            };
          }
        })
        .catch((data) => {
          if (this.loadPromiseReject) {
            this.loadPromiseReject(data.error);
          }
        });
    }

    const loadPromise = new Promise((resolve, reject) => {
      this.loadPromiseResolve = resolve;
      this.loadPromiseReject = reject;
    })
      .then((loadedCount) => this.sendInitPage(loadedCount as number))
      .then((data) => {
        if (cacheResult) {
          this.loadPromiseCache = data;
        }
        this.loadedPagesCount = 1;
        return data;
      })
      .catch((err) => {
        if (err instanceof LoadingCanceledError) {
          this.clearLoadPromise();
        }
        throw err;
      });

    this.checkLoadPromise();

    return loadPromise;
  }

  /**
   * Sets Promise that resolves after all data loaded
   *
   * @returns {Promise<{ loadedRowsCount: number, totalItemsCount: number }>} - promise with
   * loaded items count
   */
  loadAllData(): Promise<AllDataInfo> {
    if (this.isWholeDataLoaded) {
      const allDataInfo: AllDataInfo = {
        loadedRowsCount: this.getLoadedElementsCount(),
        totalItemsCount:
          typeof this.totalRowsCount === 'number' ? this.totalRowsCount : this.getTotalItemsCount(), // backward compatibility
        totalRecordsCount: this.totalRecordsCount,
        limitReached: this.limitReached,
        dataBars: this.dataBars,
        rangeMinMax: this.rangeMinMax,
      };

      if (this.columnsCount !== 0 && this.totalColumnsCount !== 0) {
        allDataInfo.columnsCount = this.columnsCount;
        allDataInfo.totalColumnsCount = this.totalColumnsCount;
      }

      return Promise.resolve(allDataInfo);
    }
    if (!this.loadAllPromise) {
      this.loadAllPromise = new Promise((resolve, reject) => {
        this.loadAllPromiseResolve = resolve;
        this.loadAllPromiseReject = reject;
      })
        .then(() => ({
          loadedRowsCount: this.getLoadedElementsCount(),
          totalItemsCount:
            typeof this.totalRowsCount === 'number'
              ? this.totalRowsCount
              : this.getTotalItemsCount(), // backward compatibility
          totalRecordsCount: this.totalRecordsCount,
          limitReached: this.limitReached,
          dataBars: this.dataBars,
          rangeMinMax: this.rangeMinMax,
        }))
        .catch((err) => {
          if (err instanceof LoadingCanceledError) {
            this.clearLoadAllPromise();
          }
          throw err;
        });
    }
    return this.loadAllPromise;
  }

  /**
   * public method for selecting page and setting new page size
   *
   * @param {number} selected - page number
   * @param {number} pageSize - set page size (optional)
   * @returns {Promise<{rowsTreeService, columnsTreeService, cornerTreeService, isLastPage}>}
   * - returns private method's call with panel's treeServices
   */
  getSelectedPageData(selected: number, pageSize?: number): Promise<InitPageData> {
    return Promise.resolve(this.sendPaginatedPage(selected, pageSize));
  }

  /**
   * public method for selecting page by indexes
   *
   * @param {number} from - first row's index
   * @param {number} to - last row's index
   * @param {boolean} lastPage - append grandTotals
   * @returns {Promise<{rowsTreeService, columnsTreeService, cornerTreeService, isLastPage}>}
   * - returns private method's call with panel's treeServices
   */
  getIndexedPageData(from: number, to: number, lastPage = false): Promise<InitPageData> {
    return Promise.resolve(this.sendPartialPage(from, to, lastPage));
  }

  /**
   * Returns current jaql request object
   *
   * @returns {JaqlRequest} - jaql request object
   */
  getJaql(): JaqlRequest {
    return (
      this.loadService.getJaql() || {
        metadata: [],
        grandTotals: null,
      }
    );
  }

  /**
   * Defines data structure
   *
   * @returns {boolean} - true - single branch tree
   */
  isSingleRowTree(): boolean {
    return this.loadService.isSingleRowTree();
  }

  /**
   * Set cell process handlers
   *
   * @param {Array<PluginConfig>} handlers - object with target and handler
   * @returns {void}
   */
  // setPluginHandlers(handlers: Array<PluginConfig>) {
  //   this.callPlugins = handlers;
  // }

  /**
   * Set global styles for all cells
   *
   * @param {GlobalStyles} [styles] - object with target and handler
   * @returns {void}
   */
  // setGlobalStyles(styles?: GlobalStyles): void {
  //   this.globalStyles = styles;
  // }

  /**
   * Returns current raw jaql request object
   *
   * @returns {JaqlRequest} - composition of required jaql fields
   * @private
   */
  getRawJaql(): JaqlRequest {
    return this.rawJaql || this.getJaql();
  }

  /**
   * Returns current jaql request metadata array
   *
   * @returns {Array<JaqlPanel>} - jaql request metadata
   * @private
   */
  getMetadata(): Array<JaqlPanel> {
    return this.metadata.length > 0 ? this.metadata : this.getJaql().metadata;
  }

  /**
   * Pre-process initial tree structure
   *
   * @param {Array<TreeNode>} items - items to normalize
   * @param {string} type - items types to normalize
   * @param {object} options - additional options
   * @param {number} [options.level=0] - tree level, for internal use only
   * @param {object} [options.measurePath={}] - items types to normalize
   * @returns {Array<PivotTreeNode>} - normalized list of items
   */
  preProcessTree(
    items: TreeNode | Array<TreeNode>,
    type: string,
    options?: {
      level?: number;
      measurePath?: { [key: string]: string };
    },
  ): Array<PivotTreeNode> {
    return pivotTransforms.preProcessTree(items, type, this.getJaql(), options);
  }

  /**
   * Post-process final tree structure with formatting event
   *
   * @param {PivotTreeNode} items - list of PivotTreeNode items
   * @param {object} [options] - additional options
   * @param {boolean} [options.skipFormatEvent] - process tree but skip format event trigger
   * @param {boolean} [options.onlyFormatEvents] - process tree with format event trigger only
   * @param {Function} [options.iterateFn] - iterate function to call for each tree node
   * @returns {void}
   */
  postProcessTree(
    items: Array<PivotTreeNode>,
    options?: { skipFormatEvent?: boolean; onlyFormatEvents?: boolean; iterateFn?: Function },
  ): void {
    const emitFn = (item: PivotTreeNode, panel: JaqlPanel | undefined, jaql: JaqlRequest): void =>
      this.emit(EVENT_HEADER_CELL_FORMAT, item, panel, jaql, this.options);
    const extendedOptions = { ...(options || {}), emitFn };
    return pivotTransforms.postProcessTree(items, this.getRawJaql(), extendedOptions);
  }

  /**
   * Post-process data list with formatting event
   *
   * @param {PivotTreeNode} items - list of PivotTreeNode rows items
   * @param {object} [options] - additional options
   * @param {boolean} [options.skipFormatEvent] - process data list but skip format event trigger
   * @param {boolean} [options.onlyFormatEvents] - process data list with format event
   * trigger only
   * @returns {void}
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  postProcessData(
    items: Array<PivotTreeNode>,
    options?: { skipFormatEvent?: boolean; onlyFormatEvents?: boolean },
  ): void {
    const { skipFormatEvent = false, onlyFormatEvents = false } = options || {};
    const columns = this.columnsTreeService ? this.columnsTreeService.getLastLevelNodes() : [];
    const rows = treeNode.getLastLevelNodes(items);
    const jaql = this.getRawJaql();

    if (skipFormatEvent) {
      return;
    }

    rows.forEach((rowTreeNode: PivotTreeNode) => {
      const rowItem = createPivotTreeNode(rowTreeNode);
      columns.forEach((columnTreeNode) => {
        const columnItem = createPivotTreeNode(columnTreeNode);
        const measurePanel = jaqlProcessor.getMetadataPanelByIndex(
          jaql,
          columnItem.measureJaqlIndex,
          PanelType.MEASURES,
        );
        if (typeof rowItem.data !== 'undefined' && typeof columnItem.index !== 'undefined') {
          const { data = [] } = rowItem;
          const { index } = columnItem;
          const value = data[index];

          const item: PivotDataNode =
            typeof value === 'object' && value !== null && value !== undefined ? value : { value };
          data[index] = item;

          if (onlyFormatEvents || !skipFormatEvent) {
            const { skipInternalColorFormatting = false } = this.options;
            if (!skipInternalColorFormatting) {
              pivotTransforms.applyColorFormatting(item, rowItem, columnItem, measurePanel);
            }
            this.emit(
              EVENT_DATA_CELL_FORMAT,
              item,
              rowItem,
              columnItem,
              measurePanel,
              jaql,
              this.options,
            );
          }
        }
      });
    });
  }

  /**
   * Modify tree structure for subtotals and grand totals and some customization
   *
   * @param {Array<PivotTreeNode>} items - base items to modify
   * @param {string} type - items types to normalize
   * @param {TreeNode} originalData - initial data object
   * @returns {PivotTreeNode | Array<PivotTreeNode>} - normalized list of items
   */
  modifyTree(
    items: Array<PivotTreeNode>,
    type: string,
    originalData?: TreeNode,
  ): Array<PivotTreeNode> {
    const jaql = this.getJaql();
    return pivotTransforms.modifyTree(items, type, jaql, {
      originalData,
      applyIndexDivergence: this.applyIndexDivergence.bind(this),
      subtotalsForSingleRow: this.options.subtotalsForSingleRow,
    });
  }

  /**
   * method calculates divergence by prev indexes
   *
   * @param {Array<PivotTreeNode>} items - data to modify divergence and apply
   * @returns {void}
   * @private
   */
  applyIndexDivergence(items: Array<PivotTreeNode>) {
    this.divergenceComparator = new DivergenceComparator(items, this.divergenceComparator);
  }

  /**
   * method creates plugin service instance for pivot
   *
   * @param {JaqlRequest} jaql - data to modify divergence and apply
   * @returns {void}
   * @private
   */
  // initPluginService(jaql: JaqlRequest) {
  //   this.pluginService = new this.options.PluginService(this.callPlugins, jaql, this.globalStyles);
  // }

  /**
   * Cancel current loading process
   *
   * @returns {void}
   */
  cancelLoading() {
    const loadingCanceledError = new LoadingCanceledError();

    if (this.loadPromiseReject && typeof this.loadPromiseReject === 'function') {
      this.loadPromiseReject(loadingCanceledError);
    }

    if (this.loadAllPromiseReject && typeof this.loadAllPromiseReject === 'function') {
      this.loadAllPromiseReject(loadingCanceledError);
    }

    this.detachEvent();
  }

  /**
   * Returns final page size, excluding grand totals rows for example
   *
   * @returns {number} - page size
   * @private
   */
  getPageSize() {
    return this.pageSize;
  }

  /**
   *
   * Send result for "loadData" function after promise resolve
   *
   * @param {number} loadedCount - count of already loaded rows
   * @returns {{
   *     rowsTreeService: TreeServiceI,
   *     columnsTreeService: TreeServiceI,
   *     corner: TreeNode,
   *     values: TreeNode,
   *     cellsMetadata: Map<string, Metadata>
   * }} - object with initial data
   * @private
   */
  sendInitPage(loadedCount: number): InitPageData {
    if (this.loadService.hasError() || !this.loadService.hasData()) {
      return DataService.getEmptyPage();
    }

    let partialRowsService;
    let cellsMetadata;
    const pageSize = this.getPageSize();
    if (this.rowsTreeService) {
      const from = 0;
      const to = pageSize > loadedCount ? loadedCount : pageSize;
      const cloneFn = DataService.cloneTreeNode;
      const partialTree = this.rowsTreeService.getPartialTree(from, to, { cloneFn });
      if (this.rowsGrand) {
        partialTree.push(cloneObject(this.rowsGrand));
      }
      this.postProcessTree(partialTree, {
        onlyFormatEvents: true,
        iterateFn: treeNode.clearNodeCache,
      });
      this.postProcessData(partialTree, { onlyFormatEvents: true });
      const deepLength = this.rowsTreeService ? this.rowsTreeService.getTreeDeepsLength() : 0;
      const wrappedModifiedRows = treeNode.wrapInRootNode(partialTree);
      // if (this.pluginService && wrappedModifiedRows && wrappedModifiedRows.children) {
      //   this.pluginService.applyToRows(wrappedModifiedRows.children);
      //   cellsMetadata = this.pluginService.metadataCache;
      // }
      partialRowsService = new TreeService(wrappedModifiedRows, true, deepLength);
      partialRowsService.hasGrandTotals = !!this.rowsGrand;
    }

    const isLastPage = this.isWholeDataLoaded && pageSize >= loadedCount;

    return {
      rowsTreeService: partialRowsService,
      columnsTreeService: this.columnsTreeService,
      cornerTreeService: this.cornerTreeService,
      isLastPage,
      cellsMetadata,
    };
  }

  /**
   * Sets Page Size and returns Tree Services
   *
   * @param {number} selected - page number -- STARTING FROM 0
   * @param {number} [newPageSize] - set new pageSize
   * @returns {{
   *     rowsTreeService: null,
   *     columnsTreeService: TreeServiceI,
   *     cornerTreeService: TreeServiceI,
   *     isLastPage: boolean
   * }} - returns panel's treeServices
   * @private
   */
  // eslint-disable-next-line sonarjs/cognitive-complexity
  sendPaginatedPage(selected: number, newPageSize?: number): InitPageData {
    if (this.loadService.hasError() || !this.loadService.hasData()) {
      return DataService.getEmptyPage();
    }

    if (newPageSize) {
      this.pageSize = newPageSize;
    }
    const pageSize = this.getPageSize();
    const loadedCount = this.getLoadedElementsCount();
    if (selected * pageSize >= loadedCount) {
      throw new Error('Selected page is out of elements range!');
    }
    if (selected < 0) {
      throw new Error('Selected page must be >= 0');
    }
    let partialRowsService;
    let cellsMetadata;
    if (this.rowsTreeService) {
      const from = selected >= 0 ? selected * pageSize : 0;
      const to = (selected + 1) * pageSize > loadedCount ? loadedCount : (selected + 1) * pageSize;
      const cloneFn = DataService.cloneTreeNode;
      const partialTree = this.rowsTreeService.getPartialTree(from, to, { cloneFn });
      if (this.rowsGrand) {
        partialTree.push(cloneObject(this.rowsGrand));
      }
      this.postProcessTree(partialTree, {
        onlyFormatEvents: true,
        iterateFn: treeNode.clearNodeCache,
      });
      this.postProcessData(partialTree, { onlyFormatEvents: true });
      const deepLength = this.rowsTreeService ? this.rowsTreeService.getTreeDeepsLength() : 0;
      const wrappedModifiedRows = treeNode.wrapInRootNode(partialTree);
      // if (this.pluginService && wrappedModifiedRows && wrappedModifiedRows.children) {
      //   this.pluginService.applyToRows(wrappedModifiedRows.children);
      //   cellsMetadata = this.pluginService.metadataCache;
      // }
      partialRowsService = new TreeService(wrappedModifiedRows, true, deepLength);
      partialRowsService.hasGrandTotals = !!this.rowsGrand;
    }

    return {
      rowsTreeService: partialRowsService,
      columnsTreeService: this.columnsTreeService,
      cornerTreeService: this.cornerTreeService,
      isLastPage: true,
      cellsMetadata,
    };
  }

  /**
   * Returns partial tree by indexes
   *
   * @param {number} paramFrom - start index
   * @param {number} paramTo - stop index
   * @param {boolean} lastPage - append grandTotals
   * @returns {{
   *     rowsTreeService: TreeServiceI,
   *     columnsTreeService: TreeServiceI,
   *     cornerTreeService: TreeServiceI,
   *     isLastPage: boolean
   * }} - returns panel's treeServices
   * @private
   */
  sendPartialPage(paramFrom: number, paramTo: number, lastPage: boolean): InitPageData {
    if (this.loadService.hasError() || !this.loadService.hasData()) {
      return DataService.getEmptyPage();
    }

    const loadedCount = this.getLoadedElementsCount();
    let [from, to] = [Math.min(paramFrom, paramTo), Math.max(paramFrom, paramTo)];
    from = from >= 0 ? from : 0;
    to = to >= 0 ? to : 0;
    to = to < loadedCount ? to : loadedCount;
    let rowsTreeService;
    let cellsMetadata;
    if (from > loadedCount) {
      rowsTreeService = undefined;
    } else {
      let partialTree;
      if (this.rowsTreeService) {
        const cloneFn = DataService.cloneTreeNode;
        partialTree = this.rowsTreeService.getPartialTree(from, to, { cloneFn });
        if (lastPage && this.rowsGrand) {
          partialTree.push(cloneObject(this.rowsGrand));
        }
        this.postProcessTree(partialTree, {
          onlyFormatEvents: true,
          iterateFn: treeNode.clearNodeCache,
        });
        this.postProcessData(partialTree, { onlyFormatEvents: true });
      }
      const deepLength = this.rowsTreeService ? this.rowsTreeService.getTreeDeepsLength() : 0;
      const wrappedModifiedRows = treeNode.wrapInRootNode(partialTree);
      // if (this.pluginService && wrappedModifiedRows && wrappedModifiedRows.children) {
      //   this.pluginService.applyToRows(wrappedModifiedRows.children);
      //   cellsMetadata = this.pluginService.metadataCache;
      // }
      rowsTreeService = new TreeService(wrappedModifiedRows, true, deepLength);
      rowsTreeService.hasGrandTotals = !!(lastPage && this.rowsGrand);
    }
    return {
      rowsTreeService,
      columnsTreeService: this.columnsTreeService,
      cornerTreeService: this.cornerTreeService,
      isLastPage: true,
      cellsMetadata,
    };
  }

  /**
   *
   * Get current state of tree (not recommended to use before 'loadData')
   *
   * @returns {number} loadedCount - current loaded count of children
   * @private
   */
  getLoadedElementsCount(): number {
    return this.rowsTreeService ? this.rowsTreeService.getTreeChildLength() : 0;
  }

  /**
   * Returns total amount items count handled on back-end side
   *
   * @deprecated
   * @returns {number} - items count
   * @private
   */
  getTotalItemsCount(): number {
    return this.loadService.getTotalItemsCount();
  }

  /**
   * Getter for pivot table loaded columns number
   *
   * @deprecated
   * @returns {number} loadedCount - current loaded pivot table columns count
   * @private
   */
  getLoadedColumnsCount(): number {
    return this.columnsTreeService ? this.columnsTreeService.getTreeChildLength() : 0;
  }

  /**
   * Attach events to load service
   * This is a key function implementing the Observer pattern
   * DataService acts as Observer and subscribes its handlers to various
   * data loading events emitted by the load service.
   *
   *
   * @returns {void}
   * @private
   */
  attachEvent() {
    if (this.loadService.listenerCount(MessageType.HEADERS)) {
      this.loadService.offAll(MessageType.HEADERS);
    }
    this.loadService.on(MessageType.HEADERS, this.onHeadersHandler);
    this.loadService.on(MessageType.METADATA, this.onMetadataHandler);
    this.loadService.on(MessageType.DATA, this.onDataHandler);
    this.loadService.on(MessageType.GRAND, this.onGrandHandler);
    this.loadService.on(MessageType.DATA_FINISH, this.onDataFinishHandler);
    this.loadService.on(MessageType.TOTAL_ROWS, this.onTotalRowsHandler);
    this.loadService.on(MessageType.DATABARS, this.onDataBarsHandler);
    this.loadService.on(MessageType.RANGE_MIN_MAX, this.onRangeMinMaxHandler);
    this.loadService.on(MessageType.FINISH, this.onFinishHandler);
    this.loadService.on(MessageType.ERROR, this.onErrorHandler);
  }

  /**
   * Dettach events from load service
   *
   * @returns {void}
   * @private
   */
  detachEvent() {
    this.loadService.off(MessageType.HEADERS, this.onHeadersHandler);
    this.loadService.off(MessageType.METADATA, this.onMetadataHandler);
    this.loadService.off(MessageType.DATA, this.onDataHandler);
    this.loadService.off(MessageType.GRAND, this.onGrandHandler);
    this.loadService.off(MessageType.DATA_FINISH, this.onDataFinishHandler);
    this.loadService.off(MessageType.TOTAL_ROWS, this.onTotalRowsHandler);
    this.loadService.off(MessageType.DATABARS, this.onDataBarsHandler);
    this.loadService.off(MessageType.RANGE_MIN_MAX, this.onRangeMinMaxHandler);
    this.loadService.off(MessageType.FINISH, this.onFinishHandler);
    this.loadService.off(MessageType.ERROR, this.onErrorHandler);
  }

  /**
   * Handler for pivot metadata received event
   *
   * @returns {void}
   */
  onMetadataHandler = () => {
    const jaql = { metadata: this.getMetadata() };
    const isSingleRowTree = this.isSingleRowTree();
    if (isSingleRowTree) {
      jaqlProcessor.normalizeSingleBranchTreeSortDetails(jaql);
    }
  };

  onHeadersHandler = (data: HeaderTreeNode) => {
    // bind methods for injecting them into tree service builders
    const getJaql = this.getJaql.bind(this);
    const getRawJaql = this.getRawJaql.bind(this);
    const applyIndexDivergence = this.applyIndexDivergence.bind(this);
    const emitHeaderCellFormatEvent = (
      item: PivotTreeNode,
      panel: JaqlPanel | undefined,
      jaql: JaqlRequest,
    ): void => this.emit(EVENT_HEADER_CELL_FORMAT, item, panel, jaql, this.options);

    // build columns tree service
    const buildColumnsTreeService = DataService.createColumnsTreeServiceBuilder(
      {
        getJaql,
        getRawJaql,
        // pluginService: this.pluginService,
        applyIndexDivergence,
      },
      {
        emitHeaderCellFormatEvent,
      },
    );

    const columnsTreeServiceBuildResult = buildColumnsTreeService(data);
    this.columnsTreeService = columnsTreeServiceBuildResult.columnsTreeService;
    this.columnsCount = columnsTreeServiceBuildResult.columnsCount;
    this.totalColumnsCount = columnsTreeServiceBuildResult.totalColumnsCount;
    this.emit(EVENT_TOTAL_COLUMNS_COUNT, {
      columnsCount: this.columnsCount || 0,
      totalColumnsCount: this.totalColumnsCount || 0,
    });

    // build corner tree service
    const buildCornerTreeService = DataService.createCornerTreeServiceBuilder(
      {
        getJaql,
        getRawJaql,
        // pluginService: this.pluginService,
        columnsTreeService: this.columnsTreeService,
      },
      {
        emitHeaderCellFormatEvent,
      },
    );

    const { cornerTreeService } = buildCornerTreeService();
    this.cornerTreeService = cornerTreeService;
  };

  onDataHandler = (data: TreeNode | Array<TreeNode>) => {
    // store the data chunk into temporary storage
    // this step is NOT throttled because we want to make
    // ALL data chunks coming (regardless of the rate) is captured
    this.tempDataChunks = this.tempDataChunks || [];

    if (Array.isArray(data)) {
      (data || []).forEach((item) => {
        DataService.fillDataChunks(this.tempDataChunks, item, this.pageSize);
      });
    } else {
      DataService.fillDataChunks(this.tempDataChunks, data, this.pageSize);
    }

    // the data processing step CAN be throttled
    // However, method onDataHandlerThrottle needs logic
    // to maintain the LAST processed chunk
    if (this.tempDataChunks.length) {
      this.isDataHandlerThrottled = true;
      // @ts-ignore
      this.onDataHandlerThrottle();
    }
  };

  onGrandHandler = (data: TreeNode) => {
    const rows = this.preProcessTree([data], PanelType.ROWS);
    const mainNode = rows[0];
    const name = 'Rows grand total';
    const grandData = mainNode ? mainNode.data : [];
    const node = treeNode.create(name, undefined, grandData);
    const grandTotalNode = createPivotTreeNode(node, PanelType.ROWS);
    grandTotalNode.userType = UserType.GRAND_TOTAL;
    this.postProcessTree([grandTotalNode]);
    this.postProcessData([grandTotalNode]);
    this.rowsGrand = grandTotalNode;
    this.emit(EVENT_GRAND_CHUNK_LOADED, treeNode.wrapInRootNode(this.rowsGrand));
  };

  onFinishHandler = () => {
    this.emit(EVENT_FINISH_CHUNK_LOADED, {
      totalRows:
        typeof this.totalRowsCount === 'number' ? this.totalRowsCount : this.getTotalItemsCount(), // backward compatibility
      totalColumns:
        typeof this.totalColumnsCount === 'number'
          ? this.totalColumnsCount
          : this.getLoadedColumnsCount(), // backward compatibility
    });
  };

  onTotalRowsHandler = (data: any) => {
    const { rowsCount, queryRowsCount, limitReached } = data || {};
    this.totalRowsCount = rowsCount;
    this.totalRecordsCount = queryRowsCount;
    this.limitReached = limitReached;
    this.emit(EVENT_TOTAL_ROWS_COUNT, data);
  };

  onDataBarsHandler = (chunk: any) => {
    const { data = [] } = chunk;
    let offset = 0;
    if (this.cornerTreeService) {
      offset = this.cornerTreeService.getTreeChildLength();
    }
    this.dataBars = [...Array(offset), ...data];
    this.emit(EVENT_DATABAR_CHUNK_LOADED, this.dataBars);
  };

  onRangeMinMaxHandler = (chunk: any) => {
    const { data = [] } = chunk;
    const jaql = this.getJaql();
    const measuresTree = jaqlProcessor.getMetadataTree(jaql, PanelType.MEASURES);
    const measures = treeNode.getChildren(measuresTree) as Array<PivotTreeNode>;
    const rangeMinMax: Array<[string, string]> = [];
    measures.forEach((measure, index) => {
      // align indexes in case disabled measures
      rangeMinMax[measure.measureJaqlIndex || 0] = data[index];
    });
    this.rangeMinMax = rangeMinMax;
    this.emit(EVENT_RANGEMINMAX_CHUNK_LOADED, this.rangeMinMax);
  };

  onDataFinishHandler = ({ rowsCount }: { rowsCount?: number } = {}) => {
    this.finishRequest();
    this.rowsCount = rowsCount;

    if (this.tempDataChunks.length) {
      const chunkLast = this.tempDataChunks[this.tempDataChunks.length - 1];
      chunkLast.ready = true;
    }
    // @ts-ignore
    this.onDataHandlerThrottle();
    this.checkLoadPromise();
    this.emit(EVENT_DATA_FINISH_CHUNK_LOADED, {
      limitedRows: this.rowsCount,
      limitedColumns: this.columnsCount,
    });
  };

  onErrorHandler = (data: any) => {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      this.logger.console.warn(
        `${this.logger.getName()} data loading error "${JSON.stringify(data)}"`,
      );
    }
    if (
      !this.isLoadInProgress &&
      !this.isWholeDataLoaded &&
      !(data instanceof LoadingCanceledError)
    ) {
      // post load error
      this.emit(EVENT_PROGRESS_ERROR, data);
    }
  };

  /**
   * Check for enough data loaded and resolve promise of "loadData" function
   *
   * @returns {void}
   * @private
   */
  checkLoadPromise() {
    if (!this.isLoadInProgress) {
      return;
    }
    const loadedCount = this.getLoadedElementsCount();
    if (loadedCount >= this.getPageSize() || this.isWholeDataLoaded) {
      this.isLoadInProgress = false;
      if (typeof this.loadPromiseResolve === 'function') {
        this.loadPromiseResolve(loadedCount);
        this.clearLoadPromise();
      }
    }
  }

  /**
   * @returns {void}
   * @private
   */
  clearLoadAllPromise() {
    this.loadAllPromise = undefined;
    this.loadAllPromiseReject = undefined;
    this.loadAllPromiseResolve = undefined;
  }

  /**
   * @returns {void}
   * @private
   */
  clearLoadPromise() {
    this.loadPromiseReject = undefined;
    this.loadPromiseResolve = undefined;
  }

  /**
   * Mark finish request
   *
   * @returns {void}
   * @private
   */
  finishRequest() {
    this.logger.log('finishRequest');
    this.hasDataFinishEvent = true;

    // even if the finish request arrives but the data handling is still being throttled
    // we cannot resolve the loadAllPromiseResolve because there are still data chunks
    // in temp storage to be processed
    if (this.isDataHandlerThrottled) {
      return;
    }
    this.isWholeDataLoaded = true;
    if (this.loadAllPromiseResolve && typeof this.loadAllPromiseResolve === 'function') {
      this.loadAllPromiseResolve();
      this.clearLoadAllPromise();
    }
  }

  /**
   * Clear internal cache in case new JAQL request send
   *
   * @returns {void}
   * @private
   */
  clearCache() {
    this.rowsGrand = undefined;
    this.rowsTreeService = undefined;
    this.columnsTreeService = undefined;
    this.loadedPagesCount = 0;
    this.hasDataFinishEvent = false;
    this.isWholeDataLoaded = false;
    this.isLoadInProgress = false;
    this.tempDataChunks = [];
    this.lastNotHandledChunkIndex = 0;
    this.lastReadyNotHandledChunkIndex = 0;
    this.isDataHandlerThrottled = false;
  }

  static getEmptyPage(): InitPageData {
    return {
      isLastPage: true,
    };
  }

  static fillDataChunks(
    list: Array<NodesChunk>,
    node: TreeNode,
    firstMaxSize: number = NODES_CHUNK_SIZE_MAX,
    maxSize: number = NODES_CHUNK_SIZE_MAX,
  ): void {
    const isFirstChunk = list.length < 2;
    const maxChunkSize = isFirstChunk ? firstMaxSize : maxSize;
    let lastChunk: NodesChunk | undefined = list[Math.max(0, list.length - 1)];
    let lastChunkNode;
    let createNewChunk = !lastChunk;

    if (
      !node ||
      (typeof node.children === 'undefined' &&
        typeof node.value === 'undefined' &&
        node.data &&
        !node.data.length)
    ) {
      if (lastChunk) {
        lastChunk.ready = true;
      }
      return;
    }

    if (lastChunk) {
      const lastChunkNodeIndex = Math.max(0, lastChunk.list.length - 1);
      lastChunkNode = lastChunk.list[lastChunkNodeIndex];
      const lastChunkSizeStr = lastChunk.size ? `${lastChunk.size}` : '0';
      const lastChunkSize = parseInt(lastChunkSizeStr, 10);
      const afterLastChunkSize = lastChunkSize + (node.size || 1);
      if (
        lastChunk.handled ||
        (afterLastChunkSize > maxChunkSize &&
          !(lastChunkNode.isPart && lastChunkNode.value === node.value))
      ) {
        createNewChunk = true;
      }
    }

    if (
      node &&
      node.isPart &&
      lastChunkNode &&
      (!lastChunkNode.isPart || lastChunkNode.value !== node.value)
    ) {
      createNewChunk = true;
      if (lastChunkNode.value !== node.value) {
        lastChunkNode = undefined;
      }
    }

    if (createNewChunk) {
      if (lastChunk) {
        lastChunk.ready = true;
      }
      lastChunk = {
        list: [],
        size: 0,
        ready: false,
        handled: false,
      };
      list.push(lastChunk);
    }

    if (lastChunk) {
      if (lastChunkNode && lastChunkNode.isPart && node && node.isPart) {
        treeNode.deepMerge(lastChunkNode, node);
        lastChunk.size += node.size || 1;
      } else {
        lastChunk.list.push(node);
        lastChunk.size += node.size || 1;
      }
    }
  }

  static cloneTreeNode<T>(obj: T, skipChildren?: boolean): T {
    // return cloneObject(obj);
    const node = obj as TreeNode;
    const {
      children,
      isMapped, // eslint-disable-line no-unused-vars
      minLevel, // eslint-disable-line no-unused-vars
      childCount, // eslint-disable-line no-unused-vars
      childDeep, // eslint-disable-line no-unused-vars
      // @ts-ignore
      parent,
      // @ts-ignore
      master,
      // @ts-ignore
      data,
      // @ts-ignore
      state,
      // @ts-ignore
      style,
      // @ts-ignore
      store,
      ...restNode
    } = node;
    const clone = cloneObject(restNode);
    if (parent) {
      clone.parent = parent;
    }
    if (master) {
      clone.master = master;
    }
    if (data) {
      clone.data = cloneObject(data);
    }
    if (state) {
      clone.state = cloneObject(state);
    }
    if (style) {
      clone.style = cloneObject(style);
    }
    if (store) {
      clone.store = cloneObject(store);
    }
    if (!skipChildren && children) {
      clone.children = children.map((ch) => {
        const clonedChild = DataService.cloneTreeNode(ch);
        // @ts-ignore
        clonedChild.parent = clone;
        return clonedChild;
      });
    }
    return clone;
  }

  /**
   * @typedef {Function} buildColumnsTreeService
   * @param {HeaderTreeNode} originalColumnsTree
   * @returns {BuildColumnsTreeServiceResult}
   */

  /**
   * @typedef {object} BuildColumnsTreeServiceResult
   * @property {TreeNode|undefined} columnsTree
   * @property {TreeService|undefined} columnsTreeService
   * @property {number} columnsCount
   * @property {number} totalColumnsCount
   */

  /**
   * Creates builder function for building columns tree service
   *
   * @param {object} handlers - build handlers
   * @param {Function} handlers.getJaql - jaql getter
   * @param {Function} [handlers.getRawJaql] - raw jaql getter
   * @param {PluginService} [handlers.pluginService] - plugin service
   * @param {Function} [handlers.applyIndexDivergence] - helper for calculation indexes divergence
   * @param {object} [events] - build event emitters
   * @param {Function} events.emitHeaderCellFormatEvent - emits EVENT_HEADER_CELL_FORMAT event
   * @returns {buildColumnsTreeService} - build function
   */
  static createColumnsTreeServiceBuilder(
    handlers: {
      getJaql: () => JaqlRequest;
      getRawJaql?: () => JaqlRequest;
      // pluginService?: PluginService;
      applyIndexDivergence?: (items: Array<PivotTreeNode>) => void;
    },
    events?: {
      emitHeaderCellFormatEvent: (
        item: PivotTreeNode,
        panel: JaqlPanel | undefined,
        jaql: JaqlRequest,
      ) => void;
    },
  ): (originalColumnsTree: HeaderTreeNode) => {
    columnsTree: TreeNode | undefined;
    columnsTreeService: TreeService | undefined;
    columnsCount: number;
    totalColumnsCount: number;
  } {
    return (originalColumnsTree) => {
      const jaql = handlers.getJaql();
      const rawJaql = handlers.getRawJaql
        ? handlers.getRawJaql()
        : getJaqlComposition(jaql, jaql.metadata || []);

      const valuesTree = jaqlProcessor.getMetadataTree(jaql, PanelType.MEASURES);
      const valuesTreeChildren = treeNode.getChildren(valuesTree);
      const { preProcessTree, modifyTree, postProcessTree } = pivotTransforms;

      let columnsTree;
      let columnsTreeService;
      let columnsCount = 0;
      let totalColumnsCount = 0;
      if (treeNode.hasChildren(originalColumnsTree)) {
        if (originalColumnsTree.columnsCount && originalColumnsTree.totalColumnsCount) {
          columnsCount = originalColumnsTree.columnsCount;
          totalColumnsCount = originalColumnsTree.totalColumnsCount;
        }

        const columns = preProcessTree(originalColumnsTree, PanelType.COLUMNS, jaql);
        const modifiedColumns = modifyTree(columns, PanelType.COLUMNS, jaql, {
          originalData: originalColumnsTree,
          applyIndexDivergence: handlers.applyIndexDivergence,
        });
        postProcessTree(modifiedColumns, rawJaql, {
          emitFn: events && events.emitHeaderCellFormatEvent,
        });
        const wrappedModifiedColumns = treeNode.wrapInRootNode(modifiedColumns);
        // if (handlers.pluginService && wrappedModifiedColumns && wrappedModifiedColumns.children) {
        //   handlers.pluginService.applyToColumns(wrappedModifiedColumns.children);
        // }

        columnsTree = wrappedModifiedColumns;
        columnsTreeService = new TreeService(wrappedModifiedColumns);
        if (valuesTreeChildren.length === 1) {
          columnsTreeService.setValueNode(valuesTreeChildren[0]);
        }
      } else if (treeNode.hasChildren(valuesTree)) {
        if (originalColumnsTree.columnsCount && originalColumnsTree.totalColumnsCount) {
          columnsCount = originalColumnsTree.columnsCount;
          totalColumnsCount = originalColumnsTree.totalColumnsCount;
        }
        // columns limit
        if (typeof originalColumnsTree.maxChilds === 'number') {
          columnsCount = originalColumnsTree.maxChilds;
          valuesTree.children = treeNode
            .getChildren(valuesTree)
            .filter((item, index) => index < (originalColumnsTree.maxChilds as number));
        }
        // if (handlers.pluginService && valuesTree.children) {
        //   handlers.pluginService.applyToColumns(valuesTree.children);
        // }
        postProcessTree(treeNode.getChildren(valuesTree), rawJaql, {
          emitFn: events && events.emitHeaderCellFormatEvent,
        });
        columnsTree = valuesTree;
        columnsTreeService = new TreeService(valuesTree);
      } else {
        // if (handlers.pluginService) {
        //   handlers.pluginService.resetRowStartFrom();
        // }
        columnsTree = undefined;
        columnsTreeService = undefined;
        columnsCount = 0;
        totalColumnsCount = 0;
      }

      return {
        columnsTree,
        columnsTreeService,
        columnsCount,
        totalColumnsCount,
      };
    };
  }

  /**
   * @typedef {Function} buildCornerTreeService
   * @param {HeaderTreeNode} originalColumnsTree
   * @returns {BuildCornerTreeServiceResult}
   */

  /**
   * @typedef {object} BuildCornerTreeServiceResult
   * @property {TreeNode|undefined} columnsTree
   * @property {TreeService|undefined} columnsTreeService
   * @property {number} columnsCount
   * @property {number} totalColumnsCount
   */

  /**
   * Creates builder function for building corners tree service
   *
   * @param {object} handlers - build handlers
   * @param {Function} handlers.getJaql - jaql getter
   * @param {Function} [handlers.getRawJaql] - raw jaql getter
   * @param {PluginService} [handlers.pluginService] - plugin service
   * @param {TreeServiceI} [handlers.columnsTreeService] - column tree service
   * @param {object} [events] - build event emitters
   * @param {Function} events.emitHeaderCellFormatEvent - emits EVENT_HEADER_CELL_FORMAT event
   * @returns {buildCornerTreeService} - build function
   */
  static createCornerTreeServiceBuilder(
    handlers: {
      getJaql: () => JaqlRequest;
      getRawJaql?: () => JaqlRequest;
      // pluginService?: PluginService;
      columnsTreeService?: TreeServiceI;
    },
    events?: {
      emitHeaderCellFormatEvent: (
        item: PivotTreeNode,
        panel: JaqlPanel | undefined,
        jaql: JaqlRequest,
      ) => void;
    },
  ): () => {
    cornerTree: TreeNode | undefined;
    cornerTreeService: TreeService | undefined;
  } {
    return () => {
      const jaql = handlers.getJaql();
      const rawJaql = handlers.getRawJaql
        ? handlers.getRawJaql()
        : getJaqlComposition(jaql, jaql.metadata || []);

      const cornerTree = jaqlProcessor.getMetadataTree(jaql, PanelType.ROWS);
      let cornerTreeService;
      if (treeNode.hasChildren(cornerTree)) {
        // add user type to tree node
        treeNode.iterateThroughTree(treeNode.getChildren(cornerTree), (item) => {
          item.userType = UserType.CORNER;
          const panel = jaqlProcessor.getMetadataPanelByIndex(
            rawJaql,
            item.jaqlIndex,
            item.metadataType || '',
          );
          if (events && events.emitHeaderCellFormatEvent) {
            events.emitHeaderCellFormatEvent(item, panel, rawJaql);
          }
        });

        let cornerDeep;
        if (handlers.columnsTreeService) {
          cornerDeep = handlers.columnsTreeService.getTreeDeepsLength();
        }
        // if (handlers.pluginService) {
        //   handlers.pluginService.applyToHeaders(cornerTree);
        // }
        cornerTreeService = new TreeService(cornerTree, false, cornerDeep);
      }
      return { cornerTree, cornerTreeService };
    };
  }
}

export default DataService;
