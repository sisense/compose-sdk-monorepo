import * as React from 'react';
import ReactDOM from 'react-dom';

import { CONSTANTS } from '../components/PageForPrint/constants.js';
import { Layout } from '../components/PageForPrint/index.js';
import { DimensionFormat } from '../components/PageForPrint/types.js';
import { Pivot } from '../components/Pivot/index.js';
import { AllDataInfo, DataServiceI, PivotTreeNode } from '../data-handling/types.js';
import { PageConfigurationService } from '../printing/index.js';
import { Defer } from '../utils/types.js';
import { Props as PivotBuilderProps } from './pivot-builder.js';

type SettingsI = {
  title?: boolean;
  pageNumbers?: boolean;
  header?: string;
  format?: string;
  orientation?: string;
};

type Props = {
  isFooterDisplayed?: boolean;
  isHeaderDisplayed?: boolean;
  titleName?: string;
  position: string;
  orientation?: string;
  format?: string;
  size: string;
  className?: string;
  onUpdatePredefinedColumnWidth?: Function;
  borderWidth?: number;
  borderColor?: string;
  rowHeight?: number;
  imageColumns?: Array<number>;
  fallbackImageUrl?: string;
  allowHtml?: boolean;
  dataBars?: Array<[string, string]>;
  rangeMinMax?: Array<[string, string]>;
};

type Options = {
  getRootElementFn?: () => Element | null;
  isPreview?: boolean;
  rowHeight?: number;
  imageColumns?: Array<number>;
  fallbackImageUrl?: string;
  allowHtml?: boolean;
};

const classes = `sisense-pivot--merged-last-level-rows
sisense-pivot--alternating-rows_ sisense-pivot--alternating-columns_
sisense-pivot--columns-headers_ sisense-pivot--row-members_
`.trim();

export class PivotPrintBuilder {
  preRender?: Pivot;

  pages: Array<Pivot> = [];

  isAllDataLoaded = false;

  pageService: PageConfigurationService = new PageConfigurationService();

  isPreRender = true;

  noResults = false;

  fixedRowsLength = 0;

  pagesIndexes: Array<{ start: number; stop: number }> = [];

  onHeaderChanged?: (options: { title: string; titlePosition: string; titleSize: string }) => void;

  isPreview = false;

  rootElement?: Element;

  getRootElementFn: () => Element | null = () => document.getElementById('root');

  widgetRoot: HTMLDivElement = document.createElement('div');

  dataService?: DataServiceI;

  layoutRoot: HTMLDivElement = document.createElement('div');

  pagesInProgress: Array<number> = [];

  printReadyCallback?: Function;

  printDomReadyCallback?: Function;

  cellDomReadyPromises?: Array<Promise<any>>;

  props: Props = {
    isFooterDisplayed: false,
    isHeaderDisplayed: false,
    titleName: '',
    format: 'A4',
    orientation: 'portrait',
    position: 'flex-start',
    size: 'small',
    className: classes,
    borderWidth: 1,
  };

  /**
   * Constructor
   *
   * @param {DataServiceI} [dataService] - data service instance
   * @param {Options} [options] - additional options
   * @returns {PivotPrintBuilder} - instance
   */
  constructor(dataService?: DataServiceI, options?: Options) {
    let isPreview = false;
    if (options && typeof options === 'object') {
      const { rowHeight, imageColumns, fallbackImageUrl, allowHtml } = options;
      this.props = {
        ...this.props,
        rowHeight,
        imageColumns,
        fallbackImageUrl,
        allowHtml,
      };
      if (options.getRootElementFn) {
        this.getRootElementFn = options.getRootElementFn;
      }
      if (typeof options.isPreview === 'boolean') {
        isPreview = options.isPreview;
      }
    }

    this.isPreview = isPreview;
    this.noResults = false;

    if (dataService) {
      this.dataService = dataService;
    }
  }

  /**
   *
   * @param {Function} cb - set external function to be called after Layout for print ready
   * @returns {void}
   */
  setReadyCallback = (cb: Function) => {
    this.printReadyCallback = cb;
  };

  setDomReadyCallback = (cb: Function) => {
    this.printDomReadyCallback = cb;
  };

  /**
   *
   * @param {PivotBuilderProps} props - provide state from widget to render correct layout
   * @returns {void}
   */
  provideStateFromWidget(props: PivotBuilderProps) {
    const { onUpdatePredefinedColumnWidth, className, borderWidth, borderColor } = props;
    this.updateProps({
      onUpdatePredefinedColumnWidth,
      className,
      borderWidth,
      borderColor,
    });
  }

