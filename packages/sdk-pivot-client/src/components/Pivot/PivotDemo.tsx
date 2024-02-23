import * as React from 'react';
// import { JsonEditor } from '../Demo';
import { Pivot } from './Pivot.js';
import { DimensionsProps } from '../PivotTable/PivotTable.js';
import {
  DataService,
  EVENT_DATA_CHUNK_LOADED,
  EVENT_HEADER_CELL_FORMAT,
  EVENT_DATA_CELL_FORMAT,
  EVENT_GRAND_CHUNK_LOADED,
  EVENT_TOTAL_ROWS_COUNT,
  EVENT_DATABAR_CHUNK_LOADED,
} from '../../data-handling/DataService.js';
import { cloneObject, throttle, getChangedProps } from '../../utils/index.js';
import { jaqlProcessor } from '../../data-handling/utils/index.js';
// import { EmbededImage, getImage } from '../Demo/EmbededImage.js';
import { defaultQuery, defaultCustomData } from '../Demo/examples.js';
import { UserType } from '../../data-handling/constants.js';
import { TreeServiceI } from '../../tree-structure/types.js';
import { DataLoadServiceI, JaqlRequest, SocketI, SortDetails } from '../../data-load/types.js';
import { Defer } from '../../utils/types.js';
import {
  DataServiceI,
  PivotTreeNode,
  PivotDataNode,
  AllDataInfo,
} from '../../data-handling/types.js';
import { SisenseDataLoadService, SisenseSocket } from '../../data-load/index.js';
import './styles.scss';
import '../../styles.js';

let socket: SocketI;
const loadServiceCreator = () => {
  if (!socket) {
    socket = new SisenseSocket('https://test.sisense.com/pivot2', {
      token:
        'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyIjoiNjM3NDJkMDQ1Zjc0ZjQwMDFhOWRhYjg4IiwiYXBpU2VjcmV0IjoiMGUxNTVlZjktYTkxNC05MTM5LTkzZmItZDhkZWUyNDU4YjYxIiwic3NvVG9rZW4iOm51bGwsImFsbG93ZWRUZW5hbnRzIjpbIjYzNzQyZDA0NWY3NGY0MDAxYTlkYWI5NSJdLCJ0ZW5hbnRJZCI6IjYzNzQyZDA0NWY3NGY0MDAxYTlkYWI5NSJ9.RA6w62XKWq6OoW7olZqP8dXVN2Jvv0i_Jyw0-IjXBPw',
    });
  }
  return new SisenseDataLoadService(socket);
};

type Props = {
  // loadServiceCreator: (state: any) => DataLoadServiceI;
  width: number;
  height: number;
  isPaginated: boolean;
  isPrinted: boolean;
  elementsPerPage: number;
  isAutoHeight: boolean;
  isEmbedImage: boolean;
  customClasses: string;
  borderWidth?: number;
  isTestData?: boolean;
};

type State = {
  itemsCount: number;
  activePage: number;
  isAllDataLoaded: boolean;
  query: Record<string, any>;
  predefinedColumnWidthString: string;
  sortedPanels: Record<any, any>;
  totalItemsCount: number;
  dataBars?: Array<[string, string]>;
};

export class PivotDemo extends React.PureComponent<Props, State> {
  pivot?: Pivot;

  loadedItemsCount?: number;

  totalItemsCount?: number;

  loadService?: DataLoadServiceI;

  dataService?: DataServiceI;

  currentRowsTreeService?: TreeServiceI;

  isLoadPageInProgress = false;

  isLoadingInProgress = false;

  onDataChunkReceivedThrottle: Function;

  predefinedDimensionsForPrint: DimensionsProps = { width: [], height: [] };

  jaql?: JaqlRequest;

  static defaultProps = {
    isPaginated: false,
    elementsPerPage: 20,
    isAutoHeight: false,
    isEmbedImage: false,
    borderWidth: 1,
    isTestData: false,
  };