  /**
   *
   * @param {Function} onHeaderChanged - callback for header internal changes
   * @returns {void}
   */
  setCallback(
    onHeaderChanged: (options: { title: string; titlePosition: string; titleSize: string }) => void,
  ) {
    this.onHeaderChanged = onHeaderChanged;
  }

  /**
   * clear state of layout
   *
   * @returns {void}
   */
  dispose() {
    if (this.layoutRoot) {
      ReactDOM.unmountComponentAtNode(this.layoutRoot);
    }
    const roots = [this.layoutRoot, this.widgetRoot];
    for (let i = 0; i < roots.length; i += 1) {
      if (this.rootElement) {
        this.rootElement.removeChild(roots[i]);
      }
    }
    this.rootElement = undefined;
    this.layoutRoot = document.createElement('div');
    this.widgetRoot = document.createElement('div');
    this.clearData();
  }

  /**
   * Update data service to build layout
   *
   * @param {DataServiceI} dataService - ready service to work with data
   * @returns {void}
   */
  updateService(dataService: DataServiceI) {
    this.dataService = dataService;
    if (this.dataService) {
      this.isAllDataLoaded = false;
      this.dataService
        .loadAllData()
        .catch(() => ({ loadedRowsCount: 0, totalItemsCount: 0 }))
        .then(({ loadedRowsCount, dataBars, rangeMinMax }: AllDataInfo) => {
          this.props.dataBars = dataBars;
          this.props.rangeMinMax = rangeMinMax;
          if (loadedRowsCount && this.dataService) {
            this.dataService.getSelectedPageData(0, 0).then(({ columnsTreeService }) => {
              if (columnsTreeService) {
                this.fixedRowsLength = columnsTreeService.getTreeDeepsLength();
              }
              this.isAllDataLoaded = true;
              this.render();
            });
          }
          if (loadedRowsCount === 0) {
            this.isAllDataLoaded = true;
            this.pagesIndexes = [{ start: 0, stop: 0 }];
            this.isPreRender = false;
            this.noResults = true;
            this.render();
          }
        });
    } else {
      this.isAllDataLoaded = true;
      this.pagesIndexes = [{ start: 0, stop: 0 }];
      this.isPreRender = false;
      this.render();
    }
  }

  /**
   * initialize Layout
   *
   * @param {Element} root - root of Layout
   * @returns {void}
   */
  initialize(root: Element) {
    this.rootElement = root || this.getRootElementFn();
    this.layoutRoot = document.createElement('div');
    const roots = [this.layoutRoot, this.widgetRoot];
    for (let i = 0; i < roots.length; i += 1) {
      if (this.rootElement) {
        this.rootElement.appendChild(roots[i]);
      }
    }
  }

  /**
   * callback for pre-render calculations finish
   *
   * @returns {void}
   * @private
   */
  onPreRenderComplete() {
    this.pagesIndexes = this.pageService.calculatePages(this.fixedRowsLength);
    this.pagesInProgress = Array.from(
      {
        length: this.getPagesCount(),
      },
      (el, i) => i,
    );
    this.isPreRender = false;
    this.render();
  }

  /**
   * @returns {number} - count of pages to render
   * @private
   */
  getPagesCount() {
    return this.isPreview && this.pagesIndexes.length > 2 ? 2 : this.pagesIndexes.length;
  }

  /**
   * Load appropriate page in case of paging
   *
   * @param {number} page - page to load
   * @returns {void}
   * @private
   */
  loadPageData(page: number) {
    const { dataService } = this;

    if (!dataService) {
      // eslint-disable-next-line no-console
      console.warn('DataService instance not defined');
      return;
    }
    const { start = 0, stop = 0 } = this.pagesIndexes[page];
    const lastPage = page === this.pagesIndexes.length - 1;
    dataService
      .getIndexedPageData(start, stop, lastPage)
      .then(({ rowsTreeService, columnsTreeService, cornerTreeService }) => {
        if (this.pages[page]) {
          this.pages[page].initialize(rowsTreeService, columnsTreeService, cornerTreeService, {
            isLastPage: true,
          });
        }
      });
  }

  /**
   * is Layout already initialized
   *
   * @returns {boolean} - initialization status
   */
  isInitialized() {
    return !!this.rootElement;
  }

  /** @public pivot 1.0 compitability */
  // eslint-disable-next-line class-methods-use-this
  setTableElements() {
    return this;
  }

  /**
   *
   * @param {Array<string>} params - applied by array size and position for title
   * @returns {void}
   * @public
   */
  setTitleParams(params: Array<string>) {
    const size = typeof params[0] === 'string' ? params[0] : this.props.size;
    const position = typeof params[1] === 'string' ? params[1] : this.props.position;
    this.updateProps({
      size,
      position,
    });
  }

  /**
   * clears internal state
   *
   * @returns {void}
   * @private
   */
  clearData() {
    this.pages = [];
    this.pagesIndexes = [];
    this.pageService.clearAll();
    this.isPreRender = true;
  }

  /**
   * clears internal state and sets layout configuration
   *
   * @param {Element} layout - (compitability point) layout element
   * @param {SettingsI} settings - layout configuration
   * @param {string} widgetId - widget's id to render viewport
   * @param {Element} el - (compitability point) element with pivot table
   * @param {object} translateText - (not used currently) object with title's "placeholder"
   * @returns {void}
   * @public
   */
  resetLayout(
    layout: Element,
    settings: SettingsI,
    widgetId: string,
    el: Element,
    translateText: Record<string, any>,
  ) {
    this.clearData();
    this.setLayout(layout, settings, widgetId, translateText);
  }

  /**
   * sets layout configuration
   *
   * @param {Element} layout - (compitability point) layout element
   * @param {SettingsI} settings - layout configuration
   * @param {string} widgetId - widget's id to render viewport
   * @param {object} translateText - (not used currently) object with title's "placeholder"
   * @returns {void}
   * @public
   */
  setLayout(
    layout: Element,
    settings: SettingsI,
    widgetId: string,
    // eslint-disable-next-line no-unused-vars
    translateText: Record<string, any>,
  ) {
    const { format, orientation, title, pageNumbers, header } = settings;

    this.widgetRoot.setAttribute('widgetid', widgetId);
    this.widgetRoot.setAttribute('widget-preview', 'true');
    this.widgetRoot.style.height = '0px';
    this.widgetRoot.style.overflow = 'hidden';

    this.pageService.setPageConfiguration(format, orientation);
    this.updateProps({
      format,
      orientation,
      isHeaderDisplayed: title,
      isFooterDisplayed: pageNumbers,
      titleName: header,
    });
  }

  /**
   *
   * @param {boolean} isFooterDisplayed - footer status
   * @returns {void}
   * @public
   */
  changeFooter(isFooterDisplayed: boolean) {
    this.updateProps({
      isFooterDisplayed,
    });
  }

  /**
   *
   * @param {Props} newProps - props update and re-render layout
   * @returns {void}
   * @private
   */
  updateProps(newProps: Record<string, any>) {
    this.props = {
      ...this.props,
      ...newProps,
    };
    this.render();
  }

  /**
   * callback for page update finish
   *
   * @param {number} pageNumber - props update and re-render layout
   * @returns {void}
   * @private
   */
  onPageGridUpdated = (pageNumber: number) => {
    const index = this.pagesInProgress.indexOf(pageNumber);
    this.pagesInProgress.splice(index, 1);

    if (!this.pagesInProgress.length) {
      if (this.printReadyCallback) {
        this.printReadyCallback();
      }
    }
  };