  constructor(props: Props) {
    super(props);

    const query = this.getQuery();

    this.state = {
      query,
      itemsCount: 0,
      activePage: -1,
      isAllDataLoaded: false,
      predefinedColumnWidthString: '[]',
      sortedPanels: {},
      totalItemsCount: 0,
    };

    this.onDataChunkReceivedThrottle = throttle((loadedCount: number) => {
      const { activePage } = this.state;
      this.setState({
        itemsCount: loadedCount,
        activePage: activePage > -1 ? activePage : 0,
      });
    }, 500);
  }

  UNSAFE_componentWillReceiveProps(nextProps: Props): void {
    const changedProps = getChangedProps(this.props, nextProps);
    if (
      typeof changedProps.isPaginated !== 'undefined' ||
      typeof changedProps.elementsPerPage !== 'undefined'
    ) {
      this.loadedItemsCount = undefined;
      this.totalItemsCount = undefined;
      this.loadInitData(nextProps, true);
    }
    if (typeof changedProps.width !== 'undefined' && nextProps.isPrinted) {
      this.predefinedDimensionsForPrint = {
        width: [],
        height: [],
      };
      this.onGridUpdated();
    }
  }

  componentWillUnmount(): void {
    this.pivot = undefined;
    if (this.currentRowsTreeService) {
      this.currentRowsTreeService.destroy();
      this.currentRowsTreeService = undefined;
    }
    if (this.dataService) {
      this.dataService.destroy();
      this.dataService = undefined;
    }
    if (this.loadService) {
      this.loadService.destroy();
      this.loadService = undefined;
    }
  }

  // eslint-disable-next-line class-methods-use-this
  onCellClick(e: any) {
    // eslint-disable-next-line no-console
    console.log(e);
  }

  // eslint-disable-next-line class-methods-use-this
  onCellEnter(e: any) {
    // eslint-disable-next-line no-console
    console.log('onCellEnter', e);
  }

  // eslint-disable-next-line class-methods-use-this
  onCellLeave(e: any) {
    // eslint-disable-next-line no-console
    console.log('onCellLeave', e);
  }