  /**
   * render function for pages
   *
   * @param {number} page - props update and re-render layout
   * @returns {Pivot} - pivot by page number
   * @private
   */
  getContentByPage = (page: number) => {
    const {
      isFooterDisplayed, // eslint-disable-line no-unused-vars
      isHeaderDisplayed, // eslint-disable-line no-unused-vars
      titleName, // eslint-disable-line no-unused-vars
      position, // eslint-disable-line no-unused-vars
      orientation: stringOrientation, // eslint-disable-line no-unused-vars
      format: stringFormat, // eslint-disable-line no-unused-vars
      size, // eslint-disable-line no-unused-vars
      ...restProps
    } = this.props;

    const getRef = (pageRef: Pivot | null) => {
      if (pageRef) {
        this.pages[page] = pageRef;
      }
    };
    const onGetInitialData = () => {
      this.loadPageData(page);
    };

    const onPageGridUpdated = () => {
      this.onPageGridUpdated(page);
    };

    const format = this.pageService.getPageFormat(stringFormat);
    const padding = this.pageService.getPixelsFromMM(20);
    const orientation = this.pageService.getPageOrientation(stringOrientation);
    const height =
      this.pageService.getPagePixelHeight(format, orientation) -
      CONSTANTS.FOOTER_HEIGHT -
      CONSTANTS.HEADER_HEIGHT -
      padding;
    const width = this.pageService.getPagePixelWidth(format, orientation) - padding;

    const pivotWrapperStyle = {
      height,
    };

    return (
      <div style={pivotWrapperStyle}>
        <Pivot
          {...restProps}
          key={`${page}_${format}_${orientation}`}
          ref={getRef}
          isPaginated={false}
          isFixedEnabled={false}
          scrollBarsMargin={0}
          width={width}
          height={height}
          isAutoHeight={false}
          itemsCount={0}
          itemsPerPage={0}
          activePage={-1}
          onGetInitialData={onGetInitialData}
          onGridUpdated={onPageGridUpdated}
          onUpdatePredefinedColumnWidth={this.getPredefinedWidthForPage}
          addCellDomReadyPromise={this.addCellDomReadyPromise}
          removeCellDomReadyPromise={this.removeCellDomReadyPromise}
          // TODO: replace stub value with something meaningful
          onSortingSettingsChanged={() => {}}
          overlay
        />
      </div>
    );
  };

  /**
   * get width for pages
   *
   * @returns {DimensionFormat} - normalized column's width
   * @private
   */
  getPredefinedWidthForPage = (): DimensionFormat => {
    const { format, orientation, borderWidth } = this.props;
    return this.pageService.getNormalizedWidth(format, orientation, { borderWidth });
  };

  preRenderRef = (ref: Pivot | null) => {
    if (ref) {
      this.preRender = ref;
    }
  };

  /**
   * render function for pivot pre-renderer
   *
   * @returns {Pivot} - pre-renderer
   * @private
   */
  getPivotPreRender = () => {
    const {
      isFooterDisplayed, // eslint-disable-line no-unused-vars
      isHeaderDisplayed, // eslint-disable-line no-unused-vars
      titleName, // eslint-disable-line no-unused-vars
      position, // eslint-disable-line no-unused-vars
      orientation: stringOrientation, // eslint-disable-line no-unused-vars
      format: stringFormat, // eslint-disable-line no-unused-vars
      size, // eslint-disable-line no-unused-vars
      ...restProps
    } = this.props;
    return (
      <Pivot
        {...restProps}
        ref={this.preRenderRef}
        isPaginated={false}
        isFixedEnabled={false}
        scrollBarsMargin={0}
        width={1}
        height={1}
        isAutoHeight={false}
        itemsCount={0}
        itemsPerPage={0}
        activePage={-1}
        onGetInitialData={this.onGetPreRenderInitialData}
        onGridUpdated={this.onPreRenderGridUpdated}
        onUpdatePredefinedColumnWidth={this.onUpdatePreRenderPredefinedColumnWidth}
        // TODO: replace stub value with something meaningful
        onSortingSettingsChanged={() => {}}
      />
    );
  };

  /**
   *  pre-renderer's cb to get build services
   *
   * @returns {void}
   * @private
   */
  onGetPreRenderInitialData = () => {
    const { dataService } = this;
    if (dataService) {
      dataService
        .loadAllData()
        .catch(() => ({ loadedRowsCount: 0, totalItemsCount: 0 }))
        .then(({ loadedRowsCount }: AllDataInfo) => {
          if (dataService) {
            const count = this.isPreview ? 100 : loadedRowsCount;
            dataService
              .getIndexedPageData(0, count)
              .then(({ rowsTreeService, columnsTreeService, cornerTreeService }) => {
                if (this.preRender) {
                  this.preRender.initialize(
                    rowsTreeService,
                    columnsTreeService,
                    cornerTreeService,
                    { isLastPage: true },
                  );
                }
              });
          }
        });
    }
  };