  loadInitData(
    props: Props = this.props,
    isPagingUpdate = false,
    customJaql?: JaqlRequest,
  ): Promise<void> {
    const { isPaginated, elementsPerPage } = props;
    const pageSize = isPaginated ? elementsPerPage : undefined;

    return this.prepareRequest(props, customJaql)
      .then((query) => {
        this.jaql = query;

        // @ts-ignore
        this.onDataChunkReceivedThrottle.cancel();
        this.isLoadPageInProgress = false;
        this.isLoadingInProgress = true;

        this.setState({
          itemsCount: 0,
          activePage: -1,
          isAllDataLoaded: false,
        });
      })
      .then(() => this.prepareLoadService(this.jaql, isPagingUpdate))
      .then((loadService) => this.prepareDataService(loadService, isPagingUpdate))
      .then(({ dataService, loadService, loadData }) => {
        this.dataService = dataService;
        this.loadService = loadService;
        return loadData(isPagingUpdate ? undefined : this.jaql, pageSize, isPaginated);
      })
      .then(
        ({ rowsTreeService, columnsTreeService, cornerTreeService, isLastPage, cellsMetadata }) => {
          if (this.loadedItemsCount !== undefined && this.totalItemsCount !== undefined) {
            this.setState({
              itemsCount: this.loadedItemsCount,
              totalItemsCount: this.totalItemsCount,
              activePage: 0,
              isAllDataLoaded: true,
            } as State);
          }
          if (this.pivot) {
            this.pivot.initialize(rowsTreeService, columnsTreeService, cornerTreeService, {
              isLastPage,
              cellsMetadata,
            });
            this.currentRowsTreeService = rowsTreeService;
          }
          this.isLoadingInProgress = false;
        },
      )
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error('Error during loading initial page"', err);
      });
  }

  loadPageData(page: number) {
    if (!this.dataService || this.isLoadPageInProgress || !this.props.isPaginated) {
      return;
    }
    this.isLoadPageInProgress = true;
    this.dataService
      .getSelectedPageData(page, this.props.elementsPerPage)
      .then(({ rowsTreeService, columnsTreeService, cornerTreeService, isLastPage }) => {
        this.isLoadPageInProgress = false;
        if (this.pivot) {
          this.pivot.initialize(rowsTreeService, columnsTreeService, cornerTreeService, {
            isLastPage,
          });
          this.currentRowsTreeService = rowsTreeService;
        }
        this.setState({
          activePage: page,
        });
      })
      .catch((err) => {
        // eslint-disable-next-line no-console
        console.error(`Error during loading page "${page}"`, err);
      });
  }

  prepareRequest(props: Props, customJaql?: JaqlRequest): Promise<any> {
    const { query } = this.state;

    if (customJaql) {
      return Promise.resolve(customJaql);
    }

    if (this.props.isTestData) {
      const data = (query || {}).request || null;
      return Promise.resolve(data);
    }

    return Promise.resolve(query);
  }

  prepareLoadService(jaql?: JaqlRequest, useCache = false): Promise<DataLoadServiceI> {
    return Promise.resolve(this.loadService).then((loadService) => {
      if (loadService && (useCache || loadService.isFormattingChanges(jaql))) {
        return loadService;
      }
      // return this.props.loadServiceCreator(this.state);
      return loadServiceCreator();
    });
  }

  prepareDataService(loadService: DataLoadServiceI, useCache = false) {
    let dataService: DataServiceI | undefined;
    if (useCache) {
      // eslint-disable-next-line prefer-destructuring
      dataService = this.dataService;
    } else {
      const oldDataServcie = this.dataService;
      if (oldDataServcie) {
        oldDataServcie.off(EVENT_DATA_CHUNK_LOADED, this.onDataChunkReceived);
        oldDataServcie.off(EVENT_GRAND_CHUNK_LOADED, this.onGrandChunkReceived);
        oldDataServcie.off(EVENT_HEADER_CELL_FORMAT, this.onHeaderCellFormat);
        oldDataServcie.off(EVENT_DATA_CELL_FORMAT, this.onDataCellFormat);
        oldDataServcie.off(EVENT_TOTAL_ROWS_COUNT, this.onTotalRowsChunkReceived);
        oldDataServcie.off(EVENT_DATABAR_CHUNK_LOADED, this.onDataBarsChunkReceived);
        oldDataServcie.destroy();
      }

      dataService = new DataService(loadService);
      dataService.on(EVENT_DATA_CHUNK_LOADED, this.onDataChunkReceived);
      dataService.on(EVENT_GRAND_CHUNK_LOADED, this.onGrandChunkReceived);
      dataService.on(EVENT_HEADER_CELL_FORMAT, this.onHeaderCellFormat);
      dataService.on(EVENT_DATA_CELL_FORMAT, this.onDataCellFormat);
      dataService.on(EVENT_TOTAL_ROWS_COUNT, this.onTotalRowsChunkReceived);
      dataService.on(EVENT_DATABAR_CHUNK_LOADED, this.onDataBarsChunkReceived);
    }

    return {
      dataService,
      loadService,
      loadData: (jaql?: JaqlRequest, pageSize?: number, isPaginated?: boolean) => {
        if (!dataService) {
          throw new Error('No DataService defined during "prepareDataService"');
        }
        const loadPromise = dataService.loadData(jaql, { pageSize, isPaginated });

        dataService.loadAllData().then((options: AllDataInfo) => {
          this.totalItemsCount = options.totalItemsCount;
          this.loadedItemsCount = options.loadedRowsCount;
          this.setState({
            itemsCount: options.loadedRowsCount,
            totalItemsCount: options.totalItemsCount,
            isAllDataLoaded: true,
          });
        });

        return loadPromise;
      },
    };
  }

  getQuery(): JaqlRequest {
    const { localStorage } = window;
    if (this.props.isTestData) {
      return localStorage.pivotCustomDataString
        ? JSON.parse(localStorage.pivotCustomDataString)
        : JSON.parse(JSON.stringify(defaultCustomData));
    }
    return localStorage.pivotQueryString
      ? JSON.parse(localStorage.pivotQueryString)
      : JSON.parse(JSON.stringify(defaultQuery));
  }

  saveQuery(query: JaqlRequest): void {
    if (this.props.isTestData) {
      window.localStorage.pivotCustomDataString = JSON.stringify(query);
    } else {
      window.localStorage.pivotQueryString = JSON.stringify(query);
    }
  }

  clearQuery(): void {
    if (this.props.isTestData) {
      window.localStorage.pivotCustomDataString = '';
    } else {
      window.localStorage.pivotQueryString = '';
    }
  }

  onQueryChange = (query: JaqlRequest): void => {
    this.saveQuery(query);
    this.setState({ query });
  };

  onGetInitialData = (): void => {
    this.loadInitData();
  };

  onPageChange = (args: { selected: number }): void => {
    this.loadPageData(args.selected);
  };

  onLoad = (): void => {
    this.loadedItemsCount = undefined;
    this.totalItemsCount = undefined;
    this.loadInitData();
  };

  onClear = (): void => {
    // @ts-ignore
    this.onDataChunkReceivedThrottle.cancel();
    this.loadedItemsCount = undefined;
    this.totalItemsCount = undefined;
    this.setState({
      itemsCount: 0,
      activePage: -1,
    });
    if (this.dataService) {
      this.dataService.destroy();
    }
    this.dataService = undefined;
    if (this.loadService) {
      this.loadService.destroy();
    }
    this.loadService = undefined;
    if (this.pivot) {
      this.pivot.initialize();
      this.currentRowsTreeService = undefined;
    }
  };

  onClearStorage = (): void => {
    this.clearQuery();
  };

  /**
   * Callback for update column width
   *
   * @param {Array<PivotTreeNode>} horizontalLastLevelsNodes - array with jaql indexes
   * @param {Array<number>} [resizedColumnWidth] - jaql index and width
   * @returns {Array<Array<number>>} - final list of widths
   */
  onUpdatePredefinedColumnWidth = (
    horizontalLastLevelsNodes: Array<PivotTreeNode>,
    resizedColumnWidth?: Array<number>,
  ): Array<Array<number>> => {
    if (resizedColumnWidth) {
      const [columnIndex, columnWidth] = resizedColumnWidth;
      const node = horizontalLastLevelsNodes[columnIndex];
      if (node && typeof node.jaqlIndex !== 'undefined') {
        jaqlProcessor.setResizeWidthToJaql(this.jaql, node.jaqlIndex, columnWidth);
      }
    }

    if (this.predefinedDimensionsForPrint.width.length && this.props.isPrinted) {
      const totalWidth = this.predefinedDimensionsForPrint.width.reduce(
        (prev, next) => prev + next[1],
        0,
      );
      const widthInversion = Math.floor(100 * (this.props.width / totalWidth)) / 100;

      const printColumnWidth = this.predefinedDimensionsForPrint.width.map((element) => {
        const [index, width] = element;
        return widthInversion > 1 ? element : [index, width * widthInversion];
      });

      this.setState({
        predefinedColumnWidthString: JSON.stringify(printColumnWidth),
      });
      return printColumnWidth;
    }
    const jaqlWidths = jaqlProcessor.getResizeWidthFromJaql(this.jaql);

    const predefinedColumnWidth: Array<any> = [];
    horizontalLastLevelsNodes.forEach((columnNode, columnIndex) => {
      if (
        typeof columnNode.jaqlIndex !== 'undefined' &&
        typeof jaqlWidths[columnNode.jaqlIndex] !== 'undefined'
      ) {
        predefinedColumnWidth.push([columnIndex, jaqlWidths[columnNode.jaqlIndex]]);
      }
    });

    this.setState({
      predefinedColumnWidthString: JSON.stringify(predefinedColumnWidth),
    });

    return predefinedColumnWidth;
  };

  onSortingMetadataUpdate = (details: SortDetails): void => {
    const { sortedPanels } = this.state;
    const { field } = details;
    const isSingleRowTree = this.dataService ? this.dataService.isSingleRowTree() : false;
    this.isLoadPageInProgress = false;

    const newSortedPanels = {
      ...sortedPanels,
      [field || '']: details,
    };
    this.setState({
      sortedPanels: newSortedPanels,
    });

    const newJaql = cloneObject(this.jaql);
    jaqlProcessor.updatePanelsSortingMetadata(details, newJaql, { isSingleRowTree });
    this.loadInitData(this.props, false, newJaql);
  };

  onSortingDeleteClick = (event: any): void => {
    const { sortedPanels } = this.state;
    const { tabIndex } = event.target;
    const details = this.state.sortedPanels[tabIndex];
    const isSingleRowTree = this.dataService ? this.dataService.isSingleRowTree() : false;

    const newSortedPanels = {
      ...sortedPanels,
    };
    delete sortedPanels[tabIndex];

    this.setState({
      sortedPanels: newSortedPanels,
    });

    delete details.dir;
    const newJaql = cloneObject(this.jaql);
    jaqlProcessor.updatePanelsSortingMetadata(details, newJaql, { isSingleRowTree });
    this.loadInitData(this.props, false, newJaql);
  };

  onDataChunkReceived = (loadedCount: number): void => {
    this.onDataChunkReceivedThrottle(loadedCount);
  };

  onGrandChunkReceived = (grandRow: PivotTreeNode): void => {
    const { isPaginated } = this.props;
    if (isPaginated && this.currentRowsTreeService && !this.isLoadingInProgress) {
      this.currentRowsTreeService.extend(grandRow);
      if (this.pivot) {
        this.pivot.addMore(this.currentRowsTreeService, true);
      }
    }
  };

  onTotalRowsChunkReceived = (data: any): void => {
    const { rowsCount } = data;
    this.setState({
      totalItemsCount: rowsCount,
    });
  };

  onDataBarsChunkReceived = (data: Array<[string, string]>): void => {
    this.setState({ dataBars: data });
  };

  onGridUpdated = (): void => {
    if (
      this.predefinedDimensionsForPrint &&
      this.predefinedDimensionsForPrint.width.length &&
      this.predefinedDimensionsForPrint.height.length
    ) {
      return;
    }
    if (this.props.isPrinted && this.pivot) {
      this.predefinedDimensionsForPrint = this.pivot.getDimensions();
      if (!this.dataService) {
        return;
      }
      this.dataService.loadAllData().then(({ loadedRowsCount }: AllDataInfo) => {
        if (this.dataService) {
          this.dataService
            .getSelectedPageData(0, loadedRowsCount - 1)
            .then(({ rowsTreeService, columnsTreeService, cornerTreeService }) => {
              if (this.pivot) {
                this.pivot.initialize(rowsTreeService, columnsTreeService, cornerTreeService, {
                  isLastPage: true,
                });
              }
            });
        }

        this.setState({
          activePage: -1,
        });
      });
    }
  };

  onDomReady = () => {
    // eslint-disable-next-line no-console
    console.log('domready');
  };

  onHeaderCellFormat = (item: PivotTreeNode) => {
    if (item.userType === UserType.SUB_TOTAL) {
      item.content = `${item.value || 'N/A'} Sub total`;
    }

    if (item.userType === UserType.GRAND_TOTAL) {
      item.content = `${item.value || 'N/A'} Grand total`;
    }
  };

  onDataCellFormat = (
    item: PivotDataNode,
    rowItem: PivotTreeNode,
    columnItem: PivotTreeNode,
  ): void => {
    if (rowItem && columnItem) {
      item.content = item.value === null ? '' : `${item.value}`;
    }
    if (!item.content && this.props.isEmbedImage) {
      const defer: Defer = {
        promise: Promise.resolve(),
        resolve() {
          return true;
        },
        reject() {
          return false;
        },
      };
      const promise = new Promise((resolve, reject) => {
        defer.resolve = resolve;
        defer.reject = reject;
      });
      item.style = item.style || {};
      item.style.textAlign = 'center';
      // item.content = EmbededImage;
      item.contentType = 'component';
      const store = item.store || {};
      // store.domReadyDefer = {
      //   promise,
      //   ...defer,
      // };
      // store.imageUrl = getImage(item.value);
      store.defaultWidth = 100;
      store.defaultHeight = 100;
      item.store = store;
    }
  };

  pivotRef = (ref: Pivot | null): void => {
    if (ref) {
      this.pivot = ref;
    }
  };

  render() {
    const {
      width,
      height,
      borderWidth,
      elementsPerPage,
      isAutoHeight,
      isPaginated,
      isPrinted,
      customClasses,
    } = this.props;
    const {
      query,
      itemsCount,
      activePage,
      predefinedColumnWidthString,
      isAllDataLoaded,
      sortedPanels,
      totalItemsCount,
      dataBars,
    } = this.state;

    const sortedPanelsKeys = Object.keys(sortedPanels);

    return (
      <div>
        {/*<div>*/}
        {/*    Query:*/}
        {/*    <br />*/}
        {/*    <JsonEditor json={query} onChange={this.onQueryChange} />*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*    <button type="button" onClick={this.onLoad}>Load</button>*/}
        {/*    <button type="button" onClick={this.onClear}>Clear</button>*/}
        {/*    <button type="button" onClick={this.onClearStorage}>Clear query storage</button>*/}
        {/*</div>*/}
        {/*<div className="demo-textarea">*/}
        {/*    <div>Columns width</div>*/}
        {/*    <textarea*/}
        {/*        style={{ width, height: 30 }}*/}
        {/*        value={predefinedColumnWidthString}*/}
        {/*        readOnly*/}
        {/*    />*/}
        {/*</div>*/}
        {/*<div>*/}
        {/*    Sorting:*/}
        {/*    <br />*/}
        {/*    {*/}
        {/*        sortedPanelsKeys.map((pIndex) => {*/}
        {/*            const panel = jaqlProcessor.getMetadataPanelByIndex(this.jaql, +pIndex);*/}
        {/*            if (!panel) {*/}
        {/*                return null;*/}
        {/*            }*/}
        {/*            return (*/}
        {/*                <span key={pIndex}>*/}
        {/*                    {panel.jaql.title}*/}
        {/*                    -&nbsp;*/}
        {/*                    <button*/}
        {/*                        type="button"*/}
        {/*                        onClick={this.onSortingDeleteClick}*/}
        {/*                        tabIndex={parseInt(pIndex, 10)}*/}
        {/*                    >*/}
        {/*                        Remove*/}
        {/*                    </button>*/}
        {/*                    ;&nbsp;&nbsp;*/}
        {/*                </span>*/}
        {/*            );*/}
        {/*        })*/}
        {/*    }*/}
        {/*</div>*/}
        <Pivot
          onSortingMetadataUpdate={this.onSortingMetadataUpdate}
          ref={this.pivotRef}
          className={customClasses}
          width={width}
          height={isPrinted && !this.predefinedDimensionsForPrint.width.length ? 200 : height}
          borderWidth={borderWidth}
          isAutoHeight={
            isPrinted && this.predefinedDimensionsForPrint.width.length ? true : isAutoHeight
          }
          isPaginated={isPaginated}
          itemsCount={itemsCount}
          totalItemsCount={totalItemsCount}
          itemsPerPage={elementsPerPage}
          activePage={activePage}
          isAllDataLoaded={isAllDataLoaded}
          onGetInitialData={this.onGetInitialData}
          onPageChange={this.onPageChange}
          onUpdatePredefinedColumnWidth={this.onUpdatePredefinedColumnWidth}
          onGridUpdated={this.onGridUpdated}
          onDomReady={this.onDomReady}
          /* eslint-disable-next-line @typescript-eslint/unbound-method */
          onCellClick={this.onCellClick}
          /* eslint-disable-next-line @typescript-eslint/unbound-method */
          onCellEnter={this.onCellEnter}
          /* eslint-disable-next-line @typescript-eslint/unbound-method */
          onCellLeave={this.onCellLeave}
          dataBars={dataBars}
          // TODO: replace stub value with something meaningful
          onSortingSettingsChanged={() => {}}
        />
      </div>
    );
  }
}

export default PivotDemo;