  /**
   * callback for pre-render rendering finish
   *
   * @returns {void}
   * @private
   */
  onPreRenderGridUpdated = () => {
    const { dataService } = this;
    if (this.pageService.isComplete()) {
      this.onPreRenderComplete();
      return;
    }
    if (this.preRender) {
      this.pageService.updateDimensions(
        this.preRender.getDimensions(),
        this.pageService.withHeight(),
      );
      if (dataService) {
        dataService
          .loadAllData()
          .catch(() => ({ loadedRowsCount: 0, totalItemsCount: 0 }))
          .then(({ loadedRowsCount }: AllDataInfo) => {
            if (dataService) {
              dataService
                .getIndexedPageData(0, this.isPreview ? 100 : loadedRowsCount)
                .then(({ rowsTreeService, columnsTreeService, cornerTreeService }) => {
                  if (this.preRender) {
                    this.preRender.initialize(
                      rowsTreeService,
                      columnsTreeService,
                      cornerTreeService,
                      { isLastPage: true },
                    );
                  }
                });
            }
          });
      }
    }
  };

  /**
   *
   * @param {Array<PivotTreeNode>} horizontalLastLevelsNodes - nodes to render fixed width
   * @param {Array<number>} resizedColumnWidth - params of resized node (not used)
   * @returns {DimensionFormat} - Array of nodes width dimensions
   * @private
   */
  onUpdatePreRenderPredefinedColumnWidth = (
    horizontalLastLevelsNodes: Array<PivotTreeNode>,
    resizedColumnWidth?: Array<number>,
  ) => {
    const { format, orientation, borderWidth } = this.props;
    if (!this.pageService.withHeight()) {
      if (this.props.onUpdatePredefinedColumnWidth) {
        return this.props.onUpdatePredefinedColumnWidth(
          horizontalLastLevelsNodes,
          resizedColumnWidth,
        );
      }
      return [];
    }
    if (!this.pageService.isComplete() || this.pageService.withHeight()) {
      return this.pageService.getNormalizedWidth(format, orientation, { borderWidth });
    }
    return [];
  };

  /**
   * Sets headers params;
   *
   * @param {string} titleName - header title
   * @param {boolean} isDisplayed - is displayed
   * @returns {void}
   * @public
   */
  setHeader(titleName: string, isDisplayed: boolean) {
    this.updateProps({
      titleName,
      isHeaderDisplayed: isDisplayed,
    });
  }

  /**
   * Notify Layout about cell 'domready' promise to wait
   *
   * @param {Defer} defer - defer object
   * @returns {void}
   */
  addCellDomReadyPromise = (defer?: Defer): void => {
    this.cellDomReadyPromises = this.cellDomReadyPromises || [];
    if (defer) {
      this.cellDomReadyPromises.push(defer.promise);
      this.render();
    }
  };

  removeCellDomReadyPromise = (defer?: Defer): void => {
    this.cellDomReadyPromises = this.cellDomReadyPromises || [];
    if (defer) {
      // eslint-disable-next-line max-len
      this.cellDomReadyPromises = this.cellDomReadyPromises.filter((p) => p !== defer.promise);
      this.render();
    }
  };

  /**
   * Render function. Imitates react render()
   *
   * @returns {void}
   * @private
   */
  render() {
    const {
      isFooterDisplayed,
      isHeaderDisplayed,
      titleName,
      format: stringFormat,
      orientation: stringOrientation,
      position,
      size,
      imageColumns,
    } = this.props;
    const format = this.pageService.getPageFormat(stringFormat);
    const padding = Math.floor(this.pageService.getPixelsFromMM(20));
    const orientation = this.pageService.getPageOrientation(stringOrientation);
    const height = this.pageService.getPagePixelHeight(format, orientation) - padding;
    const width = this.pageService.getPagePixelWidth(format, orientation) - padding;
    if (this.layoutRoot) {
      ReactDOM.render(
        <>
          {this.isAllDataLoaded ? (
            <Layout
              onHeaderChanged={this.onHeaderChanged}
              isFooterDisplayed={typeof isFooterDisplayed === 'boolean' ? isFooterDisplayed : true}
              isPreRender={this.isPreRender}
              isHeaderDisplayed={typeof isHeaderDisplayed === 'boolean' ? isHeaderDisplayed : true}
              titleName={titleName}
              width={width}
              height={height}
              padding={padding}
              isPreview={this.isPreview}
              pagesCount={this.getPagesCount()}
              renderContent={this.getContentByPage}
              preRenderContent={this.getPivotPreRender}
              position={position}
              size={size}
              imageColumns={imageColumns}
              cellDomReadyPromises={this.cellDomReadyPromises}
              printDomReadyCallback={this.printDomReadyCallback}
              noResults={this.noResults}
            />
          ) : (
            <div>Loading...</div>
          )}
        </>,
        this.layoutRoot,
      );
    }
  }
}

export default PivotPrintBuilder;
